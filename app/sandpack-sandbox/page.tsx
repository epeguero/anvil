'use client';

import React, { useEffect, useState } from 'react';
import * as ts from "typescript";
import EditorSidebar from '@/components/EditorSidebar';
import ElementDrawer from '@/components/ElementDrawer';
import ElementEditor from '@/components/ElementEditor';

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
    <>
    <div className='flex flex-nowrap '>
      <div className='flex-auto'>
        {userFiles
        ? <ElementEditor  activeFile={"MyComponent"} 
                          userFiles={userFiles}/>
        : <div>Loading...</div>}
      </div>
      <EditorSidebar/>
    </div>
    <ElementDrawer/>
    </>
  )
}