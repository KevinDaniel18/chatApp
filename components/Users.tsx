import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  Dimensions,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  ActivityIndicator,
} from "react-native";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { getAllUsers, getLikedUsers, likeUser } from "@/endpoints/endpoint";
import { SafeAreaView } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import AntDesign from "@expo/vector-icons/AntDesign";
import { SearchContext } from "@/hooks/search/searchContext";
import {
  router,
  useFocusEffect,
  useGlobalSearchParams,
  useLocalSearchParams,
} from "expo-router";
import { useUser } from "@/hooks/user/userContext";
import { useSocket } from "@/hooks/store/socketStore";
import ThemeContext from "@/hooks/theme/ThemeContext.";
import { getStyles } from "@/constants/getStyles";

interface UsersProps {
  id: number;
  name: string;
  profilePicture: string;
  likes: number;
}

type ItemProps = {
  id: number;
  name: string;
  profilePicture: string;
  likes: number;
};

export default function Users() {
  const [data, setData] = useState<UsersProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [likedUsers, setLikedUsers] = useState<{ [key: number]: boolean }>({});
  const { userId } = useUser();
  const socket = useSocket();
  const { searchText } = useContext(SearchContext);

  const themeContext = useContext(ThemeContext);
  if (!themeContext) {
    throw new Error("ThemeContext must be used within a ThemeProvider");
  }

  const { theme } = themeContext;
  const dynamicStyles = getStyles(theme);

  function navigateToChat(receiverId: number, userName: string) {
    router.push({
      pathname: "/user/chat",
      params: { receiverId, userName },
    });
  }

  useFocusEffect(
    useCallback(() => {
      if (!userId) return;

      async function fetchUsers() {
        setLoading(true);
        try {
          const res = await getAllUsers();
          setData(res.data);
          console.log("user id obtenido", userId!);

          const likedRes = await getLikedUsers(userId!);
          console.log(likedRes.data);

          const likedUsersIds = likedRes.data;

          const likedUsersState = likedUsersIds.reduce(
            (acc: { [x: string]: boolean }, id: string | number) => {
              acc[id] = true;
              return acc;
            },
            {}
          );

          setLikedUsers(likedUsersState);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      }
      fetchUsers();
    }, [userId])
  );

  async function toggleLike(likedId: number) {
    try {
      await likeUser(userId!, likedId);

      setLikedUsers((prev) => ({
        ...prev,
        [likedId]: !prev[likedId],
      }));

      setData((prevData) =>
        prevData.map((user) => {
          if (user.id === likedId) {
            const isCurrentlyLiked = likedUsers[likedId] ?? false;
            return {
              ...user,
              likes: isCurrentlyLiked ? user.likes - 1 : user.likes + 1,
            };
          }
          return user;
        })
      );

      if (socket) {
        socket.on("likeReceived", (data) => {
          console.log(`¡Tienes un nuevo like de ${data.likerId}!`);
        });
      }
      return () => {
        socket!.off("likeReceived");
      };
    } catch (error) {
      console.error(error);
    }
  }

  const filteredUsers = data.filter(
    (user) =>
      user.name.toLowerCase().includes(searchText.toLowerCase()) &&
      user.id !== userId
  );

  const paddedUsers = [...filteredUsers];
  if (filteredUsers.length % 2 !== 0) {
    paddedUsers.push({ id: -1, name: "", profilePicture: "", likes: 0 });
  }

  const Item = ({ id, name, profilePicture, likes }: ItemProps) => {
    const itemStyle: StyleProp<ViewStyle> =
      filteredUsers.length === 1
        ? {
            ...styles.item,
            flex: undefined,
            width: "70%",
            alignSelf: "center",
            margin: 16,
          }
        : {
            ...styles.item,
            backgroundColor: theme === "dark" ? "black" : "white",
          };

    const imageStyle =
      filteredUsers.length === 1
        ? {
            ...styles.image,
            height: Dimensions.get("window").width / 1.5,
          }
        : styles.image;

    const isLiked = likedUsers[id] ?? false;

    return (
      <View style={itemStyle}>
        <Image
          source={
            profilePicture
              ? { uri: profilePicture }
              : require("@/assets/images/defaultProfile.jpg")
          }
          style={imageStyle}
        />
        <Text
          style={[styles.name, dynamicStyles.changeTextColor]}
          numberOfLines={1}
        >
          {name}
        </Text>
        <View style={styles.icons}>
          <TouchableOpacity onPress={() => navigateToChat(id, name)}>
            <Feather
              name="message-square"
              size={20}
              color={theme === "dark" ? "white" : "black"}
            />
          </TouchableOpacity>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity onPress={() => toggleLike(id)}>
              <AntDesign
                name={isLiked ? "heart" : "hearto"}
                size={20}
                color={
                  theme === "dark"
                    ? isLiked
                      ? "red"
                      : "white"
                    : isLiked
                    ? "red"
                    : "black"
                }
              />
            </TouchableOpacity>
            <Text>{likes}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, dynamicStyles.changeBackgroundColor]}
    >
      {loading ? (
        <ActivityIndicator size="large" style={{ flex: 1, marginTop: 20 }} />
      ) : filteredUsers.length === 0 ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ fontSize: 16, color: "#666" }}>Users not found</Text>
        </View>
      ) : (
        <FlatList
          data={paddedUsers}
          renderItem={({ item }) =>
            item.id === -1 ? (
              <View style={{ flex: 1, margin: 8 }} />
            ) : (
              <Item
                name={item.name}
                profilePicture={item.profilePicture}
                id={item.id}
                likes={item.likes}
              />
            )
          }
          keyExtractor={(item) => item.id.toString()}
          numColumns={filteredUsers.length === 1 ? 1 : 2}
          key={filteredUsers.length === 1 ? "single-column" : "multi-column"}
          contentContainerStyle={styles.list}
          columnWrapperStyle={filteredUsers.length === 1 ? null : styles.row}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  list: {
    padding: 8,
  },
  row: {
    justifyContent: "space-between",
  },
  item: {
    flex: 1,
    margin: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: Dimensions.get("window").width / 2 - 24,
    resizeMode: "cover",
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginVertical: 8,
    color: "#333",
  },
  icons: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
});
