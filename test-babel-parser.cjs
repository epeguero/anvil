const fs = require('fs/promises');
const parse = require('@babel/parser').parse;
const generate = require('@babel/generator').default;

// import fs from 'fs/promises';

// import { parse } from '@babel/parser';
// import babelParser from '@babel/parser';
// import * as babelParser from '@babel/parser';
// import { parse } from '@babel/parser';

// import generator from '@babel/generator';
// import generate from '@babel/generator';

async function content(path) {  
  return await fs.readFile(path, 'utf8');
}

(async () => {
  const sourceCode = await content('./app/page.tsx');
  const ast = parse(sourceCode, {plugins: ['jsx']});
  const emittedCode = generate(ast);
  console.log(emittedCode);
})();