'use client';

import React, { useEffect, useState } from 'react';
import { ComponentEditor } from '@/components/ComponentEditor';
import { SandpackFile } from '@codesandbox/sandpack-react';
import { printAst, tsx } from '@/lib/ast';

export default function Home() {
//   useEffect(() => {
//     console.log("useEffect");
//     window.localStorage.setItem('/package.json', 
//       JSON.stringify(
//         {
//           main: "index.js",
//           dependencies: { 
//             'react': "latest",
//             'react-dom': "latest"
//           },
//         }
//       )
//     );

//     window.localStorage.setItem('/index.js', 
// `import ReactDOM from 'react-dom/client';
// import MyComponent from './components/MyComponent.tsx';
// ReactDOM
//   .createRoot(document.getElementById('root'))
//   .render(<MyComponent/>);
// ` 
//     )
//     window.localStorage.setItem('/components/MyComponent.tsx', printAst(tsx('MyComponent', ['A', 'B'])));
//     window.localStorage.setItem('/components/A.tsx', printAst(tsx('A')));
//     window.localStorage.setItem('/components/B.tsx', printAst(tsx('B')));
//     setUserFiles((uf) => {
//         const files = 
//           ["/components/MyComponent.tsx", "/components/A.tsx", "/components/B.tsx", "/package.json", "/index.js"]
//           .reduce(
//             (acc: {[key: string]: SandpackFile}, file: string) => {
//               const code = window.localStorage.getItem(file);
//               return code ? {...acc, [file]: {code}} : acc;
//             }, uf
//           )
//         files["/index.js"].readOnly = true;
//         return files;
//       }
//     )
//   }, []);

  return (
    <ComponentEditor/>
    // <div className='flex flex-nowrap '>
    //     <div className='flex-auto'>
    //         <ElementEditor userFiles={userFiles}/>
    //     </div>
    //     <EditorSidebar/>
    //     <div className='absolute bottom-0 left-0 right-0 p-4'>
    //       <ElementDrawer/>
    //     </div>
    // </div>
  )
}