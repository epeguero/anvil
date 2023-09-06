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
import { ErrorBoundary } from 'react-error-boundary';

export default function Home() : JSX.Element {
  const initialCode = 
`import React, {useState} from 'react';

export default function() {
  const [n, setN] = useState(0);
  return (
    <>
      <button onClick={() => setN(n+1)}>Increment</button>
      <div>{n}</div>
    </>
  )
}`
  const [sourceCode, setSourceCode] = useState<string>(initialCode);
  const MemoizedCodeEditor = React.useMemo(() => React.memo(CodeEditor), []);

  console.log("Home re-render");
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
          <MemoizedCodeEditor initialCode={initialCode} 
                              onCodeChange={
                                React.useCallback(
                                  (newCode:string) => {
                                    if(newCode !== sourceCode) 
                                      setSourceCode(newCode)
                                  },
                                  [setSourceCode])
                              }
          />
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
  const [importMapInstalled, setImportMapInstalled] = useState<boolean>(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<ts.Diagnostic[] | undefined>(undefined);
  
  console.log("Custom Component re-render");
  useEffect(() => {
      (() => {
        console.log('useEffect1');
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

          setImportMapInstalled(true);
        }
      })()
  }, []);

  useEffect(() => {
    console.log('useEffect2');

    const transpile = (code: string): ts.TranspileOutput => 
      ts.transpileModule(code, {
          compilerOptions: {
            target: ts.ScriptTarget.Latest,
            module: ts.ModuleKind.ESNext,
            jsx: ts.JsxEmit.React,
            isolatedModules: true,
            strict: true,
            alwaysStrict: true,
            exactOptionalPropertyTypes: true,
            strictNullChecks: true,
            noFallthroughCasesInSwitch: true,
            noImplicitAny: true,
            noImplicitReturns: true,
            noPropertyAccessFromIndexSignature: true,
            noUncheckedIndexedAccess: true,
            noUnusedLocals: true,
            noUnusedParameters: true,
          },
          reportDiagnostics: true
        }
      );

    // Transpile tsx to js
    const transpileOutput = transpile(source);
    console.log(transpileOutput);

    // ... and gather any errors.
    setDiagnostics(transpileOutput.diagnostics);

    // If no transpilation errors occur,
    if (
      (transpileOutput.diagnostics?.length ?? 0) === 0
    ) {
      // store the transpiled code as a blob
      setBlobUrl((oldBlobUrl) => {
        const newBlobUrl = URL.createObjectURL(
          new Blob(
            [transpileOutput.outputText],
            { type: "application/javascript" }
          )
        )
        console.log(`created new blob: ${newBlobUrl}`);

        //... and delete any previous blob.
        if (oldBlobUrl != null) {
          console.log(`revoking blob: ${oldBlobUrl}`)
          URL.revokeObjectURL(oldBlobUrl);
        }

        return newBlobUrl;
      });
    }
  }, [source]);

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
        { (() => {
            // If a code blob is present with no transpilation errors,
            if (blobUrl && !diagnostics?.length) {
              // import, render it, and handle any runtime errors it may throw.
              // (Assume it will, since the code is actively being changed, 
              //  and the transpiler doesn't catch all possible runtime errors .)

              const CompiledComponent = React.lazy(() => import(/* webpackIgnore: true */ blobUrl));
              return (
                  <Suspense fallback={<div>Compiling...</div>}>
                    <ErrorBoundary  fallbackRender={
                                      // When an error occurs,
                                      ({error, resetErrorBoundary}) => {
                                        console.log("Error: resetting UI");
                                        console.dir(error, {depth: null});
                                        // "reset the error boundary"
                                        resetErrorBoundary();
                                        // and show a placeholder UI in the meantime.
                                        return <div>Error</div>
                                      }
                                    }
                                    onError={console.dir}
                                    onReset={
                                      // To reset, we delete the existing blob,
                                      // such that it's no longer rendered.
                                      (details) => {
                                        console.log("resetting UI");
                                        console.dir(details);
                                        setBlobUrl(
                                          (oldBlobUrl: string | null) => {
                                            if(oldBlobUrl) URL.revokeObjectURL(oldBlobUrl);
                                            return null
                                          }
                                        );
                                      }
                                    }
                    >
                      {/* <CompiledComponent/> */}
                      {
                        (() => {
                          try {
                            return React.createElement(CompiledComponent,null, null)
                          }
                          catch (e) {
                            console.log('caught!');
                            setBlobUrl(null);
                          }
                        })()
                      }
                    </ErrorBoundary>
                  </Suspense>
              );
            }
            else {
              return (
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
              );
            }
          })()
        }
      </div>
    </div>
  );
};

function CodeEditor ({
    onCodeChange,
    initialCode
  }: {
    onCodeChange?: (newCode: string) => void
    initialCode?: string
  }) {
    const editorHost = React.useRef<HTMLDivElement>(null);
    const editor:React.MutableRefObject<Ace.Ace.Editor|null> = React.useRef(null);

    console.log("Code Editor re-render");
    React.useEffect(():void =>
    {
        console.log("useEffect editor");
        if (editorHost.current != null)
            editor.current = Ace.edit(editorHost.current)

        if (editor.current != null) {
            editor.current.on('change', 
              () => {
                const code = editor.current?.getValue?.() ?? "";
                onCodeChange?.(code);
              }
            );

            editor.current.session.setMode("ace/mode/jsx");
            editor.current.session.setUseSoftTabs(true);
            editor.current.setShowPrintMargin(false);
            editor.current.setTheme("ace/theme/mono_industrial");
            editor.current.setKeyboardHandler("ace/keyboard/vim");
            editor.current.setValue(initialCode ?? "", 0);
            editor.current.clearSelection();
        }
    }, []);

    // editor.current?.resize();

    return (
      <div style = {{ minWidth: "100%", minHeight: "100%" }}
           ref={editorHost}
      />
    );
};
