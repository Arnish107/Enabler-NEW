const fs = require("fs");
const path = require("path");

const nextDir = path.join(__dirname, "..", ".next");
const distDir = path.join(__dirname, "..", "dist");

if (!fs.existsSync(nextDir)) {
  console.error("verify:build failed — .next directory not found. Run npm run build first.");
  process.exit(1);
}

if (fs.existsSync(distDir)) {
  console.warn("warning: dist/ exists but is not used by Next.js deployments.");
}

console.log("verify:build passed — .next output present.");
