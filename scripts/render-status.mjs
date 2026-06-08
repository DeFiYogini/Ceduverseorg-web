/**
 * Diagnose the Render deploy pipeline for the ceduverse service.
 *
 * Get a key: Render dashboard -> Account Settings -> API Keys -> Create API Key.
 *
 * Run:
 *   RENDER_API_KEY=rnd_xxx node scripts/render-status.mjs              # diagnose (read-only)
 *   RENDER_API_KEY=rnd_xxx node scripts/render-status.mjs --deploy     # trigger a deploy of latest commit
 *   RENDER_API_KEY=rnd_xxx node scripts/render-status.mjs --deploy --clear-cache
 *
 * Prints the service's recent deploys with status + commit, so we can see
 * whether builds are failing, queued, canceled, or simply not triggering.
 * With --deploy it kicks off a fresh deploy (optionally clearing build cache).
 */
const KEY = process.env.RENDER_API_KEY;
if (!KEY) {
  console.error("Set RENDER_API_KEY first:  RENDER_API_KEY=rnd_xxx node scripts/render-status.mjs");
  process.exit(1);
}
const H = { Authorization: `Bearer ${KEY}`, Accept: "application/json" };
const API = "https://api.render.com/v1";

async function j(url) {
  const r = await fetch(url, { headers: H });
  if (!r.ok) throw new Error(`${r.status} ${r.statusText} on ${url} :: ${(await r.text()).slice(0, 200)}`);
  return r.json();
}

(async () => {
  // Find the service (by env override or by name)
  let serviceId = process.env.RENDER_SERVICE_ID;
  if (!serviceId) {
    const services = await j(`${API}/services?limit=50`);
    const match = services.find((s) => (s.service?.name || s.name) === "ceduverse");
    serviceId = match?.service?.id || match?.id;
    if (!serviceId) {
      console.log("Services on this account:");
      for (const s of services) console.log("  -", (s.service?.name || s.name), (s.service?.id || s.id));
      throw new Error('Could not find a service named "ceduverse". Set RENDER_SERVICE_ID=srv-... and re-run.');
    }
  }

  const svc = await j(`${API}/services/${serviceId}`);
  const s = svc.service || svc;
  console.log(`\nService: ${s.name}  (${s.id})`);
  console.log(`Suspended: ${s.suspended}`);
  console.log(`Auto-deploy: ${s.autoDeploy ?? s.serviceDetails?.autoDeploy ?? "?"}`);
  console.log(`Branch: ${s.branch ?? s.serviceDetails?.branch ?? "?"}`);
  console.log(`Repo: ${s.repo ?? "?"}\n`);

  const deploys = await j(`${API}/services/${serviceId}/deploys?limit=10`);
  console.log("Recent deploys (newest first):");
  for (const d0 of deploys) {
    const d = d0.deploy || d0;
    const commit = d.commit?.id?.slice(0, 7) || "?";
    const msg = (d.commit?.message || "").split("\n")[0].slice(0, 50);
    console.log(`  ${(d.status || "?").padEnd(20)} ${commit}  ${d.createdAt || ""}  ${d.finishedAt ? "(finished " + d.finishedAt + ")" : ""}`);
    console.log(`     "${msg}"`);
  }
  console.log("\nStatus legend: live=running · build_failed/update_failed=broken · build_in_progress/update_in_progress=building · canceled=superseded");

  if (process.argv.includes("--deploy")) {
    const clearCache = process.argv.includes("--clear-cache");
    console.log(`\nTriggering a new deploy${clearCache ? " (clearing build cache)" : ""}...`);
    const r = await fetch(`${API}/services/${serviceId}/deploys`, {
      method: "POST",
      headers: { ...H, "Content-Type": "application/json" },
      body: JSON.stringify(clearCache ? { clearCache: "clear" } : {}),
    });
    if (!r.ok) throw new Error(`Deploy trigger failed: ${r.status} ${(await r.text()).slice(0, 200)}`);
    const dep = await r.json();
    console.log(`✅ Deploy started: ${dep.id || dep.deploy?.id} (status ${dep.status || dep.deploy?.status}). Watch it at ${API.replace("/v1", "")} or re-run this script to poll.`);
  }
})().catch((e) => { console.error("\nERROR:", e.message); process.exit(1); });
