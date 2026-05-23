const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const baseDir = path.join(root, 'app', 'api');

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

const files = walkDir(baseDir);
let changed = 0;
for (const file of files) {
  let text = fs.readFileSync(file, 'utf8');
  const original = text;
  text = text.replace(/import\s+mysql\s+from\s+['\"]mysql2\/promise['\"];?/g, "import mysql from '@/lib/db';");
  if (text !== original) {
    fs.writeFileSync(file, text, 'utf8');
    changed += 1;
  }
}
console.log('Updated files:', changed);
