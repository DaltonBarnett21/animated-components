import { ReactNode, createContext, useContext, useState } from "react";
import { motion } from "framer-motion";
import { ANIMATIONS, cn } from "@/utils";

interface CheckBoxProps
  extends Omit<
    React.InputHTMLAttributes<React.HTMLInputTypeAttribute>,
    "className"
  > {
  isFocused?: boolean;
}

const CheckBoxContext = createContext<CheckBoxProps>({});

const Checkbox = ({ children, ...props }: CheckBoxProps) => {
  return (
    <CheckBoxContext.Provider value={{ ...props }}>
      <div className=" space-x-2 flex">{children}</div>
    </CheckBoxContext.Provider>
  );
};

const CheckBoxIndicator = ({ className }: { className?: string }) => {
  const { checked, value, onChange, isFocused } = useContext(CheckBoxContext);

  return (
    <button className={cn("relative flex items-center")}>
      <input
        type="checkbox"
        className={cn(
          ` peer ${
            isFocused &&
            " bg-blue-interaction-200 opacity-70 h-7 w-7 border-blue-interaction-200 "
          } relative h-5 w-5 cursor-pointer appearance-none rounded-md  border border-primary transition-all duration-700 before:absolute before:top-2/4 before:left-2/4 before:block before:h-7 before:w-7 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-primary checked:bg-primary checked:disabled:bg-gray-400  before:bg-blue-interaction-200 before:disabled:bg-transparent hover:before:opacity-50 disabled:border-gray-400 disabled:cursor-not-allowed`,
          className
        )}
        //@ts-ignore
        checked={checked}
        //@ts-ignore
        value={value}
        //@ts-ignore
        onChange={onChange}
      />
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white-50">
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="3.5"
          stroke="currentColor"
          className="h-3.5 w-3.5"
          initial={false}
          animate={
            //@ts-ignore
            checked ? "checked" : "unchecked"
          }
        >
          <motion.path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 12.75l6 6 9-13.5"
            variants={ANIMATIONS.tick}
          />
        </motion.svg>
      </div>
    </button>
  );
};

Checkbox.CheckBoxIndicator = CheckBoxIndicator;

interface CheckboxLabelProps {
  children: React.ReactNode;
  className?: string;
}

const CheckboxLabel = ({ children, className }: CheckboxLabelProps) => {
  return <span className={cn("", className)}>{children}</span>;
};

Checkbox.CheckboxLabel = CheckboxLabel;

export default Checkbox;
