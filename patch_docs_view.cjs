const fs = require('fs');

const content = fs.readFileSync('src/components/Views.tsx', 'utf8');

const targetStr = `const OLD_DOC_TOPICS = [`;
const targetEnd = `export function CodeGeneratorView({ onLog }: { onLog?: (label: string) => void }) {`;

const startIndex = content.indexOf(targetStr);
const endIndex = content.indexOf(targetEnd);

const before = content.substring(0, startIndex);
const after = content.substring(endIndex);

const newComponent = `export function DocumentationView({ onLog }: { onLog?: (label: string) => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<typeof DOC_TOPICS[0] | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);

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
      const match = /language-(\\w+)/.exec(className || '')
      return !inline && match ? (
        <div className="relative group mt-4 mb-6 rounded-xl overflow-hidden border border-white/10">
          <div className="flex items-center justify-between px-4 py-2 bg-black/40 border-b border-white/10">
            <span className="text-[10px] font-mono text-white/50">{match[1]}</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(String(children).replace(/\\n$/, ''))
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
            {String(children).replace(/\\n$/, '')}
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
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input 
                type="text" 
                placeholder="Search by title, keyword, or content..." 
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
                    <span className={\`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full \${
                      topic.difficulty === 'Beginner' ? 'bg-success/20 text-success' :
                      topic.difficulty === 'Intermediate' ? 'bg-warning/20 text-warning' :
                      'bg-error/20 text-error'
                    }\`}>
                      {topic.difficulty}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-text-secondary font-medium">
                      <Clock className="w-3 h-3" /> {topic.readingTime}
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
                <span className={\`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full \${
                  selectedTopic.difficulty === 'Beginner' ? 'bg-success/20 text-success' :
                  selectedTopic.difficulty === 'Intermediate' ? 'bg-warning/20 text-warning' :
                  'bg-error/20 text-error'
                }\`}>
                  {selectedTopic.difficulty}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-text-secondary font-medium">
                  <Clock className="w-4 h-4" /> {selectedTopic.readingTime}
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

`;

fs.writeFileSync('src/components/Views.tsx', before + newComponent + after);
