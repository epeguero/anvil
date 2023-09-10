'use client';

import React, { MutableRefObject, Ref, useEffect, useState } from 'react';
import * as ts from "typescript";
import {CodeEditorRef, useSandpack} from "@codesandbox/sandpack-react"
import EditorSidebar from '@/components/EditorSidebar';
import ElementDrawer from '@/components/ElementDrawer';
import ElementEditor from '@/components/ElementEditor';
import { MixIcon } from '@radix-ui/react-icons';
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

export default function Home() {
  const [userFiles, setUserFiles] = useState<{[key: string]: SandpackFile}>({});
  // let codeMirrorInstance = React.useRef<CodeEditorRef>();

  // useEffect(() => {
  //   console.log("cm ref effect");
  //   const cm = codeMirrorInstance.current;
  //   if(cm) codeMirrorInstance.current = cm;
  // }, [codeMirrorInstance]
  // );
  
  useEffect(() => {
    console.log("useEffect");
    // window.onstorage = (event) => {
    //   console.log(event);
    //   // if(event.key && event.newValue) {
    //   //   setUserFiles((uf) => ({
    //   //     ...uf, 
    //   //     [`${event.key}`]: {code: event.newValue as string}
    //   //   }))
    //   // }
    // }
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
import MyComponent from './MyComponent.tsx';
ReactDOM
  .createRoot(document.getElementById('root'))
  .render(<MyComponent/>);
` 
    )
    window.localStorage.setItem('/components/MyComponent.tsx', printAst(tsx('MyComponent', ['A', 'B'])));
    window.localStorage.setItem('/components/A.tsx', printAst(tsx('A')));
    window.localStorage.setItem('/components/B.tsx', printAst(tsx('B')));
    setUserFiles((uf) =>
      ["/components/MyComponent.tsx", "/components/A.tsx", "/components/B.tsx", "/package.json", "/index.js"]
      .reduce(
        (acc: {[key: string]: {code: string}}, file: string) => {
          const code = window.localStorage.getItem(file);
          return code ? {...acc, [file]: {code}} : acc;
        }, uf
      )
    )
  }, []);

  // useEffect(() => {
  //   Object.entries(blobs).forEach(([filename, blobUrl]) => 
  //     fetch(blobUrl)
  //       .then(response => response.text())
  //       .then(code =>
  //         setUserFiles((uf) => ({
  //           ...uf,
  //           [filename]: { code }
  //         }))
  //       )
  //   )
  // }, [userFiles]);

  return (
    <div className='flex flex-nowrap '>
        <div className='flex-auto'>
            <ElementEditor userFiles={userFiles}/>
        </div>
        <EditorSidebar/>
        <div className='absolute bottom-0 left-0 right-0 p-4'>
          <ElementDrawer/>
        </div>
    </div>
  )
}