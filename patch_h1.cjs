const fs = require('fs');

let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

const target = `<motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold tracking-tight mb-6"
        >
          AI Developer Copilot <br />
          <span className="text-primary italic">for Filecoin</span>
        </motion.h1>`;

const replacement = `<motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold tracking-tight mb-6"
        >
          Everything developers need to build on <br />
          <span className="text-primary italic">Filecoin, powered by AI.</span>
        </motion.h1>`;

content = content.replace(target, replacement);
fs.writeFileSync('src/components/Dashboard.tsx', content);
