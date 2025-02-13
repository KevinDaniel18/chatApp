import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React from "react";
import { useTheme } from "@/hooks/theme/ThemeContext.";
import { getStyles } from "@/constants/getStyles";

export default function LoadingScreen() {
  const { theme } = useTheme();
  const dynamicTheme = getStyles(theme);
  return (
    <View style={[styles.container, dynamicTheme.changeBackgroundColor]}>
      <StatusBar translucent backgroundColor="transparent" />
      <ActivityIndicator
        size="large"
        color={theme === "dark" ? "#fff" : "#000"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
