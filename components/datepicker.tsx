import React, { useRef, useState } from "react";
import { useButton, useDatePicker, useDateRangePicker } from "react-aria";
import { useDatePickerState, useDateRangePickerState } from "react-stately";
import { DateField } from "./datefield";
import { DismissButton, Overlay, usePopover } from "react-aria";
import { useDialog } from "react-aria";
import { Calendar } from "./calendar";
import { CalendarIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ANIMATIONS } from "@/utils";
import { inputVariants } from "./input-base";
import { VariantProps } from "class-variance-authority";
import InputBase from "./input-base";

interface Props extends VariantProps<typeof inputVariants> {
  minValue?: any;
  mode: "single" | "range";
  label?: string;
  description?: string;
  readonly?: boolean;
  disabled?: boolean;
  onChange?: any;
  dateValue?: string;
}

export function DatePicker(props: Props) {
  return (
    <>
      {props.mode === "single" ? <Single {...props} /> : <Range {...props} />}
    </>
  );
}

function Single(props: Props) {
  let isDisabled = props.disabled || props.readonly;
  const [isFocused, setIsFocused] = useState(false);
  let state = useDatePickerState(props);
  let ref = useRef();
  let {
    groupProps,
    labelProps,
    fieldProps,
    buttonProps,
    dialogProps,
    calendarProps,
    //@ts-ignore
  } = useDatePicker({ isDisabled: isDisabled, ...props }, state, ref);

  return (
    <div className="">
      <div
        {...groupProps}
        //@ts-ignore
        ref={ref}
      >
        <InputBase {...props} isFocused={isFocused} isMenuOpen={state.isOpen}>
          <div
            className="flex w-full  "
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          >
            <DateField {...fieldProps} />
          </div>
          <FieldButton
            isDisabled={isDisabled}
            {...buttonProps}
            isPressed={state.isOpen}
          >
            {isDisabled ? (
              <CalendarIcon className="w-5 h-5 text-gray-400 group-focus-within:text-gray-400" />
            ) : (
              <CalendarIcon className="w-5 h-5 text-primary group-focus-within:text-primary" />
            )}
          </FieldButton>
        </InputBase>
      </div>
      <span className=" text-gray-500">{props.description}</span>
      <AnimatePresence>
        {state.isOpen && !isDisabled && (
          <Popover triggerRef={ref} state={state}>
            <Dialog {...dialogProps}>
              <Calendar mode={props.mode} {...calendarProps} />
            </Dialog>
          </Popover>
        )}
      </AnimatePresence>
    </div>
  );
}

function Range(props: Props) {
  let isDisabled = props.disabled || props.readonly;
  let state = useDateRangePickerState({ isDisabled, ...props });
  const [isFocused, setIsFocused] = useState(false);
  let ref = useRef();
  let {
    groupProps,
    labelProps,
    startFieldProps,
    endFieldProps,
    buttonProps,
    dialogProps,
    calendarProps,
    //@ts-ignore
  } = useDateRangePicker({ isDisabled: isDisabled, ...props }, state, ref);

  return (
    <div className="">
      <div
        {...groupProps}
        //@ts-ignore
        ref={ref}
      >
        <InputBase {...props} isFocused={isFocused} isMenuOpen={state.isOpen}>
          <div
            className="flex w-full  "
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          >
            <DateField {...startFieldProps} />
            <span aria-hidden="true" className="px-2">
              –
            </span>
            <DateField {...endFieldProps} />
          </div>
          <FieldButton
            isDisabled={isDisabled}
            {...buttonProps}
            isPressed={state.isOpen}
          >
            {isDisabled ? (
              <CalendarIcon className="w-5 h-5 text-gray-400 group-focus-within:text-gray-400" />
            ) : (
              <CalendarIcon className="w-5 h-5 text-primary group-focus-within:text-primary" />
            )}
          </FieldButton>
        </InputBase>
      </div>
      <span className=" text-gray-500">{props.description}</span>
      <AnimatePresence>
        {state.isOpen && !isDisabled && (
          <Popover triggerRef={ref} state={state}>
            <Dialog {...dialogProps}>
              <Calendar mode={props.mode} {...calendarProps} />
            </Dialog>
          </Popover>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FieldButton(props: any) {
  let ref = useRef();
  //@ts-ignore
  let { buttonProps, isPressed, disabled } = useButton(props, ref);

  return (
    <button
      {...buttonProps}
      disabled={props.isDisabled}
      className=" "
      //@ts-ignore
      ref={ref}
    >
      {props.children}
    </button>
  );
}

function Popover(props: any) {
  let ref = React.useRef(null);
  let { state, children } = props;

  let { popoverProps, underlayProps } = usePopover(
    {
      ...props,
      popoverRef: ref,
    },

    state
  );

  return (
    <motion.div
      initial={ANIMATIONS.scaleSpringOpacity.exit}
      animate={ANIMATIONS.scaleSpringOpacity.enter}
      exit={ANIMATIONS.scaleSpringOpacity.exit}
      className=""
    >
      <div {...underlayProps} />
      <div
        {...popoverProps}
        ref={ref}
        className="absolute  -translate-x-3  bg-white-50 border border-gray-400 rounded-md  top-[4.5rem] p-5 z-50"
      >
        <DismissButton onDismiss={state.close} />
        {children}
        <DismissButton onDismiss={state.close} />
      </div>
    </motion.div>
  );
}

function Dialog({ title, children, ...props }: any) {
  let ref = React.useRef();
  //@ts-ignore
  let { dialogProps } = useDialog(props, ref);

  return (
    //@ts-ignore
    <div {...dialogProps} ref={ref}>
      {children}
    </div>
  );
}
