import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm } from "fs/promises";

async function buildAll() {
  await rm("dist", { recursive: true, force: true });

  console.log("building client...");
  await viteBuild();

  console.log("building server...");

  const startupBanner = [
    `if(!process.env.NODE_ENV)process.env.NODE_ENV="production";`,
    `console.error("[boot] process starting — "+new Date().toISOString());`,
    `console.log("[boot] Starting server process, pid="+process.pid+", node="+process.version);`,
    `console.log("[boot] ENV check: DB_URL="+(process.env.DB_URL?"set":"MISSING")+", SESSION_SECRET="+(process.env.SESSION_SECRET?"set":"MISSING")+", PORT="+(process.env.PORT||"5000"));`,
    `process.on("uncaughtException",function(e){console.error("[FATAL] Uncaught:",e.message);console.error(e.stack);setTimeout(function(){process.exit(1)},1000)});`,
    `process.on("unhandledRejection",function(r){console.error("[FATAL] Unhandled rejection:",r);setTimeout(function(){process.exit(1)},1000)});`,
  ].join("");

  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "dist/index.cjs",
    banner: { js: startupBanner },
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    external: [
      "pg",
      "pg-native",
      "pdfkit",
      "adm-zip",
      "sharp",
      "canvas",
      "bcryptjs",
      "cpu-features",
      "ssh2",
      "better-sqlite3",
    ],
    minify: true,
    logLevel: "info",
  });
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
