import { useEffect, useMemo, useState } from "react";
import sortBy from "lodash/sortBy";

import { KeyboardArrowHorizontalDirection } from "./use-keyboard-events";

function findTag(
  currentTag: any,
  tags: any[],
  direction: KeyboardArrowHorizontalDirection
): any | null {
  const index = tags.findIndex((tag) => tag.value === currentTag.value);
  return tags[direction === "left" ? index - 1 : index + 1];
}

type Props = {
  search: string | null;
  selectedItems: any[];
  options: any[];
};
const useTags = ({ search, options, selectedItems }: Props) => {
  const tags = useMemo<any[]>(() => {
    return sortBy(
      options.filter((o) =>
        selectedItems.includes(o.name as unknown as string)
      ),
      (o) => selectedItems.indexOf(o.name as unknown as string)
    );
  }, [options, selectedItems]);

  const [focusTag, setFocusTag] = useState<any | null>(null);
  const setFocusOnLast = () => setFocusTag(tags[tags.length - 1]);
  const handleTextRemoval = (
    text: string,
    removeCallback: (tag: any) => void
  ) => {
    if (text.length > 0) return;

    if (!focusTag) {
      setFocusOnLast();
    } else {
      removeCallback(tags[tags.length - 1]);
      setFocusTag(null);
    }
  };

  const onArrowMove = (
    text: string,
    direction: KeyboardArrowHorizontalDirection
  ) => {
    if (text.length > 0) return;
    if (!focusTag && direction === "right") return;
    if (!focusTag) return setFocusOnLast();

    const tag = findTag(focusTag, tags, direction);

    if (!tag) return;

    setFocusTag(tag);
  };

  useEffect(() => {
    if (search) return;

    setFocusTag(null);
  }, [search, setFocusTag]);

  return {
    tags,
    focusTag,
    setFocusTag,
    handleTextRemoval,
    onArrowMove,
  };
};

export default useTags;
