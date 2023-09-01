'use client'

import React, {JSX, useEffect, useState} from 'react';

import loadable, { LoadableClassComponent } from '@loadable/component';
import * as ts from "typescript";
// import JsxParser from 'react-jsx-parser'

import * as Ace from "ace-builds";
import "ace-builds/src-noconflict/theme-mono_industrial";
import "ace-builds/src-noconflict/mode-typescript";
import "ace-builds/src-noconflict/mode-jsx";
import "ace-builds/src-noconflict/keybinding-vim";

export default function Home() : JSX.Element {
  const [sourceCode, setSourceCode] = useState<string>(
// `
// import React from 'react';

// export default function() {
//   return (
//       <div>Hello World!</div>
//   )
// }`
`
const React = await import('https://cdn.jsdelivr.net/npm/@esm-bundle/react/esm/react.development.min.js');
export default function() {
  return (
      <div>Hello World!</div>
  )
}`
  );

  return (
    <>
      <div  style={{
              display: "flex", flexDirection: "column", 
              width: '100vw', height: '100vh'
            }}
      >

        {/* <script type='importmap'>
          {
          ` {
              "imports": {
                "react": "../../node_modules/react"
              }
            }
          `
          }
        </script> */}
        {/* <script src="https://unpkg.com/systemjs@6.3.2/dist/system.js"></script>
        <script type="systemjs-importmap">
          {`
              {
                // for each library you add u have to include it here
                // documentation is here [systemjs import maps][3]d
                "imports": {
                  "react": "https://unpkg.com/react@16/umd/react.production.min.js",
                  "react-dom": "https://unpkg.com/react-dom@16/umd/react-dom.production.min.js"
                }
              }
          `}
        </script> */}
        <div  style={{
                background: 
                  `repeating-linear-gradient(
                      135deg,
                      #606dbc,
                      #606dbc 10px,
                      #465298 10px,
                      #465298 20px
                    )`, 
                borderRadius: '15px',
                padding: '1em',
                flex: '1 0 0'
              }}
        >
          <CustomComponent source={sourceCode} />
        </div>

        <div  style= {{ flex: '1 0 0' }}
        >
          <CodeEditor initialCode={sourceCode} onCodeChange={setSourceCode}/>
        </div>

      </div>
    </>
  );
}

const CustomComponent = ({ 
  source
} : {
  source: string
}) => {
  const [diagnostics, setDiagnostics] = useState<ts.Diagnostic[] | undefined>(undefined);
  const [outputCode, setOutputCode] = useState("");
  const [DynamicComponent, setDynamicComponent] = useState<LoadableClassComponent<any>>(null);
  const [module, setModule] = useState<any>(null);
  
  useEffect(() => {
    const transpiled = ts.transpileModule(source, {
        compilerOptions: {
          target: ts.ScriptTarget.Latest,
          module: ts.ModuleKind.ESNext,
          jsx: ts.JsxEmit.React
        },
        reportDiagnostics: true
      }
    );
    setOutputCode(transpiled.outputText);

    console.log(transpiled);
    setDiagnostics(transpiled.diagnostics);

    if(!transpiled.diagnostics?.length) {
      const blob = new Blob(
        [transpiled.outputText], 
        { type: "application/javascript" }
      );

      const blobUrl = URL.createObjectURL(blob);

      (
        async () => {
          try {
            setDynamicComponent( () =>
              loadable(() => {
                return import(/* webpackIgnore: true */ blobUrl)
                .then((module) => {
                  console.log(module.default); 
                  return module.default;
                })
              }
            ))
          } catch (error) {
            console.log(error);
          }
        }
      )()

    }
  }, [source]);

  console.log(DynamicComponent);
  console.log(module);
  console.log(outputCode);
  return (
    <div>
      <div>
        <script>
          {
          ` {
              "imports": {
                "react": "https://cdn.jsdelivr.net/npm/@esm-bundle/react/esm/react.development.min.js"
              }
            }
          `
          }
        </script>
        { DynamicComponent
        ? ( 
            <div>
              Compiled Code<br/>
              {/* {DynamicComponent.render(null, React)} */}
              {DynamicComponent.render({ref: {'react': React}})}
              {/* {module.default()} */}
              {/* {new Function("f", "React.createElement('div', null, 'HelloWorld!')")()} */}
              {outputCode}
              {/* {eval("React.createElement('div', null, 'HelloWorld!')")} */}
              {/* {React.createElement('div', null, 'HelloWorld!')} */}
              {/* <script>
                React.createElement('div', null, 'HelloWorld!')
              </script> */}
            </div>
          )
        : (
            <div>
              Compilation Errors
              { (() => {
                  const sourceFile = ts.createSourceFile("Custom.tsx", source, ts.ScriptTarget.Latest);
                  return diagnostics?.map((d, ix) => {
                    const lineAndChar = sourceFile.getLineAndCharacterOfPosition(d.start ?? 0);
                    const line = lineAndChar.line + 1;
                    const charPos = lineAndChar.character;
                    return (
                      <div key={`diag${ix}`}>{
                        `Line ${line}, Position ${charPos}: ${d.messageText as string}`
                      }</div>
                    )
                  }
                )})()
              }
            </div>
          )}
      </div>
    </div>
  );
  // return ( <JsxParser jsx={source} /> );
};

function CodeEditor({
    onCodeChange,
    initialCode
  }: {
    onCodeChange?: (newCode: string) => void
    initialCode?: string
  }) {
    const editorHost = React.useRef<HTMLDivElement>(null);
    const editor:React.MutableRefObject<Ace.Ace.Editor|null> = React.useRef(null);

    React.useEffect(():void =>
    {
        if (editorHost.current != null)
            editor.current = Ace.edit(editorHost.current)

        if (editor.current != null) {
            editor.current.on('change', 
              () => {
                const code = editor.current?.getValue?.() ?? "";
                if (code != "") { onCodeChange?.(code) }
              }
            );

            editor.current.session.setMode("ace/mode/jsx");
            editor.current.session.setUseSoftTabs(true);
            editor.current.setShowPrintMargin(false);
            editor.current.setTheme("ace/theme/mono_industrial");
            editor.current.setKeyboardHandler("ace/keyboard/vim");
            editor.current.setValue(initialCode ?? "", -1);
            editor.current.clearSelection();
        }
    }, []);

    editor.current?.resize();

    return (
      <div style = {{ minWidth: "100%", minHeight: "100%" }}
           ref={editorHost}
      />
    );
}