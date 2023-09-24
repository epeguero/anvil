import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
 
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Cross2Icon, CrossCircledIcon, PlusCircledIcon, PlusIcon } from "@radix-ui/react-icons";
import { PlusCircleIcon } from "lucide-react";
import React, { BaseSyntheticEvent, FormEvent, RefObject, useEffect, useRef, useState } from "react";
import 'react-hook-form';
import { FieldErrors, FieldValues, FormProvider, Resolver, SubmitHandler, UseFormReturn, useForm } from "react-hook-form";
import { ObjectSchema } from "yup";
import { eventNames } from "process";

export default function ComponentDetails({
  getPropsHandler,
  addPropHandler
}: {
  getPropsHandler: () => string[],
  addPropHandler: (name: string) => void
}) {
  const hooks = ['useState', 'useEffect'];

  const existingProps = getPropsHandler();
  return (
    <>
    <Accordion key={'accordion-props'} className='pl-2' type="single" collapsible>
      <AccordionItem value="item-1" className='border-none'>
        <AccordionTrigger>Props</AccordionTrigger>
        <AccordionContent>
          <ScrollArea>
            <div className="p-4 pt-0">
              {existingProps.map((prop, i) => (
                <div key={`prop-${i}`}>
                  <div className="flex items-center space-x-2 pb-1 group/props">
                    <button className="invisible group-hover/props:visible">
                      <CrossCircledIcon/>
                    </button>
                    <Label htmlFor={prop}>{prop}</Label>
                  </div>
                </div>
              ))}
              <AddPropForm existingProps={existingProps} addPropHandler={addPropHandler}/>
              {/* <AddPropForm
                existingProps={existingProps} 
                addPropHandler={addPropHandler}
              /> */}
            </div>
          </ScrollArea>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
    <Accordion key={'accordion-hooks'} className='pl-2' type='single' collapsible>
      <AccordionItem value="item-1" className='border-none'>
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

function Form({
  onSubmit,
  children
}:{
  onSubmit: (form: HTMLFormElement, event: BaseSyntheticEvent) => void,
  children: React.ReactNode
}) {
  const [form, setForm] = useState<HTMLFormElement | null>(null);

  const submitHandler = 
    (e: BaseSyntheticEvent) => {
      e.preventDefault();
      if(form) onSubmit(form, e)
    }

  return (
    <form ref={setForm}
          method='dialog' 
          onSubmit={submitHandler}
          className='w-full h-full'
    >
      {children}
    </form>
  )
}

function AddPropForm({
  existingProps,
  addPropHandler
}:{
  existingProps: string[],
  addPropHandler: (name: string) => void
}) {
  const [form, setForm] = useState<HTMLFormElement | null>(null);
  const [input, setInput] = useState<HTMLInputElement | null>(null);
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    if(showInput && input) {input.focus()}
  }, 
  [showInput, input]
  );

  function submitProp(input: HTMLInputElement, form: HTMLFormElement) {
    if(existingProps.includes(input.value)) {
      input.setCustomValidity(`Cannot have duplicate: '${input.value}'`);
      input.reportValidity();
      input.focus();
      form?.reset();
    }
    else if (!input.value.match(/^[a-zA-Z]+[a-zA-Z0-9_]*$/)) { 
      input.setCustomValidity(`Prop name is invalid identifier: '${input.value}'\n`);
      input.reportValidity();
      input.focus();
      form?.reset();
    }
    else if (input.value) {
      input.setCustomValidity('');
      form?.requestSubmit();
    }
  }

  function onClick() {
    if(!input) return;
    input.focus(); 
    if(!showInput) { setShowInput(true); }
    else if (showInput && !input.value) { setShowInput(false); }
    else if (form) { submitProp(input, form); }
  }

  function onBlur() {
    if(!input) return;

    if(!input.value) { setShowInput(false); }
    else if (form) { submitProp(input, form); }
  }

  const onSubmit = (e: BaseSyntheticEvent) => {
    e.preventDefault();
    if(!form) return;

    const data = 
      Array.from(new FormData(form).entries())
      .reduce(
        (accum, [key, value]) => ({...accum, [key]: value}),
        {}
      ) as {prop: string};
    
    form.reset();
    if(showInput) setShowInput(false);
    addPropHandler(data.prop)
  }

  return (
    <form ref={setForm}
          method='dialog' 
          onSubmit={onSubmit}
          className='w-full h-full'
    >
      <div className="h-full flex items-center space-x-2 pb-1">
        <button 
          type='button'
          onClick={ onClick }
        >
          <PlusCircledIcon/> 
        </button>
        <label htmlFor="prop">
          {!showInput ? "add new prop" : "" }
          <input 
            type={showInput ? 'text' : 'hidden'}
            className={'w-full bg-foreground text-background p-1'}
            placeholder="new prop name"
            name={'prop'}
            ref={setInput}
            onBlur={onBlur}
          />
        </label>
      </div>
    </form>
  )
}