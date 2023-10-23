import { useButton } from "@react-aria/button";
import { useMenuTrigger } from "@react-aria/menu";
import {
  ListKeyboardDelegate,
  useSelectableCollection,
} from "@react-aria/selection";
import { useMenuTriggerState } from "@react-stately/menu";
import {
  ChangeEventHandler,
  Key,
  KeyboardEventHandler,
  RefObject,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CollectionChildren } from "@react-types/shared";
import { createListBox } from "./listbox/listbox";
import {
  SELECT_ALL_KEY,
  useSelectAllState,
} from "@/hooks/use-select-hooks/use-select-all-state";
import { toggleSelectAll } from "@/hooks/use-select-hooks/use-select-all-option";
import { FocusScope } from "@react-aria/focus";
import { DismissButton, useOverlay } from "@react-aria/overlays";
import { MenuTriggerState } from "@react-stately/menu";
import { forwardRef, ReactNode, useImperativeHandle } from "react";
import { DateRangePickerState } from "react-stately";
import { Item } from "react-stately";
import { inputVariants } from "./input-base";
import DownArrow from "./icons/down-arrow";
import { VariantProps } from "class-variance-authority";
import { AnimatePresence, motion } from "framer-motion";
import { ANIMATIONS } from "@/utils";
import InputBase from "./input-base";

export interface SearchableSelectProps
  extends VariantProps<typeof inputVariants> {
  children: CollectionChildren<object>;
  defaultOpen?: boolean;
  defaultSelectedKeys?: Iterable<Key>;
  disabledKeys?: Iterable<Key>;
  error?: boolean;
  readonly?: boolean;
  disabled?: boolean;
  items?: Iterable<object>;
  onSelectionChange?: (keys: Set<Key>) => unknown;
  placeholder?: string;
  selectedKeys?: Iterable<Key>;
  allowSelectAll?: boolean | "auto";
  mode: "single" | "multiple";
  searchPlaceholder?: string;
  options: Option[];
  label?: string;
  description?: string;
}

const ListBox = createListBox({
  renderOption: (item, { isSelected, isDisabled }, state) => (
    // Prevent checkbox from stealing focus
    <div>
      <input
        type="checkbox"
        aria-hidden
        readOnly
        disabled={isDisabled}
        checked={isSelected}
      ></input>
      <div>{item.rendered}</div>
      {item.key === SELECT_ALL_KEY && <hr />}
    </div>
  ),
});

