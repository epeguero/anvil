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
  // const sourceCode = await content('./app/page.tsx');
  const sourceCode = `
    import React, {useState} from 'react';

    export default function() {
      const [n, setN] = useState<(0);
      return (
        <>
          <button onClick={() => setN(n+1)}>Increment</button>
          <div>{n}</div>
        </>
      )
    }
  `;
  const parseResult = parse(sourceCode, {
    plugins: ['jsx', 'typescript']}
  );
  console.log(parseResult);
  const emittedCode = generate(parseResult);
  console.log(emittedCode);
})();