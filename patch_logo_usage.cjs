const fs = require('fs');

let sidebar = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');
sidebar = sidebar.replace(
  "import logoImage from '../assets/logo.png';\n",
  ""
);
sidebar = sidebar.replace(
  '<img src={logoImage} alt="Filecoin AI Logo" className="w-full h-full object-cover" />',
  '<img src="/logo.png" alt="Filecoin AI Logo" className="w-full h-full object-cover" />'
);
fs.writeFileSync('src/components/Sidebar.tsx', sidebar);

let chat = fs.readFileSync('src/components/ChatInterface.tsx', 'utf8');
chat = chat.replace(
  "import logoImage from '../assets/logo.png';\n",
  ""
);
chat = chat.replace(
  '<img src={logoImage} alt="Filecoin AI Logo" className="w-full h-full object-cover" />',
  '<img src="/logo.png" alt="Filecoin AI Logo" className="w-full h-full object-cover" />'
);
fs.writeFileSync('src/components/ChatInterface.tsx', chat);
