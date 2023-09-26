import { SandpackCodeEditor, SandpackConsole, SandpackLayout, SandpackPreview, SandpackProvider, SandpackConsumer, SandpackContext, SandpackFileExplorer, useSandpack, SandpackFile, SandpackState, CodeEditorRef, useSandpackClient, useSandpackNavigation, SandpackProviderProps, SandpackPreviewRef } from "@codesandbox/sandpack-react/unstyled";
import { EditorView, ViewUpdate } from "@codemirror/view"
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useRef, useState } from "react";
import { addProp, editProp, getProps, removeProp } from "@/lib/ast";
import { CodeIcon, ReloadIcon } from "@radix-ui/react-icons";

import * as prettier from 'prettier/standalone';
import * as prettierTsPlugin from 'prettier/plugins/typescript';
import * as prettierEsTreePlugin from 'prettier/plugins/estree';

import ComponentDrawer from "./ComponentDrawer";
import EditorSidebar from "./EditorSidebar";

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
      recompileMode: "immediate",
      externalResources: ["https://cdn.tailwindcss.com"],
      classes: {
        "sp-wrapper": "h-full w-full",
        "sp-layout": "h-full w-full",

        "sp-preview": "h-full w-full",
        "sp-preview-container": "h-full w-full flex flex-col",
        "sp-preview-iframe": "flex-1 border bg-foreground",
        "sp-preview-actions": "",
        "sp-icon-standalone": "flex-none mx-4",

        "sp-file-explorer": "h-full w-full text-xs",
        "sp-file-explorer-list": "h-full w-full",
        "sp-explorer": "h-full w-full flex items-center gap-1",

        // "sp-code-editor": "max-h-[60%] h-full overflow-auto",
        "sp-editor": "h-full overflow-y-auto overflow-x-hidden text-xs",
        // "sp-cm": "h-full",

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

function createNewComponent(name: string) {
  return { [name]:
      {
        '/index.js': {code: 
`import ReactDOM from 'react-dom/client';
import ${name} from './components/${name}.tsx';
ReactDOM
.createRoot(document.getElementById('root'))
.render(<${name}/>);
` 
      },
      [`/components/${name}.tsx`]: {code: `export default function ${name}() { return ("${name}"); }`},
      [`/package.json`] : { code:
        JSON.stringify(
          {
            entry: '/index.js',
            dependencies: {
              'react': 'latest',
              'react-dom': 'latest',
            }
          }
        )
      }
    }
  };
}

export type ComponentFiles = {[file: string]: SandpackFile};
export type Component = {[cName: string]: ComponentFiles};
export type Components = {[cName: string]: ComponentFiles};

export function ComponentEditor({
}: {
}) {

  const [components, setComponents] = useState<Components>(
    createNewComponent("Placeholder")
  );
  const [spProviderProps, setSpProviderProps] = useState<SandpackProviderProps>(
    initialSandpackProviderProps(components, "Placeholder")
  );
  const [activeComponent, setActiveComponent] = useState("Placeholder");

  useEffect(() => {
    console.log(`components useEffect`)
    setSpProviderProps((p: SandpackProviderProps) => {
      const files = Object.values(components).reduce( (acc, f) => ({...acc, ...f}), {});
      return {...p, files};
    });
  }, [components])

  useEffect(() => {
    setSpProviderProps((p: SandpackProviderProps) => { 
      if(p.options) p.options.activeFile = `/components/${activeComponent}.tsx`;
      return {...p}; 
    });
  }, [activeComponent])

  useEffect(() => {
    console.log('rerendering ' + spProviderProps?.options?.activeFile)
    setSpProviderProps(p => ({...p}));
  }, [spProviderProps?.options?.activeFile])

  const handleComponentCodeEdit = 
    (componentName: string, file: string, newCode: string) => {
      setComponents(
        (cs: Components) => {
          cs[componentName][file].code = newCode;
          return {...cs};
        }
      )
      setSpProviderProps(
        (sp: SandpackProviderProps) => {
          if(sp.options) sp.options.activeFile = file;
          return {...sp}
        } 
      )
    }

  const handleAddNewComponent = (componentName: string) => {
    const newComponent = createNewComponent(componentName);
    setComponents(
      cs => ({...cs, ...newComponent})
    )

    const newComponentFiles = newComponent[componentName];
    setSpProviderProps(
      (p) => {
        if (p.options && p.files) {
          p.files = {...p.files, ...newComponentFiles};
          p.options.activeFile = `/components/${componentName}.tsx`;
          p.options.visibleFiles = Object.keys(newComponentFiles);
        }
        return {...p};
      }
    );
    setActiveComponent(componentName);
  }

  const handleComponentSelect = (componentName: string) => {
    setSpProviderProps(
      (p) => {
        if (p.options) {
          p.options.activeFile = `/components/${componentName}.tsx`;
          p.options.visibleFiles = Object.keys(components[componentName]);
        }
        return {...p};
      }
    )
    setActiveComponent(componentName);
  }


  const handleGetProps = 
    () => {
      const componentFileName = `/components/${activeComponent}.tsx`;
      const file = components[activeComponent][componentFileName];
      return getProps(file.code);
    }

  const handleAddProp = 
    (propName: string) => {
      const componentFileName = `/components/${activeComponent}.tsx`;
      const file = components[activeComponent][componentFileName];
      const codeWithProp = addProp(file.code, propName);
      setComponents(
        (cs: Components) => {
          file.code = codeWithProp;
          return {...cs};
        }
      );
    }

  const handleEditProp =
    (oldProp: string, newProp: string) => {
      const componentFileName = `/components/${activeComponent}.tsx`;
      const file = components[activeComponent][componentFileName];
      const codeWithEdittedProp = editProp(file.code, oldProp, newProp);
      setComponents(
        (cs: Components) => {
          file.code = codeWithEdittedProp;
          return {...cs};
        }
      );
    }

  const handleRemoveProp =
    (prop: string) => {
      const componentFileName = `/components/${activeComponent}.tsx`;
      const file = components[activeComponent][componentFileName];
      const codeWithRemovedProp = removeProp(file.code, prop);
      setComponents(
        (cs: Components) => {
          file.code = codeWithRemovedProp;
          return {...cs};
        }
      );
    }

  const prettifyAction =
    () => {
      (async () => {
        const {['/package.json']: packageJsonFile, ...filesToPrettify} = components[activeComponent]
        Promise.all(Object.entries(filesToPrettify).map(([fileName, file]) => 
          prettier.format(
            file.code, 
            {parser: 'typescript', plugins: [prettierTsPlugin, prettierEsTreePlugin]}
          )
          .then((prettyCode) => ({[fileName]: {...file, code: prettyCode}}))
        ))
        .then(entries => entries.reduce((acc, file) => ({...acc, ...file}), {}))
        .then((prettyFiles: ComponentFiles) => {
          setComponents( {[activeComponent]: {...prettyFiles, ['/package.json']: packageJsonFile}});
        });
      })();
    }

  return (
    <SandpackProvider {...spProviderProps}>
      <SandpackLayout>
      <SandpackConsumer>
      { 
        (ctx: SandpackContext | null) => {
          return (
            <div className='grid h-full w-full place-items-stretch gap-2 grid-cols-[1fr_4fr_2fr] grid-rows-[1fr_1fr_25px]' style={{gridTemplateAreas: ["'preview preview sidebar'","'files code sidebar'", "'drawer drawer drawer'"].join('\n')}}>
              <div className='bg-card' style={{gridArea: 'preview'}}>
                {ctx?.status === 'initial'
                  ? <Skeleton className="rounded-full"/>
                  : 
                  <ComponentPreview prettifyAction={prettifyAction} />
                }
              </div>
              <div className='bg-card p-2' style={{gridArea: 'files'}}>
                {ctx?.status === 'initial'
                  ? <Skeleton className="rounded-full"/> 
                  : <ComponentFileExplorer spProviderProps={spProviderProps}/>
                }
              </div>
              <div className='min-h-0 min-w-0 bg-card p-2' style={{gridArea: 'code'}}>
                {ctx?.status === 'initial' || !ctx
                  ? <Skeleton className="rounded-full"/> 
                  : <ComponentCodeEditor  
                      activeComponent={activeComponent}
                      spProviderProps={spProviderProps}
                      onEdit={handleComponentCodeEdit}
                    />
                }
              </div>
              <div className='bg-card' style={{gridArea: 'sidebar'}}>
                <EditorSidebar 
                  activeFile={ctx?.activeFile}
                  getPropsHandler={handleGetProps}
                  addPropHandler={handleAddProp}
                  editPropHandler={handleEditProp}
                  removePropHandler={handleRemoveProp}
                />
              </div>

            <div className='bg-card' style={{gridArea: 'drawer'}}>
            {ctx?.status === 'initial' || !ctx
              ? <Skeleton className="h-[25px] rounded-full"/> 
              : <ComponentDrawer  components={components}
                                  onCreateComponent={() => handleAddNewComponent("New")}
                                  onSelectComponent={handleComponentSelect}
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

function ComponentFileExplorer({
  spProviderProps
}:{
  spProviderProps: SandpackProviderProps
}) {
  const [timerDone, setTimerDone] = useState(false);

  function delay(s: number) {
    return new Promise(resolve => {
      setTimeout(resolve, 1000*s);
    });
  }

  useEffect(() => {delay(0.75).then(() => setTimerDone(true))}, [])

  // const { sandpack } = useSandpack();
  // console.log(sandpack);
  // if(spProviderProps.options?.activeFile) sandpack.updateFile(spProviderProps.options?.activeFile);
  // sandpack.files = spProviderProps?.files ?? {};

  return ( timerDone ? <SandpackFileExplorer autoHiddenFiles/> : <></>);
}

function ComponentCodeEditor({
  activeComponent,
  spProviderProps,
  onEdit
}: {
  activeComponent: string,
  spProviderProps: SandpackProviderProps
  onEdit: (componentName: string, file: string, newCode: string) => void
}) {
  const editorRef = useRef<CodeEditorRef>(null);
  const [initialized, setInitialized] = useState(false);

  // Initialize editor to currently active file
  function initialize() {
    console.log('editor detected change in active component and/or sandpack');
    setInitialized(false);
    const editor = editorRef?.current?.getCodemirror();
    const activeFileName = spProviderProps.options?.activeFile;
    if(!editor) {return;}
    if(   
          !(
            activeFileName &&
            spProviderProps.files && 
            Object.keys(spProviderProps.files).includes(activeFileName)
          )
      ) 
    { 
      throw new Error(`Code editor error: could not initialize file '${activeFileName}' for component ${activeComponent}.`) 
    }

    const activeFile = spProviderProps.files[activeFileName] as SandpackFile;
    editor.dispatch({ changes: {from: 0, to: editor.state.doc.length, insert: activeFile.code } });
    console.log(`initialized editor with '${activeFileName}' from component '${activeComponent}'`);
  }

  useEffect(
    initialize, 
    [editorRef?.current?.getCodemirror(), activeComponent, spProviderProps?.files, spProviderProps?.options?.activeFile]
  );

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

      `}</style>
      <SandpackCodeEditor 
        ref={editorRef}
        showTabs={false}
        // initMode="immediate"
        extensions={
          initialized
          ? [
              EditorView.updateListener.of(
                (update: ViewUpdate) => {
                  if(update.docChanged) {
                    if(!initialized) {setInitialized(true);}
                    else if(spProviderProps?.options?.activeFile) {
                      const newCode = update.state.doc.toString();
                      console.log(`editor change: updating ${activeComponent}:${spProviderProps.options.activeFile}`);
                      onEdit(activeComponent, spProviderProps.options?.activeFile, newCode);
                    }
                  }
                }
              )
            ]
          : []
          }
        showRunButton={false}
        showLineNumbers
        wrapContent
        showInlineErrors={false}
      />
    </>
  );
}


export function ComponentPreview({
  prettifyAction
}: {
  prettifyAction: () => void,
}) {
  const preview = useRef<SandpackPreviewRef>(null);
  // const {sandpack} = useSandpackClient();
  // type mode = 'preview' | 'console';
  // const [mode, setMode] = useState<mode>('preview');
  // const [previewRef, setPreviewRef] = useState<any>(useRef<any>());
  // const [consoleRef, setConsoleRef] = useState<any>(useRef<any>());

  // Object.entries(sandpack.clients).forEach(([clientId, client]) => {
  //   client.options.showErrorScreen = false;
  //   client.listen((msg) => {
  //     console.warn(msg);
  //   });
  //   // client.options.width = client.errors.length ? client.options.width
  // })
  // console.log(sandpack);
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

    <SandpackPreview    showSandpackErrorOverlay={false}
                        showOpenInCodeSandbox={false}
                        showRestartButton
                        showRefreshButton
                        actionsChildren={
                          <div className= "pt-1 flex justify-center bg-background">
                            <button className='mx-2' onClick={prettifyAction}><CodeIcon/></button>
                            <button className='mx-2' onClick={() => preview.current?.getClient()?.dispatch({type: 'refresh'})}><ReloadIcon/></button>
                          </div>
                        }
                        ref={preview}
    />
    // </CardContent>
  );
}