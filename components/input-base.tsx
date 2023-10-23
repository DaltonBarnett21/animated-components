import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils";

export const inputVariants = cva(
  "flex w-full mt-[4px] mb-[2px] relative bg-white rounded-md outline-none border border-coolGray-400 transition-all duration-300   placeholder:text-muted-foreground ",
  {
    variants: {
      variant: {
        default: "",
        available: "border-primary ",
        error:
          "bg-red-50 border border-red-400 focus:border-red-400 outline-none ring-0 mt-[5px] mb-[5px]  ",
      },
      size: {
        small: " p-[7px]  ",
        large: " p-[12px] ",
      },
      disabled: {
        true: "bg-coolGray-100 border-none text-coolGray-400",
      },
      readonly: {
        true: "outline-none font-medium  border-t-0 border-l-0 border-r-0 rounded-none border-b-coolGray-400",
      },
      error: {
        true: "bg-red-50 border border-red-400 focus:border-red-400 outline-none ring-0 mt-[5px] mb-[5px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "large",
    },
  }
);

interface Props extends VariantProps<typeof inputVariants> {
  children: React.ReactNode[] | React.ReactNode;
  className?: string;
  isFocused?: boolean;
  isMenuOpen?: boolean;
  label?: string;
}

const InputBase = ({
  children,
  variant,
  size,
  className,
  isFocused,
  isMenuOpen,
  disabled,
  readonly,
  error,
  label,
}: Props) => {
  return (
    <>
      {Array.isArray(children) ? (
        <>
          <label>{label}</label>
          <div className=" relative">
            <div
              className={cn(
                inputVariants({
                  variant,
                  size,
                  disabled,
                  readonly,
                  error,
                }),
                isFocused && " border-primary border-2 ring-1 ring-primary",
                className
              )}
            >
              {children[0]}
            </div>
            {/* ICON CONTAINER */}
            {children[1] && (
              <div
                className={cn(`absolute duration-300 transition-all rounded-r-md inset-y-0 right-0 p-2  
              flex items-center  
               border-l border-l-coolGray-400   
                ${
                  isMenuOpen &&
                  !isFocused &&
                  " border border-primary ring-1 ring-primary "
                }
                ${disabled || (readonly && "border-none cursor-none")}
               `)}
              >
                {children[1]}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <label>{label}</label>
          <div className=" relative">
            <div
              className={cn(
                inputVariants({
                  variant,
                  size,
                  disabled,
                  readonly,
                  error,
                }),
                isFocused &&
                  !disabled &&
                  !readonly &&
                  " border-primary border-2 ring-1 ring-primary",
                className
              )}
            >
              {children}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default InputBase;
