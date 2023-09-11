import {SandpackCodeEditor, SandpackLayout, SandpackPreview, SandpackProvider, SandpackConsumer, SandpackContext, SandpackFileExplorer, useSandpack, SandpackFile, SandpackState, CodeEditorRef} from "@codesandbox/sandpack-react";
import { EditorView, ViewUpdate } from "@codemirror/view"
import ComponentDrawer from "./ComponentDrawer";
import EditorSidebar from "./EditorSidebar";
import { useRef } from "react";

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

export function ComponentEditor({
  userFiles
}: {
  userFiles: {[file: string]: SandpackFile}
}) {
  return (
    <Sandpack userFiles={userFiles}>
      <SandpackConsumer>
      { 
        (ctx: SandpackContext | null) => {
          console.log(ctx);
          return (
            ctx?.editorState
            ? <>
                <div className='flex-1'>
                  <ComponentPreview/>
                </div>
                <div className='flex-1 flex min-w-0'>
                  <SandpackFileExplorer className='flex-1' autoHiddenFiles/>
                  <ComponentCodeEditor/>
                </div>
                <ComponentDrawer/>
                <EditorSidebar/>
              </>
            : <div>Loading...</div>
          )
        }
      }
      </SandpackConsumer>
    </Sandpack>
  )
}

function ComponentCodeEditor() {
  return (
    <SandpackConsumer >
    { (ctx: SandpackContext | null) => (
        <SandpackCodeEditor 
          showTabs={false}
          initMode="immediate"
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
  );
}


function Sandpack({
  userFiles,
  children
}: {
  userFiles: {[file: string]: SandpackFile}
  children: React.ReactNode
}) {
  return (
    <SandpackProvider
      files={
        Object.keys(userFiles).length
        ? userFiles
        : {
          "/index.js": {code: ""}
        }
      }
      options ={{
        externalResources: ["https://cdn.tailwindcss.com"],
      }}
      customSetup = {
        {
          dependencies: {
            "react": "latest"
          },
          entry: "/index.js"
        }
      }
    >
      <SandpackLayout className='flex-col justify-stretch h-screen'>
        {children}
      </SandpackLayout>
    </SandpackProvider>
  )
}

export function ComponentPreview({
}: {
}) {
  const {sandpack} = useSandpack();
  console.log(sandpack);
  return (
    <SandpackPreview  className='h-full' 
                      showOpenInCodeSandbox={false}
                      showRefreshButton
                      showRestartButton
    />
  );
}