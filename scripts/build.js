const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const dist = path.join(root, "dist");

const dirsToCopy = ["css", "js", "assets"];
const filesToCopy = ["index.html"];

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
    return;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

if (fs.existsSync(dist)) {
  fs.rmSync(dist, { recursive: true, force: true });
}
fs.mkdirSync(dist, { recursive: true });

for (const file of filesToCopy) {
  const src = path.join(root, file);
  if (!fs.existsSync(src)) {
    console.error(`Build failed: missing required file "${file}"`);
    process.exit(1);
  }
  copyRecursive(src, path.join(dist, file));
}

for (const dir of dirsToCopy) {
  const src = path.join(root, dir);
  if (!fs.existsSync(src)) {
    console.error(`Build failed: missing required directory "${dir}"`);
    process.exit(1);
  }
  copyRecursive(src, path.join(dist, dir));
}

const publicDir = path.join(root, "public");
if (fs.existsSync(publicDir)) {
  copyRecursive(publicDir, path.join(dist, "public"));
}

console.log("Build completed successfully.");
