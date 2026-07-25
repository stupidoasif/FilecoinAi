const fs = require('fs');
let content = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

const targetLogo = `          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center font-bold text-white shadow-lg shadow-primary/20 shrink-0">
            <Hash className="w-6 h-6" />
          </div>`;

const newLogo = `          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center font-bold text-white shadow-lg shadow-primary/20 shrink-0 overflow-hidden relative">
            <svg viewBox="0 0 100 100" className="w-10 h-10 absolute drop-shadow-md" xmlns="http://www.w3.org/2000/svg">
              <g transform="translate(50, 50)">
                <circle cx="0" cy="-10" r="22" fill="white" />
                <circle cx="-20" cy="5" r="20" fill="white" />
                <circle cx="20" cy="5" r="20" fill="white" />
                <circle cx="-10" cy="18" r="18" fill="white" />
                <circle cx="10" cy="18" r="18" fill="white" />
                <circle cx="-32" cy="10" r="14" fill="white" />
                <circle cx="32" cy="10" r="14" fill="white" />
                <circle cx="0" cy="5" r="25" fill="white" />
                
                <rect x="-14" y="-2" width="10" height="20" rx="5" fill="#0090FF" />
                <rect x="4" y="-2" width="10" height="20" rx="5" fill="#0090FF" />
              </g>
            </svg>
          </div>`;

content = content.replace(targetLogo, newLogo);

// Also increase sidebar width and slightly reduce text size to prevent cropping
content = content.replace(`animate={{ width: isExpanded ? 280 : 80 }}`, `animate={{ width: isExpanded ? 300 : 80 }}`);
content = content.replace(`<span className="font-bold text-sm block tracking-tight uppercase">Filecoin Dev Studio</span>`, `<span className="font-bold text-[13px] block tracking-tight uppercase">Filecoin Dev Studio</span>`);

fs.writeFileSync('src/components/Sidebar.tsx', content);
