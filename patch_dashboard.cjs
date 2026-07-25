const fs = require('fs');

let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

const target = `          Build, debug, and integrate with decentralized storage using natural language. 
          Your workspace for Filecoin Virtual Machine intelligence.`;

const replacement = `          Accelerate Filecoin development with intelligent code generation, blockchain exploration, documentation search, and practical developer tools designed for builders.`;

content = content.replace(target, replacement);
fs.writeFileSync('src/components/Dashboard.tsx', content);
