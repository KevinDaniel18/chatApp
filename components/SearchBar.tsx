import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import React, { useContext, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { SearchContext } from "@/hooks/search/searchContext";

export default function SearchBar({ navigation, route, options }: any) {
  const [showSearch, setShowSearch] = useState(false);
  const {searchText, setSearchText} = useContext(SearchContext)

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {!showSearch ? (
          <>
            <Pressable onPress={navigation.toggleDrawer}>
              <Ionicons name="menu" size={24} color="black" />
            </Pressable>
            <Text style={styles.title}>{options.title}</Text>
            <Pressable
              onPress={() => setShowSearch(true)}
              style={styles.searchIcon}
            >
              <AntDesign name="search1" size={24} color="black" />
            </Pressable>
          </>
        ) : (
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              value={searchText}
              onChangeText={(text)=>setSearchText(text)}
              autoFocus
            />
            <Pressable
              onPress={() => {
                setShowSearch(false);
                setSearchText("");
              }}
            >
              <AntDesign name="close" size={24} color="black" />
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
    paddingVertical: 8,
    backgroundColor: "white",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
});