import {
  Animated,
  Modal,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "@/hooks/theme/ThemeContext.";
import { getStyles } from "@/constants/getStyles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AntDesign, Feather, Ionicons } from "@expo/vector-icons";
import { deleteMessageForUser } from "@/endpoints/endpoint";
import { Alert } from "react-native";
import { showToast } from "@/constants/toast";
import * as SecureStore from "expo-secure-store";

export default function ChatOptionModal({
  visible,
  onClose,
  senderId,
  receiverId,
  messages = [],
}: any) {
  const [showModal, setShowModal] = useState(visible);
  const [localMessages, setLocalMessages] = useState<any[]>([]);
  const [isDeleted, setIsDeleted] = useState(false);
  const slideAnim = useRef(new Animated.Value(500)).current;
  const { theme } = useTheme();

  const dynamicStyles = getStyles(theme);
  const insets = useSafeAreaInsets();

  async function deleteMsg() {
    console.log("isdeleted antes de borrar", isDeleted);

    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete all messages with this user? This action cannot be undone.", // Mensaje del alerta
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await deleteMessageForUser(
                senderId,
                Number(receiverId)
              );
              if (res.status === 201) {
                setLocalMessages([]);
                setIsDeleted(true);
                await SecureStore.deleteItemAsync("chat-files");

                showToast("Messages deleted successfully");
              }
              console.log("isdeleted despues de borrar", isDeleted);
              return res;
            } catch (error) {
              console.error(error);
            }
          },
        },
      ]
    );
  }

  useEffect(() => {
    if (visible) {
      setLocalMessages(messages || []);
      console.log(JSON.stringify(messages));

      setShowModal(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 500,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowModal(false));
    }
  }, [visible]);

  return (
    <Modal
      transparent={true}
      visible={showModal}
      onRequestClose={onClose}
      animationType="none"
      statusBarTranslucent
    >
      <View style={[styles.container, dynamicStyles.changeBackgroundColor]}>
        <Animated.View
          style={[
            styles.chatOverlay,
            { transform: [{ translateX: slideAnim }] },
            dynamicStyles.changeBackgroundColor,
          ]}
        >
          <View style={[styles.header, { marginTop: insets.top }]}>
            <TouchableOpacity onPress={onClose}>
              <AntDesign
                name="arrowleft"
                size={28}
                color={theme === "dark" ? "white" : "black"}
              />
            </TouchableOpacity>
            <Text style={[styles.text, dynamicStyles.changeTextColor]}>
              Chat Settings
            </Text>
          </View>

          <Text style={[styles.textOption, dynamicStyles.changeTextColor]}>
            Notifications
          </Text>
          <View style={styles.content}>
            <TouchableOpacity style={styles.settingItem}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 15,
                }}
              >
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color={theme === "dark" ? "white" : "black"}
                />
                <Text style={[dynamicStyles.changeTextColor]}>
                  Enable Notifications
                </Text>
              </View>
              <Switch />
            </TouchableOpacity>
          </View>

          <Text style={[styles.textOption, dynamicStyles.changeTextColor]}>
            Privacy
          </Text>
          <View style={styles.content}>
            <TouchableOpacity style={styles.settingItem}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 15,
                }}
              >
                <Feather
                  name="lock"
                  size={24}
                  color={theme === "dark" ? "white" : "black"}
                />
                <Text style={[dynamicStyles.changeTextColor]}>
                  Read Receipts
                </Text>
              </View>
              <Switch />
            </TouchableOpacity>
            <View style={{ marginVertical: 10 }} />
          </View>

          <TouchableOpacity
            style={styles.clearChat}
            onPress={deleteMsg}
            disabled={isDeleted || localMessages.length === 0}
          >
            <Text
              style={[
                styles.textClearChat,
                {
                  color:
                    isDeleted || localMessages.length === 0
                      ? "#f5a09b"
                      : "#ca0601",
                },
              ]}
            >
              Clear Chat History
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatOverlay: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "100%",
    backgroundColor: "white",
    elevation: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginHorizontal: 20,
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 15,
  },
  content: {
    padding: 20,
  },
  textOption: {
    marginTop: 20,
    marginHorizontal: 20,
    fontWeight: "600",
    fontSize: 18,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  clearChat: {
    borderWidth: 1,
    padding: 10,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 10,
    borderColor: "#eee",
  },
  textClearChat: {
    textAlign: "center",
    fontWeight: "600",
  },
});
