// import {Sidebar, Menu, SubMenu, MenuItem, sidebarClasses} from 'react-pro-sidebar';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

import EditorOutline from "./EditorOutline";
import ComponentDetails from "./ComponentDetails";
import { useSandpack } from "@codesandbox/sandpack-react/unstyled";

export default function EditorSidebar({
  activeFile,
  getPropsHandler,
  addPropHandler,
  editPropHandler,
  removePropHandler
}: {
  activeFile: string | undefined,
  getPropsHandler: () => string[]
  addPropHandler: (propName: string) => void,
  editPropHandler: (oldProp: string, newProp: string) => void,
  removePropHandler: (prop: string) => void
}) {
  return (
    <div className='h-full flex flex-col gap-1 border p-1'>
      <div className='flex-1 border p-2'>
        <p className='pb-1'>Outline:</p>
        <EditorOutline/>
      </div>
      <div className='flex-[2_1_0] border px-2'>
        { 
          activeFile && ['.tsx', '.jsx'].some((ext) => activeFile.includes(ext))
          ? <ComponentDetails 
              addPropHandler={addPropHandler}
              getPropsHandler={getPropsHandler}
              editPropHandler={editPropHandler}
              removePropHandler={removePropHandler}
            />
          : <></>
        }
      </div>
    </div>
  );

}