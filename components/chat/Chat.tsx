import {
  Animated,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { useSocket } from "@/hooks/store/socketStore";
import { useUser } from "@/hooks/user/userContext";
import { getMessages } from "@/endpoints/endpoint";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { useTheme } from "@/hooks/theme/ThemeContext.";
import { getStyles } from "@/constants/getStyles";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import ChatOptionModal from "./ChatOptionModal";
import { supabase } from "@/endpoints/supabase";
import { showToast } from "@/constants/toast";
import MessageList from "./MessageList";
import VideoItem from "../media/VideoItem";
import ProgressBar from "../ProgressBar";
import useFileStore from "@/hooks/store/fileStore";
import * as SecureStore from "expo-secure-store";
import { groupMessagesByDate } from "./groupMessagesByDate";
import useMessageStore from "@/hooks/store/messageStore";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import BottomMsgOption from "../bottomSheets/BottomMsgOption";
import AudioRecorder from "../media/AudioRecorder";
import AudioPlayer from "../media/AudioPlayer";
import { RecordingIndicator } from "../media/RecordingIndicator";

export default function Chat({ receiverId, userName, isPending }: any) {
  const [sendMessage, setSendMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [isFileRendered, setIsFileRendered] = useState(false);
  const [isDeletingFiles, setIsDeletingFiles] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [height, setHeight] = useState(100);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null
  );
  const [selectedMessageDeleteId, setSelectedMessageDeleteId] = useState<
    string | null
  >(null);
  const [openModal, setOpenModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const socket = useSocket();
  const { userId } = useUser();
  const insets = useSafeAreaInsets();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [showDelete, setShowDelete] = useState(false);
  const { theme } = useTheme();
  const { getFilesForUser, setFilesForUser } = useFileStore();
  const { setDraftForUser, clearDraftForUser } = useMessageStore();
  const dynamicStyles = getStyles(theme);

  useFocusEffect(
    useCallback(() => {
      if (isPending && isPending === "true") {
        Alert.alert(
          `${userName}wants to connect with you`,
          "do you want to proceed?",
          [
            {
              text: "Cancel",
              onPress: () => router.replace("/current-chat"),
              style: "cancel",
            },
            {
              text: "OK",
              onPress: () => socket!.emit("enterChat", { userId, receiverId }),
            },
          ]
        );
      }

      if (!openModal) {
        async function loadMessages() {
          try {
            const msgData = await getMessages(userId!, Number(receiverId));

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
      socket.on("messageDeleted", (messageId) => {
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg.id !== messageId)
        );
      });
    }

    joinUserRoom();

    return () => {
      if (socket) {
        socket.off("receiveMessage", handleNewMessage);
        socket.off("messageDeleted");
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
      setSendMessage("");
      setFilesForUser(receiverId, []);
      setFiles([]);
      clearDraftForUser(receiverId);
      await SecureStore.deleteItemAsync(`chat-files-${receiverId}`);
      await SecureStore.deleteItemAsync(`chat-draft-${receiverId}`);
    }
  }

  const handleDeleteMessage = (messageId: any) => {
    socket!.emit("deleteMessage", messageId, userId, receiverId);
  };

  const groupedMessages = groupMessagesByDate(messages);

  const handleFileLoad = (index: any) => {
    if (files.length === index + 1) {
      setIsFileRendered(true);
    }
  };

  async function deleteFiles() {
    setIsDeletingFiles(true);
    try {
      const { data: session, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError || !session?.session) {
        throw new Error("Debes estar autenticado para eliminar los archivos.");
      }

      if (files.length === 0) {
        showToast("No hay archivos para eliminar.");
        return;
      }

      // Separar archivos en audios e imágenes
      const audioFiles: string[] = [];
      const imageFiles: string[] = [];

      files.forEach((fileUrl) => {
        const fileName = fileUrl.split("/").pop();
        if (fileName) {
          if (isAudio(fileName)) {
            audioFiles.push(fileName);
          } else {
            imageFiles.push(fileName);
          }
        }
      });

      // Eliminar audios del bucket "recordings"
      if (audioFiles.length > 0) {
        const { error: audioError } = await supabase.storage
          .from("recordings")
          .remove(audioFiles);
        if (audioError) throw audioError;
      }

      // Eliminar imágenes del bucket "messageImg"
      if (imageFiles.length > 0) {
        const { error: imageError } = await supabase.storage
          .from("messageImg")
          .remove(imageFiles);
        if (imageError) throw imageError;
      }

      // Limpiar archivos en SecureStore
      await SecureStore.deleteItemAsync(`chat-files-${receiverId}`);

      setFilesForUser(receiverId, []);
      setFiles([]);
      showToast("Action cancelled.");
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Error al eliminar archivos", error.message);
      }
    } finally {
      setIsDeletingFiles(false);
    }
  }

  const deleteFile = async (indexToDelete: number) => {
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

      const fileUrl = files[indexToDelete];
      const path = fileUrl.split("/").pop();

      const bucket = isAudio(fileUrl) ? "recordings" : "messageImg";

      const { error } = await supabase.storage.from(bucket).remove([path]);

      if (error) {
        throw error;
      }

      const newFiles = files.filter((_, index) => index !== indexToDelete);
      setFiles(newFiles);
      setFilesForUser(receiverId, newFiles);

      await SecureStore.setItemAsync(
        `chat-files-${receiverId}`,
        JSON.stringify(newFiles)
      );

      if (newFiles.length === 0) {
        setIsFileRendered(false);
      }

      showToast("File deleted.");
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Error al eliminar el archivo:", error.message);
      }
    } finally {
      setIsDeletingFiles(false);
    }
  };

  const isImage = (fileUrl: string) => /\.(jpg|jpeg|png|gif)$/i.test(fileUrl);
  const isVideo = (fileUrl: string) => /\.(mp4|mov|avi|mkv)$/i.test(fileUrl);
  const isAudio = (fileUrl: string) => /\.(mp3|wav|ogg|m4a)$/i.test(fileUrl);

  const renderedFiles = files.map((fileUrl, index) => {
    if (isImage(fileUrl)) {
      return (
        <View key={`image-${index}`} style={{ flexDirection: "row", gap: 4 }}>
          <Image
            source={{ uri: fileUrl }}
            width={50}
            height={50}
            style={{ borderRadius: 10 }}
            onLoad={() => handleFileLoad(index)}
          />
          <TouchableOpacity onPress={() => deleteFile(index)}>
            <AntDesign
              name="close"
              size={20}
              color={theme === "dark" ? "#fff" : "#000"}
            />
          </TouchableOpacity>
        </View>
      );
    } else if (isVideo(fileUrl)) {
      return (
        <VideoItem
          key={`video-${index}`}
          fileUrl={fileUrl}
          onLoad={handleFileLoad}
          index={index}
          deleteFile={() => deleteFile(index)}
        />
      );
    } else if (isAudio(fileUrl)) {
      return (
        <View key={`audio-${index}`} style={{ flexDirection: "row", gap: 4 }}>
          <AudioPlayer file={fileUrl} sliderWidth="80%" />
          <TouchableOpacity onPress={() => deleteFile(index)}>
            <AntDesign
              name="close"
              size={20}
              color={theme === "dark" ? "#fff" : "#000"}
            />
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  });

  useEffect(() => {
    async function loadFiles() {
      const storedFiles = await SecureStore.getItemAsync(
        `chat-files-${receiverId}`
      );
      if (storedFiles) {
        const parsedFiles = JSON.parse(storedFiles);
        setFiles(parsedFiles);
        setFilesForUser(receiverId, parsedFiles);
      }
    }
    loadFiles();
  }, [receiverId]);

  useEffect(() => {
    async function saveFiles() {
      if (files.length > 0) {
        await SecureStore.setItemAsync(
          `chat-files-${receiverId}`,
          JSON.stringify(files)
        );
        setFilesForUser(receiverId, files);
      }
    }
    saveFiles();
  }, [files, receiverId]);

  useEffect(() => {
    const currentUserFiles = getFilesForUser(receiverId);
    if (currentUserFiles.length > 0) {
      setFiles(currentUserFiles);
    }
  }, [receiverId]);

  useLayoutEffect(() => {
    if (files.length > 0 && !isFileRendered) {
      setIsFileRendered(true);
    }
  }, [files, isFileRendered]);

  useEffect(() => {
    async function loadMessage() {
      const storedMessage = await SecureStore.getItemAsync(
        `draft-${receiverId}`
      );
      if (storedMessage) {
        setSendMessage(storedMessage);
        setDraftForUser(receiverId, storedMessage);
      } else {
        setSendMessage("");
      }
    }
    loadMessage();
  }, [receiverId]);

  useEffect(() => {
    async function saveMessage() {
      if (sendMessage.trim() !== "") {
        await SecureStore.setItemAsync(`draft-${receiverId}`, sendMessage);
        setDraftForUser(receiverId, sendMessage);
      } else {
        await SecureStore.deleteItemAsync(`draft-${receiverId}`);
        setDraftForUser(receiverId, "");
      }
    }
    saveMessage();
  }, [sendMessage, receiverId]);

  const handleDeleteClick = () => {
    if (selectedMessageDeleteId) {
      handleDeleteMessage(selectedMessageDeleteId);
      setShowDelete(false);
      setSelectedMessageDeleteId(null);
    }
  };

  return (
    <View style={[styles.container, dynamicStyles.changeBackgroundColor]}>
      <View style={[styles.header, { marginTop: insets.top }]}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {showDelete ? (
            <Text
              style={[dynamicStyles.changeTextColor, { paddingVertical: 4.5 }]}
            >
              Delete for everyone?
            </Text>
          ) : (
            <>
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
            </>
          )}
        </View>

        {isDeletingFiles ? (
          <ActivityIndicator size={"small"} />
        ) : files.length > 0 && isFileRendered ? (
          <TouchableOpacity onPress={deleteFiles}>
            <Text style={{ color: "#ee391f", fontWeight: "bold" }}>Cancel</Text>
          </TouchableOpacity>
        ) : showDelete ? (
          <View style={{ flexDirection: "row", gap: 20, alignItems: "center" }}>
            <TouchableOpacity onPress={() => setShowDelete(false)}>
              <Text
                style={[{ fontWeight: "600" }, dynamicStyles.changeTextColor]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDeleteClick}>
              <Feather name="trash" size={24} color="#ee391f" />
            </TouchableOpacity>
          </View>
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
        fadeAnim={fadeAnim}
        historyVisible={historyVisible}
        handleDeleteMessage={handleDeleteMessage}
        showDelete={showDelete}
        setShowDelete={setShowDelete}
        setSelectedMessageDeleteId={setSelectedMessageDeleteId}
      />
      <View>
        {loadingFiles && (
          <ProgressBar
            progress={uploadProgress}
            height={8}
            backgroundColor="#f3f3f3"
            progressColor="#4caf50"
          />
        )}
        {isRecording && <RecordingIndicator isRecording={isRecording} />}
        {files.length > 0 && (
          <ScrollView
            style={[styles.renderedFiles, dynamicStyles.changeBackgroundColor]}
            horizontal
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                gap: 15,
                justifyContent: "center",
              }}
            >
              {renderedFiles}
            </View>
          </ScrollView>
        )}
        <View
          style={[
            styles.chatInputContainer,
            dynamicStyles.changeBackgroundColor,
            { marginBottom: insets.bottom },
          ]}
        >
          {loadingFiles ? (
            <Text style={{ color: theme === "dark" ? "white" : "black" }}>
              {uploadProgress.toFixed(0)}%
            </Text>
          ) : files.length > 0 && !isFileRendered ? (
            <ActivityIndicator
              size="small"
              color={theme === "dark" ? "white" : "black"}
            />
          ) : (
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Ionicons
                name="add-outline"
                size={24}
                color={theme === "dark" ? "#fff" : "#000"}
              />
            </TouchableOpacity>
          )}
          <TextInput
            value={sendMessage}
            onChangeText={setSendMessage}
            placeholder={
              loadingFiles
                ? "Loading file"
                : files.length > 0 && !isFileRendered
                ? "Rendering file"
                : "Write a message..."
            }
            placeholderTextColor={theme === "dark" ? "#6f6f6f" : "#000"}
            style={[
              styles.input,
              {
                color: theme === "dark" ? "#fff" : "#000",
                height: height,
              },
            ]}
            editable={!loadingFiles || !isFileRendered}
            multiline
            maxLength={1000}
            onContentSizeChange={(e) => {
              const contentHeight = e.nativeEvent.contentSize.height;
              const maxHeight = 120;
              setHeight(contentHeight > maxHeight ? maxHeight : contentHeight);
            }}
          />
          <View>
            {!sendMessage.trim() && files.length === 0 ? (
              <AudioRecorder
                setFiles={setFiles}
                setLoadingFiles={setLoadingFiles}
                setUploadProgress={setUploadProgress}
                setIsRecording={setIsRecording}
              />
            ) : (
              <TouchableOpacity
                onPress={handleSendMessage}
                disabled={
                  loadingFiles ||
                  (!sendMessage.trim() &&
                    (!isFileRendered || files.length === 0))
                }
              >
                <AntDesign
                  name="arrowup"
                  size={24}
                  color={
                    theme === "dark"
                      ? sendMessage.trim() ||
                        (files.length > 0 && isFileRendered)
                        ? "white"
                        : "gray"
                      : sendMessage.trim() ||
                        (files.length > 0 && isFileRendered)
                      ? "black"
                      : "gray"
                  }
                />
              </TouchableOpacity>
            )}
          </View>
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
      <BottomMsgOption
        modalVisible={modalVisible || false}
        setModalVisible={() => setModalVisible(false)}
        setFiles={setFiles}
        setLoadingFiles={setLoadingFiles}
        setUploadProgress={setUploadProgress}
        historyVisible={historyVisible}
        setHistoryVisible={setHistoryVisible}
        setShowDelete={setShowDelete}
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
    gap: 10,
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 10,
    paddingTop: 10,
    paddingBottom: 10,
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
  renderedFiles: {
    width: "100%",
    padding: 20,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 10,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 5,
  },
});
