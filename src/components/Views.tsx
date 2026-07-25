import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Check, X, Terminal, Code2, Calculator, Hash, History, Settings, ExternalLink, ChevronLeft, ChevronRight, Loader2, Copy, Download, Maximize, FileText, Clock, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { DOC_TOPICS } from '../data/docs';

export function DocumentationView({ onLog }: { onLog?: (label: string) => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<typeof DOC_TOPICS[0] | null>(() => {
    const saved = localStorage.getItem('filecoin_docs_last_topic');
    return DOC_TOPICS.find(t => t.id === saved) || null;
  });
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedTopic) {
      localStorage.setItem('filecoin_docs_last_topic', selectedTopic.id);
    } else {
      localStorage.removeItem('filecoin_docs_last_topic');
    }
  }, [selectedTopic]);

  // Auto-scroll on topic change
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (selectedTopic && contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedTopic]);

  const filteredTopics = DOC_TOPICS.filter(topic => {
    const q = searchQuery.toLowerCase();
    return topic.title.toLowerCase().includes(q) || 
           topic.description.toLowerCase().includes(q) ||
           topic.keywords.some(k => k.toLowerCase().includes(q)) ||
           topic.content.toLowerCase().includes(q);
  });

  const getTopicIndex = (id: string) => DOC_TOPICS.findIndex(t => t.id === id);
  const currentIdx = selectedTopic ? getTopicIndex(selectedTopic.id) : -1;
  const prevTopic = currentIdx > 0 ? DOC_TOPICS[currentIdx - 1] : null;
  const nextTopic = currentIdx !== -1 && currentIdx < DOC_TOPICS.length - 1 ? DOC_TOPICS[currentIdx + 1] : null;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !selectedTopic && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape' && selectedTopic) {
        setSelectedTopic(null);
        setAiExplanation(null);
      }
      if (selectedTopic && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        if (e.key === 'ArrowLeft' && prevTopic) {
          setSelectedTopic(prevTopic);
          setAiExplanation(null);
        }
        if (e.key === 'ArrowRight' && nextTopic) {
          setSelectedTopic(nextTopic);
          setAiExplanation(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTopic, prevTopic, nextTopic]);

  const handleExplain = async () => {
    if (!selectedTopic) return;
    setIsExplaining(true);
    setAiExplanation(null);
    onLog?.('AI.Explain');
    
    try {
      const response = await fetch('/api/explain-doc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedTopic.title,
          content: selectedTopic.content
        })
      });
      const data = await response.json();
      setAiExplanation(data.response);
    } catch (e: any) {
      setAiExplanation("Failed to generate explanation: " + e.message);
    } finally {
      setIsExplaining(false);
    }
  };

  const MarkdownComponents = {
    code({node, inline, className, children, ...props}: any) {
      const match = /language-(\w+)/.exec(className || '')
      return !inline && match ? (
        <div className="relative group mt-4 mb-6 rounded-xl overflow-hidden border border-white/10">
          <div className="flex items-center justify-between px-4 py-2 bg-black/40 border-b border-white/10">
            <span className="text-[10px] font-mono text-white/50">{match[1]}</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(String(children).replace(/\n$/, ''))
                onLog?.('Code.Copy')
              }}
              className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-white/50 hover:text-white"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
          <SyntaxHighlighter
            style={oneDark as any}
            language={match[1]}
            PreTag="div"
            customStyle={{ margin: 0, padding: '1rem', background: 'rgba(0,0,0,0.2)', fontSize: '13px' }}
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code className="bg-white/10 px-1.5 py-0.5 rounded text-primary text-[0.9em]" {...props}>
          {children}
        </code>
      )
    },
    h2: ({node, ...props}: any) => <h2 className="text-2xl font-bold mt-12 mb-6 text-white border-b border-white/10 pb-4" {...props} />,
    h3: ({node, ...props}: any) => <h3 className="text-xl font-bold mt-8 mb-4 text-white/90" {...props} />,
    p: ({node, ...props}: any) => <p className="text-text-secondary leading-relaxed mb-6" {...props} />,
    ul: ({node, ...props}: any) => <ul className="list-disc list-inside text-text-secondary space-y-2 mb-6 ml-4" {...props} />,
    ol: ({node, ...props}: any) => <ol className="list-decimal list-inside text-text-secondary space-y-2 mb-6 ml-4" {...props} />,
    li: ({node, ...props}: any) => <li className="leading-relaxed" {...props} />,
    a: ({node, ...props}: any) => <a className="text-primary hover:underline underline-offset-4" target="_blank" rel="noopener noreferrer" {...props} />,
    blockquote: ({node, ...props}: any) => (
      <blockquote className="border-l-4 border-primary bg-primary/5 p-4 rounded-r-xl my-6 text-white/80" {...props} />
    )
  };

  return (
    <div className="p-16 max-w-5xl mx-auto h-full flex flex-col">
      <AnimatePresence mode="wait">
        {!selectedTopic ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1"
          >
            <h1 className="text-4xl font-bold mb-10 tracking-tight italic">Documentation</h1>
            <div className="relative mb-12">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary z-10 pointer-events-none" />
              <input 
                ref={searchInputRef}
                type="text" 
                placeholder="Search by title, keyword, or content... (Press '/' to focus)" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[1.5rem] py-5 pl-16 pr-6 focus:outline-none focus:border-primary/50 transition-all text-sm font-medium shadow-2xl hover:border-white/20"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-6 pb-20">
              {filteredTopics.map(topic => (
                <div 
                  key={topic.id} 
                  onClick={() => setSelectedTopic(topic)}
                  className="p-8 rounded-[2rem] bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:border-primary/50 hover:shadow-primary/10 transition-all cursor-pointer group shadow-2xl flex flex-col h-full"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${
                      topic.difficulty === 'Beginner' ? 'bg-success/20 text-success' :
                      topic.difficulty === 'Intermediate' ? 'bg-warning/20 text-warning' :
                      'bg-error/20 text-error'
                    }`}>
                      {topic.difficulty}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold tracking-tight mb-3 group-hover:text-primary transition-colors">{topic.title}</h3>
                  <p className="text-xs text-text-secondary mb-6 leading-relaxed font-medium flex-1">{topic.description}</p>
                  
                  <div className="flex items-center gap-2 text-[10px] text-primary font-bold uppercase tracking-widest mt-auto">
                    Read Topic <ExternalLink className="w-3 h-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </div>
                </div>
              ))}
              {filteredTopics.length === 0 && (
                <div className="col-span-2 text-center py-20 text-text-secondary bg-white/[0.02] rounded-[2rem] border border-white/5">
                  <Search className="w-10 h-10 mx-auto mb-4 opacity-20" />
                  No documentation found matching "{searchQuery}"
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="content"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex-1 flex flex-col h-full overflow-hidden"
          >
            <div className="flex items-center justify-between mb-8 shrink-0">
              <button 
                onClick={() => { setSelectedTopic(null); setAiExplanation(null); }}
                className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors w-fit bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:bg-white/10"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Back to Topics</span>
              </button>
              
              <button
                onClick={handleExplain}
                disabled={isExplaining}
                className="flex items-center gap-2 bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30 transition-colors px-5 py-2 rounded-full"
              >
                {isExplaining ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span className="text-[10px] font-bold uppercase tracking-widest">Explain with AI</span>
              </button>
            </div>
            
            <div 
              ref={contentRef}
              className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2rem] p-12 shadow-2xl flex-1 overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center gap-4 mb-6">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full ${
                  selectedTopic.difficulty === 'Beginner' ? 'bg-success/20 text-success' :
                  selectedTopic.difficulty === 'Intermediate' ? 'bg-warning/20 text-warning' :
                  'bg-error/20 text-error'
                }`}>
                  {selectedTopic.difficulty}
                </span>
              </div>
              
              <h2 className="text-4xl font-bold mb-8 tracking-tight italic">{selectedTopic.title}</h2>
              
              {aiExplanation && (
                <motion.div 
                  initial={{ opacity: 0, y: -20, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  className="mb-10 bg-primary/10 border border-primary/20 rounded-[1.5rem] p-8 overflow-hidden relative"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                  <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-[10px] mb-4">
                    <Sparkles className="w-4 h-4" /> AI Explanation
                  </div>
                  <div className="prose prose-invert prose-sm max-w-none text-white/90">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                      {aiExplanation}
                    </ReactMarkdown>
                  </div>
                </motion.div>
              )}
              
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                  {selectedTopic.content}
                </ReactMarkdown>
              </div>
              
              <div className="mt-16 pt-12 border-t border-white/10 grid grid-cols-2 gap-12">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-6 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Related Topics
                  </h4>
                  <div className="flex flex-col gap-3">
                    {selectedTopic.relatedTopics.map(relId => {
                      const relTopic = DOC_TOPICS.find(t => t.id === relId);
                      if (!relTopic) return null;
                      return (
                        <button
                          key={relId}
                          onClick={() => { setSelectedTopic(relTopic); setAiExplanation(null); }}
                          className="text-left p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/50 hover:bg-white/10 transition-colors group flex items-center justify-between"
                        >
                          <span className="text-sm font-medium text-white/90 group-hover:text-primary transition-colors">
                            {relTopic.title}
                          </span>
                          <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-primary transition-colors group-hover:translate-x-1" />
                        </button>
                      );
                    })}
                    {selectedTopic.relatedTopics.length === 0 && (
                      <span className="text-xs text-white/30 italic">No related topics.</span>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-6 flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" /> Official Resources
                  </h4>
                  <div className="flex flex-col gap-3">
                    {selectedTopic.officialResources.map((res, i) => (
                      <a
                        key={i}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-colors group flex items-center justify-between"
                      >
                        <span className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">
                          {res.title}
                        </span>
                        <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-white transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-12 pt-8 border-t border-white/10 flex items-center justify-between">
                {prevTopic ? (
                  <button
                    onClick={() => { setSelectedTopic(prevTopic); setAiExplanation(null); }}
                    className="flex flex-col items-start gap-1 group"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary flex items-center gap-1">
                      <ChevronLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Previous
                    </span>
                    <span className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">{prevTopic.title}</span>
                  </button>
                ) : <div />}
                
                {nextTopic ? (
                  <button
                    onClick={() => { setSelectedTopic(nextTopic); setAiExplanation(null); }}
                    className="flex flex-col items-end gap-1 group"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary flex items-center gap-1">
                      Next <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <span className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">{nextTopic.title}</span>
                  </button>
                ) : <div />}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function CodeGeneratorView({ onLog }: { onLog?: (label: string) => void }) {
  const [language, setLanguage] = useState('TypeScript');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const QUICK_PROMPTS = [
    'Upload File',
    'Retrieve File',
    'Storage Deal',
    'CID Lookup',
    'FVM Contract',
    'Wallet Connection',
    'Estimate Cost',
    'Generate SDK'
  ];

  const LANGUAGES = ['JavaScript', 'TypeScript', 'Python', 'Go', 'Rust'];

  useEffect(() => {
    const savedLang = localStorage.getItem('codegen_lang');
    if (savedLang) setLanguage(savedLang);
    const savedPrompt = localStorage.getItem('codegen_prompt');
    if (savedPrompt) setPrompt(savedPrompt);
    const savedResult = localStorage.getItem('codegen_result');
    if (savedResult) setGeneratedCode(savedResult);
  }, []);

  const handleLanguageSelect = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('codegen_lang', lang);
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    localStorage.setItem('codegen_prompt', e.target.value);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    onLog?.('Code.Generate');
    setIsGenerating(true);
    setGeneratedCode(null);
    localStorage.removeItem('codegen_result');
    
    try {
      const response = await fetch('/api/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, language }),
      });
      
      if (!response.ok) throw new Error('Failed to generate code');
      
      const data = await response.json();
      setGeneratedCode(data.response);
      localStorage.setItem('codegen_result', data.response);
    } catch (error) {
      console.error(error);
      setGeneratedCode('## Error\nFailed to generate code. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleGenerate();
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };
  
  const handleDownload = (code: string, lang: string) => {
    const exts: Record<string, string> = {
      'JavaScript': 'js',
      'TypeScript': 'ts',
      'Python': 'py',
      'Go': 'go',
      'Rust': 'rs'
    };
    const ext = exts[lang] || 'txt';
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `generated_code.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderGeneratedContent = () => {
    if (!generatedCode) return null;
    
    const sections = generatedCode.split(/^## /m).filter(s => s.trim());
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-12 space-y-8"
      >
        {sections.map((section, idx) => {
          const lines = section.split('\n');
          const title = lines[0].trim();
          const content = lines.slice(1).join('\n').trim();
          
          if (title.toLowerCase() === 'code') {
            const match = content.match(/```(\w+)?\n([\s\S]*?)```/);
            const codeToCopy = match ? match[2] : content;
            
            return (
              <div key={idx} className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between px-8 py-6 border-b border-white/10 bg-white/[0.02]">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-primary">{title}</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary bg-white/5 px-3 py-1.5 rounded-full">
                      {language}
                    </span>
                    <button onClick={() => handleCopy(codeToCopy, 'code')} className="p-2 hover:bg-white/10 rounded-full transition-colors text-text-secondary hover:text-white" title="Copy">
                      {copiedSection === 'code' ? <Hash className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button onClick={() => handleDownload(codeToCopy, language)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-text-secondary hover:text-white" title="Download">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-text-secondary hover:text-white" title="Fullscreen">
                      <Maximize className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-6 overflow-x-auto text-[13px] bg-black/40">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({node, inline, className, children, ...props}: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={oneDark}
                            language={match[1]}
                            PreTag="div"
                            customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }}
                            showLineNumbers={true}
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                            {children}
                          </code>
                        )
                      }
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                </div>
              </div>
            );
          }
          
          return (
            <div key={idx} className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-4">{title}</h3>
              <div className="text-text-primary text-sm leading-relaxed prose prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({node, inline, className, children, ...props}: any) {
                      return (
                        <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                          {children}
                        </code>
                      )
                    },
                    a({node, ...props}: any) {
                      return <a className="text-primary hover:underline" {...props} />
                    }
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>
            </div>
          );
        })}
        
        {/* Status Row */}
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-text-secondary px-4 pb-12">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> AI Generated</span>
            <span>•</span>
            <span className="text-primary">Production Ready</span>
          </div>
          <span>Est. time: {isGenerating ? '...' : '< 5s'}</span>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="p-16 max-w-4xl mx-auto h-full flex flex-col overflow-y-auto scrollbar-hide">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-4 tracking-tight italic flex items-center justify-center gap-4">
          <Code2 className="w-8 h-8 text-primary" />
          AI Code Generator
        </h1>
        <p className="text-text-secondary text-[11px] font-bold uppercase tracking-widest">
          Generate production-ready Filecoin and FOC code using natural language.
        </p>
      </div>

      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2rem] p-10 shadow-2xl shrink-0">
        <div className="flex flex-wrap gap-2 mb-8">
          {LANGUAGES.map(lang => (
            <button 
              key={lang} 
              onClick={() => handleLanguageSelect(lang)}
              className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${lang === language ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white/[0.03] backdrop-blur-xl border-white/10 text-text-secondary hover:border-primary/50 hover:text-white'}`}
            >
              {lang}
            </button>
          ))}
        </div>

        <div className="relative mb-6">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={handlePromptChange}
            onKeyDown={handleKeyDown}
            placeholder="Describe what you want to build... (e.g., Upload a file to Filecoin using Web3.Storage)"
            className="w-full h-40 bg-black/20 border border-white/10 rounded-2xl p-6 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/50 transition-all resize-none"
          />
          <div className="absolute bottom-4 right-6 text-[10px] font-bold text-text-secondary/50 uppercase tracking-widest">
            Ctrl + Enter to generate
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {QUICK_PROMPTS.map(chip => (
            <button
              key={chip}
              onClick={() => {
                setPrompt(chip);
                localStorage.setItem('codegen_prompt', chip);
                textareaRef.current?.focus();
              }}
              className="px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white/[0.02] border border-white/5 text-text-secondary hover:bg-white/[0.05] hover:text-white transition-all"
            >
              {chip}
            </button>
          ))}
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full py-5 bg-primary text-white rounded-[1.5rem] text-[12px] font-bold uppercase tracking-widest transition-all hover:bg-primary/90 shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Code'
          )}
        </button>
      </div>

      {renderGeneratedContent()}
    </div>
  );
}


export function CIDDecoderView({ onLog }: { onLog?: (label: string) => void }) {
  const [cidInput, setCidInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<null | {
    version: number;
    codec: string;
    hashAlg: string;
    hashLen: number;
    base: string;
    cid: string;
  }>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (result?.cid) {
      navigator.clipboard.writeText(result.cid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAnalyze = () => {
    if (!cidInput.trim()) return;
    onLog?.('CID.Decode');
    
    setAnalyzing(true);
    setError(null);
    setResult(null);

    // Simulate analysis delay
    setTimeout(() => {
      setAnalyzing(false);
      
      const input = cidInput.trim();
      
      // Simple mock validation logic
      if (input.startsWith('Qm') && input.length === 46) {
        setResult({
          version: 0,
          codec: 'dag-pb',
          hashAlg: 'sha2-256',
          hashLen: 32,
          base: 'base58btc',
          cid: input
        });
      } else if (input.startsWith('b') && input.length >= 59) {
        setResult({
          version: 1,
          codec: 'raw', // Mock guess
          hashAlg: 'sha2-256',
          hashLen: 32,
          base: 'base32',
          cid: input
        });
      } else {
        setError('Invalid or unrecognized CID format.');
      }
    }, 600);
  };

  return (
    <div className="p-16 max-w-4xl mx-auto h-full flex flex-col">
      <h1 className="text-4xl font-bold mb-10 tracking-tight italic flex items-center gap-4">
        CID Decoder
      </h1>
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2rem] p-12 mb-10 shadow-2xl">
        <input 
          type="text" 
          value={cidInput}
          onChange={(e) => setCidInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
          placeholder="Paste Content Identifier (CID)..." 
          className="w-full bg-black/20 border border-white/10 rounded-[1.5rem] px-8 py-5 focus:outline-none focus:border-primary/50 transition-all font-mono text-xs mb-8 placeholder:text-text-secondary"
        />
        <button 
          onClick={handleAnalyze}
          disabled={analyzing || !cidInput.trim()}
          className="w-full py-4 bg-primary text-white rounded-[1.5rem] text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {analyzing ? (
            <>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                <History className="w-4 h-4" />
              </motion.div>
              ANALYZING...
            </>
          ) : 'ANALYZE IDENTIFIER'}
        </button>
      </div>
      
      {error && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center mb-8 space-y-4">
          <div className="flex items-center gap-2 bg-[#EF4444]/15 border border-[#EF4444]/35 px-4 py-2 rounded-full h-9">
            <X className="w-4 h-4 text-[#EF4444]" />
            <span className="text-[#EF4444] text-sm font-bold">Invalid CID</span>
          </div>
          <div className="flex flex-col items-center">
             <span className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">Status</span>
             <span className="text-sm font-bold text-[#EF4444]">Invalid</span>
          </div>
        </motion.div>
      )}

      {result && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex flex-col items-center justify-center mb-6 space-y-4">
            <div className="flex items-center gap-2 bg-[#22C55E]/15 border border-[#22C55E]/35 px-4 py-2 rounded-full h-9">
              <Check className="w-4 h-4 text-[#22C55E]" />
              <span className="text-[#22C55E] text-sm font-bold">Valid CID</span>
            </div>
            <div className="flex flex-col items-center">
               <span className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">Status</span>
               <span className="text-sm font-bold text-[#22C55E]">Valid</span>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 mb-4">
             <button 
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 hover:border-primary/50 text-[10px] font-bold uppercase tracking-widest text-text-secondary hover:text-white transition-all shadow-lg"
             >
                {copied ? <Check className="w-3 h-3 text-[#22C55E]" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied!' : 'Copy CID'}
             </button>
             <button 
                onClick={() => window.open(`https://ipfs.io/ipfs/${result.cid}`, '_blank', 'noopener,noreferrer')}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 hover:bg-primary/20 hover:border-primary/50 text-[10px] font-bold uppercase tracking-widest text-primary transition-all shadow-lg"
             >
                <ExternalLink className="w-3 h-3" />
                Open in IPFS Gateway
             </button>
          </div>
          <div className="p-10 border border-white/10 bg-white/[0.03] backdrop-blur-xl rounded-[2rem] shadow-2xl">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-8 text-primary">CID Breakdown</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <span className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">Version</span>
                <p className="font-mono text-lg">CIDv{result.version}</p>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">Base Encoding</span>
                <p className="font-mono text-lg text-info">{result.base}</p>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">Codec</span>
                <p className="font-mono text-lg text-success">{result.codec}</p>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">Hash Algorithm</span>
                <p className="font-mono text-lg text-warning">{result.hashAlg}</p>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-white/10 space-y-2">
              <span className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">Hash Length</span>
              <p className="font-mono text-sm">{result.hashLen} bytes</p>
            </div>
          </div>
        </motion.div>
      )}

      {!result && !error && (
        <div className="space-y-4 opacity-40 mt-8">
          <div className="p-10 border border-white/10 border-dashed rounded-[2rem] flex flex-col items-center justify-center text-center">
            <Hash className="w-10 h-10 mb-4 text-text-secondary" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Input CID to see multihash breakdown</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function TransactionExplorerView({ onLog }: { onLog?: (label: string) => void }) {
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<null | {
    type: 'transaction' | 'address';
    hash: string;
    status?: string;
    amount?: string;
    from?: string;
    to?: string;
    timestamp?: string;
    balance?: string;
    messagesCount?: number;
    blockHeight?: number;
    gasFee?: string;
    method?: string;
    network?: string;
  }>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSearch = async () => {
    if (!searchInput.trim()) return;
    onLog?.('Explorer.Search');

    setIsSearching(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch('/api/explorer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchInput }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || 'Transaction Not Found');
      }

      if (resData.type === 'transaction') {
        const d = resData.data;
        const isSuccess = d.receipt?.exitCode === 0;
        const gasFeeVal = d.fee ? ((Number(d.fee.baseFeeBurn || 0) + Number(d.fee.minerTip || 0)) / 1e18).toFixed(6) : '0';
        setResult({
          type: 'transaction',
          hash: d.cid,
          status: isSuccess ? 'Success' : 'Failed',
          amount: (Number(d.value) / 1e18).toFixed(4) + ' FIL',
          from: d.from,
          to: d.to,
          timestamp: new Date(d.timestamp * 1000).toLocaleString(),
          blockHeight: d.height,
          gasFee: gasFeeVal + ' FIL',
          method: d.method || 'Transfer',
          network: 'Mainnet'
        });
      } else {
        const d = resData.data;
        setResult({
          type: 'address',
          hash: d.address || d.robust || searchInput,
          balance: (Number(d.balance) / 1e18).toFixed(4) + ' FIL',
          messagesCount: d.messageCount,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Transaction Not Found');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="p-16 max-w-4xl mx-auto h-full flex flex-col">
      <h1 className="text-4xl font-bold mb-10 tracking-tight italic flex items-center gap-4">
        Tx Explorer
      </h1>
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2rem] p-12 mb-10 text-center shadow-2xl transition-all">
        {!result && (
          <>
            <div className="w-20 h-20 bg-black/20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-white/10 shadow-inner">
              <Search className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-4 tracking-tight uppercase tracking-widest italic">Chain Inspection</h3>
            <p className="text-text-secondary text-[11px] font-bold uppercase tracking-widest mb-10 max-w-xs mx-auto leading-loose opacity-60">
              Monitor protocol messages, <br /> sector updates, and FIL transfers.
            </p>
          </>
        )}
        <div className="max-w-xl mx-auto flex gap-3">
          <input 
            type="text" 
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search hash or address..." 
            className="flex-1 bg-black/20 border border-white/10 rounded-[1.5rem] px-8 py-4 focus:outline-none focus:border-primary/50 transition-all font-mono text-xs shadow-inner"
          />
          <button 
            onClick={handleSearch}
            disabled={isSearching || !searchInput.trim()}
            className="bg-primary text-white px-8 py-4 rounded-[1.5rem] text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary/20 disabled:opacity-50 hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            {isSearching ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                  <History className="w-4 h-4" />
                </motion.div>
                SEARCHING
              </>
            ) : 'SEARCH'}
          </button>
        </div>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 mb-10 bg-error/10 border border-error/20 rounded-[1.5rem] text-error text-center text-[10px] font-bold uppercase tracking-widest">
          {error}
        </motion.div>
      )}

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2rem] p-10 shadow-2xl flex-1"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-primary">
              {result.type === 'transaction' ? 'Transaction Details' : 'Address Overview'}
            </h3>
            {result.type === 'transaction' && (
              <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border flex items-center gap-2 ${result.status === 'Success' ? 'bg-success/20 text-success border-success/20' : 'bg-error/20 text-error border-error/20'}`}>
                {result.status === 'Success' ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                {result.status}
              </span>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-black/20 p-6 rounded-2xl border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary block mb-2">
                {result.type === 'transaction' ? 'Transaction Hash' : 'Address'}
              </span>
              <p className="font-mono text-sm break-all text-text-primary">{result.hash}</p>
            </div>

            {result.type === 'transaction' ? (
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-black/20 p-6 rounded-2xl border border-white/10">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary block mb-2">Block Height</span>
                  <p className="font-mono text-sm">{result.blockHeight}</p>
                </div>
                <div className="bg-black/20 p-6 rounded-2xl border border-white/10">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary block mb-2">Timestamp</span>
                  <p className="font-mono text-sm">{result.timestamp}</p>
                </div>
                <div className="bg-black/20 p-6 rounded-2xl border border-white/10">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary block mb-2">From</span>
                  <p className="font-mono text-sm break-all">{result.from}</p>
                </div>
                <div className="bg-black/20 p-6 rounded-2xl border border-white/10">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary block mb-2">To</span>
                  <p className="font-mono text-sm break-all">{result.to}</p>
                </div>
                <div className="bg-black/20 p-6 rounded-2xl border border-white/10">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary block mb-2">Value (FIL)</span>
                  <p className="font-mono text-lg font-bold text-info">{result.amount}</p>
                </div>
                <div className="bg-black/20 p-6 rounded-2xl border border-white/10">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary block mb-2">Gas Fee</span>
                  <p className="font-mono text-sm">{result.gasFee}</p>
                </div>
                <div className="bg-black/20 p-6 rounded-2xl border border-white/10">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary block mb-2">Method</span>
                  <p className="font-mono text-sm">{result.method}</p>
                </div>
                <div className="bg-black/20 p-6 rounded-2xl border border-white/10">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary block mb-2">Network</span>
                  <p className="font-mono text-sm text-primary">{result.network}</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-black/20 p-6 rounded-2xl border border-white/10">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary block mb-2">Balance</span>
                  <p className="font-mono text-2xl font-bold text-success">{result.balance}</p>
                </div>
                <div className="bg-black/20 p-6 rounded-2xl border border-white/10">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary block mb-2">Messages</span>
                  <p className="font-mono text-2xl font-bold">{result.messagesCount}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/10 mt-6">
              <button 
                onClick={() => handleCopy(result.hash)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 hover:border-primary/50 text-[10px] font-bold uppercase tracking-widest text-text-secondary hover:text-white transition-all shadow-lg"
              >
                {copied ? <Check className="w-3 h-3 text-[#22C55E]" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied!' : `Copy ${result.type === 'transaction' ? 'Hash' : 'Address'}`}
              </button>
              <button 
                onClick={() => window.open(`https://filfox.info/en/${result.type === 'transaction' ? 'message' : 'address'}/${result.hash}`, '_blank', 'noopener,noreferrer')}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 hover:bg-primary/20 hover:border-primary/50 text-[10px] font-bold uppercase tracking-widest text-primary transition-all shadow-lg"
              >
                <ExternalLink className="w-3 h-3" />
                Open in Filfox
              </button>
              <button 
                onClick={() => window.open(`https://filscan.io/${result.type === 'transaction' ? 'message' : 'address'}/${result.hash}`, '_blank', 'noopener,noreferrer')}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 hover:bg-secondary/20 hover:border-secondary/50 text-[10px] font-bold uppercase tracking-widest text-secondary transition-all shadow-lg"
              >
                <ExternalLink className="w-3 h-3" />
                Open in Filscan
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}