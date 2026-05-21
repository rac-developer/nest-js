const fs = require('fs');
const content = fs.readFileSync('node_modules/@prisma/adapter-pg/dist/index.js', 'utf8');

const lines = content.split('\n');
lines.forEach((line, index) => {
  if (line.includes('Promise') || line.includes('Client') || line.includes('Pool') || line.includes('pg')) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
