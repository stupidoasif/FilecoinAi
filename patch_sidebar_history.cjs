const fs = require('fs');

let content = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

// Remove history nav item
content = content.replace(/  { id: 'history' as View, label: 'History', icon: History },\n/, '');

// Remove History import
content = content.replace(/  History,\n/, '');

fs.writeFileSync('src/components/Sidebar.tsx', content);
