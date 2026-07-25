const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `  return (
    <div className="flex h-screen bg-background text-text-primary overflow-hidden relative">
      <div className="absolute inset-0 z-0">`;

const replacement = `  return (
    <>
      <div className="md:hidden flex flex-col items-center justify-center h-screen bg-background text-text-primary p-8 text-center relative z-50">
        <div className="absolute inset-0 z-0">
          <HeroBackground />
        </div>
        <div className="z-10 bg-surface/50 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-2xl max-w-sm">
          <h2 className="text-3xl font-bold mb-4 italic tracking-tight uppercase">Desktop Required</h2>
          <p className="text-text-secondary text-sm font-medium leading-relaxed">
            Filecoin AI is optimized for desktop interfaces. Please switch to a larger screen to access the workspace.
          </p>
        </div>
      </div>
      <div className="hidden md:flex h-screen bg-background text-text-primary overflow-hidden relative">
        <div className="absolute inset-0 z-0">`;

content = content.replace(target, replacement);

content = content.replace(/    <\/div>\n  \);\n\}/, '    </div>\n    </>\n  );\n}');

fs.writeFileSync('src/App.tsx', content);
