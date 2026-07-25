import React, { useState, useRef, useEffect } from 'react';
import { Send, Copy, Check, Terminal, Code2, BookOpen, Search, Loader2, Hash } from 'lucide-react';
import { Message } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
  const match = /language-(\w+)/.exec(className || '');
  const [copied, setCopied] = useState(false);
  const code = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!inline && match) {
    return (
      <div className="relative group my-4 rounded-xl overflow-hidden bg-[#0d1117] border border-white/5">
        <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
          <span className="text-[10px] font-mono text-text-secondary uppercase">{match[1]}</span>
          <button 
            type="button"
            onClick={handleCopy}
            className="text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1.5 text-[10px]"
          >
            {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <SyntaxHighlighter
          style={oneDark}
          language={match[1]}
          PreTag="div"
          customStyle={{
            margin: 0,
            padding: '1rem',
            background: 'transparent',
            fontSize: '0.75rem',
          }}
          {...props}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    );
  }

  return (
    <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
      {children}
    </code>
  );
};

const SUGGESTIONS = ['Explain FVM Actors', 'Storage cost estimate', 'CID breakdown'];

const SuggestionButtons = React.memo(({ onSelect }: { onSelect: (text: string) => void }) => {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {SUGGESTIONS.map((suggest) => (
        <button 
          key={suggest}
          type="button"
          onClick={() => onSelect(suggest)}
          className="text-[10px] font-bold uppercase tracking-widest bg-white/[0.03] border border-white/10 px-4 py-2 rounded-full hover:border-primary/50 hover:shadow-primary/10 transition-colors text-text-secondary hover:text-primary shadow-lg transform-gpu"
        >
          {suggest}
        </button>
      ))}
    </div>
  );
});

export default function ChatInterface({ messages, onSendMessage, isLoading }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-12 space-y-12 scrollbar-hide">
        <AnimatePresence initial={false}>
          {messages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto"
            >
              <div className="w-20 h-20 bg-transparent rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl overflow-hidden relative">
                <img src="/logo.png" alt="Filecoin AI Logo" className="w-full h-full object-cover" />
              </div>
              <h2 className="text-3xl font-bold mb-4 tracking-tight uppercase italic">Filecoin AI Chat</h2>
              <p className="text-text-secondary text-[11px] font-bold uppercase tracking-widest leading-relaxed">
                Ask me about FVM, storage deals, or Lotus configuration. I'm here to accelerate your Filecoin journey.
              </p>
            </motion.div>
          )}

          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] ${msg.role === 'user' ? 'bg-primary text-white px-6 py-4 rounded-[1.5rem] rounded-tr-none shadow-xl shadow-primary/10' : ''}`}>
                {msg.role === 'assistant' ? (
                  <div className="flex gap-6">
                    <div className="w-10 h-10 rounded-xl bg-background border border-border flex-shrink-0 flex items-center justify-center shadow-sm">
                      <span className="text-primary text-xs font-bold italic">F</span>
                    </div>
                    <div className="flex-1 min-w-0 bg-background p-8 rounded-[2rem] rounded-tl-none border border-border shadow-xl">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code: CodeBlock,
                          h1: ({node, ...props}) => <h1 className="text-xl font-bold text-text-primary mt-8 mb-4 italic tracking-tight" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-[10px] font-bold text-primary uppercase tracking-widest mt-8 mb-4" {...props} />,
                          p: ({node, ...props}) => <p className="text-xs leading-relaxed mb-4 text-text-primary font-medium last:mb-0" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 space-y-2 text-xs text-text-secondary font-medium" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4 space-y-2 text-xs text-text-secondary font-medium" {...props} />,
                          table: ({node, ...props}) => (
                            <div className="overflow-x-auto my-6 border border-border rounded-2xl bg-surface/50">
                              <table className="w-full text-[10px] text-left" {...props} />
                            </div>
                          ),
                          th: ({node, ...props}) => <th className="bg-background/50 p-3 font-bold uppercase tracking-widest border-b border-border" {...props} />,
                          td: ({node, ...props}) => <td className="p-3 border-b border-border text-text-secondary font-medium" {...props} />,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs font-bold tracking-tight uppercase tracking-wider">{msg.content}</p>
                )}
              </div>
            </motion.div>
          ))}
          
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start gap-6">
              <div className="w-10 h-10 rounded-xl bg-background border border-border flex-shrink-0 flex items-center justify-center">
                <span className="text-primary text-xs font-bold italic">F</span>
              </div>
              <div className="flex items-center gap-3 text-text-secondary text-[10px] font-bold uppercase tracking-widest bg-background px-6 py-3 rounded-full border border-border">
                <Loader2 className="w-3 h-3 animate-spin text-primary" />
                Thinking...
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-12 pb-12">
        <div className="max-w-4xl mx-auto">
          <SuggestionButtons onSelect={onSendMessage} />

          <form onSubmit={handleSubmit} className="relative group">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about Filecoin..."
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              className="w-full bg-white/[0.03] border border-white/10 rounded-[2rem] px-8 py-6 pr-32 focus:outline-none focus:border-primary/50 transition-colors resize-none text-sm font-bold placeholder:text-text-secondary shadow-2xl group-hover:border-white/20"
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3">

              <button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-2xl transition-colors shadow-lg shadow-primary/20"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
          <p className="text-[10px] text-text-secondary mt-6 text-center font-bold uppercase tracking-widest opacity-50 italic">
            Secure Protocol Connection Active
          </p>
        </div>
      </div>
    </div>
  );
}
