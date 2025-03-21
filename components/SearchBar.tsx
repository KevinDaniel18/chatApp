import {
  BackHandler,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { SearchContext } from "@/hooks/search/searchContext";
import { useTheme } from "@/hooks/theme/ThemeContext.";
import { getStyles } from "@/constants/getStyles";

export default function SearchBar({ navigation, options }: any) {
  const { searchText, setSearchText, showSearch, setShowSearch } =
    useContext(SearchContext);

  const { theme } = useTheme();
  const dynamicStyles = getStyles(theme);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (showSearch) {
          setShowSearch(false);
          setSearchText("");
          return true;
        }
        return false;
      }
    );

    return () => backHandler.remove();
  }, [showSearch]);

  return (
    <View style={[styles.container, dynamicStyles.changeBackgroundColor]}>
      <View style={styles.content}>
        {!showSearch ? (
          <>
            <Pressable onPress={navigation.toggleDrawer}>
              <Ionicons
                name="menu"
                size={24}
                color={theme === "dark" ? "white" : "black"}
              />
            </Pressable>
            <Text style={[styles.title, dynamicStyles.changeTextColor]}>
              {options.title}
            </Text>
            <Pressable
              onPress={() => setShowSearch(true)}
              style={styles.searchIcon}
            >
              <AntDesign
                name="search1"
                size={24}
                color={theme === "dark" ? "white" : "black"}
              />
            </Pressable>
          </>
        ) : (
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              value={searchText}
              onChangeText={(text) => setSearchText(text)}
              autoFocus
              autoCorrect={false}
              textContentType="none"
            />
            <Pressable
              onPress={() => {
                setShowSearch(false);
                setSearchText("");
              }}
            >
              <AntDesign
                name="close"
                size={24}
                color={theme === "dark" ? "white" : "black"}
              />
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "white",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    height: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 16,
  },
  searchIcon: {
    marginLeft: "auto",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 12,
    marginRight: 8,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    fontSize: 16,
    height: 40,
  },
});
