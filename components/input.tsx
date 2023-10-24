import React, { InputHTMLAttributes, useState } from "react";
import InputBase, { inputVariants } from "./input-base";
import { VariantProps } from "class-variance-authority";
import { useNumberFieldState } from "react-stately";
import { useLocale, useNumberField } from "react-aria";
import { cn } from "@/utils";

interface Props
  extends Omit<
      React.InputHTMLAttributes<HTMLInputElement>,
      "disabled" | "readonly" | "size"
    >,
    VariantProps<typeof inputVariants> {
  label?: string;
  description?: string;
  format?: "number";
  formatOptions?: {
    style: "currency" | "percent";
    currency?: string;
  };
  minValue?: number;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, Props>(
  (
    {
      className,
      children,
      disabled,
      readonly,
      placeholder,
      description,
      label,
      type,
      formatOptions,
      format,
      minValue,
      icon,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <>
        <InputBase
          isFocused={isFocused}
          disabled={disabled}
          readonly={readonly}
          label={label}
          {...props}
        >
          {format === "number" ? (
            <>
              <NumberFormat
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className=" relative"
                placeholder={placeholder}
                readOnly={readonly!}
                disabled={disabled!}
                formatOptions={formatOptions}
                minValue={minValue}
                {...props}
              />
            </>
          ) : (
            <>
              <input
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className=" w-full outline-none bg-transparent relative"
                placeholder={placeholder}
                type={type}
                readOnly={readonly!}
                disabled={disabled!}
                ref={ref}
                onChange={props.onChange}
              />
            </>
          )}
          {icon && icon}
        </InputBase>
        <span className=" text-gray-500">{description}</span>
      </>
    );
  }
);

const NumberFormat = (props: any) => {
  let { locale } = useLocale();
  let state = useNumberFieldState({ ...props, locale });
  let inputRef = React.useRef(null);
  let { inputProps } = useNumberField(props, state, inputRef);

  return (
    <input
      onBlur={() => props.setIsFocused(false)}
      className=" w-full outline-none bg-transparent"
      placeholder={props.placeholder}
      readOnly={props.readonly!}
      disabled={props.disabled!}
      {...inputProps}
      ref={inputRef}
    />
  );
};
