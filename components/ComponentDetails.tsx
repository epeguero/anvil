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
import React, { BaseSyntheticEvent, FormEvent, RefObject, useRef, useState } from "react";
import 'react-hook-form';
import { FieldErrors, FieldValues, FormProvider, Resolver, SubmitHandler, UseFormReturn, useForm } from "react-hook-form";
import { ObjectSchema } from "yup";

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

function FormWithError({
  formSchema,
  submitHandler,
  isEmptySubmission,
  children
}:{
  formSchema: ObjectSchema<any>,
  submitHandler: (_:BaseSyntheticEvent, __: UseFormReturn) => void,
  isEmptySubmission: (_:BaseSyntheticEvent, __: UseFormReturn) => boolean,
  children: (_: UseFormReturn) => React.ReactNode
}) {
  const [errors, setErrors] = useState<string[]>([])

  const rhf = useForm({
    shouldUseNativeValidation: false,
    mode: 'all',
    resolver: yupResolver(formSchema),
  });

  const errorHandler = (errors: FieldErrors) => {
    const errorMessages = Object.keys(errors).map(key => errors[key]?.message ?? "");
    if (errorMessages) setErrors(errorMessages);
  }

  const formSubmitHandler =
    (e: BaseSyntheticEvent) => {
      console.log('formSubmitHandler');
      e.preventDefault();
      e.stopPropagation();
      setErrors([]);
      rhf.handleSubmit(
        (_ , e) => {if(e) {submitHandler(e, rhf)}},
        errorHandler)(e)
    }

  return (
    <form method='dialog' 
          onSubmit={formSubmitHandler}
          noValidate
          className='w-full'
    >
      {children(rhf)}
      <dialog 
        open={errors.length > 0} 
        className='relative z-100 text-red-800 text-[0.5rem] rounded-lg p-2 m-1' >
      {
        errors.map(
          (e, i) => 
          <span key={`add-prop-error-${i}`} >{e}</span>
        )
      }
      </dialog>
    </form>
  )
}

// function EditPropForm({
//   renamePropHandler,
//   deletePropHandler
// }: {
//   renamePropHandler: (newName: string) => void,
//   deletePropHandler: (name: string) => void
// }) {
//   const [showInput, setShowInput] = useState(false);


//   return <FormWithError formSchema={} submitHandler={}>
//     {
//     (rhf) => {
//       return (
//           <div className="flex items-center space-x-2 pb-1 group/props">
//             <label>
//               <button type='submit' className="invisible group-hover/props:visible">
//                 <CrossCircledIcon/>
//               </button>
//               <input 
//                   type={`${showInput ? 'text' : 'hidden'}`}
//                   className={'w-full bg-foreground text-background p-1'}
//                   autoFocus
//                   placeholder="new prop name"
//                   {...rhf.register('prop')}
//               />
//             </label>
//           </div>
//         )
//       }
//     }
//   </FormWithError>
// }

function AddPropForm({
  existingProps,
  addPropHandler
}:{
  existingProps: string[],
  addPropHandler: (name: string) => void
}) {
  const [showInput, setShowInput] = useState(false)
  const formSchema = yup.object().shape(
    {
      prop: yup.string()
        .matches(/^[a-zA-Z]+[a-zA-Z0-9_]*$/)
        .notOneOf(existingProps)
        .required()
    }
  );

  const submitHandler = (e: BaseSyntheticEvent, rhf: UseFormReturn) => {
    console.log('child submit handler');
    addPropHandler(rhf.getValues().prop);
    // setShowInput(true);
    rhf.reset();
  }

  const isEmptySubmission = (e: BaseSyntheticEvent, rhf: UseFormReturn) => 
    rhf.getValues().prop === ''

  const inputRef = useRef<HTMLInputElement>();
  return (
    <FormWithError 
              formSchema={formSchema} 
              submitHandler={submitHandler}
              isEmptySubmission={isEmptySubmission}
            >
      {(rhf) => {
        const rhfInput = {...rhf.register('prop')};
        const rhfButton = {...rhf.register('propButton')};
        return ( 
          <div className="h-full flex items-center space-x-2 pb-1">
            <button 
              // type={`${showInput ? 'submit' : 'button'}`} 
              type={'button'} 
              // onClick={(e) => {
              //   console.log('button clicked'); 
              //   setShowInput(!showInput);
              // }}
              onClick={
                (e) => {
                  console.log('button e:', e);
                  e.preventDefault();
                  e.stopPropagation();
                  setShowInput(!showInput);

                  if(!isEmptySubmission(e, rhf)) {
                    console.log('non-empty button click')
                    // rhf.setValue('prop', )
                    rhfButton.onBlur(e);
                  }
                  else {
                    console.log('empty button click');
                    console.log(showInput);
                  }
                }
              }
            >
              <PlusCircledIcon/> 
            </button>
            <label htmlFor="prop">
              <input 
                autoFocus
                type={`${showInput ? 'text' : 'hidden'}`}
                className={'w-full bg-foreground text-background p-1'}
                placeholder="new prop name"
                name={rhfInput.name}
                onBlur={
                  (e) => {
                    console.log('input e:', e, rhf.getValues());
                    const prop = e.target.value;
                    if(prop === '') {
                      console.log('empty input blur')
                      setShowInput(false);
                    }
                    else {
                      console.log('non-empty input blur')
                      rhf.setValue('prop', prop)
                      rhfInput.onBlur(e);
                    }
                  }
                }
                ref={rhfInput.ref}
              />
              {!showInput && <span>new prop</span>}
            </label>
          </div>
        )
      }
    }
    </FormWithError>
  )
}