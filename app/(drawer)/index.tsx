import FilterUsersAndPosts from "@/components/FilterUsersAndPosts";
import SearchBar from "@/components/SearchBar";
import { useNavigation } from "expo-router";
import { useLayoutEffect, useState } from "react";
import { Text, View } from "react-native";

export default function Index() {
  const navigation = useNavigation();
  const [showSearchBar, setShowSearchBar] = useState(true);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: showSearchBar
        ? (props: any) => <SearchBar {...props} />
        : undefined,
      headerShown: showSearchBar,
    });
  }, [showSearchBar]);

  return (
    <FilterUsersAndPosts
      onComponentChange={(componentName: string) => {
        setShowSearchBar(componentName === "users");
      }}
    />
  );
}
