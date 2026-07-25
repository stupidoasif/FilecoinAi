const fs = require('fs');

let content = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

// Insert import after line 1
content = content.replace(
  "import { useState } from 'react';",
  "import { useState } from 'react';\nimport logoImage from '../assets/logo.jpg';"
);

content = content.replace(
  '<img src="/logo.jpg" alt="Filecoin AI Logo" className="w-full h-full object-cover" />',
  '<img src={logoImage} alt="Filecoin AI Logo" className="w-full h-full object-cover" />'
);

fs.writeFileSync('src/components/Sidebar.tsx', content);

let chatContent = fs.readFileSync('src/components/ChatInterface.tsx', 'utf8');
chatContent = chatContent.replace(
  "import React, { useState, useRef, useEffect } from 'react';",
  "import React, { useState, useRef, useEffect } from 'react';\nimport logoImage from '../assets/logo.jpg';"
);
chatContent = chatContent.replace(
  '<img src="/logo.jpg" alt="Filecoin AI Logo" className="w-full h-full object-cover" />',
  '<img src={logoImage} alt="Filecoin AI Logo" className="w-full h-full object-cover" />'
);

fs.writeFileSync('src/components/ChatInterface.tsx', chatContent);
