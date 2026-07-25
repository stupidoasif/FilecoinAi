const fs = require('fs');
let content = fs.readFileSync('src/components/Views.tsx', 'utf8');

content = content.replace(/export function HistoryView\(\{[^]*?\)\s*\}\s*/, '');

fs.writeFileSync('src/components/Views.tsx', content);
