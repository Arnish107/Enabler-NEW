const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const dist = path.join(root, "dist");

const filesToCopy = [
  "index.html",
  path.join("css", "styles.css"),
  path.join("js", "main.js"),
];

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
  const dest = path.join(dist, file);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

const publicDir = path.join(root, "public");
if (fs.existsSync(publicDir)) {
  copyRecursive(publicDir, path.join(dist, "public"));
}

console.log("Build completed successfully.");
