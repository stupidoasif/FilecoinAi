const fs = require('fs');

let content = fs.readFileSync('src/components/Views.tsx', 'utf8');

const target1 = `                    </span>
                     
                  <h3 className="text-lg font-bold tracking-tight mb-3`;

const replacement1 = `                    </span>
                  </div>
                     
                  <h3 className="text-lg font-bold tracking-tight mb-3`;

content = content.replace(target1, replacement1);


const target2 = `                </span>
                 
              <h2 className="text-4xl font-bold mb-8 tracking-tight italic">{selectedTopic.title}</h2>`;

const replacement2 = `                </span>
              </div>
                 
              <h2 className="text-4xl font-bold mb-8 tracking-tight italic">{selectedTopic.title}</h2>`;

content = content.replace(target2, replacement2);

fs.writeFileSync('src/components/Views.tsx', content);
