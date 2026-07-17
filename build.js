const fs = require('fs');
const path = require('path');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach((childItemName) => {
      if (childItemName === '__tests__') return; // Skip test files in build
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

const outputDir = path.join(__dirname, 'dist');
if (fs.existsSync(outputDir)) {
  fs.rmSync(outputDir, { recursive: true, force: true });
}
fs.mkdirSync(outputDir, { recursive: true });

// Copy demo-portfolio files to static root
const srcDir = path.join(__dirname, 'apps', 'demo-portfolio');
fs.readdirSync(srcDir).forEach((file) => {
  if (file === '__tests__') return;
  copyRecursiveSync(path.join(srcDir, file), path.join(outputDir, file));
});

// Copy packages and challenges so relative imports work in the deployed build
copyRecursiveSync(path.join(__dirname, 'packages'), path.join(outputDir, 'packages'));
copyRecursiveSync(path.join(__dirname, 'challenges'), path.join(outputDir, 'challenges'));

console.log(`Build completed: copied app, packages, and challenges to ${outputDir}`);
