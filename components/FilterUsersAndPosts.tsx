import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import { useTheme } from "@/hooks/theme/ThemeContext.";
import { getStyles } from "@/constants/getStyles";
import Users from "./user/Users";
import Feeds from "./media/Feeds";

type Props = {
  onComponentChange?: (componentName: "users" | "feeds") => void;
};

export default function FilterUsersAndPosts({ onComponentChange }: Props) {
  const [filterComponent, setFilterComponent] = useState<"users" | "feeds">(
    "users"
  );

  const { theme } = useTheme();
  const dynamicStyles = getStyles(theme);

  function handleTabChange(tab: "users" | "feeds") {
    setFilterComponent(tab);
    onComponentChange?.(tab);
  }

  function renderComponents() {
    return <>{filterComponent === "users" ? <Users /> : <Feeds />}</>;
  }
  function tabStyles(tabName: string) {
    const isActive = filterComponent === tabName;
    if (isActive && theme === "dark") return styles.tabDark;
    if (isActive && theme === "light") return styles.tabLigh;
    return styles.inactiveTab;
  }

  return (
    <View style={[styles.container, dynamicStyles.changeBackgroundColor]}>
      <View style={styles.contentContainer}>{renderComponents()}</View>

      <View style={[styles.tabContainer, dynamicStyles.changeBackgroundColor]}>
        <TouchableOpacity
          style={tabStyles("users")}
          onPress={() => handleTabChange("users")}
        >
          <Text style={dynamicStyles.changeTextColor}>Users</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={tabStyles("feeds")}
          onPress={() => handleTabChange("feeds")}
        >
          <Text style={dynamicStyles.changeTextColor}>Feeds</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  contentContainer: {
    flex: 1,
    paddingBottom: 60, // para que no se solape con los tabs
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  tabDark: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: "#0e8008",
  },
  tabLigh: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: "#E8F5E9",
  },
  inactiveTab: {
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "green",
  },
});
