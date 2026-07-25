const fs = require('fs');
let content = fs.readFileSync('src/components/Views.tsx', 'utf8');

const targetContent = `  const handleExecute = () => {
    setIsExecuting(true);
    setOutput(null);
    
    // Simulate API call
    setTimeout(() => {
      setOutput(selectedEndpoint.mockResponse);
      setIsExecuting(false);
    }, 800);
  };`;

const replacementContent = `  const handleExecute = async () => {
    setIsExecuting(true);
    setOutput(null);
    onLog?.(\`API.\${selectedEndpoint.method}\`);
    
    try {
      const response = await fetch(selectedEndpoint.url, {
        method: selectedEndpoint.method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: selectedEndpoint.method !== 'GET' ? requestBody : undefined
      });
      
      const data = await response.json();
      
      if (response.status === 503 && data.error === "Live Filecoin node not configured.") {
        setOutput(data.error);
        return;
      }
      
      if (data.url) {
        let out = \`URL: \${data.url}\\n\`;
        out += \`Method: \${data.method}\\n\`;
        out += \`Headers: \${JSON.stringify(data.headers, null, 2)}\\n\`;
        out += \`Body: \${data.body}\\n\\n\`;
        out += \`Raw Response:\\n\${data.rawResponse}\`;
        setOutput(out);
      } else {
        setOutput(JSON.stringify(data, null, 2));
      }
    } catch (e: any) {
      setOutput(\`Error: \${e.message}\`);
    } finally {
      setIsExecuting(false);
    }
  };`;

content = content.replace(targetContent, replacementContent);
fs.writeFileSync('src/components/Views.tsx', content);
