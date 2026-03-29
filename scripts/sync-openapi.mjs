#!/usr/bin/env node

/**
 * Sync openapi.json from the formono repo (local or remote).
 *
 * Usage:
 *   npm run sync:openapi
 *   npm run sync:openapi -- --branch claude/review-api-parity-LNFXD
 *   npm run sync:openapi -- --remote-path apps/backend/openapi.json
 */

import { existsSync, copyFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { execFileSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const destPath = resolve(__dirname, "..", "api-reference", "openapi.json");

// Parse CLI args
const args = process.argv.slice(2);
function getArg(name, defaultValue) {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : defaultValue;
}

const branch = getArg("branch", "main");
const remotePath = getArg(
  "remote-path",
  "apps/backend/docs/openapi.json"
);
const localRepoPath = getArg(
  "local-repo",
  resolve(__dirname, "..", "..", "formono")
);

// 1. Try local formono repo
const localSource = resolve(localRepoPath, remotePath);
if (existsSync(localSource)) {
  console.log(`Copying from local formono repo:\n  ${localSource}`);
  copyFileSync(localSource, destPath);
  console.log(`Saved to ${destPath}`);
  process.exit(0);
}

console.log(
  `Local source not found at ${localSource}\nFetching from GitHub (branch: ${branch})...`
);

// 2. Try gh CLI (handles private repo auth)
const repo = "getformo/formono";
try {
  const ghOutput = execFileSync("gh", [
    "api",
    `repos/${repo}/contents/${remotePath}?ref=${branch}`,
    "--jq",
    ".content",
  ], { encoding: "utf-8" });

  const decoded = Buffer.from(ghOutput.trim(), "base64");
  if (decoded.length === 0) {
    throw new Error("Received empty content from GitHub API");
  }
  writeFileSync(destPath, decoded);
  console.log(`Saved to ${destPath} (via gh CLI)`);
  process.exit(0);
} catch {
  console.log("gh CLI failed, trying curl...");
}

// 3. Fallback to curl (public repos or CI with GITHUB_TOKEN)
try {
  const curlArgs = ["-fsSL"];
  if (process.env.GITHUB_TOKEN) {
    curlArgs.push("-H", `Authorization: token ${process.env.GITHUB_TOKEN}`);
  }
  curlArgs.push(
    `https://raw.githubusercontent.com/${repo}/${branch}/${remotePath}`,
    "-o",
    destPath
  );
  execFileSync("curl", curlArgs, { stdio: ["pipe", "pipe", "pipe"] });
  console.log(`Saved to ${destPath} (via curl)`);
  process.exit(0);
} catch {
  console.error(
    "Failed to fetch openapi.json from GitHub.\n" +
      "Make sure you have access to the repo via gh CLI or set GITHUB_TOKEN."
  );
  process.exit(1);
}
