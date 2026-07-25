const fs = require('fs');
let content = fs.readFileSync('src/components/Views.tsx', 'utf8');

// Find the end of TransactionExplorerView
const textToFind = `          </div>
        </motion.div>
      )}
    </div>
  );
}`;

const goodEnd = textToFind;
content = content.substring(0, content.indexOf(textToFind) + textToFind.length);
fs.writeFileSync('src/components/Views.tsx', content);
