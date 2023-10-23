import {
  ChangeEventHandler,
  useState,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import debounce from "lodash/debounce";
import { useFilter } from "react-aria";
import { Node, Selection } from "@react-types/shared";

type Props = { initialSearch: string | null };
const useSearch = ({ initialSearch }: Props) => {
  const [search, setSearch] = useState(initialSearch);
  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setSearch(event.target.value);
  };
  const onSearch = useMemo(() => {
    return debounce(handleChange, 300);
  }, []);

  // Cancel search on unmount
  useEffect(() => () => onSearch.cancel(), [onSearch]);

  const { contains } = useFilter({ sensitivity: "base" });

  return { search, setSearch, onSearch };
};

export default useSearch;
