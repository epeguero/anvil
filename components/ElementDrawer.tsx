import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { MixIcon } from "@radix-ui/react-icons"

export default function ElementDrawer() {
  return (
    <Sheet modal={false}>
      <SheetTrigger>{<MixIcon/>}</SheetTrigger>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>Component Drawer</SheetTitle>
            <div key={'test components'} className='flex overflow-y-auto gap-10'>
              {Array.from({ length: 15 }, (_, i) => (
                <div key={`test-component-${i}`} className='shrink-0 w-96 h-96 bg-black'/>
              ))}
            </div>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  )
}