'use client';

import React from 'react';
import {SandpackCodeEditor, SandpackLayout, SandpackPreview, SandpackProvider} from "@codesandbox/sandpack-react";

export default function Home() {
  return (<Sandbox/>)
}

function Sandbox() {
  return (
    <SandpackProvider 
      customSetup = {
        {
          dependencies: {
            "react": "latest"
          },
        }
      }
      files = {
        { 
          // We infer dependencies and the entry point from package.json 
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
`import ReactDOM from 'react-dom';
import A from './A.js';
ReactDOM
  .createRoot(document.getElementById('root'))
  .render(<A/>);
` 
          },

           "/A.js": {
            code:
`import React, {useState} from 'react';
export default function A() {
  const [n, setN] = useState(0);
  return (
    <>
      <button onClick={() => setN(n+1)}>Increment</button>
      {n}
    </>
  );
}
`
          }

        }
      }
    >
      <SandpackLayout>
        <SandpackCodeEditor />
        <SandpackPreview showOpenInCodeSandbox={false}/>
      </SandpackLayout>
    </SandpackProvider>
  )
}