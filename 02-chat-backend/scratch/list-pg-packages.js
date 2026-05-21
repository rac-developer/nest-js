const fs = require('fs');
const path = require('path');

function findPkg(dir) {
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    if (file === 'node_modules') {
      const sublist = fs.readdirSync(fullPath);
      sublist.forEach(sub => {
        const pkgPath = path.join(fullPath, sub);
        if (sub === 'pg') {
          const pkgJson = JSON.parse(fs.readFileSync(path.join(pkgPath, 'package.json'), 'utf8'));
          console.log(`Found pg at ${pkgPath} (version ${pkgJson.version})`);
        } else if (sub.startsWith('@')) {
          const scopeList = fs.readdirSync(pkgPath);
          scopeList.forEach(scopeSub => {
            if (scopeSub === 'pg') {
              const scopePkgPath = path.join(pkgPath, scopeSub);
              const pkgJson = JSON.parse(fs.readFileSync(path.join(scopePkgPath, 'package.json'), 'utf8'));
              console.log(`Found pg at ${scopePkgPath} (version ${pkgJson.version})`);
            }
          });
        }
      });
      // Also search recursively inside node_modules
      sublist.forEach(sub => {
        const subPath = path.join(fullPath, sub);
        if (fs.statSync(subPath).isDirectory()) {
          findPkg(subPath);
        }
      });
    } else {
      if (fs.statSync(fullPath).isDirectory() && !file.startsWith('.') && file !== 'dist') {
        findPkg(fullPath);
      }
    }
  });
}

findPkg('.');
