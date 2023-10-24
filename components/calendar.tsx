import {
  createCalendar,
  getLocalTimeZone,
  today,
} from "@internationalized/date";
import React, { useRef } from "react";
import {
  DateValue,
  useCalendar,
  useLocale,
  useRangeCalendar,
} from "react-aria";
import {
  CalendarStateOptions,
  useCalendarState,
  useRangeCalendarState,
} from "react-stately";
import { useCalendarGrid } from "@react-aria/calendar";
import { getWeeksInMonth, endOfMonth } from "@internationalized/date";
import { useDateFormatter } from "@react-aria/i18n";
import { VisuallyHidden } from "@react-aria/visually-hidden";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useCalendarCell } from "@react-aria/calendar";
import { isSameDay, getDayOfWeek, isSameMonth } from "@internationalized/date";
import { useFocusRing } from "@react-aria/focus";
import { mergeProps } from "@react-aria/utils";

interface Props {
  minValue?: any;
  mode: "single" | "range";
}

export const Calendar = (props: Props) => {
  return (
    <>
      {props.mode === "single" ? (
        <SingleCalendar {...props} />
      ) : (
        <RangeCalendar {...props} />
      )}
    </>
  );
};

function SingleCalendar(props: Props) {
  let { locale } = useLocale();
  let state = useCalendarState({
    ...props,
    visibleDuration: { months: 1 },
    locale,
    createCalendar,
  });

  let ref = useRef();
  let { calendarProps, prevButtonProps, nextButtonProps } = useCalendar(
    props,
    state,
    //@ts-ignore
    ref
  );
  return (
    //@ts-ignore
    <div {...calendarProps} ref={ref} className=" ">
      <CalendarHeader
        state={state}
        calendarProps={calendarProps}
        prevButtonProps={prevButtonProps}
        nextButtonProps={nextButtonProps}
        mode={props.mode}
      />

      <div className="flex gap-8">
        <CalendarGrid state={state} />
        {props.mode === "range" && (
          <CalendarGrid state={state} offset={{ months: 1 }} />
        )}
      </div>
    </div>
  );
}

function RangeCalendar(props: any) {
  let { locale } = useLocale();
  let state = useRangeCalendarState({
    ...props,
    visibleDuration: { months: 2 },
    locale,
    createCalendar,
  });

  let ref = useRef();
  let { calendarProps, prevButtonProps, nextButtonProps } = useRangeCalendar(
    props,
    state,
    //@ts-ignore
    ref
  );

  return (
    <div
      {...calendarProps}
      //@ts-ignore
      ref={ref}
      className=" rounded-md"
    >
      <CalendarHeader
        state={state}
        calendarProps={calendarProps}
        prevButtonProps={prevButtonProps}
        nextButtonProps={nextButtonProps}
        mode={props.mode}
      />
      <div className="flex gap-6 ">
        <CalendarGrid state={state} />
        <CalendarGrid state={state} offset={{ months: 1 }} />
      </div>
    </div>
  );
}

export function CalendarHeader({
  state,
  calendarProps,
  prevButtonProps,
  nextButtonProps,
  mode,
}: any) {
  let monthDateFormatter = useDateFormatter({
    month: "long",
    year: "numeric",
    timeZone: state.timeZone,
  });

  return (
    <div className="flex items-center py-4">
      <VisuallyHidden>
        <p>{calendarProps["aria-label"]}</p>
      </VisuallyHidden>
      <Button {...prevButtonProps}>
        <ChevronLeftIcon className="h-6 w-6 text-primary font-bold" />
      </Button>
      <h2 aria-hidden className="flex-1 align-center font-semibold text-center">
        {monthDateFormatter.format(
          state.visibleRange.start.toDate(state.timeZone)
        )}
      </h2>
      {mode === "range" && (
        <h2
          aria-hidden
          className="flex-1 align-center font-semibold text-center"
        >
          {monthDateFormatter.format(
            state.visibleRange.start.add({ months: 1 }).toDate(state.timeZone)
          )}
        </h2>
      )}

      <Button {...nextButtonProps}>
        <ChevronRightIcon className="h-6 w-6 text-primary" />
      </Button>
    </div>
  );
}

