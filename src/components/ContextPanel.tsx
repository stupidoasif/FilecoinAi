import { 
  Globe, 
  Wallet, 
  Cpu, 
  Activity,
  ExternalLink,
  BookMarked,
  Info
} from 'lucide-react';

import { LogEntry } from "../types";
import { useEffect, useState } from "react";

export default function ContextPanel({ logs = [] }: { logs?: LogEntry[] }) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);
  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };
  return (
    <aside className="w-64 bg-background/40 backdrop-blur-md border-l border-white/5 p-6 flex flex-col gap-6 h-full overflow-y-auto scrollbar-hide z-10">
      {/* Workspace Info */}
      <section>
        <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-4">
          Network Status
        </h3>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center p-3 rounded-xl bg-surface border border-border">
            <span className="text-[11px] text-text-secondary font-bold uppercase">Mainnet</span>
            <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
          </div>

          <div className="p-3 rounded-xl bg-surface border border-border">
            <span className="text-[10px] text-text-secondary font-bold uppercase block mb-1">AI Agent</span>
            <span className="text-xs font-bold text-primary">Active</span>
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-4">
          Latest Logs
        </h3>
        <div className="space-y-2">
          {logs.slice(0, 3).map((log) => (
            <div key={log.id} className="text-[10px] font-bold bg-surface/50 p-2.5 rounded-lg border border-border flex justify-between items-center">
              <span className="uppercase tracking-tight truncate mr-2" title={log.label}>{log.label}</span>
              <span className="text-text-secondary italic whitespace-nowrap">{formatTimeAgo(log.timestamp)}</span>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-[10px] font-bold text-text-secondary text-center italic py-2">
              No recent activity
            </div>
          )}
        </div>
      </section>

      {/* Quick Links */}
      <section>
        <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-4">
          Resources
        </h3>
        <div className="space-y-1.5">
          {[
            { label: 'FVM Documentation', href: 'https://docs.filecoin.io/smart-contracts/fundamentals/the-fvm' },
            { label: 'IPFS Gateway', href: 'https://ipfs.io' },
            { label: 'Lotus RPC API', href: 'https://lotus.filecoin.io/reference/basics' },
            { label: 'Network Explorer', href: 'https://filfox.info/en' }
          ].map((doc) => (
            <a 
              key={doc.label}
              href={doc.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-[11px] font-bold text-text-secondary hover:text-primary transition-colors py-1"
            >
              {doc.label}
            </a>
          ))}
        </div>
      </section>

    </aside>
  );
}
