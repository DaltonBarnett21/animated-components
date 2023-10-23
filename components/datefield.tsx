import { useDateFieldState } from "react-stately";
import { useDateField, useDateSegment, useLocale } from "react-aria";
import { createCalendar } from "@internationalized/date";
import React from "react";

export function DateField(props: any) {
  let { locale } = useLocale();
  let state = useDateFieldState({
    ...props,
    locale,
    createCalendar,
  });

  let ref = React.useRef(null);
  let { labelProps, fieldProps } = useDateField(props, state, ref);

  return (
    <div className=" ">
      <span {...labelProps}>{props.label}</span>
      <div {...fieldProps} ref={ref} className="flex space-x-1">
        {state.segments.map((segment, i) => (
          <DateSegment key={i} segment={segment} state={state} />
        ))}
      </div>
    </div>
  );
}

function DateSegment({ segment, state }: any) {
  let ref = React.useRef(null);
  let { segmentProps } = useDateSegment(segment, state, ref);

  return (
    <div
      {...segmentProps}
      ref={ref}
      className={`  ${segment.isPlaceholder ? "placeholder" : ""}`}
    >
      {segment.text}
    </div>
  );
}
