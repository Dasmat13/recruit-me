const { spawn } = require('child_process');
process.env.NODE_OPTIONS = '--experimental-vm-modules';
const child = spawn('npx', ['jest'], { stdio: 'inherit' });
child.on('close', (code) => {
  process.exit(code);
});
