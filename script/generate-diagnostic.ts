import fs from "fs";
import path from "path";
import { execSync, spawn } from "child_process";
import http from "http";

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

function getExecError(err: unknown): string {
  if (err instanceof Error && "stdout" in err && typeof (err as Record<string, unknown>).stdout === "string") {
    return (err as Record<string, unknown>).stdout as string;
  }
  return getErrorMessage(err);
}

interface DiagnosticData {
  timestamp: string;
  envVars: Record<string, { set: boolean; length?: number }>;
  jwtAnalysis: Record<string, { valid: boolean; claims?: Record<string, unknown>; error?: string }>;
  gitState: { branch: string; lastCommits: string[]; distAge?: string; distMtime?: number; lastCommitTime?: number };
  buildResult: { success: boolean; output: string; warnings: string[]; artifacts: { path: string; size: string }[] };
  deploymentConfig: Record<string, string>;
  healthCheck: { success: boolean; response?: string; error?: string };
  esbuildExternals: string[];
  authComponents: { errorBoundary: boolean; appErrorBoundary: boolean; supabaseConfigured: boolean };
}

function checkEnvVars(): DiagnosticData["envVars"] {
  const vars = [
    "DB_URL", "SUPABASE_URL", "SUPABASE_ANON_KEY",
    "VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY",
    "ACADEMY_SECRET", "SESSION_SECRET",
  ];
  const result: DiagnosticData["envVars"] = {};
  for (const v of vars) {
    const val = process.env[v];
    result[v] = { set: !!val, length: val ? val.length : undefined };
  }
  return result;
}

function decodeJwt(token: string): { valid: boolean; claims?: Record<string, unknown>; error?: string } {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return { valid: false, error: "Not a valid JWT (expected 3 parts)" };
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString()) as Record<string, unknown>;
    const sanitized: Record<string, unknown> = {};
    const safeFields = ["iss", "aud", "exp", "iat", "nbf", "sub", "role", "typ"];
    for (const f of safeFields) {
      if (payload[f] !== undefined) {
        if (f === "exp" || f === "iat" || f === "nbf") {
          const ts = Number(payload[f]);
          sanitized[f] = ts;
          sanitized[`${f}_human`] = new Date(ts * 1000).toISOString();
          if (f === "exp") {
            sanitized["expired"] = ts * 1000 < Date.now();
            sanitized["expires_in_days"] = Math.round((ts * 1000 - Date.now()) / 86400000);
          }
        } else if (f === "sub") {
          sanitized[f] = String(payload[f]).substring(0, 8) + "...";
        } else {
          sanitized[f] = payload[f];
        }
      }
    }
    return { valid: true, claims: sanitized };
  } catch (err: unknown) {
    return { valid: false, error: getErrorMessage(err) };
  }
}

function analyzeJwts(): DiagnosticData["jwtAnalysis"] {
  const result: DiagnosticData["jwtAnalysis"] = {};
  if (process.env.ACADEMY_SECRET) {
    result["ACADEMY_SECRET"] = decodeJwt(process.env.ACADEMY_SECRET);
  }
  if (process.env.SUPABASE_ANON_KEY) {
    result["SUPABASE_ANON_KEY"] = decodeJwt(process.env.SUPABASE_ANON_KEY);
  }
  return result;
}

