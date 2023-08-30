'use client'

import React, {JSX, useState} from 'react';
import {createRoot} from 'react-dom/client';
import JsxParser from 'react-jsx-parser'
import * as Ace from "ace-builds";
import "ace-builds/src-noconflict/theme-mono_industrial";
import "ace-builds/src-noconflict/mode-typescript";
import "ace-builds/src-noconflict/mode-jsx";
import "ace-builds/src-noconflict/keybinding-vim";

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

    return (
      <div
          style= {{ 
            // width: "100%", height: "100%",
            minWidth: "50%", minHeight: "50%",
          }}
          ref={editorHost}
      />
    );
}

const Sandbox = ({ 
    userCode
  } : {
    userCode: string
  }) => {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  React.useEffect(() => {
    const iframeDocument = iframeRef.current?.contentDocument;
    if (iframeDocument) {
      iframeDocument.body.innerHTML = '';
      const div = iframeDocument.createElement('div');
      iframeDocument.body.appendChild(div);

      const iframeReactRoot = createRoot(div); // Use this if userCode is JSX
      iframeReactRoot.render(
        <JsxParser
          jsx={userCode}
          onError={(error) => {
            iframeDocument.body.innerText = `Error: ${error}`;
          }}
        />
      );
    }
  }, [userCode]);

  return (
    <iframe 
      title="sandbox" 
      ref={iframeRef} 
      style={{ border: 'none', margin: 0, padding: 0, width: '100%', height: '100%' }}
    />
  );
};


export default function Home() : JSX.Element {
  const [code, setCode] = useState<string>('<div>hello, world!</div>');
  
  return (
    <>
      <div style={{display: "flex", flexDirection: "column", width: '100vw', height: '100vh'}}>
        <Sandbox userCode={code} />
        <CodeEditor initialCode={code} onCodeChange={setCode}/>
      </div>
    </>
  );
}

// import Image from 'next/image'
// export default function Home() {
//   return (
//     <main className="flex min-h-screen flex-col items-center justify-between p-24">
//       <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
//         <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
//           Get started by editing&nbsp;
//           <code className="font-mono font-bold">app/page.tsx</code>
//         </p>
//         <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
//           <a
//             className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
//             href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             By{' '}
//             <Image
//               src="/vercel.svg"
//               alt="Vercel Logo"
//               className="dark:invert"
//               width={100}
//               height={24}
//               priority
//             />
//           </a>
//         </div>
//       </div>

//       <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1]">
//         <Image
//           className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
//           src="/next.svg"
//           alt="Next.js Logo"
//           width={180}
//           height={37}
//           priority
//         />
//       </div>

//       <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
//         <a
//           href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
//           className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <h2 className={`mb-3 text-2xl font-semibold`}>
//             Docs{' '}
//             <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
//               -&gt;
//             </span>
//           </h2>
//           <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
//             Find in-depth information about Next.js features and API.
//           </p>
//         </a>

//         <a
//           href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <h2 className={`mb-3 text-2xl font-semibold`}>
//             Learn{' '}
//             <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
//               -&gt;
//             </span>
//           </h2>
//           <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
//             Learn about Next.js in an interactive course with&nbsp;quizzes!
//           </p>
//         </a>

//         <a
//           href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
//           className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <h2 className={`mb-3 text-2xl font-semibold`}>
//             Templates{' '}
//             <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
//               -&gt;
//             </span>
//           </h2>
//           <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
//             Explore the Next.js 13 playground.
//           </p>
//         </a>

//         <a
//           href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
//           className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <h2 className={`mb-3 text-2xl font-semibold`}>
//             Deploy{' '}
//             <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
//               -&gt;
//             </span>
//           </h2>
//           <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
//             Instantly deploy your Next.js site to a shareable URL with Vercel.
//           </p>
//         </a>
//       </div>
//     </main>
//   )
// }
