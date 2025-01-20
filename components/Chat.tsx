import {
  FlatList,
  Animated,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { useSocket } from "@/hooks/store/socketStore";
import { useUser } from "@/hooks/user/userContext";
import { getMessages } from "@/endpoints/endpoint";
import { format, parseISO } from "date-fns";
import { enUS } from "date-fns/locale";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import ThemeContext from "@/hooks/theme/ThemeContext.";
import { getStyles } from "@/constants/getStyles";

export default function Chat({ receiverId, userName }: any) {
  const [sendMessage, setSendMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null
  );
  const socket = useSocket();
  const { userId } = useUser();
  const insets = useSafeAreaInsets();
  const [fadeAnim] = useState(new Animated.Value(0));

  const themeContext = useContext(ThemeContext);
  if (!themeContext) {
    throw new Error("ThemeContext must be used within a ThemeProvider");
  }

  const { theme } = themeContext;
  const dynamicStyles = getStyles(theme);

  useEffect(() => {
    async function loadMessages() {
      try {
        const msgData = await getMessages(userId!, Number(receiverId));
        //console.log(msgData.data);

        setMessages(msgData.data);
      } catch (error) {
        console.error("error", error);
      }
    }
    loadMessages();
  }, [userId, receiverId]);

  useEffect(() => {
    async function joinUserRoom() {
      if (socket && userId) {
        socket.emit("joinRoom", {
          senderId: userId,
          receiverId: Number(receiverId),
        });
      }
    }

    const handleNewMessage = (msg: any) => {
      setMessages((prevMsg) => {
        const messageExists = prevMsg.some(
          (existingMsg) =>
            existingMsg.id === msg.id ||
            (existingMsg.content === msg.content &&
              existingMsg.createdAt === msg.createdAt &&
              existingMsg.senderId === msg.senderId)
        );
        if (!messageExists) {
          return [...prevMsg, msg];
        }
        return prevMsg;
      });
    };

    if (socket) {
      socket.on("receiveMessage", handleNewMessage);
    }

    joinUserRoom();

    return () => {
      if (socket) {
        socket.off("receiveMessage", handleNewMessage);
      }
    };
  }, [receiverId, socket, userId]);

  const handleMessagePress = (messageId: string) => {
    setSelectedMessageId(selectedMessageId === messageId ? null : messageId);

    if (selectedMessageId !== messageId) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const formatMessageTime = (date: string) => {
    return format(parseISO(date), "HH:mm - d MMM yyyy", { locale: enUS });
  };

  async function handleSendMessage() {
    if (socket && sendMessage.trim() !== "") {
      const newMessage = {
        senderId: userId,
        receiverId: Number(receiverId),
        content: sendMessage,
        createdAt: new Date().toISOString(),
      };

      socket.emit("sendMessage", newMessage);

      setSendMessage("");
    }
  }

  const groupMessagesByDate = (messages: any[]) => {
    const groupedMessages: any = {};

    messages.forEach((message) => {
      if (!message.createdAt) return;

      const messageDate = parseISO(message.createdAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const messageDateOnly = new Date(messageDate.setHours(0, 0, 0, 0));
      const todayOnly = new Date(today.setHours(0, 0, 0, 0));
      const yesterdayOnly = new Date(yesterday.setHours(0, 0, 0, 0));

      let groupLabel = "";

      if (messageDateOnly.getTime() === todayOnly.getTime()) {
        groupLabel = "Today";
      } else if (messageDateOnly.getTime() === yesterdayOnly.getTime()) {
        groupLabel = "Yesterday";
      } else {
        groupLabel = format(messageDate, "d 'of' MMMM yyyy", { locale: enUS });
      }

      if (!groupedMessages[groupLabel]) {
        groupedMessages[groupLabel] = [];
      }
      groupedMessages[groupLabel].push(message);
    });

    return groupedMessages;
  };

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <View style={[styles.container, dynamicStyles.changeBackgroundColor]}>
      <View style={[styles.header, { marginTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <AntDesign
            name="arrowleft"
            size={28}
            color={theme === "dark" ? "white" : "black"}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, dynamicStyles.changeTextColor]}>
          {userName}
        </Text>
      </View>

      <View style={styles.content}>
        <FlatList
          data={Object.keys(groupedMessages)}
          keyExtractor={(item) => item}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View>
              <Text style={styles.dateLabel}>{item}</Text>
              {groupedMessages[item].map((message: any, index: number) => (
                <View
                  key={`${item}-${
                    message.id || `${message.createdAt}-${index}`
                  }`}
                >
                  <TouchableOpacity
                    onPress={() => handleMessagePress(message.id)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.messageBubble,
                        message.senderId === Number(userId)
                          ? styles.sentMessage
                          : styles.receivedMessage,
                      ]}
                    >
                      <Text style={styles.messageText}>{message.content}</Text>
                    </View>
                  </TouchableOpacity>
                  {selectedMessageId === message.id && (
                    <Animated.View style={{ opacity: fadeAnim }}>
                      <Text
                        style={[
                          styles.timestampText,
                          message.senderId === userId
                            ? styles.sentTimestamp
                            : styles.receivedTimestamp,
                        ]}
                      >
                        {formatMessageTime(message.createdAt)}
                      </Text>
                    </Animated.View>
                  )}
                </View>
              ))}
            </View>
          )}
        />
      </View>

      <View
        style={[
          styles.chatInputContainer,
          dynamicStyles.changeBackgroundColor,
          { marginBottom: insets.bottom },
        ]}
      >
        <TextInput
          value={sendMessage}
          onChangeText={setSendMessage}
          placeholder="Write a message..."
          placeholderTextColor={theme === "dark" ? "#6f6f6f" : "#000"}
          style={[styles.input, { color: theme === "dark" ? "#fff" : "#000" }]}
        />
        <TouchableOpacity
          onPress={handleSendMessage}
          disabled={!sendMessage.trim()}
        >
          <AntDesign
            name="arrowup"
            size={24}
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 15,
  },
  content: {
    flex: 1,
    marginHorizontal: 20,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginVertical: 10,
    marginLeft: 5,
    color: "#888",
  },
  messageBubble: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    maxWidth: "75%",
  },
  sentMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C6",
  },
  receivedMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#E8E8E8",
  },
  messageText: {
    fontSize: 16,
  },
  chatInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  input: {
    flex: 1,
    height: 40,
    paddingLeft: 10,
  },
  timestampText: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
    marginBottom: 8,
  },
  sentTimestamp: {
    textAlign: "right",
    marginRight: 16,
  },
  receivedTimestamp: {
    textAlign: "left",
    marginLeft: 16,
  },
});
