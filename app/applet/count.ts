import fs from 'fs';
const code = fs.readFileSync('src/App.tsx', 'utf8');
let open = 0, close = 0;
for (let char of code) {
  if (char === '{') open++;
  else if (char === '}') close++;
}
console.log('Open:', open, 'Close:', close);
