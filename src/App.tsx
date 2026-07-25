import { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import ContextPanel from './components/ContextPanel';
import HeroBackground from './components/HeroBackground';
import { 
  DocumentationView, 
  CodeGeneratorView, 
  CIDDecoderView, 
  TransactionExplorerView, 
  HistoryView, 
} from './components/Views';
import { View, Message, LogEntry } from './types';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: "mock-1", label: "Storage.Upload", timestamp: new Date(Date.now() - 120000) },
    { id: "mock-2", label: "Retrieval.Query", timestamp: new Date(Date.now() - 3600000) },
    { id: "mock-3", label: "Deal.Accept", timestamp: new Date(Date.now() - 14400000) }
  ]);

  const addLog = useCallback((label: string) => {
    setLogs(prev => [{ id: Math.random().toString(36).substring(7), label, timestamp: new Date() }, ...prev]);
  }, []);

  const handleSendMessage = useCallback(async (text: string, useSearch?: boolean) => {
    if (!text.trim()) return;

    // Switch to assistant view if we're not already there
    if (currentView !== 'assistant') {
      setCurrentView('assistant');
    }

    addLog('Assistant.Query');

    const newUserMessage: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: text,
          stream: true,
          useSearch,
          history: messages.map(m => ({ 
            role: m.role === 'user' ? 'user' : 'model', 
            parts: [{ text: m.content }] 
          }))
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        let errMsg = 'Failed to connect to assistant';
        if (errData && errData.error) {
          try {
            // Sometimes the error is double stringified
            const parsed = JSON.parse(errData.error);
            if (parsed.error && parsed.error.message) {
              errMsg = parsed.error.message;
            } else {
              errMsg = errData.error;
            }
          } catch {
            errMsg = errData.error;
          }
        }
        throw new Error(errMsg);
      }

      // Initialize assistant message
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      let buffer = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data.trim() === '[DONE]') break;
              
              try {
                if (data.trim()) {
                  const parsed = JSON.parse(data);
                  if (parsed.text) {
                    assistantContent += parsed.text;
                    setMessages(prev => {
                      const newMessages = [...prev];
                      newMessages[newMessages.length - 1].content = assistantContent;
                      return newMessages;
                    });
                  }
                }
              } catch (e) {
                console.error('Error parsing stream chunk', e);
              }
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Chat Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `I encountered an error: ${error.message || 'Please check your connection or try again later.'}`
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, currentView]);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onQuickPrompt={handleSendMessage} />;
      case 'assistant':
        return <ChatInterface messages={messages} onSendMessage={handleSendMessage} isLoading={isLoading} />;
      case 'docs':
        return <DocumentationView />;
      case 'code':
        return <CodeGeneratorView onLog={addLog} />;
      case 'cid':
        return <CIDDecoderView onLog={addLog} />;
      case 'tx':
        return <TransactionExplorerView onLog={addLog} />;
      default:
        return <Dashboard onQuickPrompt={handleSendMessage} />;
    }
  };

  return (
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
        <div className="absolute inset-0 z-0">
        <HeroBackground />
      </div>
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="flex-1 bg-transparent overflow-hidden relative flex z-10">
        <div className="flex-1 flex flex-col min-w-0 z-10">

          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="flex-1 overflow-y-auto scrollbar-hide relative"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>

        <ContextPanel logs={logs} />
      </main>
    </div>
    </>
  );
}

