import React, { ReactNode, createContext, useState, useEffect } from "react";
import { Appearance } from "react-native";
import * as SecureStore from "expo-secure-store";

interface ThemeContextProps {
  theme: string;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

interface UserProvider {
  children: ReactNode;
}

export const ThemeProvider: React.FC<UserProvider> = ({ children }) => {
  const [theme, setTheme] = useState<string>("light");

  useEffect(() => {
    const loadTheme = async () => {
      const storedTheme = await SecureStore.getItemAsync("theme");
      if (storedTheme) {
        setTheme(storedTheme);
      } else {
        setTheme(Appearance.getColorScheme() || "light");
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    await SecureStore.setItemAsync("theme", newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
