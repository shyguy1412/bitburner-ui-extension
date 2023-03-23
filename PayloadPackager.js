const fs = require('fs');
const path = require('path');

const filename = 'ui';

const jsfile = path.join(__dirname, 'dist', `${filename}.js`);
const cssFile = path.join(__dirname, 'dist', `${filename}.css`);

fs.watchFile(jsfile, () => package());
fs.watchFile(cssFile, () => package());

function package() {
  fs.writeFileSync(
    path.join(__dirname, 'src/bitburner/dist', 'payload.js'),
   /*js*/`export const payload=['${encode(jsfile)}', '${encode(cssFile)}']`
  )
  console.log(new Date() + 'Packaged');
}

function encode(string){
  return Buffer.from(fs.readFileSync(string)).toString('base64')
}