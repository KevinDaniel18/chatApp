import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { getUsersSentMessages } from "@/endpoints/endpoint";
import { useUser } from "@/hooks/user/userContext";
import { router, useFocusEffect, useNavigation } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DrawerActions } from "@react-navigation/native";

interface User {
  id: number;
  name: string;
  email: string;
  profilePicture: string | null;
  likes: number;
  createdAt: string;
}

export default function CurrentUsersMsg() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const { userId } = useUser();
  const nav = useNavigation();

  function onToggle() {
    nav.dispatch(DrawerActions.openDrawer());
  }

  function navigateToChat(receiverId: number, userName: string) {
    router.push({
      pathname: "/user/chat",
      params: { receiverId, userName },
    });
  }

  useFocusEffect(
    useCallback(() => {
      async function fetchCurrentUsersMsg() {
        setLoading(true);
        try {
          const res = await getUsersSentMessages(userId!);
          setUsers(res.data);
        } catch (error) {
          console.error("error en current", error);
        } finally {
          setLoading(false);
        }
      }
      fetchCurrentUsersMsg();
    }, [userId])
  );

  useEffect(() => {
    return () => {
      router.replace("/");
    };
  }, []);

  const renderItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => navigateToChat(item.id, item.name)}
    >
      <Image
        source={
          item.profilePicture
            ? { uri: item.profilePicture }
            : require("@/assets/images/defaultProfile.jpg")
        }
        style={styles.avatar}
      />
      <View style={styles.userInfo}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.email}>{item.email}</Text>
      </View>
      <View style={styles.stats}>
        <Text style={styles.likes}>{item.likes} likes</Text>
        <Text style={styles.date}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()}>
            <AntDesign name="arrowleft" size={28} color="black" />
          </TouchableOpacity>
          <Text style={styles.text}>Messages</Text>
        </View>
        <TouchableOpacity onPress={onToggle}>
          <FontAwesome name="bars" size={24} color="black" />
        </TouchableOpacity>
      </View>
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="green" />
        </View>
      ) : (
        <FlatList
          data={users}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginHorizontal: 20,
    justifyContent: "space-between",
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
    backgroundColor: "#ffffff",
    marginLeft: 15,
  },
  listContent: {
    paddingBottom: 16,
  },
  itemContainer: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
  },
  email: {
    fontSize: 14,
    color: "#666",
  },
  stats: {
    alignItems: "flex-end",
  },
  likes: {
    fontSize: 12,
    color: "#666",
  },
  date: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
});
