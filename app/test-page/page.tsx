'use client'

import React, {JSX, useState} from 'react';
import {createRoot} from 'react-dom/client';

import * as ts from "typescript";
// import JsxParser from 'react-jsx-parser'

import * as Ace from "ace-builds";
import "ace-builds/src-noconflict/theme-mono_industrial";
import "ace-builds/src-noconflict/mode-typescript";
import "ace-builds/src-noconflict/mode-jsx";
import "ace-builds/src-noconflict/keybinding-vim";

export default function Home() : JSX.Element {
  const [sourceCode, setSourceCode] = useState<string>(
`export default function() {
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

        <div  style={{
                background: 
                  `repeating-linear-gradient(
                      135deg,
                      #606dbc,
                      #606dbc 10px,
                      #465298 10px,
                      #465298 20px
                    );`, 
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

const CustomComponent = ({ 
    source
  } : {
    source: string
  }) => {
  // const iframeRef = React.useRef<HTMLIFrameElement>(null);

  // React.useEffect(() => {
  //   const iframeDocument = iframeRef.current?.contentDocument;
  //   if (iframeDocument) {
  //     iframeDocument.body.innerHTML = '';
  //     const div = iframeDocument.createElement('div');
  //     iframeDocument.body.appendChild(div);

  //     const iframeReactRoot = createRoot(div); // Use this if userCode is JSX
  //     iframeReactRoot.render(
  //       <div onClick={() => console.log("clicked iframe")}>
  //       <JsxParser
  //         jsx={userCode}
  //         onError={(error) => {
  //           iframeDocument.body.innerText = `Error: ${error}`;
  //         }}
  //       />
  //       </div>
  //     );
  //   }
  // }, [userCode]);

  // return (
  //   <iframe 
  //     title="sandbox" 
  //     ref={iframeRef} 
  //     style={{ border: 'none', margin: 0, padding: 0, width: '100%', height: '100%' }}
  //   />
  // );
  // const compilerOptions = {
  //   target: ts.ScriptTarget.Latest,
  //   module: ts.ModuleKind.CommonJS,
  //   jsx: ts.JsxEmit.React,
  // };

  // const host = ts.createCompilerHost(compilerOptions);
  const sourceFile = ts.createSourceFile("Custom.tsx", source, ts.ScriptTarget.Latest);
  // const program = ts.createProgram([sourceFile.fileName], compilerOptions);
  // const diagnostics = ts.getPreEmitDiagnostics(program, sourceFile, undefined);

  const transpiled = ts.transpileModule(source, {
      compilerOptions: {
        target: ts.ScriptTarget.Latest,
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.React
      },
      reportDiagnostics: true
    }
  );

  console.log(transpiled);

  if(!transpiled.diagnostics?.length) {
    // console.log(eval(transpiled.outputText));
    const x = 1;
    // eval('x = 2');
    console.log(x);
  }
  // const blob = new Blob(
  //   [transpiled.outputText], 
  //   { type: "application/javascript" }
  // );

  // const blobUrl = URL.createObjectURL(blob);

  // import(blobUrl)
  //   .then((module) => console.log(module))
  //   .catch(console.log)

  // console.log(blob, blobUrl);


  return transpiled.diagnostics?.length
  ? (
    <div>
      Compilation Errors
      <div>
        {
          transpiled.diagnostics?.map((d, ix) => {
            const lineAndChar = sourceFile.getLineAndCharacterOfPosition(d.start ?? 0);
            const line = lineAndChar.line + 1;
            const charPos = lineAndChar.character;
            return (
              <div key={`diag${ix}`}>{
                `Line ${line}, Position ${charPos}: ${d.messageText as string}`
              }</div>
            )
          })
        }
      </div>
    </div>
  )
  : (
    <div>
      Compiled Code
      <div>
        {transpiled.outputText}
        {/* {new Function("f", "React.createElement('div', null, 'HelloWorld!')")()} */}
        {/* {eval(transpiled.outputText)} */}
        {/* {eval("React.createElement('div', null, 'HelloWorld!')")} */}
        {/* {React.createElement('div', null, 'HelloWorld!')} */}
        {/* <script>
          React.createElement('div', null, 'HelloWorld!')
        </script> */}
      </div>
    </div>
  );
  // return ( <JsxParser jsx={source} /> );
};

