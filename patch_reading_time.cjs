const fs = require('fs');

let content = fs.readFileSync('src/components/Views.tsx', 'utf8');

const target1 = `                    <span className="flex items-center gap-1 text-[10px] text-text-secondary font-medium">
`;
content = content.replace(target1, '');

const target2 = `                <span className="flex items-center gap-1.5 text-xs text-text-secondary font-medium">
`;
content = content.replace(target2, '');

fs.writeFileSync('src/components/Views.tsx', content);
