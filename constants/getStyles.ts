import { StyleSheet } from "react-native";

export const getStyles = (theme: string) => {
  return StyleSheet.create({
    changeBackgroundColor: {
      backgroundColor: theme === "light" ? "#ffffff" : "#1a1a1a",
    },
    changeTextColor: {
      color: theme === "light" ? "#000000" : "#ffffff",
    },
  });
};
