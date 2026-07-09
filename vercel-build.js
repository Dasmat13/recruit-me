const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'apps', 'demo-portfolio');
const outputDir = path.join(__dirname, '.vercel', 'output', 'static');

fs.mkdirSync(outputDir, { recursive: true });

const files = fs.readdirSync(srcDir);
for (const file of files) {
  const srcPath = path.join(srcDir, file);
  const destPath = path.join(outputDir, file);
  fs.copyFileSync(srcPath, destPath);
}

console.log(`Deploy build: copied ${files.length} files from apps/demo-portfolio to ${outputDir}`);

module.exports = {
  outputDirectory: outputDir,
};
