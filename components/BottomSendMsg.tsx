import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
  BackHandler,
  Keyboard,
  PanResponder,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSocket } from "@/hooks/store/socketStore";
import { useUser } from "@/hooks/user/userContext";
import { useTheme } from "@/hooks/theme/ThemeContext.";
import { getStyles } from "@/constants/getStyles";
import { UsersProps } from "./Users";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { getUsersWithPendingMessages } from "@/endpoints/endpoint";
import { showToast } from "../constants/toast";

interface SendMessageModalProps {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  selectedUser: UsersProps | null;
}

export default function BottomSendMsg({
  modalVisible,
  setModalVisible,
  selectedUser,
}: SendMessageModalProps) {
  const [sendMessage, setSendMessage] = useState("");
  const { userId } = useUser();
  const socket = useSocket();
  const { theme } = useTheme();
  const dynamicStyles = getStyles(theme);
  const insets = useSafeAreaInsets();
  const [firstMsg, setFirstMsg] = useState(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const panY = useRef(new Animated.Value(0)).current;

  const resetPositionAnim = Animated.timing(panY, {
    toValue: 0,
    duration: 200,
    useNativeDriver: true,
  });

  const closeAnim = Animated.timing(slideAnim, {
    toValue: 0,
    duration: 200,
    useNativeDriver: true,
  });

  function navigateToChat(receiverId: number, userName: string) {
    router.push({
      pathname: "/user/chat",
      params: { receiverId, userName },
    });
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 0;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 50) {
          closeModal();
        } else {
          resetPositionAnim.start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (modalVisible) {
      panY.setValue(0);
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } else {
      closeAnim.start();
    }
  }, [modalVisible]);

  useEffect(() => {
    async function joinUserRoom() {
      if (socket && userId) {
        socket.emit("joinRoom", {
          senderId: userId,
          receiverId: Number(selectedUser?.id),
        });
      }
    }
    joinUserRoom();
  }, [userId, socket, selectedUser?.id]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (modalVisible) {
          closeModal();
          return true;
        }
        return false;
      }
    );

    return () => backHandler.remove();
  }, [modalVisible]);

  useFocusEffect(
    useCallback(() => {
      try {
        async function getFirstMessage() {
          const res = await getUsersWithPendingMessages(userId!);
          const pendingUserId =
            res.data.users.find(
              (user: { id: number | undefined }) => user.id === selectedUser?.id
            )?.id || null;
          setFirstMsg(pendingUserId);
          console.log(pendingUserId);

          return pendingUserId;
        }
        getFirstMessage();
      } catch (error) {
        console.error(error);
      }
    }, [userId, modalVisible, selectedUser?.id])
  );

  const closeModal = () => {
    Keyboard.dismiss();
    setModalVisible(false);
  };

  async function sendMessageToSocket() {
    if (socket && sendMessage.trim() !== "") {
      const newMessage = {
        senderId: userId,
        receiverId: Number(selectedUser?.id),
        content: sendMessage,
        createdAt: new Date().toISOString(),
      };

      socket.emit("sendMessage", newMessage);
      socket.emit("enterChat", { userId, receiverId: selectedUser?.id });
      showToast("Message sent succesfully");
      setSendMessage("");
      closeModal();
    }
  }

  async function handleSendMessage() {
    if (sendMessage.trim() === "") {
      return; // No hacer nada si el mensaje está vacío
    }

    // Verifica si hay un mensaje pendiente con el usuario seleccionado igualando los id
    if (firstMsg !== null && selectedUser?.id === firstMsg) {
      Alert.alert(
        "Pending Message",
        `You got a pending message from ${
          selectedUser?.name
        }, if you sent it ${selectedUser?.name
          .split(" ")
          .at(0)} will read your message. Do you want to continue?`,
        [
          {
            text: "Cancelar",
            style: "cancel",
          },
          {
            text: "OK",
            onPress: () => {
              sendMessageToSocket(); // Envía el mensaje al aceptar
              navigateToChat(selectedUser?.id!, selectedUser?.name!);
            },
          },
        ]
      );
    } else {
      sendMessageToSocket(); // Si no hay mensaje pendiente, envía directamente
    }
  }

  const translateY = Animated.add(
    panY,
    slideAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [300, 0],
    })
  );

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="none"
      onRequestClose={closeModal}
      statusBarTranslucent
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={closeModal}
      >
        <Animated.View
          style={[
            styles.modalContent,
            dynamicStyles.changeBackgroundColor,
            { transform: [{ translateY }] },
            { paddingBottom: insets.bottom },
          ]}
        >
          <View {...panResponder.panHandlers}>
            <View style={styles.handle} />

            <Text style={[styles.title, dynamicStyles.changeTextColor]}>
              {firstMsg !== null && selectedUser?.id === firstMsg
                ? ` Start Chatting with ${selectedUser?.name}`
                : "Send Message"}
            </Text>
          </View>
          <View
            style={[
              styles.chatInputContainer,
              dynamicStyles.changeBackgroundColor,
            ]}
          >
            <TextInput
              value={sendMessage}
              onChangeText={setSendMessage}
              placeholder="Write a message..."
              placeholderTextColor={theme === "dark" ? "#6f6f6f" : "#000"}
              style={[
                styles.input,
                { color: theme === "dark" ? "#fff" : "#000" },
              ]}
              autoFocus
            />
            <TouchableOpacity
              onPress={handleSendMessage}
              disabled={!sendMessage.trim()}
            >
              <Ionicons
                name="send"
                size={20}
                color={
                  theme === "dark"
                    ? sendMessage.trim()
                      ? "white"
                      : "gray"
                    : sendMessage.trim()
                    ? "black"
                    : "gray"
                }
              />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: "20%",
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#DEDEDE",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    paddingBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
  chatInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "white",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#eee",
  },
  input: {
    flex: 1,
    height: 40,
    paddingLeft: 10,
  },
});
