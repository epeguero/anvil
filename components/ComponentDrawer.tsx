import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { printAst, tsx } from "@/lib/ast";
import { SandpackConsumer, SandpackContext, SandpackFile, SandpackLayout, SandpackPreview, SandpackProvider, SandpackProviderProps, useSandpackNavigation } from "@codesandbox/sandpack-react/unstyled";
import { MixIcon, PlusIcon } from "@radix-ui/react-icons"
import { Component, ComponentFiles, Components } from "./ComponentEditor";

const sandpackPreviewProviderProps = (c: Component) : SandpackProviderProps => 
{
  const cFiles = Object.entries(c)[0][1];
  return (
    {
      files: cFiles,
      options: {
        externalResources: ["https://cdn.tailwindcss.com"],
        classes: {
          "sp-preview": "h-full w-full component-preview",
          "sp-preview-container": "h-full w-full",
          "sp-preview-iframe": "h-full w-full",
          "sp-preview-actions": "hidden",
        }
      },
      customSetup: {
        dependencies: {
          "react": "latest",
          "react-dom": "latest",
          '@radix-ui/react-slot': 'latest',
          'class-variance-authority': 'latest',
          'clsx': 'latest',
          'tailwind-merge': 'latest'
        },
        entry: "/index.js"
      }
    }
  )
}

export function newComponent(name: string) {
  return { [name]: 
    {
      '/index.js': {code: 
`import ReactDOM from 'react-dom/client';
import ${name} from './components/${name}.tsx';
ReactDOM
.createRoot(document.getElementById('root'))
.render(<div className='flex flex-wrap h-screen justify-around content-around'><${name}/></div>);
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
            '@radix-ui/react-slot': 'latest',
            'class-variance-authority': 'latest',
            'clsx': 'latest',
            'tailwind-merge': 'latest'
          }
        }
      )
    }
  }
};
}
export default function ComponentDrawer({
  components,
  addComponent,
  onSelectComponent
}: {
  components: Components,
  addComponent: (component: Component) => void,
  onSelectComponent: (componentName: string) => void
}) {
  return (
    <Sheet modal={false}>
      <SheetTrigger>
        <div className='flex w-full h-items-center gap-1 m-1 text-xs'>
          <MixIcon/>
          Component Drawer
        </div>
      </SheetTrigger>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>Component Drawer</SheetTitle>
        </SheetHeader>
        <div className='flex overflow-y-auto gap-10 p-4 items-stretch '> 
          <div className='group/add shrink-0 w-44 h-44 flex bg-zinc-100 transition-all :transition-all hover:shadow-lg hover:shadow-black/50'
                onClick={
                  () => {
                    addComponent(newComponent('New'));
                  }
                }
          >
              <PlusIcon className='m-auto h-10 w-10 text-neutral-500 group-hover/add:text-neutral-950'/>
          </div>
          {
            Object.entries(components).map(([cName, cFiles]) => 
              (
                <div  className="relative group/component"
                      onClick={() => onSelectComponent(cName)}
                      key={`component-${cName}`} 
                >
                <div  className="z-10 absolute shrink-0 w-44 h-44 border bg-neutral-100 opacity-10 group-hover/component:shadow-lg group-hover/component:shadow-black/50 transition-all"/>
                <div  className='z-0 shrink-0 w-44 h-44 border group-hover/component:shadow-lg group-hover/component:shadow-black/50 transition-all'
                >
                  <SandpackProvider {...sandpackPreviewProviderProps({cName: cFiles})}>
                    <style>{`
                      .component-preview iframe { height: 100% !important; width: 100%; }
                    `}</style>
                    <SandpackLayout>
                      <SandpackPreview 
                        showOpenInCodeSandbox={false} 
                        showRefreshButton={false}
                      />
                    </SandpackLayout> 
                  </SandpackProvider>
              </div>
              </div>
              )
            )
          }
        </div>
      </SheetContent>
    </Sheet>
  )
}