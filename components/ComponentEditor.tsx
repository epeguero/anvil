import {SandpackCodeEditor, SandpackConsole, SandpackLayout, SandpackPreview, SandpackProvider, SandpackConsumer, SandpackContext, SandpackFileExplorer, useSandpack, SandpackFile, SandpackState, CodeEditorRef, useSandpackClient, useSandpackNavigation, SandpackProviderProps, useActiveCode} from "@codesandbox/sandpack-react/unstyled";
import { EditorView, ViewUpdate } from "@codemirror/view"
import ComponentDrawer, { newComponent } from "./ComponentDrawer";
import EditorSidebar from "./EditorSidebar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card, CardContent
} from "@/components/ui/card"
import { memo, useCallback, useMemo, useRef, useState } from "react";

const sandpackProviderProps = (components: Components, activeComponent: string): SandpackProviderProps => 
(
  {
    files: (
      Object.keys(components[activeComponent]).length
      ? components[activeComponent]
      : {
        "/index.js": {code: "", readOnly: true}
      }
    ),
    options: {
      activeFile: `/components/${activeComponent}.tsx`,
      visibleFiles: Object.keys(components[activeComponent]),
      // recompileMode: "immediate",
      // externalResources: ["https://cdn.tailwindcss.com"],
      classes: {
        "sp-wrapper": "flex-1 flex flex-col",
        "sp-layout": "flex-1 flex flex-col",
        "sp-preview": "invisible flex-1 flex",
        "sp-preview-container": "flex-1 flex flex-col",
        "sp-preview-iframe": "flex-1 flex",
        "sp-preview-actions": "flex-none flex p-1 justify-end",
        "sp-icon-standalone": "flex-none",
        "sp-editor": "flex-1",
        "sp-console": "invisible flex-1 flex flex-col",
        "sp-console-list": "flex-1 flex flex-col",
        "sp-console-actions": "flex-none flex p-1 justify-end",
      }
    },
    customSetup: {
      dependencies: {
        "react": "latest",
        "react-dom": "latest"
      },
      entry: "/index.js"
    }
  }
)

export type ComponentFiles = {[file: string]: SandpackFile};
export type Component = {[cName: string]: ComponentFiles};
export type Components = {[name: string]: ComponentFiles};

export function ComponentEditor({
}: {
}) {

  const [components, setComponents] = useState<Components>(
    newComponent("Placeholder")
  );
  const [activeComponent, setActiveComponent] = useState<string>('Placeholder');
  const MemoComponentCodeEditor = useMemo(
    () => memo(ComponentCodeEditor, (oldProps, newProps) => 
        oldProps.componentName === newProps.componentName
        &&
        oldProps.sandpack === newProps.sandpack
    )
    ,[]
  );
  const handleComponentEdit = 
    useCallback(
      (componentName: string, file: string, newCode: string) => {
        setComponents(
          (cs: Components) => {
            cs[componentName][file].code = newCode;
            console.log(cs);
            return {...cs};
          }
        )
      }
    ,[])
  console.log("component editor rerender", components)

  console.log(sandpackProviderProps(components, activeComponent));
  return (
    <SandpackProvider {...sandpackProviderProps(components, activeComponent)}>
      <SandpackLayout>
      <SandpackConsumer>
      { 
        (ctx: SandpackContext | null) => {
          console.log(ctx);
          return (
            <div className='flex-1 flex flex-col'>
              <div className='flex-1 flex'>
                <div className='flex-[3_1_0] flex'>
                  <div className='flex-1 flex flex-col'>
                    <Card className='flex flex-col flex-1 p-1 rounded-none rounded-tl-lg'>
                      <div className='flex-1 flex'>
                        {ctx?.status === 'initial'
                          ? <Skeleton className="flex-1 rounded-full"/>
                          : 
                          <Card className='flex-1 flex rounded-none'>
                            <CardContent className='flex-1 flex p-1'>
                              <ComponentPreview/>
                            </CardContent>
                          </Card>
                        }
                      </div>
                      <div className='flex-1 flex'>
                        <div className='flex-1 flex'>
                          {ctx?.status === 'initial' 
                            ? <Skeleton className="flex-1 rounded-full"/> 
                            : <ComponentFileExplorer/>
                          }
                        </div>
                        <div className='flex-[4_1_0] flex'>
                          {ctx?.status === 'initial' || !ctx
                            ? <Skeleton className="flex-1 rounded-full"/> 
                            : <Card className='flex-1 flex rounded-none'>
                                <MemoComponentCodeEditor  
                                  componentName={activeComponent}
                                  sandpack={ctx}
                                  onEdit={handleComponentEdit}
                                />
                              </Card>
                          }
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
                <div className='flex-1 flex flex-col'>
                  <EditorSidebar/>
                </div>
              </div>
              <div className='flex-none flex border-solid border-black rounded-b-lg bg-white'>
                {ctx?.status === 'initial' || !ctx
                  ? <Skeleton className="h-[25px] rounded-full"/> 
                  : <ComponentDrawer  components={components}
                                      addComponent={
                                        (component: Component) => {
                                          setComponents(
                                            cs => ({...cs, ...component})
                                          )
                                          setActiveComponent(Object.keys(component)[0]);
                                        }
                                      }
                                      onSelectComponent={(name: string) => {setActiveComponent(name); console.log(name);}}
                    /> 
                }
              </div>
            </div>
          )
        }
      }
      </SandpackConsumer>
      </SandpackLayout>
    </SandpackProvider>
  )
}

