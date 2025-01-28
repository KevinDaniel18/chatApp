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
import { router, useFocusEffect } from "expo-router";
import { useTheme } from "@/hooks/theme/ThemeContext.";
import { getStyles } from "@/constants/getStyles";
import useFileStore from "@/hooks/store/fileStore";
import * as SecureStore from "expo-secure-store";

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
  const { getFilesForUser, setFilesForUser } = useFileStore();
  const { userId } = useUser();

  const { theme } = useTheme();

  const dynamicStyles = getStyles(theme);

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
    async function loadFiles() {
      for (const user of users) {
        const storedFiles = await SecureStore.getItemAsync(
          `chat-files-${user.id}`
        );
        if (storedFiles) {
          const parsedFiles = JSON.parse(storedFiles);
          setFilesForUser(user.id.toString(), parsedFiles);
        }
      }
    }
  
    if (users.length > 0) {
      loadFiles();
    }
  }, [users, setFilesForUser]);
  

  const renderItem = ({ item }: { item: User }) => {
    const pendingFiles = getFilesForUser(item.id.toString());
    
    const hasFilesPending = pendingFiles.length > 0;
    return (
      <TouchableOpacity
        style={[styles.itemContainer, dynamicStyles.changeBackgroundColor]}
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
          <Text style={[styles.name, dynamicStyles.changeTextColor]}>
            {item.name}
          </Text>
          <Text style={styles.email}>{item.email}</Text>
          {hasFilesPending && (
            <Text style={{ color: "#40b034", fontWeight: "700" }}>
              {pendingFiles.length === 1
                ? `${pendingFiles.length} file pending to send`
                : `${pendingFiles.length} pending files to send`}
            </Text>
          )}
        </View>
        <View style={styles.stats}>
          <Text style={styles.likes}>{item.likes} likes</Text>
          <Text style={styles.date}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

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
            No sent messages.
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
