import {
  FlatList,
  Animated,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "@/hooks/store/socketStore";
import { useUser } from "@/hooks/user/userContext";
import { getMessages } from "@/endpoints/endpoint";
import { format, parseISO } from "date-fns";
import { enUS } from "date-fns/locale";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { useTheme } from "@/hooks/theme/ThemeContext.";
import { getStyles } from "@/constants/getStyles";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import ChatOptionModal from "./ChatOptionModal";
import MessageImage from "./MessageImage";
import { supabase } from "@/endpoints/supabase";
import { showToast } from "@/constants/toast";
import { useVideoPlayer, VideoView } from "expo-video";
import MessageList from "./MessageList";
import VideoItem from "./VideoItem";

export default function Chat({ receiverId, userName }: any) {
  const [sendMessage, setSendMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [isFileRendered, setIsFileRendered] = useState(false);
  const [isDeletingFiles, setIsDeletingFiles] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null
  );
  const [openModal, setOpenModal] = useState(false);
  const socket = useSocket();
  const { userId } = useUser();
  const insets = useSafeAreaInsets();
  const [fadeAnim] = useState(new Animated.Value(0));

  const { theme } = useTheme();

  const dynamicStyles = getStyles(theme);

  useFocusEffect(
    useCallback(() => {
      if (!openModal) {
        async function loadMessages() {
          try {
            const msgData = await getMessages(userId!, Number(receiverId));
            //console.log(msgData.data);

            console.log(msgData.data.length);
            const filteredMessages = msgData.data.filter(
              (message: any) => !message.deletedForUserIds.includes(userId!)
            );
            setMessages(filteredMessages);
          } catch (error) {
            console.error("error", error);
          }
        }

        loadMessages();
      }
    }, [openModal, userId, receiverId])
  );

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
    if ((socket && sendMessage.trim() !== "") || files.length > 0) {
      const newMessage = {
        senderId: userId,
        receiverId: Number(receiverId),
        content: sendMessage.trim(),
        files,
        createdAt: new Date().toISOString(),
      };

      socket!.emit("sendMessage", newMessage);
      socket!.emit("enterChat", { userId, receiverId });
      setSendMessage("");
      setFiles([]);
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

  const handleFileLoad = (index: any) => {
    // Marcar cuando todas las imágenes están completamente cargadas
    if (files.length === index + 1) {
      setIsFileRendered(true); // Solo marcar como renderizado cuando todas las imágenes hayan cargado
    }
  };

  //esta deberia ser la funcion para borrar los archivos del bucket y limpiar el estado
  async function deleteFiles() {
    setIsDeletingFiles(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Debes estar autenticado para eliminar los archivos.");
      }

      if (files.length === 0) {
        showToast("No hay archivos para eliminar.");
        return;
      }

      // Prepara los archivos para ser eliminados del bucket
      const paths = files.map((fileUrl) => fileUrl.split("/").pop());

      const { error } = await supabase.storage.from("messageImg").remove(paths);

      if (error) {
        throw error;
      }

      // Limpia el estado de los archivos
      setFiles([]);

      showToast("Done.");
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Error canceling files:", error.message);
      }
    } finally {
      setIsDeletingFiles(false);
    }
  }

  const isImage = (fileUrl: string) => /\.(jpg|jpeg|png|gif)$/i.test(fileUrl);
  const isVideo = (fileUrl: string) => /\.(mp4|mov|avi|mkv)$/i.test(fileUrl);

  const renderedFiles = files.map((fileUrl, index) => {
    if (isImage(fileUrl)) {
      return (
        <Image
          key={`image-${index}`}
          source={{ uri: fileUrl }}
          width={40}
          height={40}
          onLoad={() => handleFileLoad(index)}
        />
      );
    } else if (isVideo(fileUrl)) {
      // Inicializar el reproductor de video
      return (
        <VideoItem
          key={`video-${index}`}
          fileUrl={fileUrl}
          onLoad={handleFileLoad}
          index={index}
        />
      );
    }
    return null;
  });

  return (
    <View style={[styles.container, dynamicStyles.changeBackgroundColor]}>
      <View style={[styles.header, { marginTop: insets.top }]}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
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
        {isDeletingFiles ? (
          <ActivityIndicator size={"small"} />
        ) : files.length > 0 && isFileRendered ? (
          <TouchableOpacity onPress={deleteFiles}>
            <Text style={{ color: "#ee391f", fontWeight: "bold" }}>Cancel</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => setOpenModal(true)}>
            <SimpleLineIcons
              name="options-vertical"
              size={24}
              color={theme === "dark" ? "white" : "black"}
            />
          </TouchableOpacity>
        )}
      </View>

      <MessageList
        groupedMessages={groupedMessages}
        userId={userId}
        handleMessagePress={handleMessagePress}
        selectedMessageId={selectedMessageId}
        formatMessageTime={formatMessageTime}
        fadeAnim={fadeAnim}
      />

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
          placeholder={
            loadingFiles
              ? "Loading files..."
              : files.length > 0 && !isFileRendered
              ? "Rendering files..."
              : "Write a message..."
          }
          placeholderTextColor={theme === "dark" ? "#6f6f6f" : "#000"}
          style={[styles.input, { color: theme === "dark" ? "#fff" : "#000" }]}
          editable={!loadingFiles}
        />
        <View style={{ flexDirection: "row", gap: 15, alignItems: "center" }}>
          {loadingFiles ? (
            <ActivityIndicator size="small" />
          ) : files.length > 0 ? (
            <>{renderedFiles}</>
          ) : (
            <MessageImage
              setFiles={setFiles}
              setLoadingFiles={setLoadingFiles}
            />
          )}

          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={
              loadingFiles ||
              (!sendMessage.trim() && (!isFileRendered || files.length === 0))
            }
          >
            <AntDesign
              name="arrowup"
              size={24}
              color={
                theme === "dark"
                  ? sendMessage.trim() || (files.length > 0 && isFileRendered)
                    ? "white"
                    : "gray"
                  : sendMessage.trim() || (files.length > 0 && isFileRendered)
                  ? "black"
                  : "gray"
              }
            />
          </TouchableOpacity>
        </View>
      </View>
      <ChatOptionModal
        visible={openModal}
        onClose={() => setOpenModal(false)}
        senderId={userId}
        receiverId={receiverId}
        messages={messages}
        setMessages={setMessages}
      />
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
  messageImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginTop: 8,
  },
});
