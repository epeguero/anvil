// import {Sidebar, Menu, SubMenu, MenuItem, sidebarClasses} from 'react-pro-sidebar';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import EditorOutline from "./EditorOutline";
import ElementDetails from "./ElementDetails";
import { Separator } from "@/components/ui/separator"

export default function EditorSidebar() {
  return (
    <div className='w-60 h-screen overflow-hidden'>
      <Card className='h-1/3 rounded-sm'>
        <CardTitle className='font-semibold text-base pl-2 pt-2'>Outline</CardTitle>
        <Separator/>
        <EditorOutline/>
      </Card>
      <Card className='h-2/3 rounded-sm'>
        <CardTitle className='font-semibold text-base pl-2 pt-2'>Details: MyComponent</CardTitle>
        <ElementDetails/>
      </Card>
    </div>
    // <Sidebar>
    //   <Menu closeOnClick={false} >
    //     <SubMenu  className="h-72 w-48 rounded-md border" 
    //               label="Outline"
    //               defaultOpen={true}
    //     >
    //     <MenuItem>
    //     </MenuItem>
    //     </SubMenu>
    //   </Menu>
    // </Sidebar>
  );

}