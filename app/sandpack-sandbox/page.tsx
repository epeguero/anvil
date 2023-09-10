'use client';

import React, { useEffect, useState } from 'react';
import {SandpackCodeEditor, SandpackLayout, SandpackPreview, SandpackProvider, SandpackConsumer, SandpackReactContext, SandpackContext, SandpackFile} from "@codesandbox/sandpack-react";
import { EditorView, ViewUpdate } from "@codemirror/view"
import * as ts from "typescript";
import EditorSidebar from '@/components/EditorSidebar';
import { sandpackDark } from "@codesandbox/sandpack-themes";

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
  useEffect(() => {
    console.log("useEFfect");
    // window.onstorage = (event) => {
    //   console.log(event);
    //   if(event.key && event.newValue) {
    //     setUserFiles((uf) => ({
    //       ...uf, 
    //       [`${event.key}`]: {code: event.newValue as string}
    //     }))
    //   }
    // }
    window.localStorage.setItem('MyComponent', printAst(tsx('MyComponent', ['A', 'B'])));
    window.localStorage.setItem('A', printAst(tsx('A')));
    window.localStorage.setItem('B', printAst(tsx('B')));
    setUserFiles((uf) =>
      ["MyComponent", "A", "B"]
      .reduce(
        (acc: {[key: string]: {code: string}}, e: string) => {
          const code = window.localStorage.getItem(e);
          return code ? {...acc, [`/components/${e}.tsx`]: {code}} : acc;
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
    <div className='flex flex-nowrap h-screen'>
      <div className='flex-auto'>
        {userFiles
        ? <Sandbox  activeFile={"MyComponent"} 
                    userFiles={userFiles}/>
        : <div>Loading...</div>}
      </div>
      <EditorSidebar/>
    </div>
  )
}

function Sandbox({
  activeFile,
  userFiles
}: {
  activeFile: string,
  userFiles: {[key: string]: {code: string }}
}) {
  console.log(userFiles);
  return (
    <SandpackProvider
      theme={sandpackDark}
      options ={{
        visibleFiles: [`/components/${activeFile}.tsx`, '/package.json', '/index.js']
      }}
      customSetup = {
        {
          dependencies: {
            "react": "latest"
          },
//           entry: 
// `import ReactDOM from 'react-dom/client';
// import ${activeFile} from './${activeFile}.tsx';
// ReactDOM
//   .createRoot(document.getElementById('root'))
//   .render(<${activeFile}/>);
// ` 
        }
      }
      files = {
        { 
          ...userFiles,
          "/package.json": {
            code: JSON.stringify(
              {
                main: "index.js",
                dependencies: { 
                  'react': "latest",
                  'react-dom': "latest"
                },
              }
            )
          },

          // Main file
          "/index.js": { 
            readOnly: true,
            code: 
`import ReactDOM from 'react-dom/client';
import ${activeFile} from './components/${activeFile}.tsx';
ReactDOM
  .createRoot(document.getElementById('root'))
  .render(<${activeFile}/>);
` 
          }
        }
      }
    >
      <SandpackLayout className='flex-col items-stretch h-screen'>
        <SandpackPreview showOpenInCodeSandbox={false}/>
        <SandpackConsumer>
        { (ctx: SandpackContext | null) => (
            <SandpackCodeEditor 
              // ref={codeMirrorInstance} 
              // initMode="immediate"
              extensions={[
                EditorView.updateListener.of(
                  (update: ViewUpdate) => {
                    // console.log(ctx);
                  }
                )
              ]}
              showLineNumbers
              showInlineErrors
            />
          )
        }
        </SandpackConsumer>
      </SandpackLayout>
    </SandpackProvider>
  )
}

function Outline() {
  return (<div className='w-96 h-96 bg-sky-500/50'></div>)
}