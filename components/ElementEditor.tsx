import {SandpackCodeEditor, SandpackLayout, SandpackPreview, SandpackProvider, SandpackConsumer, SandpackReactContext, SandpackContext, SandpackFile, SandpackFileExplorer} from "@codesandbox/sandpack-react";
import { EditorView, ViewUpdate } from "@codemirror/view"
import { sandpackDark } from "@codesandbox/sandpack-themes";
import ElementDrawer from "./ElementDrawer";

export default function ElementEditor({
  activeFile,
  userFiles
}: {
  activeFile: string,
  userFiles: {[key: string]: {code: string }}
}) {
  console.log(userFiles);
  return (
    <SandpackProvider
      // theme={sandpackDark}
      options ={{
        visibleFiles: [`/components/${activeFile}.tsx`, '/package.json', '/index.js']
      }}
      customSetup = {
        {
          dependencies: {
            "react": "latest"
          },
//           entry: 
// `import ReactDOM from 'react-dom/client';
// import ${activeFile} from './${activeFile}.tsx';
// ReactDOM
//   .createRoot(document.getElementById('root'))
//   .render(<${activeFile}/>);
// ` 
        }
      }
      files = {
        { 
          ...userFiles,
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
            readOnly: true,
            code: 
`import ReactDOM from 'react-dom/client';
import ${activeFile} from './components/${activeFile}.tsx';
ReactDOM
  .createRoot(document.getElementById('root'))
  .render(<${activeFile}/>);
` 
          }
        }
      }
    >
      <SandpackLayout className='flex-col justify-stretch h-screen'>
        <div className='flex-1'>
          <SandpackPreview  className='h-full' 
                            showOpenInCodeSandbox={false}
                            showRefreshButton
                            showRestartButton
                            actionsChildren={<ElementDrawer/>}
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
