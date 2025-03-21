import { createContext, useState, ReactNode } from "react";

export const SearchContext = createContext({
  showSearch: false,
  setShowSearch: (value: boolean) => {},
  searchText: "",
  setSearchText: (text: string) => {},
});

export const SearchProvider = ({ children }: { children: ReactNode }) => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState("");

  return (
    <SearchContext.Provider
      value={{ searchText, setSearchText, showSearch, setShowSearch }}
    >
      {children}
    </SearchContext.Provider>
  );
};
