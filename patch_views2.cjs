const fs = require('fs');

const content = fs.readFileSync('src/components/Views.tsx', 'utf8');

const targetStr = `import { Search, Check, X, Terminal, Code2, Calculator, Hash, History, Settings, ExternalLink, ChevronLeft, Loader2, Copy, Download, Maximize } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const DOC_TOPICS = [`;

const replacement = `import { Search, Check, X, Terminal, Code2, Calculator, Hash, History, Settings, ExternalLink, ChevronLeft, ChevronRight, Loader2, Copy, Download, Maximize, FileText, Clock, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { DOC_TOPICS } from '../data/docs';

const OLD_DOC_TOPICS = [`;

fs.writeFileSync('src/components/Views.tsx', content.replace(targetStr, replacement));
