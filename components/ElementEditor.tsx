import {CodeEditorRef, useSandpack} from "@codesandbox/sandpack-react"
import {SandpackCodeEditor, SandpackLayout, SandpackPreview, SandpackProvider, SandpackConsumer, SandpackContext, SandpackFileExplorer} from "@codesandbox/sandpack-react";
import { EditorView, ViewUpdate } from "@codemirror/view"
import { MutableRefObject, Ref, useRef } from "react";

const spinnerFiles = {
  "/index.js" : {
    code: 
`import ReactDOM from 'react-dom/client';
import { Blocks } from 'react-loader-spinner';
ReactDOM
  .createRoot(document.getElementById('root'))
  .render(
    <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
      <Blocks
        visible={true}
        height="80"
        width="80"
        ariaLabel="blocks-loading"
        wrapperStyle={{}}
        wrapperClass="blocks-wrapper"
      />
      Loading user files...
    </div>
  );
` 

  },

  "/package.json": {
    code: JSON.stringify(
      {
        main: "index.js",
        dependencies: { 
          'react': "latest",
          'react-dom': "latest",
          'react-loader-spinner': "latest"
        },
      }
    )
  },
}
export default function ElementEditor({
  userFiles
}: {
  userFiles: {[key: string]: {code: string }},
}) {
  return (
    <SandpackProvider
      options ={{
        // visibleFiles: [`/components/${activeFile}.tsx`, '/package.json', '/index.js']
      }}
      customSetup = {
        {
          dependencies: {
            "react": "latest"
          },
        }
      }
      files = {Object.keys(userFiles).length == 0 ? spinnerFiles : userFiles}
    >
      <SandpackLayout className='flex-col justify-stretch h-screen'>
        <div className='flex-1'>
          <SandpackPreview  className='h-full' 
                            showOpenInCodeSandbox={false}
                            showRefreshButton
                            showRestartButton
          />
        </div>
        <div className='flex-1 flex min-w-0'>
          <SandpackFileExplorer className='flex-1' autoHiddenFiles/>
          <SandpackConsumer >
          { (ctx: SandpackContext | null) => (
              <SandpackCodeEditor 
                showTabs={false}
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
        </div>
      </SandpackLayout>
    </SandpackProvider>
  )
}