export function CalendarGrid({ state, offset = {} }: any) {
  let { locale } = useLocale();
  let startDate = state.visibleRange.start.add(offset);
  let endDate = endOfMonth(startDate);
  let { gridProps, headerProps, weekDays } = useCalendarGrid(
    {
      startDate,
      //@ts-ignore
      endDate,
    },
    state
  );

  // Get the number of weeks in the month so we can render the proper number of rows.
  let weeksInMonth = getWeeksInMonth(startDate, locale);

  return (
    <table {...gridProps} cellPadding="0" className="flex-1">
      <thead {...headerProps} className="text-gray-600">
        <tr>
          {weekDays.map((day, index) => (
            <th key={index}>{day}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[...new Array(weeksInMonth).keys()].map((weekIndex) => (
          <tr key={weekIndex}>
            {state
              .getDatesInWeek(weekIndex, startDate)
              .map((date: Date, i: number) =>
                date ? (
                  <CalendarCell
                    key={i}
                    state={state}
                    date={date}
                    currentMonth={startDate}
                  />
                ) : (
                  <td key={i} />
                )
              )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function CalendarCell({ state, date, currentMonth }: any) {
  let ref = useRef();
  let { cellProps, buttonProps, isSelected, isDisabled, formattedDate } =
    //@ts-ignore
    useCalendarCell({ date }, state, ref);

  let isOutsideMonth = !isSameMonth(currentMonth, date);

  // The start and end date of the selected range will have
  // an emphasized appearance.
  let isSelectionStart = state.highlightedRange
    ? isSameDay(date, state.highlightedRange.start)
    : isSelected;
  let isSelectionEnd = state.highlightedRange
    ? isSameDay(date, state.highlightedRange.end)
    : isSelected;

  // We add rounded corners on the left for the first day of the month,
  // the first day of each week, and the start date of the selection.
  // We add rounded corners on the right for the last day of the month,
  // the last day of each week, and the end date of the selection.
  let { locale } = useLocale();
  let dayOfWeek = getDayOfWeek(date, locale);
  let isRoundedLeft =
    isSelected && (isSelectionStart || dayOfWeek === 0 || date.day === 1);
  let isRoundedRight =
    isSelected &&
    (isSelectionEnd ||
      dayOfWeek === 6 ||
      date.day === date.calendar.getDaysInMonth(date));

  let { focusProps, isFocusVisible } = useFocusRing();

  return (
    <td
      {...cellProps}
      className={`py-0.5 relative ${isFocusVisible ? "z-10" : "z-0"}`}
    >
      <div
        {...mergeProps(buttonProps, focusProps)}
        //@ts-ignore
        ref={ref}
        hidden={isOutsideMonth}
        className={`w-10 h-10 outline-none group ${
          isRoundedLeft ? "rounded-l-md" : ""
        } ${isRoundedRight ? "rounded-r-md" : ""} ${
          isSelected ? "bg-blue-50 " : ""
        } ${isDisabled ? " text-gray-400 cursor-not-allowed" : ""}`}
      >
        <div
          className={`w-full h-full rounded-md flex items-center justify-center ${
            isDisabled ? "text-gray-400" : ""
          } ${
            // Focus ring, visible while the cell has keyboard focus.
            isFocusVisible
              ? "ring-2 group-focus:z-2 ring-primary ring-offset-2"
              : ""
          } ${
            // Darker selection background for the start and end.
            isSelectionStart || isSelectionEnd
              ? "bg-primary text-white-50 hover:bg-primary  "
              : ""
          } ${
            // Hover state for cells in the middle of the range.
            isSelected && !(isSelectionStart || isSelectionEnd)
              ? "hover:bg-primary text-white-50"
              : ""
          } ${
            // Hover state for non-selected cells.
            !isSelected && !isDisabled
              ? "hover:bg-primary hover:text-white-50"
              : ""
          } cursor-default`}
        >
          {formattedDate}
        </div>
      </div>
    </td>
  );
}

import { useButton } from "react-aria";

function Button(props: any) {
  let ref = props.buttonRef;
  let { buttonProps } = useButton(props, ref);
  return (
    <button {...buttonProps} ref={ref} style={props.style}>
      {props.children}
    </button>
  );
}