function ComponentFileExplorer() {
  return (
        <SandpackFileExplorer autoHiddenFiles/>
  );
}

function ComponentCodeEditor({
  componentName,
  sandpack,
  onEdit
}: {
  componentName: string,
  sandpack: SandpackContext,
  onEdit: (componentName: string, file: string, newCode: string) => void
}) {
  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     console.log('saving');
  //     // console.log(editorRef?.current?.getCodemirror());
  //     console.log(sandpack);
  //     const file = sandpack.activeFile;
  //     const newCode = sandpack.files[sandpack.activeFile].code;
  //     onEdit(componentName, file, newCode);
  //   }, 1000);
  //   return () => clearInterval(intervalId);
  // }, [])
  console.log(`${componentName}:${sandpack.activeFile}`);
  return (
        <SandpackCodeEditor 
          // ref={editorRef}
          showTabs={false}
          // initMode="immediate"
          extensions={[
            EditorView.updateListener.of(
              (update: ViewUpdate) => {
                if(update.docChanged) {
                  const file = sandpack.activeFile;
                  const newCode = update.state.doc.toString();
                  console.log(`editor change: updating ${componentName}:${file}`);
                  onEdit(componentName, file, newCode);
                }
              }
            )
          ]}
          showLineNumbers
          wrapContent
          showInlineErrors={false}
        />
  );
}


export function ComponentPreview({
}: {
}) {
  const {sandpack} = useSandpackClient();
  type mode = 'preview' | 'console';
  const [mode, setMode] = useState<mode>('preview');
  const [previewRef, setPreviewRef] = useState<any>(useRef<any>());
  const [consoleRef, setConsoleRef] = useState<any>(useRef<any>());

  Object.entries(sandpack.clients).forEach(([clientId, client]) => {
    client.options.showErrorScreen = false;
    client.listen((msg) => {
      console.warn(msg);
    });
    // client.options.width = client.errors.length ? client.options.width
  })
  console.log(sandpack);
  // useEffect(() => 
  //   setPreviewRef(
  //     (pf: any) => {
  //       if(pf.current?.getClient()) {
  //         pf.current.getClient().options.showErrorScreen = false;
  //       }
  //       return pf
  //     }
  //   )
  //   , [previewRef]
  // );
  // useEffect(() => setConsoleRef((cf: any) => consoleRef ? cf : consoleRef), [consoleRef]);
  // console.log(previewRef.current?.getClient());
  // console.log(consoleRef.current);
  // const c = previewRef.current?.getClient();

  return (
    <CardContent className='flex-1 flex flex-col border p-0 resize overflow-auto'>
      <style>{`
        .sp-console {
          visibility: ${mode === 'console' ? 'visible' : 'hidden'};
          max-height: ${mode === 'console' ? '100%' : '0%'};
          flex: ${mode === 'console' ? '1 1 0' : '0 0 0'};
        } 
        .sp-preview{
          visibility: ${mode === 'preview' ? 'visible' : 'hidden'};
          max-height: ${mode === 'preview' ? '100%' : '0%'};
          flex: ${mode === 'preview' ? '1 1 0' : '0 0 0'};
        } 
      `}</style> 
        {/* <SandpackConsole    actionsChildren={<button onClick={() => setMode('preview')}>Show Preview</button>}
                            // ref={consoleRef}
                            showSyntaxError
                            resetOnPreviewRestart
                            // showHeader
                            // showSetupProgress
          /> */}

        <SandpackPreview    showOpenInCodeSandbox={false}
                            showRefreshButton
                            showRestartButton
                            showOpenNewtab
                            showSandpackErrorOverlay={false}
                            // actionsChildren={
                            //   <button onClick={() => setMode('console')}>Show Console</button>
                            // }
        />
    </CardContent>
  );
}