import { useState } from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  BookOpen, 
  Code2, 
  Terminal, 
  Calculator, 
  Hash, 
  Search, 
  History, 
} from 'lucide-react';
import { View } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

const navItems = [
  { id: 'dashboard' as View, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'assistant' as View, label: 'AI Assistant', icon: MessageSquare },
  { id: 'docs' as View, label: 'Documentation', icon: BookOpen },
  { id: 'code' as View, label: 'Code Generator', icon: Code2 },
  { id: 'cid' as View, label: 'CID Decoder', icon: Hash },
  { id: 'tx' as View, label: 'Transaction Explorer', icon: Search },
];

export default function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isExpanded ? 300 : 80 }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className="bg-background/40 backdrop-blur-md flex flex-col h-screen sticky top-0 shrink-0 border-r border-white/5 transition-colors duration-300 z-50 overflow-hidden"
    >
      <div className="flex items-center mb-8 mt-6 min-h-[48px] px-3">
        <div className="w-[56px] flex items-center justify-center shrink-0">
          <div className="w-12 h-12 bg-transparent rounded-2xl flex items-center justify-center shrink-0 overflow-hidden relative shadow-lg shadow-primary/20">
            <img src="/logo.png" alt="Filecoin AI Logo" className="w-full h-full object-cover" />
          </div>
        </div>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="whitespace-nowrap overflow-hidden"
            >
              <div className="pl-3 pr-2">
                <span className="font-bold text-[13px] block tracking-tight uppercase">Filecoin Dev Studio</span>
                <span className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">Filecoin AI</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 space-y-1.5 px-3 overflow-y-auto scrollbar-hide pb-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center h-12 rounded-2xl text-[11px] font-bold uppercase tracking-wider transition-all border group relative overflow-hidden ${
              currentView === item.id 
                ? 'bg-white text-black border-white shadow-xl shadow-white/5' 
                : 'text-white border-transparent hover:bg-white/[0.03]'
            }`}
          >
            <div className="w-[56px] flex items-center justify-center shrink-0">
              <item.icon className={`w-5 h-5 transition-transform duration-300 ${currentView === item.id ? 'text-black' : 'text-white group-hover:scale-110'}`} />
            </div>
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap overflow-hidden text-left flex-1"
                >
                  <span className="pr-4">{item.label}</span>
                </motion.div>
              )}
            </AnimatePresence>
            {currentView === item.id && (
              <motion.div 
                layoutId="active-indicator"
                className="absolute left-1 w-1 h-5 bg-primary rounded-full"
              />
            )}
          </button>
        ))}
      </nav>
    </motion.aside>
  );
}
