#!/usr/bin/env node
/**
 * build-apk-export.js
 *
 * Runs the Next.js static export build for the Android/Capacitor APK
 * (BUILD_TARGET=apk -> output: "export" in next.config.ts).
 *
 * Static export can't ship API routes (no server at runtime — the APK
 * uses client-side SQLite via use-shop-fetch.ts instead), so this
 * script temporarily moves src/app/api out of the tree, runs the
 * build, and restores it afterwards — even if the build fails.
 *
 * This replaces relying on scripts/build-apk.sh (which also expects
 * ANDROID_HOME/JAVA_HOME and runs the full Gradle build) for CI steps
 * that only need the Next.js export step in isolation, e.g.:
 *
 *   npm run build:apk
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const apiDir = path.join(root, "src", "app", "api");
const backupDir = path.join(root, "src", "app", ".api-backup");

function moveApiOut() {
  if (fs.existsSync(apiDir)) {
    fs.rmSync(backupDir, { recursive: true, force: true });
    fs.renameSync(apiDir, backupDir);
    console.log("  Moved src/app/api out of the tree for static export.");
    return true;
  }
  console.log("  src/app/api not found (already moved?) — continuing.");
  return false;
}

function restoreApi() {
  if (fs.existsSync(backupDir)) {
    fs.rmSync(apiDir, { recursive: true, force: true });
    fs.renameSync(backupDir, apiDir);
    console.log("  Restored src/app/api.");
  }
}

const isApkTarget =
  process.env.BUILD_TARGET === "apk" || process.argv.includes("--apk");

if (!isApkTarget) {
  // Not an APK build (e.g. plain `npm run build` with no BUILD_TARGET
  // set) — run the normal standalone build, untouched.
  console.log("==> BUILD_TARGET != apk, running standalone build...");
  execSync(
    "next build && cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/",
    { cwd: root, stdio: "inherit", shell: "/bin/bash" }
  );
  process.exit(0);
}

let moved = false;
try {
  console.log("==> Preparing static export build (BUILD_TARGET=apk)...");
  moved = moveApiOut();

  console.log("==> Running next build...");
  execSync("next build", {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, BUILD_TARGET: "apk" },
  });

  console.log("==> Static export build succeeded.");
} finally {
  if (moved) restoreApi();
}
