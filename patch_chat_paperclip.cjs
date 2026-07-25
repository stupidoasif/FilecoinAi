const fs = require('fs');
let content = fs.readFileSync('src/components/ChatInterface.tsx', 'utf8');

// Remove import
content = content.replace(/Paperclip, /, '');

// Remove button
const buttonTarget = `              <button type="button" className="p-2 text-text-secondary hover:text-text-primary transition-colors">
                <Paperclip className="w-5 h-5" />
              </button>`;
content = content.replace(buttonTarget, '');

fs.writeFileSync('src/components/ChatInterface.tsx', content);
