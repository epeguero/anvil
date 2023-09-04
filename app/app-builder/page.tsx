'use client'

import React, {JSX, useEffect, useState, lazy, LazyExoticComponent, Suspense} from 'react';
// import ReactDefault, * as ReactNamed from 'react';
// console.log(ReactDefault);
// console.log(ReactNamed);
// import npm from 'npm';
// const React = require('react');
// const useState = React.useState;
// const useEffect = React.useEffect;

// import * as browserify from 'browserify';
// browserify.require('react');

// import loadable, { LoadableClassComponent } from '@loadable/component';
import * as ts from "typescript";

import * as Ace from "ace-builds";
import "ace-builds/src-noconflict/theme-mono_industrial";
import "ace-builds/src-noconflict/mode-typescript";
import "ace-builds/src-noconflict/mode-jsx";
import "ace-builds/src-noconflict/keybinding-vim";

export default function Home() : JSX.Element {
  const [sourceCode, setSourceCode] = useState<string>(
`
export default function() {
  return (42)
}`
// `
// import React, {useState} from 'react';

// export default function() {
//   const [n, setN] = useState(0);
//   return (
//     <>
//       <button onClick={() => setN(n+1)}>Increment</button>
//       <div>{n}</div>
//     </>
//   )
// }`
  );

  return (
    <>
      <div  style={{
              display: "flex", flexDirection: "column", 
              width: '100vw', height: '100vh'
            }}
      >
        <div  style={{ flex: '1 0 0' }} >
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
  // const [DynamicComponent, setDynamicComponent] = useState<LoadableClassComponent<any> | null>(null);
  const [DynamicComponent, setDynamicComponent] = useState<LazyExoticComponent<any> | null>(null);
  const [importMapInstalled, setImportMapInstalled] = useState<boolean>(false);
  
  useEffect(() => {
      (() => {
        if(!importMapInstalled) {
          // add import map
          window.React = React;
          const namedExports = Object.keys(React).map(key => 
            `${key} = React.${key}`
          ).join(', ');
          console.log(namedExports);

          const im = document.createElement('script');
          im.textContent = JSON.stringify({
            imports: {
              'react': 'data:application/javascript;charset=utf-8,' + encodeURIComponent(
                ` 
                  const React = window.React;
                  export default React;
                  export const ${namedExports};
                `
              ),
            }
          });
          im.type = 'importmap';
          document.head.appendChild(im);

          const transpile = (code: string): string => 
            ts.transpileModule(code, {
                compilerOptions: {
                  target: ts.ScriptTarget.Latest,
                  module: ts.ModuleKind.ESNext,
                  jsx: ts.JsxEmit.React
                },
                reportDiagnostics: true
              }
            ).outputText;

          const code = transpile(`
              import React, {useState} from 'react';
              export default function F() {
                const [n, setN] = useState(0);
                return <>
                  <button onClick={() => setN(n+1)}>Increment</button>
                  <br/>
                  {n}
                </>;
              }
            `);

          // add module script
          const blob = new Blob(
            [code], 
            { type: "application/javascript" }
          );

          const blobUrl = URL.createObjectURL(blob);

          ( async() => {
            setDynamicComponent( () => 
              React.lazy(() => {
                return import(/* webpackIgnore: true */ blobUrl).then(m => {console.log(m); return m})
              })
            )
          })()

          setImportMapInstalled(true);
        }
      })()
  })

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

    console.log(transpiled.outputText);
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
            // setDynamicComponent( () =>
            //   loadable(() => {
            //     return import(/* webpackIgnore: true */ blobUrl)
            //     .then((module) => {
            //       console.log(module.default); 
            //       return module.default;
            //     })
            //   }
            // ))
          } catch (error) {
            console.log(error);
          }
        }
      )()

    }
  }, [source]);

  console.log(DynamicComponent);
  return (
    <div style={{display:'flex', flexDirection: 'column', height: '100%'}}>
      <div style={{
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
                flex: '2 1 0'
              }}>
        
        { !diagnostics?.length && DynamicComponent
        ? 
          // (function () {
          //   const m = document.createElement('script');
          //   // m.type = 'module-shim';
          //   // m.textContent = `
          //   //   import DynamicReact from 'react';
          //   //   console.log(DynamicReact === React);
          //   // `;
          //   document.head.appendChild(m);
          // })()
          <Suspense fallback={<div>Loading...</div>}>
            <DynamicComponent/>
          </Suspense>
        : null
        }
      </div>
      <div style={{display: 'flex', flex: '1 1 0', flexDirection: 'column' }}>
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
    </div>
  );
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
    });

    editor.current?.resize();

    return (
      <div style = {{ minWidth: "100%", minHeight: "100%" }}
           ref={editorHost}
      />
    );
}