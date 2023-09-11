import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
 
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Cross2Icon, CrossCircledIcon, PlusCircledIcon, PlusIcon } from "@radix-ui/react-icons";
import { PlusCircleIcon } from "lucide-react";

export default function ComponentDetails() {
  const props = ['onClick', 'active', 'data'];
  const hooks = ['useState', 'useEffect'];

  return (
    <>
    <Accordion key={'accordion-props'} className='p-2' type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>Props</AccordionTrigger>
        <AccordionContent>
          <ScrollArea>
            <div className="p-4 pt-0">
              {props.map((prop, i) => (
                <div key={`prop-${i}`}>
                  <div className="flex items-center space-x-2 pb-1">
                    <button><CrossCircledIcon/></button>
                    <Label htmlFor={prop}>{prop}</Label>
                  </div>
                  <Separator/>
                </div>
              ))}
              <div className="flex items-center space-x-2 pb-1">
                <button><PlusCircledIcon/></button>
                <span>Add new prop</span>
              </div>
            </div>
          </ScrollArea>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
    <Accordion key={'accordion-hooks'} className='pl-2' type='single' collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>Hooks</AccordionTrigger>
        <AccordionContent>
          <ScrollArea>
            <div className="p-4 pt-0">
              {hooks.map((h, i) => (
                <div key={`hook-${i}`} className="text-sm">
                  {h}
                </div>
              ))}
            </div>
          </ScrollArea>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
    </>
  );
}