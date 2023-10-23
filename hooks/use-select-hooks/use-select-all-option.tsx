import { focusSafely } from "@react-aria/focus";
import {
  isFocusVisible,
  PressProps,
  useHover,
  usePress,
} from "@react-aria/interactions";
import { getItemId, listData, OptionAria } from "@react-aria/listbox";
import {
  SelectableItemAria,
  SelectableItemOptions,
} from "@react-aria/selection";
import { isMac, isWebKit, mergeProps, useSlotId } from "@react-aria/utils";
import { getItemCount } from "@react-stately/collections";
import { ListState } from "@react-stately/list";
// eslint-disable-next-line import/no-unresolved
import { PressEvent } from "@react-types/shared";
import { HTMLAttributes, Key, RefObject, useEffect } from "react";
import { SELECT_ALL_KEY } from "./use-select-all-state";

interface SelectAllOptionProps {
  key: Key;
  "aria-label"?: string;
}

export function allSelected<T>(state: ListState<T>) {
  return [...state.collection.getKeys()].every(
    (k) =>
      k === SELECT_ALL_KEY ||
      state.selectionManager.isSelected(k) ||
      state.disabledKeys.has(k)
  );
}

export function toggleSelectAll<T>(state: ListState<T>) {
  const isSelected = allSelected(state);

  const currentCollection = new Set(state.collection.getKeys());
  if (isSelected) {
    const newSelection = [...state.selectionManager.selectedKeys].filter(
      (k) =>
        (k !== SELECT_ALL_KEY && !currentCollection.has(k)) ||
        state.disabledKeys.has(k)
    );
    state.selectionManager.setSelectedKeys(newSelection);
  } else {
    state.selectionManager.selectAll();
  }
}

// TODO: Find a better solution upstream: https://github.com/adobe/react-spectrum/issues/2663
// Modified version of github.com/adobe/react-spectrum/blob/main/packages/@react-aria/listbox/src/useOption.ts
export function useSelectAllOption<T>(
  props: SelectAllOptionProps,
  state: ListState<T>,
  ref: RefObject<HTMLElement>
): OptionAria {
  const { key } = props;

  const data = listData.get(state)!;

  const isDisabled = state.disabledKeys.has(key);
  const isFocused = state.selectionManager.focusedKey === key;
  const isSelected = allSelected(state);

  const { shouldFocusOnHover, shouldUseVirtualFocus, isVirtualized } = data;

  const labelId = useSlotId();
  const descriptionId = useSlotId();

  const optionProps: HTMLAttributes<HTMLElement> = {
    role: "option",
    "aria-disabled": isDisabled,
    "aria-selected":
      state.selectionManager.selectionMode !== "none" ? isSelected : undefined,
  };

  // Safari with VoiceOver on macOS misreads options with aria-labelledby or aria-label as simply "text".
  // We should not map slots to the label and description on Safari and instead just have VoiceOver read the textContent.
  // https://bugs.webkit.org/show_bug.cgi?id=209279
  if (!(isMac() && isWebKit())) {
    optionProps["aria-label"] = props["aria-label"];
    optionProps["aria-labelledby"] = labelId;
    optionProps["aria-describedby"] = descriptionId;
  }

  if (isVirtualized) {
    optionProps["aria-posinset"] = state.collection.getItem(key)!.index! + 1;
    optionProps["aria-setsize"] = getItemCount(state.collection);
  }

  const { itemProps, isPressed } = useSelectAllItem(
    {
      selectionManager: state.selectionManager,
      key,
      ref,
      isVirtualized,
      shouldUseVirtualFocus,
      isDisabled,
    },
    state
  );

  const { hoverProps } = useHover({
    isDisabled: isDisabled || !shouldFocusOnHover,
    onHoverStart() {
      if (!isFocusVisible()) {
        state.selectionManager.setFocused(true);
        state.selectionManager.setFocusedKey(key);
      }
    },
  });
  //@ts-ignore
  return {
    optionProps: {
      ...optionProps,
      ...mergeProps(itemProps, hoverProps),
      id: getItemId(state, key),
    },
    labelProps: {
      id: labelId,
    },
    descriptionProps: {
      id: descriptionId,
    },
    isFocused,
    isSelected,
    isDisabled,
    isPressed,
  };
}

// Modified version of https://github.com/adobe/react-spectrum/blob/main/packages/@react-aria/selection/src/useSelectableItem.ts
export function useSelectAllItem<T>(
  options: SelectableItemOptions,
  state: ListState<T>
): SelectableItemAria {
  const {
    selectionManager: manager,
    key,
    ref,
    isVirtualized,
    shouldUseVirtualFocus,
    isDisabled,
  } = options;

  const onSelect = (e: PointerEvent | PressEvent) => {
    toggleSelectAll(state);
  };

  // Focus the associated DOM node when this item becomes the focusedKey
  const isFocused = key === manager.focusedKey;
  useEffect(() => {
    if (
      isFocused &&
      manager.isFocused &&
      !shouldUseVirtualFocus &&
      document.activeElement !== ref.current
    ) {
      focusSafely(ref.current!);
    }
  }, [
    ref,
    isFocused,
    manager.focusedKey,
    manager.childFocusStrategy,
    manager.isFocused,
    shouldUseVirtualFocus,
  ]);

  // Set tabIndex to 0 if the element is focused, or -1 otherwise so that only the last focused
  // item is tabbable.  If using virtual focus, don't set a tabIndex at all so that VoiceOver
  // on iOS 14 doesn't try to move real DOM focus to the item anyway.
  let itemProps: SelectableItemAria["itemProps"] & { "data-key"?: Key } = {};
  if (!shouldUseVirtualFocus) {
    itemProps = {
      tabIndex: isFocused ? 0 : -1,
      onFocus(e) {
        if (e.target === ref.current) {
          manager.setFocusedKey(key);
        }
      },
    };
  }

  const allowsSelection = !isDisabled && manager.canSelectItem(key);

  const itemPressProps: PressProps = {
    // On touch, it feels strange to select on touch down, so we special case this.
    onPressStart: (e) => {
      if (e.pointerType !== "touch" && e.pointerType !== "virtual") {
        onSelect(e);
      }
    },
    onPress: (e) => {
      if (e.pointerType === "touch" || e.pointerType === "virtual") {
        onSelect(e);
      }
    },
  };

  if (!isVirtualized) {
    itemProps["data-key"] = key;
  }

  itemPressProps.preventFocusOnPress = shouldUseVirtualFocus;
  const { pressProps, isPressed } = usePress(itemPressProps);
  //@ts-ignore
  return {
    itemProps: mergeProps(itemProps, allowsSelection ? pressProps : {}),
    isPressed,
  };
}
