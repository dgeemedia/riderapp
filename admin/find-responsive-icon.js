const fs = require('fs');
const path = require('path');

function findResponsiveIconUsages(dir) {
  const results = [];
  
  function walk(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (item.endsWith('.jsx') || item.endsWith('.js')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes('ResponsiveIcon')) {
          results.push({
            file: fullPath,
            lines: content.split('\n').map((line, index) => ({
              number: index + 1,
              text: line,
              hasResponsiveIcon: line.includes('ResponsiveIcon')
            })).filter(line => line.hasResponsiveIcon)
          });
        }
      }
    }
  }
  
  walk(dir);
  return results;
}

const usages = findResponsiveIconUsages(path.join(__dirname));
console.log('📁 Found ResponsiveIcon usages in', usages.length, 'files:\n');

usages.forEach((usage, index) => {
  console.log(`${index + 1}. ${usage.file}`);
  usage.lines.forEach(line => {
    console.log(`   Line ${line.number}: ${line.text.trim()}`);
  });
  console.log();
});