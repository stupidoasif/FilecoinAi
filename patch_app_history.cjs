const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Remove import
content = content.replace(/  HistoryView,\n/, '');

// Remove renderView case
content = content.replace(/      case 'history':\n        return <HistoryView \/>;\n/, '');

fs.writeFileSync('src/App.tsx', content);
