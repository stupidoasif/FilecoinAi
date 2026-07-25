const fs = require('fs');

let sidebar = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');
sidebar = sidebar.replace(
  "import { logoBase64 } from '../logoBase64';",
  "import logoImage from '../assets/logo.jpg';"
);
sidebar = sidebar.replace(
  '<img src={logoBase64} alt="Filecoin AI Logo" className="w-full h-full object-cover" />',
  '<img src={logoImage} alt="Filecoin AI Logo" className="w-full h-full object-cover" />'
);
fs.writeFileSync('src/components/Sidebar.tsx', sidebar);

let chat = fs.readFileSync('src/components/ChatInterface.tsx', 'utf8');
chat = chat.replace(
  "import { logoBase64 } from '../logoBase64';",
  "import logoImage from '../assets/logo.jpg';"
);
chat = chat.replace(
  '<img src={logoBase64} alt="Filecoin AI Logo" className="w-full h-full object-cover" />',
  '<img src={logoImage} alt="Filecoin AI Logo" className="w-full h-full object-cover" />'
);
fs.writeFileSync('src/components/ChatInterface.tsx', chat);

fs.unlinkSync('src/logoBase64.ts');
