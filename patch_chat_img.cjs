const fs = require('fs');

let content = fs.readFileSync('src/components/ChatInterface.tsx', 'utf8');

const target = `<div className="w-20 h-20 bg-background rounded-[2rem] flex items-center justify-center mb-8 border border-border shadow-2xl">
                <Hash className="w-10 h-10 text-primary" />
              </div>`;

const replacement = `<div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center mb-8 border-2 border-primary/20 shadow-2xl overflow-hidden relative">
                <img src="/logo.jpg" alt="Filecoin AI Logo" className="w-full h-full object-cover" />
              </div>`;

content = content.replace(target, replacement);
fs.writeFileSync('src/components/ChatInterface.tsx', content);
