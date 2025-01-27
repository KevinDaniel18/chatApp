import {
  FlatList,
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from "react-native";
import RenderImage from "./RenderImage";
import RenderVideo from "./RenderVideo";

export default function MessageList({
  groupedMessages,
  userId,
  handleMessagePress,
  selectedMessageId,
  formatMessageTime,
  fadeAnim,
}: any) {
  const isImage = (fileUrl: string) => /\.(jpg|jpeg|png|gif)$/i.test(fileUrl);
  const isVideo = (fileUrl: string) => /\.(mp4|mov|avi|mkv)$/i.test(fileUrl);

  return (
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
                key={`${item}-${message.id || `${message.createdAt}-${index}`}`}
              >
                <TouchableOpacity
                  onPress={() => handleMessagePress(message.id)}
                  activeOpacity={0.7}
                >
                  {message.content && (
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
                  )}
                  {message.fileUrls && message.fileUrls.length > 0 && (
                    <View
                      style={[
                        styles.messageBubble,
                        message.senderId === Number(userId)
                          ? { alignSelf: "flex-end" }
                          : { alignSelf: "flex-start" },
                      ]}
                    >
                      {message.fileUrls.map((file: string, fileIndex: number) =>
                        isImage(file) ? (
                          <RenderImage
                            key={`image-${message.id || index}-${fileIndex}`}
                            file={file}
                            messageId={message.id || `${index}`}
                            index={fileIndex}
                          />
                        ) : isVideo(file) ? (
                          <RenderVideo
                            key={`video-${message.id || index}-${fileIndex}`}
                            file={file}
                            messageId={message.id || `${index}`}
                            index={fileIndex}
                          />
                        ) : null
                      )}
                    </View>
                  )}
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
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: "transparent",
  },
  messageVideo: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: "black",
  },
});
