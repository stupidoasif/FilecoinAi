import { 
  Code2, 
  BookOpen, 
  Calculator, 
  Terminal, 
  Hash, 
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  onQuickPrompt: (prompt: string) => void;
}

const quickPrompts = [
  { 
    title: 'Generate Filecoin upload code', 
    desc: 'Get production-ready JS/TS code for storage.', 
    icon: Code2,
    prompt: 'Generate Filecoin upload code using Web3.Storage SDK'
  },
  { 
    title: 'Explain FVM smart contracts', 
    desc: 'Deep dive into Filecoin Virtual Machine basics.', 
    icon: BookOpen,
    prompt: 'Explain how FVM smart contracts differ from EVM'
  },
  { 
    title: 'Estimate storage cost', 
    desc: 'Calculate deal costs for 1TB on mainnet.', 
    icon: Calculator,
    prompt: 'Estimate the cost to store 1TB of data on Filecoin for 1 year'
  },
  { 
    title: 'Debug Lotus error', 
    desc: 'Common fixes for node connection issues.', 
    icon: Terminal,
    prompt: 'How do I fix "connection refused" in Lotus node?'
  },
  { 
    title: 'Decode a CID', 
    desc: 'Understand the parts of your content ID.', 
    icon: Hash,
    prompt: 'Explain the structure of a Filecoin CID v1'
  },
  { 
    title: 'Generate SDK example', 
    desc: 'Quick boilerplate for the Lotus API.', 
    icon: Code2,
    prompt: 'Give me a Python example to query storage deals'
  },
];

export default function Dashboard({ onQuickPrompt }: DashboardProps) {
  return (
    <>
      <div className="max-w-5xl mx-auto py-16 px-12 scrollbar-hide relative z-10">
      <header className="mb-20">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold tracking-tight mb-6"
        >
          Everything developers need to build on <br />
          <span className="text-primary italic">Filecoin, powered by AI.</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-text-secondary max-w-xl leading-relaxed font-medium"
        >
          Accelerate Filecoin development with intelligent code generation, blockchain exploration, documentation search, and practical developer tools designed for builders.
        </motion.p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickPrompts.map((item, index) => (
          <motion.button
            key={item.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.05 }}
            whileHover={{ y: -2, backgroundColor: 'rgba(255,255,255,0.08)' }}
            onClick={() => onQuickPrompt(item.prompt)}
            className="group flex flex-col p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:border-primary/50 hover:shadow-primary/10 transition-all text-left relative overflow-hidden shadow-2xl"
          >
            <div className="text-primary mb-4">
              <item.icon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-xs uppercase tracking-wider mb-2 group-hover:text-primary transition-colors">
              {item.title}
            </h3>
            <p className="text-[11px] text-text-secondary leading-relaxed font-medium">
              {item.desc}
            </p>
          </motion.button>
        ))}
      </div>

    </div>
    </>
  );
}
