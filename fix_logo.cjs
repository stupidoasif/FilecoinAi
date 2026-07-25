const fs = require('fs');

let sidebar = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');
sidebar = sidebar.replace(
  "import logoImage from '../assets/logo.jpg';",
  "import logoImage from '../assets/logo.png';"
);
fs.writeFileSync('src/components/Sidebar.tsx', sidebar);

let chat = fs.readFileSync('src/components/ChatInterface.tsx', 'utf8');
chat = chat.replace(
  "import logoImage from '../assets/logo.jpg';",
  "import logoImage from '../assets/logo.png';"
);
fs.writeFileSync('src/components/ChatInterface.tsx', chat);

let index = fs.readFileSync('index.html', 'utf8');
index = index.replace('href="/logo.jpg"', 'href="/logo.png"');
fs.writeFileSync('index.html', index);

fs.copyFileSync('src/assets/logo.png', 'public/logo.png');
