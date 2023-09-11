'use client';

import React, { useEffect, useState } from 'react';
import * as ts from "typescript";
import { ComponentEditor } from '@/components/ComponentEditor';
import { SandpackFile } from '@codesandbox/sandpack-react';

function printAst(ast: ts.Node) {
  return ts.createPrinter().printNode(
      ts.EmitHint.Unspecified, 
      ast,
      undefined as any
  )
}

function jsxSelfClose(name: string) {
  return (
    ts.factory.createJsxSelfClosingElement(
      ts.factory.createIdentifier(name),
      [],
      ts.factory.createJsxAttributes([])
    )
  )
}

function jsxFun(name: string, children: string[] = []) {
  return ts.factory.createFunctionDeclaration(
    [ts.SyntaxKind.ExportKeyword, ts.SyntaxKind.DefaultKeyword]
      .map((k) => ts.factory.createModifier(k as ts.ModifierSyntaxKind)),
    undefined,
    ts.factory.createIdentifier(name),
    [],
    [],
    undefined,
    ts.factory.createBlock(
      [
        ts.factory.createReturnStatement(
          ts.factory.createParenthesizedExpression(
            ts.factory.createJsxFragment(
              ts.factory.createJsxOpeningFragment(),
              children.map(jsxSelfClose),
              ts.factory.createJsxJsxClosingFragment()
            )
          )
        )
      ]
    )
  )
}

function importDecl(importClause: string, moduleSpec: string) {
  return ts.factory.createImportDeclaration(
    [],
    ts.factory.createImportClause(
      false,
      ts.factory.createIdentifier(importClause),
      undefined
    ),
    ts.factory.createStringLiteral(moduleSpec),
    undefined
  );
}

function tsx(name: string, children: string[] = [], externalDeps: ts.ImportDeclaration[] = []) {
  const tsx = ts.createSourceFile(
    `${name}.tsx`,
    '',
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TS
  );
  tsx.statements = ts.factory.createNodeArray([
    ...externalDeps,
    ...children.map(c => importDecl(c, `./${c}`)),
    jsxFun(name, children)
  ]);

  return tsx;
}

const spinnerFiles = {
  "/index.js" : {
    code: 
`import ReactDOM from 'react-dom/client';
import { Blocks } from 'react-loader-spinner';
ReactDOM
  .createRoot(document.getElementById('root'))
  .render(
    <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
      <Blocks
        visible={true}
        height="80"
        width="80"
        ariaLabel="blocks-loading"
        wrapperStyle={{}}
        wrapperClass="blocks-wrapper"
      />
      Loading user files...
    </div>
  );
` 

  },

  "/package.json": {
    code: JSON.stringify(
      {
        main: "index.js",
        dependencies: { 
          'react': "latest",
          'react-dom': "latest",
          'react-loader-spinner': "latest"
        },
      }
    )
  },
}

export default function Home() {
  const [userFiles, setUserFiles] = useState<{[key: string]: SandpackFile}>({});
  
  useEffect(() => {
    console.log("useEffect");
    window.localStorage.setItem('/package.json', 
      JSON.stringify(
        {
          main: "index.js",
          dependencies: { 
            'react': "latest",
            'react-dom': "latest"
          },
        }
      )
    );

    window.localStorage.setItem('/index.js', 
`import ReactDOM from 'react-dom/client';
import MyComponent from './components/MyComponent.tsx';
ReactDOM
  .createRoot(document.getElementById('root'))
  .render(<>MyComponent<br/><MyComponent/></>);
` 
    )
    window.localStorage.setItem('/components/MyComponent.tsx', printAst(tsx('MyComponent', ['A', 'B'])));
    window.localStorage.setItem('/components/A.tsx', printAst(tsx('A')));
    window.localStorage.setItem('/components/B.tsx', printAst(tsx('B')));
    setUserFiles((uf) => {
        const files = 
          ["/components/MyComponent.tsx", "/components/A.tsx", "/components/B.tsx", "/package.json", "/index.js"]
          .reduce(
            (acc: {[key: string]: SandpackFile}, file: string) => {
              const code = window.localStorage.getItem(file);
              return code ? {...acc, [file]: {code}} : acc;
            }, uf
          )
        files["/index.js"].readOnly = true;
        return files;
      }
    )
  }, []);

  return (
    <ComponentEditor userFiles={userFiles}/>
    // <div className='flex flex-nowrap '>
    //     <div className='flex-auto'>
    //         <ElementEditor userFiles={userFiles}/>
    //     </div>
    //     <EditorSidebar/>
    //     <div className='absolute bottom-0 left-0 right-0 p-4'>
    //       <ElementDrawer/>
    //     </div>
    // </div>
  )
}