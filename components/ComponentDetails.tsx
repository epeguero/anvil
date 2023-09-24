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
import { editProp } from "@/lib/ast";

export default function ComponentDetails({
  getPropsHandler,
  addPropHandler,
  editPropHandler,
  removePropHandler
}: {
  getPropsHandler: () => string[],
  addPropHandler: (name: string) => void,
  editPropHandler: (oldProp: string, newProp :string) => void,
  removePropHandler: (prop: string) => void,
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
              {existingProps.map((prop, i) => 
                <EditPropForm 
                  key={`edit-prop-${i}`}
                  prop={prop} 
                  existingProps={existingProps.filter(p => p != prop)} 
                  editPropHandler={editPropHandler}
                  removePropHandler={removePropHandler}
                />)
              }
              <AddPropForm 
                existingProps={existingProps} 
                addPropHandler={addPropHandler}
              />
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

  useEffect(() => { if(showInput && input) {input.focus()} }, [showInput, input]);

  function onClick() {
    if(!input) return;
    console.log('click')
    if(!showInput) { setShowInput(true); }
  }

  function onBlur() {
    if(!input) return;
    console.log('blur');
    if(showInput && !input.value) {setShowInput(false);}
    if (form) { submitProp(input, form, existingProps); }
  }

  function submitProp(input: HTMLInputElement, form: HTMLFormElement, existingProps: string[]) {
    if(!input.value) {
      input.setCustomValidity('');
    }
    else if(existingProps.includes(input.value)) {
      input.setCustomValidity(`Cannot have duplicate: '${input.value}'`);
      input.reportValidity();
      form?.reset();
    }
    else if (!input.value.match(/^[a-zA-Z]+[a-zA-Z0-9_]*$/)) { 
      input.setCustomValidity(`Prop name is invalid identifier: '${input.value}'\n`);
      input.reportValidity();
      form?.reset();
    }
    else {
      input.setCustomValidity('');
      form?.requestSubmit();
    }
  }

  function onSubmitAddPropForm(e: BaseSyntheticEvent) {
    onSubmit<{prop: string}>(e, (data) => {
      if(showInput) setShowInput(false);
      addPropHandler(data.prop)
    })
  }

  return (
    <form ref={setForm}
          method='dialog' 
          onSubmit={onSubmitAddPropForm}
          className='w-full h-full group/add-prop'
    >
      <div className="h-full flex items-center space-x-2 pb-1" onClick={onClick} >
        <button 
          className='opacity-30 group-hover/add-prop:opacity-100'
          type='button'
        >
          <PlusCircledIcon/> 
        </button>
        <label htmlFor="prop">
          {!showInput ? <div className='opacity-30 group-hover/add-prop:opacity-100' >add new prop</div>: "" }
          <input 
            type={showInput ? 'text' : 'hidden'}
            className={'w-full bg-foreground text-background p-1 opacity-100'}
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


function EditPropForm({
  prop,
  existingProps,
  editPropHandler,
  removePropHandler
}:{
  prop: string,
  existingProps: string[],
  editPropHandler: (oldProp: string, newProp: string) => void,
  removePropHandler: (prop: string) => void
}) {
  const [form, setForm] = useState<HTMLFormElement | null>(null);
  const [input, setInput] = useState<HTMLInputElement | null>(null);
  const [showInput, setShowInput] = useState(false);

  useEffect(() => { if(showInput && input) {input.focus()} }, [showInput, input]);

  function onClickProp() {
    if(!input) return;
    console.log('click')
    if(!showInput) { input.value = prop; setShowInput(true); }
  }

  function onClickDelete() {
    removePropHandler(prop);
  }

  function onBlur() {
    if(!input) return;
    console.log('blur');
    if(showInput && !input.value) {setShowInput(false);}
    if (form) { submitProp(input, form, existingProps); }
  }

  function submitProp(input: HTMLInputElement, form: HTMLFormElement, existingProps: string[]) {
    if(!input.value) {
      input.setCustomValidity('');
      form?.requestSubmit();
    }
    else if(existingProps.includes(input.value)) {
      input.setCustomValidity(`Cannot have duplicate: '${input.value}'`);
      input.reportValidity();
      form?.reset();
    }
    else if (!input.value.match(/^[a-zA-Z]+[a-zA-Z0-9_]*$/)) { 
      input.setCustomValidity(`Prop name is invalid identifier: '${input.value}'\n`);
      input.reportValidity();
      form?.reset();
    }
    else if (input.value != prop) {
      input.setCustomValidity('');
      form?.requestSubmit();
    }
    else {
      setShowInput(false);
    }
  }

  function onSubmitEditPropForm(e: BaseSyntheticEvent) {
    onSubmit<{prop: string}>(e, (data) => {
      console.log('submit')
      if(showInput) setShowInput(false);
      data.prop
      ? editPropHandler(prop, data.prop)
      : removePropHandler(prop)
    })
  }

  return (
    <form ref={setForm}
          method='dialog' 
          onSubmit={onSubmitEditPropForm}
          className='w-full h-full group/edit-prop'
    >
      <div className="h-full flex items-center space-x-2 pb-1">
        <button 
          type='button'
          onClick={onClickDelete}
          className='opacity-0 group-hover/edit-prop:opacity-30 group-hover/edit-prop:hover:opacity-100'
        >
          <CrossCircledIcon/> 
        </button>
        <label htmlFor="prop">
          {!showInput 
            ? <button onClick={onClickProp} className='hover:underline'>{prop}</button>
            : <></>
          }
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

function onSubmit<T>(e: BaseSyntheticEvent, submitHandler: (data: T) => void) {
  console.log('submit')
  e.preventDefault();
  const form = e.currentTarget;
  if(!form) return;

  const data = 
    Array.from(new FormData(form).entries())
    .reduce(
      (accum, [key, value]) => ({...accum, [key]: value}),
      {}
    ) as T;
  
  form.reset();
  submitHandler(data);
}
