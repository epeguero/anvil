import {SandpackCodeEditor, SandpackLayout, SandpackPreview, SandpackProvider, SandpackConsumer, SandpackContext, SandpackFileExplorer, useSandpack, SandpackFile, SandpackState, CodeEditorRef} from "@codesandbox/sandpack-react";
import { EditorView, ViewUpdate } from "@codemirror/view"
import ComponentDrawer from "./ComponentDrawer";
import EditorSidebar from "./EditorSidebar";
import { Blocks } from "react-loader-spinner";
import { Separator } from "@radix-ui/react-separator";
import { Skeleton } from "@/components/ui/skeleton";
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
            <div className='flex-1 flex-col'>
              <div className='flex-1 flex'>
                <div className='flex-[10_1_0] flex'>
                  <div className='flex-1 flex flex-col'>
                    <div className='flex-1 flex min-w-0'>
                      {ctx?.status === 'initial'
                        ? <Skeleton className="flex-1 rounded-full"/>
                        : <ComponentPreview/>
                      }
                    </div>
                    <Separator className='w-full h-[1px] bg-primary'/>
                    <div className='flex-1 flex'>
                      <div className='flex-1 flex min-w-0'>
                      {ctx?.status === 'initial' ? <Skeleton className="flex-1 rounded-full"/> : <SandpackFileExplorer autoHiddenFiles/> }
                      </div>
                      <Separator className='bg-primary flex-none w-[1px]' orientation='vertical'/>
                      <div className='flex-[4_1_0] flex min-w-0'>
                        {ctx?.status === 'initial' ? <Skeleton className="flex-1 rounded-full"/> : <ComponentCodeEditor/> }
                      </div>
                    </div>
                  </div>
                </div>
                <Separator className='bg-primary flex-none w-[1px]' orientation='vertical'/>
                <div className='flex-1 flex'>
                  <div className='flex-1 w-full h-full'>
                    {/* {ctx?.status === 'initial' ? <Skeleton className="flex-1 rounded-full"/> : <EditorSidebar/> } */}
                    {/* <Skeleton className="flex-1 rounded-full"/> */}
                    <EditorSidebar/>
                  </div>
                </div>
              </div>
              <Separator className='w-full h-[1px] bg-primary'/>
              <div className='flex-none'>
                {ctx?.status === 'initial' ? <Skeleton className="h-[25px] rounded-full"/> : <ComponentDrawer/> }
              </div>
            </div>
          )
        }
      }
      </SandpackConsumer>
    </Sandpack>
  )
}

function ComponentCodeEditor() {
  return (
    <SandpackConsumer>
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
        classes: {
          "sp-wrapper": "",
          "sp-layout": "",
        }
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
      <SandpackLayout>
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
    <SandpackPreview  showOpenInCodeSandbox={false}
                      showRefreshButton
                      showRestartButton
    />
  );
}