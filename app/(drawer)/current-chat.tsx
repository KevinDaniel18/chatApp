import React, { useCallback, useEffect, useState } from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { router, useFocusEffect } from "expo-router";
import CurrentUsersMsg from "@/components/chat/CurrentUsersMsg";
import PendingMessages from "@/components/chat/PendingMessages";
import { getStyles } from "@/constants/getStyles";
import { useTheme } from "@/hooks/theme/ThemeContext.";
import { useSocket } from "@/hooks/store/socketStore";
import { useUser } from "@/hooks/user/userContext";

export default function CurrentChat() {
  const nav = useNavigation();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("current");
  const [pendingCount, setPendingCount] = useState(0);
  const { userId } = useUser();

  const dynamicStyles = getStyles(theme);
  const socket = useSocket();

  function onToggle() {
    nav.dispatch(DrawerActions.openDrawer());
  }

  useFocusEffect(
    useCallback(() => {
      if (socket) {
        socket.emit("joinUser", { userId });

        socket.on("pendingMessages", ({ count }) => {
          console.log("count", count);
          
          setPendingCount(count);
        });
      }
      return () => {
        if (socket) {
          socket.off("pendingMessages");
        }
      };
    }, [socket])
  );

  return (
    <View style={[styles.container, dynamicStyles.changeBackgroundColor]}>
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()}>
            <AntDesign
              name="arrowleft"
              size={28}
              color={theme === "dark" ? "white" : "black"}
            />
          </TouchableOpacity>
          <Text style={[styles.text, dynamicStyles.changeTextColor]}>
            Messages
          </Text>
        </View>
        <TouchableOpacity onPress={onToggle}>
          <FontAwesome
            name="bars"
            size={24}
            color={theme === "dark" ? "white" : "black"}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "current" && styles.activeTab,
            dynamicStyles.changeBackgroundColor,
          ]}
          onPress={() => setActiveTab("current")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "current" && styles.activeTabText,
              dynamicStyles.changeTextColor,
            ]}
          >
            Current
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "pending" && styles.activeTab,
            dynamicStyles.changeBackgroundColor,
          ]}
          onPress={() => setActiveTab("pending")}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text
              style={[
                styles.tabText,
                activeTab === "pending" && styles.activeTabText,
                dynamicStyles.changeTextColor,
              ]}
            >
              Pending
            </Text>
            {pendingCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{pendingCount}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {activeTab === "current" ? <CurrentUsersMsg /> : <PendingMessages />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginLeft: 15,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginBottom: 10,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#007AFF",
  },
  tabText: {
    fontSize: 16,
  },
  activeTabText: {
    fontWeight: "bold",
  },
  badge: {
    backgroundColor: "#FF4B4B",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    paddingHorizontal: 6,
  },
  badgeText: {
    color: "red",
    fontSize: 12,
    fontWeight: "bold",
  },
});
