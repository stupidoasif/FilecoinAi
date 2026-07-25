const fs = require('fs');
const image = fs.readFileSync('public/logo.jpg');
const base64 = image.toString('base64');
fs.writeFileSync('src/logoBase64.ts', `export const logoBase64 = 'data:image/jpeg;base64,${base64}';\n`);
