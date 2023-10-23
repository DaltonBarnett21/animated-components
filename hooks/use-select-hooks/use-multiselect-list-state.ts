import { ListState, useListState } from "@react-stately/list";
import { CollectionBase, MultipleSelection, Node } from "@react-types/shared";
import { Key } from "react";

export interface MultiSelectListProps<T>
  extends CollectionBase<T>,
    MultipleSelection {
  filter?: any;
}

export interface MultiSelectListState<T> extends ListState<T> {
  /** The keys for the currently selected items. */
  selectedKeys: Set<Key>;

  /** Sets the selected keys. */
  setSelectedKeys(keys: Iterable<Key>): void;

  /** The value of the currently selected items. */
  selectedItems: Node<T>[] | null;

  /** The type of selection. */
  selectionMode: MultipleSelection["selectionMode"];
}

export function useMultiSelectListState<T extends {}>(
  props: MultiSelectListProps<T>
): MultiSelectListState<T> {
  const {
    collection,
    disabledKeys,
    selectionManager,
    selectionManager: { setSelectedKeys, selectedKeys, selectionMode },
  } = useListState({ filter: props.filter, ...props });

  const missingKeys: Key[] = [];

  const selectedItems =
    selectedKeys.size !== 0
      ? Array.from(selectedKeys)
          .map((key) => {
            const item = collection.getItem(key);

            if (!item) {
              missingKeys.push(key);
            }

            return item;
          })
          // Remove undefined values when some keys are not present in the collection
          .filter(Boolean)
      : null;

  if (missingKeys.length) {
    // eslint-disable-next-line no-console
    console.warn(
      `Select: Keys "${missingKeys.join(
        ", "
      )}" passed to "selectedKeys" are not present in the collection.`
    );
  }

  console.log(collection);

  return {
    collection,
    disabledKeys,
    selectionManager,
    selectionMode,
    selectedKeys,
    setSelectedKeys: setSelectedKeys.bind(selectionManager),
    //@ts-ignore
    selectedItems,
  };
}
