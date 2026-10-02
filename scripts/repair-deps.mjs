// Detects partially-installed packages (files missing after an in-place upgrade)
// and reinstalls them before building.
import { existsSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { execSync } from "node:child_process";

const NM = resolve("node_modules");
const SCOPES = ["@tanstack"];
const PLAIN = ["seroval", "seroval-plugins"];

function packageDirs() {
  const dirs = PLAIN.map((p) => join(NM, p));
  for (const scope of SCOPES) {
    const s = join(NM, scope);
    if (existsSync(s)) for (const p of readdirSync(s)) dirs.push(join(s, p));
  }
  return dirs.filter((d) => existsSync(join(d, "package.json")));
}

function jsFiles(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) jsFiles(full, out);
    else if (/\.(m?js)$/.test(name)) out.push(full);
  }
  return out;
}

const IMPORT_RE = /(?:from|import)\s*\(?\s*["'](\.{1,2}\/[^"']+\.m?js)["']/g;

function isBroken(pkgDir) {
  const dist = join(pkgDir, "dist");
  if (!existsSync(dist)) return false;
  for (const file of jsFiles(dist)) {
    const src = readFileSync(file, "utf8");
    for (const m of src.matchAll(IMPORT_RE)) {
      if (!existsSync(resolve(dirname(file), m[1]))) return true;
    }
  }
  return false;
}

const broken = packageDirs().filter(isBroken);
if (broken.length) {
  console.log("[repair-deps] reinstalling incomplete packages:", broken.map((d) => d.slice(NM.length + 1)).join(", "));
  for (const d of broken) rmSync(d, { recursive: true, force: true });
  try {
    execSync("bun pm cache rm", { stdio: "inherit" });
  } catch {}
  execSync("bun install --force", { stdio: "inherit" });
  const still = packageDirs().filter(isBroken);
  if (still.length) {
    console.error("[repair-deps] still incomplete:", still.join(", "));
    process.exit(1);
  }
}
