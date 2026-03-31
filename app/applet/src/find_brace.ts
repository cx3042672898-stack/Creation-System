import fs from 'fs';
const code = fs.readFileSync('/app/applet/src/App.tsx', 'utf8');
let open = 0;
let lines = code.split('\n');
for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  for (let j = 0; j < line.length; j++) {
    if (line[j] === '{') open++;
    else if (line[j] === '}') {
      open--;
      if (open === 0) {
        console.log(`Count reached 0 at line ${i + 1}, col ${j + 1}`);
      }
    }
  }
}
