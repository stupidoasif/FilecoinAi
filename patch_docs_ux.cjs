const fs = require('fs');

let content = fs.readFileSync('src/components/Views.tsx', 'utf8');

const targetState = `  const [selectedTopic, setSelectedTopic] = useState<typeof DOC_TOPICS[0] | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);

  // Auto-scroll on topic change`;

const newState = `  const [selectedTopic, setSelectedTopic] = useState<typeof DOC_TOPICS[0] | null>(() => {
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

  // Auto-scroll on topic change`;

content = content.replace(targetState, newState);


const targetNavigation = `  const prevTopic = currentIdx > 0 ? DOC_TOPICS[currentIdx - 1] : null;
  const nextTopic = currentIdx !== -1 && currentIdx < DOC_TOPICS.length - 1 ? DOC_TOPICS[currentIdx + 1] : null;

  const handleExplain = async () => {`;

const newNavigation = `  const prevTopic = currentIdx > 0 ? DOC_TOPICS[currentIdx - 1] : null;
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

  const handleExplain = async () => {`;

content = content.replace(targetNavigation, newNavigation);

const targetInput = `<input 
                type="text" 
                placeholder="Search by title, keyword, or content..." `;

const newInput = `<input 
                ref={searchInputRef}
                type="text" 
                placeholder="Search by title, keyword, or content... (Press '/' to focus)" `;

content = content.replace(targetInput, newInput);

fs.writeFileSync('src/components/Views.tsx', content);
