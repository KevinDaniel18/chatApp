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
import { getUsersWithPendingMessages } from "@/endpoints/endpoint";
import { useUser } from "@/hooks/user/userContext";
import { router, useFocusEffect } from "expo-router";
import { useTheme } from "@/hooks/theme/ThemeContext.";
import { getStyles } from "@/constants/getStyles";
import BottomConfirmMessage from "./BottomConfirmMessage";
import { useSocket } from "@/hooks/store/socketStore";

export interface User {
  id: number;
  name: string;
  email: string;
  profilePicture: string | null;
  likes: number;
  createdAt: string;
}

export default function PendingMessages() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [firstMsg, setFirstMsg] = useState(null);

  const { userId } = useUser();
  const socket = useSocket();

  const { theme } = useTheme();

  const dynamicStyles = getStyles(theme);

  useFocusEffect(
    useCallback(() => {
      async function fetchCurrentUsersMsg() {
        setLoading(true);
        try {
          const res = await getUsersWithPendingMessages(userId!);
          console.log(JSON.stringify(res.data));
          setFirstMsg(res.data.firstPendingMessage);
          setUsers(res.data.users);
        } catch (error) {
          console.error("error en current", error);
        } finally {
          setLoading(false);
        }
      }

      fetchCurrentUsersMsg();
    }, [userId])
  );

  function openModal(receiverId: number, userName: string) {
    if (firstMsg !== null) {
      setModalVisible(true);
    } else {
      router.push({
        pathname: "/user/chat",
        params: { receiverId, userName },
      });
    }
  }

  const renderItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={[styles.itemContainer, dynamicStyles.changeBackgroundColor]}
      onPress={() => {
        openModal(item.id, item.name);
        setSelectedUser(item);
      }}

      // onPress={() => navigateToChat(item.id, item.name)}
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
        <Text style={[styles.name, dynamicStyles.changeTextColor]}>
          {item.name}
        </Text>
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
    <View style={[styles.container, dynamicStyles.changeBackgroundColor]}>
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="green" />
        </View>
      ) : users.length === 0 ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={[dynamicStyles.changeTextColor, { color: "gray" }]}>
            No pending messages.
          </Text>
        </View>
      ) : (
        <FlatList
          data={users}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      )}
      <BottomConfirmMessage
        modalVisible={modalVisible || false}
        setModalVisible={() => setModalVisible(false)}
        selectedUser={selectedUser}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
