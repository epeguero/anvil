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

export default function EditorSidebar() {
  return (
    <>
      <EditorOutline/>
      <ComponentDetails/>
    </>
    // <Card className='rounded-none rounded-tr-lg'>
    //   <CardContent className='flex flex-col p-1'>
    //     <Card className='flex-1 rounded-sm'>
    //       <CardTitle className='font-semibold text-base pl-2 pt-2'>Outline</CardTitle>
    //       <Separator/>
    //       <EditorOutline/>
    //     </Card>
    //     <Card className='flex-1 rounded-sm'>
    //       <CardTitle className='font-semibold text-base pl-2 pt-2'>Details: MyComponent</CardTitle>
    //       <ComponentDetails/>
    //     </Card>
    //   </CardContent>
    // </Card>
  );

}