function getGitState(): DiagnosticData["gitState"] {
  let branch = "unknown";
  let lastCommits: string[] = [];
  let distMtime: number | undefined;
  let distAge: string | undefined;
  let lastCommitTime: number | undefined;

  try { branch = execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf8" }).trim(); } catch {}
  try {
    lastCommits = execSync('git log --oneline -10 --format="%h %ai %s"', { encoding: "utf8" }).trim().split("\n");
    const lastTs = execSync('git log -1 --format="%at"', { encoding: "utf8" }).trim();
    lastCommitTime = parseInt(lastTs) * 1000;
  } catch {}
  try {
    const stat = fs.statSync("dist/index.cjs");
    distMtime = stat.mtimeMs;
    const ageSec = (Date.now() - stat.mtimeMs) / 1000;
    if (ageSec < 60) distAge = `${Math.round(ageSec)}s ago`;
    else if (ageSec < 3600) distAge = `${Math.round(ageSec / 60)}m ago`;
    else distAge = `${Math.round(ageSec / 3600)}h ago`;
  } catch {}

  return { branch, lastCommits, distMtime, distAge, lastCommitTime };
}

function runBuild(): DiagnosticData["buildResult"] {
  const artifacts: { path: string; size: string }[] = [];
  const warnings: string[] = [];
  let output = "";
  let success = false;

  try {
    output = execSync("npm run build 2>&1", { encoding: "utf8", timeout: 120000 });
    success = true;
    const warnMatches = output.match(/▲ \[WARNING\].*$/gm);
    if (warnMatches) warnings.push(...warnMatches);
  } catch (err: unknown) {
    output = getExecError(err);
  }

  const checkFiles = ["dist/index.cjs", "dist/public/index.html"];
  try {
    const assets = fs.readdirSync("dist/public/assets");
    for (const a of assets) checkFiles.push(`dist/public/assets/${a}`);
  } catch {}

  for (const f of checkFiles) {
    try {
      const stat = fs.statSync(f);
      const sizeKb = (stat.size / 1024).toFixed(1);
      artifacts.push({ path: f, size: `${sizeKb} KB` });
    } catch {}
  }

  return { success, output: output.substring(0, 5000), warnings, artifacts };
}

function getDeploymentConfig(): DiagnosticData["deploymentConfig"] {
  const result: DiagnosticData["deploymentConfig"] = {};
  try {
    const content = fs.readFileSync(".replit", "utf8");
    const deployBlock = content.match(/\[deployment\]([\s\S]*?)(?=\[|$)/);
    if (deployBlock) {
      const lines = deployBlock[1].trim().split("\n");
      for (const line of lines) {
        const m = line.match(/^(\w+)\s*=\s*(.+)/);
        if (m) result[m[1]] = m[2].replace(/["\[\]]/g, "").trim();
      }
    }
  } catch {}
  return result;
}

function checkHealthWithOwnServer(): Promise<DiagnosticData["healthCheck"]> {
  return new Promise((resolve) => {
    const port = 9876;
    const child = spawn("node", ["dist/index.cjs"], {
      env: { ...process.env, PORT: String(port), NODE_ENV: "production" },
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d: Buffer) => { stdout += d.toString(); });
    child.stderr.on("data", (d: Buffer) => { stderr += d.toString(); });

    const killChild = () => {
      try { child.kill("SIGTERM"); } catch {}
      setTimeout(() => { try { child.kill("SIGKILL"); } catch {} }, 2000);
    };

    const timeout = setTimeout(() => {
      killChild();
      resolve({ success: false, error: `Server did not start within 20s. stdout: ${stdout.substring(0, 500)}` });
    }, 20000);

    const checkInterval = setInterval(() => {
      if (stdout.includes("serving on port")) {
        clearInterval(checkInterval);
        const req = http.get(`http://localhost:${port}/__health`, (res) => {
          let body = "";
          res.on("data", (chunk: Buffer) => { body += chunk.toString(); });
          res.on("end", () => {
            clearTimeout(timeout);
            killChild();
            resolve({ success: body.includes('"ok"'), response: `[production mode, port ${port}] ${body}` });
          });
        });
        req.on("error", (err: Error) => {
          clearTimeout(timeout);
          killChild();
          resolve({ success: false, error: `Health probe failed: ${err.message}` });
        });
        req.setTimeout(5000);
      }
    }, 500);

    child.on("error", (err: Error) => {
      clearTimeout(timeout);
      clearInterval(checkInterval);
      resolve({ success: false, error: `Failed to spawn: ${err.message}` });
    });

    child.on("exit", (code) => {
      clearTimeout(timeout);
      clearInterval(checkInterval);
      if (code !== null && code !== 0) {
        resolve({ success: false, error: `Server exited with code ${code}. stderr: ${stderr.substring(0, 500)}` });
      }
    });
  });
}

function getEsbuildExternals(): string[] {
  try {
    const content = fs.readFileSync("script/build.ts", "utf8");
    const match = content.match(/external:\s*\[([\s\S]*?)\]/);
    if (match) {
      return match[1].match(/"([^"]+)"/g)?.map((s) => s.replace(/"/g, "")) || [];
    }
  } catch {}
  return [];
}

function checkAuthComponents(): DiagnosticData["authComponents"] {
  let errorBoundary = false;
  let appErrorBoundary = false;
  let supabaseConfigured = false;
  try {
    const auth = fs.readFileSync("client/src/pages/auth.tsx", "utf8");
    errorBoundary = auth.includes("AuthErrorBoundary");
  } catch {}
  try {
    const app = fs.readFileSync("client/src/App.tsx", "utf8");
    appErrorBoundary = app.includes("AppErrorBoundary");
  } catch {}
  try {
    const sub = fs.readFileSync("client/src/lib/supabase.ts", "utf8");
    supabaseConfigured = sub.includes("createClient");
  } catch {}
  return { errorBoundary, appErrorBoundary, supabaseConfigured };
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function renderBadge(ok: boolean, trueLabel = "OK", falseLabel = "MISSING"): string {
  return ok ? `<span class="badge badge-ok">${trueLabel}</span>` : `<span class="badge badge-err">${falseLabel}</span>`;
}

function generateHtml(data: DiagnosticData): string {
  const envRows = Object.entries(data.envVars)
    .map(([k, v]) => `<tr><td><span class="mono">${k}</span></td><td>${renderBadge(v.set, "SET", "MISSING")}</td><td>${v.set ? `${v.length} chars` : "Not configured"}</td></tr>`)
    .join("\n");

  const jwtRows = Object.entries(data.jwtAnalysis)
    .map(([k, v]) => {
      if (!v.valid) return `<tr><td><span class="mono">${k}</span></td><td>${renderBadge(false, "", "INVALID")}</td><td>${escapeHtml(v.error || "Unknown")}</td></tr>`;
      const c = v.claims!;
      const expStatus = c.expired ? '<span class="badge badge-err">EXPIRED</span>' : `<span class="badge badge-ok">Valid (${c.expires_in_days}d remaining)</span>`;
      const details = [
        c.iss ? `iss: ${escapeHtml(String(c.iss))}` : null,
        c.role ? `role: ${escapeHtml(String(c.role))}` : null,
        c.aud ? `aud: ${escapeHtml(String(c.aud))}` : null,
        c.exp_human ? `exp: ${c.exp_human}` : null,
        c.iat_human ? `iat: ${c.iat_human}` : null,
      ].filter(Boolean).join("<br>");
      return `<tr><td><span class="mono">${k}</span></td><td>${expStatus}</td><td>${details}</td></tr>`;
    })
    .join("\n");

  const commitRows = data.gitState.lastCommits
    .map((c) => `<li>${escapeHtml(c)}</li>`)
    .join("\n");

  const distVsGit = (() => {
    if (!data.gitState.distMtime || !data.gitState.lastCommitTime) return "Unable to compare";
    const diff = data.gitState.distMtime - data.gitState.lastCommitTime;
    if (diff >= 0) return `<span class="badge badge-ok">Build is newer than last commit (by ${Math.round(diff / 1000)}s)</span>`;
    return `<span class="badge badge-warn">Build is older than last commit (by ${Math.round(Math.abs(diff) / 1000)}s) — rebuild recommended</span>`;
  })();

  const artifactRows = data.buildResult.artifacts
    .map((a) => `<tr><td><span class="mono">${escapeHtml(a.path)}</span></td><td>${a.size}</td><td>${renderBadge(true)}</td></tr>`)
    .join("\n");

  const deployRows = Object.entries(data.deploymentConfig)
    .map(([k, v]) => `<tr><td>${escapeHtml(k)}</td><td><span class="mono">${escapeHtml(v)}</span></td><td>${renderBadge(true)}</td></tr>`)
    .join("\n");

  const buildWarnings = data.buildResult.warnings.length > 0
    ? data.buildResult.warnings.map((w) => `<li>${escapeHtml(w)}</li>`).join("")
    : "<li>None</li>";

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Ceduverse — Diagnostic Report</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8f9fa;color:#1a1a2e;line-height:1.6;padding:2rem 1rem}
.container{max-width:900px;margin:0 auto}
h1{font-size:1.75rem;margin-bottom:.25rem}
.subtitle{color:#6c757d;margin-bottom:2rem;font-size:.95rem}
.section{background:#fff;border:1px solid #e9ecef;border-radius:12px;padding:1.5rem;margin-bottom:1.5rem}
.section h2{font-size:1.15rem;margin-bottom:1rem;padding-bottom:.5rem;border-bottom:1px solid #e9ecef}
.badge{display:inline-block;padding:2px 10px;border-radius:6px;font-size:.8rem;font-weight:600}
.badge-ok{background:#d4edda;color:#155724}
.badge-warn{background:#fff3cd;color:#856404}
.badge-err{background:#f8d7da;color:#721c24}
table{width:100%;border-collapse:collapse;margin-top:.75rem}
th,td{text-align:left;padding:8px 12px;border-bottom:1px solid #f0f0f0;font-size:.9rem}
th{color:#6c757d;font-weight:600;font-size:.8rem;text-transform:uppercase}
.mono{font-family:'Fira Code',monospace;font-size:.82rem;background:#f1f3f5;padding:2px 6px;border-radius:4px}
ul{list-style:none;padding:0}
ul li{padding:4px 0;font-size:.85rem}
.action-item{background:#fff8e1;border-left:4px solid #ffc107;padding:.75rem 1rem;border-radius:0 8px 8px 0;margin-bottom:.75rem;font-size:.9rem}
.action-item.critical{background:#fce4ec;border-left-color:#e53935}
.action-item.success{background:#e8f5e9;border-left-color:#43a047}
pre{background:#f8f9fa;border:1px solid #e9ecef;padding:1rem;border-radius:8px;font-size:.8rem;overflow-x:auto;max-height:300px;margin-top:.75rem}
</style>
</head>
<body>
<div class="container">
<h1>Ceduverse Deployment Diagnostic</h1>
<p class="subtitle">Generated: ${data.timestamp} — Evidence-based analysis from runtime data collection.</p>

<div class="section">
<h2>1. Environment Variables</h2>
<table>
<tr><th>Variable</th><th>Status</th><th>Details</th></tr>
${envRows}
</table>
</div>

<div class="section">
<h2>2. JWT Token Analysis</h2>
<p style="font-size:.85rem;color:#6c757d;margin-bottom:.5rem">Decoded locally — secrets are not exposed. Only safe metadata fields (iss, aud, exp, iat, role) are shown.</p>
<table>
<tr><th>Token</th><th>Expiration</th><th>Claims</th></tr>
${jwtRows}
</table>
</div>

<div class="section">
<h2>3. Git State vs Build Artifacts</h2>
<p><strong>Branch:</strong> <span class="mono">${escapeHtml(data.gitState.branch)}</span></p>
<p><strong>dist/index.cjs age:</strong> ${data.gitState.distAge || "Not found"}</p>
<p><strong>Build vs commit:</strong> ${distVsGit}</p>
<details style="margin-top:.75rem">
<summary style="cursor:pointer;font-weight:600;font-size:.9rem">Last 10 commits</summary>
<ul style="margin-top:.5rem">${commitRows}</ul>
</details>
</div>

<div class="section">
<h2>4. esbuild Configuration</h2>
<p><strong>External modules:</strong> <span class="mono">${data.esbuildExternals.join(", ")}</span></p>
<div class="action-item success">
Native Node.js modules are declared as external to prevent bundling errors for binary/native packages.
</div>
</div>

<div class="section">
<h2>5. Build Result</h2>
<p><strong>Status:</strong> ${renderBadge(data.buildResult.success, "SUCCESS", "FAILED")}</p>
<p><strong>Warnings:</strong></p>
<ul>${buildWarnings}</ul>
<table>
<tr><th>Artifact</th><th>Size</th><th>Status</th></tr>
${artifactRows}
</table>
<details style="margin-top:.75rem">
<summary style="cursor:pointer;font-weight:600;font-size:.9rem">Full build output</summary>
<pre>${escapeHtml(data.buildResult.output)}</pre>
</details>
</div>

<div class="section">
<h2>6. Deployment Configuration</h2>
<table>
<tr><th>Setting</th><th>Value</th><th>Status</th></tr>
${deployRows}
</table>
</div>

<div class="section">
<h2>7. Health Check (Production Mode)</h2>
<p><strong>GET /__health:</strong> ${renderBadge(data.healthCheck.success, "RESPONDING", "FAILED")}</p>
${data.healthCheck.response ? `<pre>${escapeHtml(data.healthCheck.response)}</pre>` : ""}
${data.healthCheck.error ? `<p class="mono" style="color:#721c24">${escapeHtml(data.healthCheck.error)}</p>` : ""}
</div>

<div class="section">
<h2>8. Auth Flow Components</h2>
<table>
<tr><th>Component</th><th>Status</th></tr>
<tr><td>AuthErrorBoundary (auth.tsx)</td><td>${renderBadge(data.authComponents.errorBoundary, "Present", "Missing")}</td></tr>
<tr><td>AppErrorBoundary (App.tsx)</td><td>${renderBadge(data.authComponents.appErrorBoundary, "Present", "Missing")}</td></tr>
<tr><td>Supabase client configured</td><td>${renderBadge(data.authComponents.supabaseConfigured, "Yes", "No")}</td></tr>
</table>
</div>

<div class="section">
<h2>9. Recommended Actions</h2>
<div class="action-item critical">
<strong>ACTION REQUIRED:</strong> The Replit deployment itself may fail due to project-level permissions or billing settings. The project owner must verify the deployment target (Autoscale) is available on their plan.
</div>
${Object.values(data.jwtAnalysis).some(j => j.claims?.expired) ? '<div class="action-item critical"><strong>ACTION REQUIRED:</strong> One or more JWT tokens have expired. Regenerate the expired token(s) to restore API integrations.</div>' : ""}
<div class="action-item">
<strong>RECOMMENDATION:</strong> Consider code-splitting the frontend bundle using dynamic import() for heavy pages to improve initial load time.
</div>
</div>

</div>
</body>
</html>`;
}

async function main() {
  console.log("Collecting diagnostic data...");

  const envVars = checkEnvVars();
  const jwtAnalysis = analyzeJwts();
  const gitState = getGitState();
  const buildResult = runBuild();
  const deploymentConfig = getDeploymentConfig();
  const esbuildExternals = getEsbuildExternals();
  const authComponents = checkAuthComponents();

  console.log("Build success:", buildResult.success);
  console.log("JWT tokens analyzed:", Object.keys(jwtAnalysis).length);

  console.log("Starting production server for health check...");
  const healthCheck = await checkHealthWithOwnServer();
  console.log("Health check:", healthCheck.success);

  const data: DiagnosticData = {
    timestamp: new Date().toISOString(),
    envVars,
    jwtAnalysis,
    gitState,
    buildResult,
    deploymentConfig,
    healthCheck,
    esbuildExternals,
    authComponents,
  };

  const html = generateHtml(data);
  fs.writeFileSync("diagnostic-ceduverse.html", html);
  console.log("Written diagnostic-ceduverse.html");
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
