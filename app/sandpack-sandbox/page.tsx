'use client';

import React from 'react';
import {SandpackCodeEditor, SandpackLayout, SandpackPreview, SandpackProvider, SandpackConsumer, SandpackReactContext, SandpackContext} from "@codesandbox/sandpack-react";
import { EditorView, ViewUpdate } from "@codemirror/view"
import * as ts from "typescript";

function printAst(ast: ts.Node) {
  return ts.createPrinter().printNode(
      ts.EmitHint.Unspecified, 
      ast,
      undefined as any
  )
}

function createModule(name: string, children: string[]) {
  return ts.factory.createModuleDeclaration(
    [],
    ts.factory.createIdentifier(name),
    ts.factory.createModuleBlock(
      [
        ts.factory.createExportDefault(
          ts.factory.createFunctionExpression(
            [],
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
                      [],
                      ts.factory.createJsxJsxClosingFragment()
                    )
                  )
                )
              ],
              true
            )
          )
        )
      ]
    ),
    undefined,
  );
}

export default function Home() {
  return (
    <Sandbox elementName={"MyComponent"} />
  )
}

function Sandbox({
  elementName
}: {
  elementName: string
}) {
  return (
    <SandpackProvider
      options ={{
        visibleFiles: [`/${elementName}.tsx`, '/package.json']
      }}
      customSetup = {
        {
          dependencies: {
            "react": "latest"
          },
        }
      }
      files = {
        { 
          [`/${elementName}.tsx`] : { 
            code: printAst(emptyModule(elementName))
          },
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
            code: 
`import ReactDOM from 'react-dom/client';
import ${elementName} from './${elementName}.tsx';
ReactDOM
  .createRoot(document.getElementById('root'))
  .render(<${elementName}/>);
` 
          }
        }
      }
    >
      <SandpackLayout>
        <SandpackConsumer>
        { (ctx: SandpackContext | null) => (
            <SandpackCodeEditor 
              // ref={codeMirrorInstance} 
              // initMode="immediate"
              extensions={[
                EditorView.updateListener.of(
                  (update: ViewUpdate) => {
                    console.log(ctx);
                  }
                )
              ]}
            />
          )
        }
        </SandpackConsumer>
        <SandpackPreview showOpenInCodeSandbox={false}/>
      </SandpackLayout>
    </SandpackProvider>
  )
}