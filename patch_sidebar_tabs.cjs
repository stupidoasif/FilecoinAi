const fs = require('fs');

let content = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

const targetClass = ": 'text-text-secondary border-transparent hover:bg-white/[0.03] hover:text-text-primary'";
const replacementClass = ": 'text-white border-transparent hover:bg-white/[0.03]'";

content = content.replace(targetClass, replacementClass);

const targetIconClass = ": 'opacity-40 group-hover:opacity-100 group-hover:scale-110'}`}";
const replacementIconClass = ": 'text-white group-hover:scale-110'}`}";

content = content.replace(targetIconClass, replacementIconClass);

fs.writeFileSync('src/components/Sidebar.tsx', content);
