import { useSelectAllOption } from "@/hooks/use-select-hooks/use-select-all-option";
import { SELECT_ALL_KEY } from "@/hooks/use-select-hooks/use-select-all-state";
import { OptionAria, useListBox, useOption } from "@react-aria/listbox";
import { ListState } from "@react-stately/list";
import { Check } from "lucide-react";
// eslint-disable-next-line import/no-unresolved
import { FocusStrategy, Node } from "@react-types/shared";
import { Key, ReactNode, RefObject, useRef } from "react";
import Checkbox from "../checkbox";
import { motion } from "framer-motion";
import { ANIMATIONS } from "@/utils";

export interface ListBoxProps {
  listBoxRef?: RefObject<HTMLUListElement>;
  state: ListState<object>;
  selectionMode?: "multiple" | "none" | "single";
  defaultSelectedKeys?: Iterable<Key>;
  autoFocus?: FocusStrategy | boolean;
  shouldFocusOnHover?: boolean;
  shouldUseVirtualFocus?: boolean;
  disallowEmptySelection?: boolean;
}

export interface ListBoxOptionProps {
  state: ListState<object>;
  item: Node<object>;
}

export interface CreateListBoxOptions {
  renderOption?: (
    item: Node<object>,
    option: OptionAria,
    state: ListState<object>
  ) => ReactNode;
}

export function createListBox({
  renderOption = (item) => item.rendered,
}: CreateListBoxOptions) {
  const Option = (props: ListBoxOptionProps) => {
    const { item, state } = props;
    const ref = useRef() as RefObject<HTMLLIElement>;
    const option = useOption({ key: item.key }, state, ref);

    const isFocused = state.selectionManager.focusedKey === item.key;

    return (
      <li
        className={` ${isFocused && " bg-gray-300"} `}
        {...option.optionProps}
        ref={ref}
      >
        {state.selectionManager.selectionMode === "multiple" && (
          <Checkbox checked={option.isSelected}>
            <Checkbox.CheckBoxIndicator />
            <Checkbox.CheckboxLabel>{item.rendered}</Checkbox.CheckboxLabel>
          </Checkbox>
        )}

        {item.key !== SELECT_ALL_KEY && (
          <div
            className={`flex p-1 items-center justify-between  ${
              option.isDisabled
                ? "hover:bg-white-50"
                : "hover:bg-blue-interaction-100"
            } transition-all cursor-pointer  `}
          >
            {typeof item.rendered === "string" &&
              state.selectionManager.selectionMode === "single" && (
                <span
                  className={`${
                    option.isDisabled && "text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {item.rendered}
                </span>
              )}
            {state.selectionManager.selectionMode === "single" ? (
              <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="3.5"
                stroke="currentColor"
                className="h-4 w-4"
                initial={false}
                animate={
                  //@ts-ignore
                  option.isSelected ? "checked" : "unchecked"
                }
              >
                <motion.path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                  variants={ANIMATIONS.tick}
                />
              </motion.svg>
            ) : null}
          </div>
        )}
      </li>
    );
  };

  const SelectAllOption = (props: ListBoxOptionProps) => {
    const { item, state } = props;
    const ref = useRef() as RefObject<HTMLLIElement>;
    const option = useSelectAllOption({ key: item.key }, state, ref);
    const isFocused = state.selectionManager.focusedKey === item.key;

    return (
      <li
        className={`pb-2 mb-2  border-b border-gray-400 ${
          isFocused && " bg-gray-300"
        }`}
        {...option.optionProps}
        ref={ref}
      >
        <Checkbox checked={option.isSelected}>
          <Checkbox.CheckBoxIndicator />
          <Checkbox.CheckboxLabel>{item.rendered}</Checkbox.CheckboxLabel>
        </Checkbox>
      </li>
    );
  };

  const ListBox = (props: ListBoxProps) => {
    const ref = useRef() as RefObject<HTMLUListElement>;
    const { listBoxRef = ref, state, ...rest } = props;
    const { listBoxProps } = useListBox(
      {
        disallowEmptySelection: true,
        shouldFocusOnHover: true,
        ...rest,
      },
      state,
      listBoxRef
    );

    return (
      <ul className="p-3 space-y-1" ref={listBoxRef} {...listBoxProps}>
        {[...state.collection].map((item) =>
          item.key === SELECT_ALL_KEY &&
          state.selectionManager.selectionMode === "multiple" ? (
            <SelectAllOption key={item.key} item={item} state={state} />
          ) : (
            <Option key={item.key} item={item} state={state} />
          )
        )}
      </ul>
    );
  };

  return ListBox;
}
