import { createContext, useState, ReactNode } from "react";

export const SearchContext = createContext({
  searchText: "",
  setSearchText: (text: string) => {},
});

export const SearchProvider = ({ children }: { children: ReactNode }) => {
  const [searchText, setSearchText] = useState("");

  return (
    <SearchContext.Provider value={{ searchText, setSearchText }}>
      {children}
    </SearchContext.Provider>
  );
};
