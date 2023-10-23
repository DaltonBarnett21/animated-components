import { useFilter } from "@react-aria/i18n";
import { Item } from "@react-stately/collections";
import { ListProps, ListState, useListState } from "@react-stately/list";
// eslint-disable-next-line import/no-unresolved
import { CollectionChildren, Node } from "@react-types/shared";
import { Key, ReactNode, useMemo } from "react";

export const SELECT_ALL_KEY = "__lingo__select_all";
export const SELECT_ALL_AUTO_MIN_SIZE = 7;

export type SelectAllProps = Omit<ListProps<object>, "onSelectionChange"> & {
  allowSelectAll?: boolean | "auto";
  selectedKeys?: Iterable<Key>;
  defaultSelectedKeys?: Iterable<Key>;
  children: CollectionChildren<object>;
  items?: Iterable<object>;
  searchValue?: string;
  onSelectionChange?: (selection: Set<Key>) => void;
};

// Injects Select all into children and items
function useWithSelectAll(
  { children, items, ...props }: SelectAllProps,
  content: ReactNode
) {
  // Wrap children to inject select all case
  const childrenWithSelectAll = useMemo(() => {
    // New child to inject
    const selectAll = <Item key={SELECT_ALL_KEY}>{content}</Item>;

    // If children is a render-prop we are using items, and need to handle the
    // injected select all item manually to avoid passing it to the render prop
    if (typeof children === "function") {
      return (item: object) =>
        "key" in item && (item as { key?: string }).key === SELECT_ALL_KEY
          ? selectAll
          : children(item);
    }

    if (Array.isArray(children)) {
      return [selectAll, ...children];
    }

    return [selectAll, children];
  }, [children, content]);

  // Wrap items to inject select all case
  const itemsWithSelectAll = useMemo(
    () =>
      items && [
        {
          key: SELECT_ALL_KEY,
        },
        ...items,
      ],
    [items]
  );

  return {
    ...props,
    children: childrenWithSelectAll,
    items: itemsWithSelectAll,
  };
}

// Wrapper around useListState hook that adds filtering and select-all logic
export function useSelectAllState(
  props: SelectAllProps,
  content: ReactNode
): ListState<object> {
  const { contains } = useFilter({ sensitivity: "base" });

  const {
    allowSelectAll = "auto",
    onSelectionChange,
    searchValue,
    ...rest
  } = useWithSelectAll(props, content);

  const filter = useMemo(
    () => (nodes: Iterable<Node<object>>) => {
      const filtered = [];

      for (const node of nodes) {
        if (
          node.key === SELECT_ALL_KEY
            ? allowSelectAll
            : !searchValue || contains(node.textValue, searchValue)
        ) {
          filtered.push(node);
        }
      }

      if (
        allowSelectAll === "auto" &&
        filtered.length < SELECT_ALL_AUTO_MIN_SIZE
      ) {
        return filtered.slice(1);
      }

      // If select-all is the only only node
      if (allowSelectAll === true && filtered.length === 1) {
        return [];
      }

      return filtered;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchValue, allowSelectAll]
  );

  const state = useListState({
    ...rest,
    selectionMode: props.selectionMode,

    onSelectionChange: (keys: Set<Key> | "all") => {
      // This will cause this to trigger another call to onSelectionChange
      if (keys === "all") {
        state.selectionManager.setSelectedKeys([
          ...[...state.collection.getKeys()].filter(
            (k) => k !== SELECT_ALL_KEY && !state.disabledKeys.has(k)
          ),
          ...state.selectionManager.selectedKeys,
        ]);
      } else {
        onSelectionChange?.(new Set(keys));
      }
    },

    filter,
  });

  return state;
}
