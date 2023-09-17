import {SandpackCodeEditor, SandpackConsole, SandpackLayout, SandpackPreview, SandpackProvider, SandpackConsumer, SandpackContext, SandpackFileExplorer, useSandpack, SandpackFile, SandpackState, CodeEditorRef, useSandpackClient, useSandpackNavigation, SandpackProviderProps, useActiveCode} from "@codesandbox/sandpack-react/unstyled";
import { EditorView, ViewUpdate } from "@codemirror/view"
import ComponentDrawer, { newComponent } from "./ComponentDrawer";
import EditorSidebar from "./EditorSidebar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card, CardContent
} from "@/components/ui/card"
import { memo, useCallback, useMemo, useRef, useState } from "react";

const initialSandpackProviderProps = (components: Components, activeComponent: string): SandpackProviderProps => 
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
      externalResources: ["https://cdn.tailwindcss.com"],
      classes: {
        "sp-wrapper": "h-full w-full",
        "sp-layout": "h-full w-full",

        "sp-preview": "h-full w-full",
        "sp-preview-container": "h-full w-full flex flex-col",
        "sp-preview-iframe": "flex-1 border",
        "sp-preview-actions": "order-first py-1 flex justify-end",
        "sp-icon-standalone": "flex-none",

        "sp-file-explorer": "h-full w-full",
        "sp-file-explorer-list": "h-full w-full",
        "sp-explorer": "h-full w-full flex items-center gap-1",

        "sp-code-editor": "max-h-[40vh] overflow-auto",

        "sp-console": "flex-1 flex flex-col",
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
  const [spProviderProps, setSpProviderProps] = useState<SandpackProviderProps>(initialSandpackProviderProps(components, activeComponent));

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

  console.log(spProviderProps);
  return (
    <SandpackProvider {...spProviderProps}>
      <SandpackLayout>
      <SandpackConsumer>
      { 
        (ctx: SandpackContext | null) => {
          console.log(ctx);
          return (
            <div className='grid h-full w-full place-items-stretch gap-4 grid-cols-[1fr_3fr_1fr] grid-rows-[1fr_1fr_25px]' style={{gridTemplateAreas: ["'preview preview sidebar'","'files code sidebar'", "'drawer drawer drawer'"].join('\n')}}>
              <div style={{gridArea: 'preview'}}>
                {ctx?.status === 'initial'
                  ? <Skeleton className="rounded-full"/>
                  : 
                  <ComponentPreview/>
                }
              </div>
              <div style={{gridArea: 'files'}}>
                {ctx?.status === 'initial' 
                  ? <Skeleton className="rounded-full"/> 
                  : <ComponentFileExplorer/>
                }
              </div>
              <div style={{gridArea: 'code'}}>
                {ctx?.status === 'initial' || !ctx
                  ? <Skeleton className="rounded-full"/> 
                  : <MemoComponentCodeEditor  
                      componentName={activeComponent}
                      sandpack={ctx}
                      onEdit={handleComponentEdit}
                    />
                }
              </div>
              <div style={{gridArea: 'sidebar'}}>
                <EditorSidebar/>
              </div>

            <div style={{gridArea: 'drawer'}}>
            {ctx?.status === 'initial' || !ctx
              ? <Skeleton className="h-[25px] rounded-full"/> 
              : <ComponentDrawer  components={components}
                                  addComponent={
                                    (newComponent: Component) => {
                                      setComponents(
                                        cs => ({...cs, ...newComponent})
                                      )
                                      const newComponentName = Object.keys(newComponent)[0];
                                      const newComponentFiles = newComponent[newComponentName];
                                      setActiveComponent(newComponentName);
                                      setSpProviderProps(
                                        (p) => {
                                          console.log(newComponent);
                                          if (p.options && p.files) {
                                            p.files = {...p.files, ...newComponentFiles};
                                            p.options.activeFile = `/components/${newComponentName}.tsx`;
                                            p.options.visibleFiles = Object.keys(newComponentFiles);
                                            console.log(p);
                                          }
                                          return {...p};
                                        }
                                        // (p) => ({
                                        //   ...p,
                                        //   options: {
                                        //     ...p.options,
                                        //     activeFile: `/components/${newComponentName}.tsx`
                                        //   }
                                        // })
                                      );
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
    <>
      <style>{`
        .cm-gutterElement {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .cm-scroller {
          display: flex;
          gap: 1rem;
        }
        ::-webkit-scrollbar-thumb {
          scrollbar-color: blue black;
        }
      `}</style>
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
    </>
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
    // <CardContent className='flex-1 flex flex-col border p-0 resize overflow-auto'>
    //   <style>{`
    //     .sp-console {
    //       visibility: ${mode === 'console' ? 'visible' : 'hidden'};
    //       max-height: ${mode === 'console' ? '100%' : '0%'};
    //       flex: ${mode === 'console' ? '1 1 0' : '0 0 0'};
    //     } 
    //     .sp-preview{
    //       visibility: ${mode === 'preview' ? 'visible' : 'hidden'};
    //       max-height: ${mode === 'preview' ? '100%' : '0%'};
    //       flex: ${mode === 'preview' ? '1 1 0' : '0 0 0'};
    //     } 
    //   `}</style> 
    //     {/* <SandpackConsole    actionsChildren={<button onClick={() => setMode('preview')}>Show Preview</button>}
    //                         // ref={consoleRef}
    //                         showSyntaxError
    //                         resetOnPreviewRestart
    //                         // showHeader
    //                         // showSetupProgress
    //       /> */}

        <SandpackPreview    showOpenInCodeSandbox={false}
                            showRefreshButton
                            showRestartButton
                            showOpenNewtab
                            showSandpackErrorOverlay={false}
                            // actionsChildren={
                            //   <button onClick={() => setMode('console')}>Show Console</button>
                            // }
        />
    // </CardContent>
  );
}