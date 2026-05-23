const fs = require('fs');
const path = require('path');

function walkDir(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(fullPath));
    } else if (entry.isFile() && fullPath.endsWith('.ts')) {
      results.push(fullPath);
    }
  }
  return results;
}

const root = path.resolve(__dirname, '..');
const baseDir = path.join(root, 'app', 'api');
const files = walkDir(baseDir);

let changed = 0;

for (const file of files) {
  let text = fs.readFileSync(file, 'utf8');
  const original = text;

  // Replace mysql.createPool({...}) with mysql.createPool()
  text = text.replace(
    /const\s+pool\s*=\s*mysql\.createPool\s*\(\s*\{[^}]+\}\s*\);/gs,
    'const pool = mysql.createPool();'
  );

  if (text !== original) {
    fs.writeFileSync(file, text, 'utf8');
    changed++;
    console.log(`✓ ${path.relative(root, file)}`);
  }
}

console.log(`\nTotal updated: ${changed} files`);
