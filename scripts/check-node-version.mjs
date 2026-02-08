const [major] = process.versions.node.split('.').map(Number);

if (Number.isNaN(major)) {
  console.error('Could not detect Node.js version. Please use Node 20 or 22 LTS.');
  process.exit(1);
}

if (major < 20 || major >= 24) {
  console.error(`\n[LiveAlerts] Unsupported Node.js version: ${process.versions.node}`);
  console.error('Please use Node.js 20.x or 22.x LTS.');
  console.error('Windows quick fix:');
  console.error('  1) nvm install 22.13.1');
  console.error('  2) nvm use 22.13.1');
  console.error('  3) npm install');
  process.exit(1);
}