const SearchableSelect = (props: SearchableSelectProps) => {
  const [searchValue, setSearchValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef() as RefObject<HTMLDivElement>;
  const buttonRef = useRef() as RefObject<HTMLButtonElement>;
  const resetButtonRef = useRef() as RefObject<HTMLButtonElement>;
  const inputRef = useRef() as RefObject<HTMLInputElement>;
  const overlayRef = useRef() as RefObject<HTMLDivElement>;
  const listBoxRef = useRef() as RefObject<HTMLUListElement>;
  const {
    readonly,
    disabled,
    placeholder,
    searchPlaceholder,
    label,
    description,
  } = props;

  const triggerState = useMenuTriggerState({
    ...props,
    onOpenChange(isOpen) {
      if (isOpen) {
        setSearchValue("");
      }
    },
  });
  const state = useSelectAllState(
    {
      ...props,
      searchValue: triggerState.isOpen ? searchValue : "",
      selectionMode: props.mode,
    },
    props.mode === "multiple" && "Select all"
  );

  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const triggerDisabled = disabled || readonly;
  const { menuTriggerProps, menuProps } = useMenuTrigger(
    {
      type: "listbox",
      isDisabled: triggerDisabled,
    },
    triggerState,
    buttonRef
  );

  // Handles keyboard navigation over filtered set
  const delegate = useMemo(
    () =>
      new ListKeyboardDelegate(
        state.collection,
        state.disabledKeys,
        listBoxRef
      ),
    [state.collection, state.disabledKeys, listBoxRef]
  );

  const { collectionProps } = useSelectableCollection({
    selectionManager: state.selectionManager,
    keyboardDelegate: delegate,
    disallowTypeAhead: true,
    disallowEmptySelection: true,
    ref: inputRef,
  });

  const handleSearchChange: ChangeEventHandler<HTMLInputElement> = (ev) => {
    setSearchValue(ev.currentTarget.value);
  };

  const handleKeyDown: KeyboardEventHandler<
    HTMLButtonElement & HTMLInputElement
    // eslint-disable-next-line complexity
  > = (e) => {
    if (triggerDisabled) {
      return;
    }

    if (!triggerState.isOpen) {
      switch (e.key) {
        case "ArrowDown":
          triggerState.open("first");
          break;
        case "ArrowUp":
          triggerState.open("last");
          break;
        case "Enter":
        case " ":
          triggerState.open("first");
          break;
        default:
          break;
      }
    } else {
      switch (e.key) {
        case "Tab":
        case "Escape":
          triggerState.close();
          break;
        case "Enter":
          // Prevent form submission if menu is open since we may be selecting an option
          e.preventDefault();

          if (state.selectionManager.focusedKey === SELECT_ALL_KEY) {
            toggleSelectAll(state);
          } else if (state.selectionManager.focusedKey) {
            state.selectionManager.select(state.selectionManager.focusedKey);
          }
          break;
        default:
          break;
      }
    }

    collectionProps.onKeyDown?.(e);
  };

  const { buttonProps } = useButton(
    {
      ...menuTriggerProps,
      isDisabled: triggerDisabled,
    },
    buttonRef as RefObject<HTMLElement>
  );

  const { buttonProps: resetProps } = useButton(
    {
      // TODO: i18n and make this customizable
      "aria-label": "Clear search",
      isDisabled: triggerDisabled,
      onPress: () => {
        setSearchValue("");
        inputRef.current?.focus();
      },
    },
    resetButtonRef
  ) as {
    buttonProps: {};
  };

  const selectedItems = [...state.selectionManager.selectedKeys]
    .map((key) => state.collection.getItem(key))
    .filter(Boolean);

  const selectedText =
    props.options.length === selectedItems.length
      ? "All"
      : `${selectedItems.map((item) => item?.textValue)}`;

  return (
    <motion.div
      initial={false}
      animate={triggerState.isOpen ? "open" : "closed"}
      className=" relative"
    >
      <div ref={containerRef}>
        <InputBase
          {...props}
          isFocused={isFocused}
          isMenuOpen={triggerState.isOpen}
          disabled={disabled}
          readonly={readonly}
          label={label}
        >
          <input
            className=" outline-none w-full bg-transparent"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            ref={inputRef}
            disabled={triggerDisabled}
            placeholder={triggerState.isOpen ? searchPlaceholder : placeholder}
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            readOnly={readonly || !triggerState.isOpen}
            type="text"
            value={triggerState.isOpen ? searchValue : selectedText}
            onInput={handleSearchChange}
            onKeyDown={handleKeyDown}
          />
          {triggerState.isOpen && searchValue ? (
            <button
              ref={resetButtonRef}
              {...resetProps}
              tabIndex={-1}
              type="button"
            >
              'x'
            </button>
          ) : (
            <button
              type="button"
              {...buttonProps}
              ref={buttonRef}
              disabled={triggerDisabled}
              tabIndex={-1}
              className="outline-none"
            >
              <motion.div
                variants={{
                  open: ANIMATIONS.rotate.open,
                  closed: ANIMATIONS.rotate.closed,
                }}
                transition={{ duration: ANIMATIONS.rotate.duration }}
                aria-hidden="true"
              >
                {disabled || readonly ? (
                  <DownArrow className={" fill-coolGray-500"} />
                ) : (
                  <DownArrow />
                )}
              </motion.div>
            </button>
          )}
        </InputBase>
      </div>
      <span className=" text-coolGray-500">{props.description}</span>
      <AnimatePresence>
        {triggerState.isOpen && (
          <Popover
            ref={overlayRef}
            shouldCloseOnInteractOutside={(el) =>
              !containerRef.current?.contains(el)
            }
            state={triggerState}
          >
            {state.collection.size > 0 && (
              <ListBox
                {...menuProps}
                shouldUseVirtualFocus
                listBoxRef={listBoxRef}
                state={state}
              />
            )}
            {state.collection.size === 0 && <div>{"No items found"}</div>}
          </Popover>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

interface PopoverProps {
  state: MenuTriggerState | DateRangePickerState;
  children?: ReactNode;
  portal?: boolean;
  shouldCloseOnInteractOutside?: (element: HTMLElement) => boolean;
}

const Popover = forwardRef<HTMLDivElement, PopoverProps>(
  (props: PopoverProps, ref) => {
    const overlayRef = useRef() as RefObject<HTMLDivElement>;
    useImperativeHandle(ref, () => overlayRef.current!);

    const { state, children, shouldCloseOnInteractOutside, ...otherProps } =
      props;

    const { overlayProps } = useOverlay(
      {
        isOpen: state.isOpen,
        onClose: state.close,
        shouldCloseOnBlur: true,
        isDismissable: true,
        //@ts-ignore
        shouldCloseOnInteractOutside,
      },
      overlayRef
    );

    if (!state.isOpen) {
      return null;
    }

    return (
      <FocusScope restoreFocus>
        <motion.div
          className=" border border-coolGray-400 z-50 absolute w-[100%] top-[4.3rem]  rounded-md bg-white"
          initial={ANIMATIONS.scaleSpringOpacity.exit}
          animate={ANIMATIONS.scaleSpringOpacity.enter}
          exit={ANIMATIONS.scaleSpringOpacity.exit}
        >
          <div ref={overlayRef} {...otherProps} {...overlayProps}>
            {children}
          </div>

          <DismissButton onDismiss={() => void state.close()} />
        </motion.div>
      </FocusScope>
    );
  }
);

interface Option {
  key: string | number;
  label: string;
}

interface SelectProps extends Omit<SearchableSelectProps, "children"> {}

export const Select = (props: SelectProps) => {
  return (
    <SearchableSelect {...props}>
      {props.options.map((option: Option) => (
        <Item key={option.key}>{option.label}</Item>
      ))}
    </SearchableSelect>
  );
};
