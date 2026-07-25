const fs = require('fs');

let sidebar = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');
sidebar = sidebar.replace(
  'bg-white rounded-2xl flex items-center justify-center font-bold text-white shadow-lg shadow-primary/20 shrink-0 overflow-hidden relative border-2 border-primary/20',
  'bg-transparent rounded-2xl flex items-center justify-center shrink-0 overflow-hidden relative shadow-lg shadow-primary/20'
);
fs.writeFileSync('src/components/Sidebar.tsx', sidebar);

let chat = fs.readFileSync('src/components/ChatInterface.tsx', 'utf8');
chat = chat.replace(
  'bg-white rounded-[2rem] flex items-center justify-center mb-8 border-2 border-primary/20 shadow-2xl overflow-hidden relative',
  'bg-transparent rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl overflow-hidden relative'
);
fs.writeFileSync('src/components/ChatInterface.tsx', chat);
