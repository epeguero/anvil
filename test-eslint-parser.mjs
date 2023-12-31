import {ESLint} from 'eslint';

(async function main() {
    const eslint = new ESLint({
      useEslintrc: false,
      overrideConfig: {
        extends: [
          "eslint:recommended",
          "plugin:@typescript-eslint/recommended",    
          "react-app"
        ],
        parserOptions: {
            sourceType: "module",
            ecmaVersion: "latest",
        },
        env: {
            es2022: true,
            node: true,
        },
        // extends: [
        //   'next/core-web-vitals',
        //   "plugin:@typescript-eslint/strict-type-checked",
        //   "airbnb/hooks",
        //   "airbnb-typescript",
        //   "plugin:react/recommended",
        //   "plugin:react/jsx-runtime",
        //   "plugin:@typescript-eslint/recommended",
        //   "plugin:@typescript-eslint/recommended-requiring-type-checking",
        //   // "plugin:prettier/recommended",
        //   // "plugin:import/recommended"
        // ],
        // "rules": {
        //   'import/no-anonymous-default-export': 'off',
        //   'react/display-name': 'off'
        // },
        // "parser": "@typescript-eslint/parser",
        // "parserOptions": {
        //   "ecmaFeatures": {
        //     "jsx": true
        //   },
        //   "ecmaVersion": "latest",
        //   "sourceType": "module",
        //   "project": ["./tsconfig.json"],
        //   "extraFileExtensions": ["."]
        // },
      },
    });

    const sourceCode = 
    `import React, {useState, JSX} from 'react';

     export default function Increment(): JSX.Element { const [n, setN] = useState<(0); return ( <> <button onClick={() => setN(n-1)}></button> <div>{n}</div> </>);
    }
     
    `;

    const results = await eslint.lintText(sourceCode);
    results.source = sourceCode
    console.dir(results, {depth: null});

    const formatter = await eslint.loadFormatter("stylish");
    const resultText = formatter.format(results);

    console.dir(resultText.length, {depth: null});

})().catch((error) => {
    process.exitCode = 1;
    console.error(error);
});