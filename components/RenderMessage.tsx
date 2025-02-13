import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import RenderImage from "./RenderImage";
import RenderVideo from "./RenderVideo";
import AudioPlayer from "./AudioPlayer";

export default function RenderMessage(props: any) {
  const isImage = (fileUrl: string) => /\.(jpg|jpeg|png|gif)$/i.test(fileUrl);
  const isVideo = (fileUrl: string) => /\.(mp4|mov|avi|mkv)$/i.test(fileUrl);
  const isAudio = (fileUrl: string) => /\.(mp3|wav|m4a)$/i.test(fileUrl);

  const handleLongPress = (messageId: string, senderId: number) => {
    if (props.userId === senderId) {
      props.setSelectedMessageDeleteId(messageId);
      props.setShowDelete(true);
    }
  };

  return (
    <View key={`${props.item}-${props.index}`}>
      <Text style={styles.dateLabel}>{props.item}</Text>
      {props.groupedMessages[props.item].map(
        (message: any, msgIndex: number) => (
          <View
            key={`${props.item}-${
              message.id || `${message.createdAt}-${msgIndex}`
            }`}
          >
            <TouchableOpacity
              onPress={() => props.handleMessagePress(message.id)}
              activeOpacity={0.7}
              onLongPress={() => handleLongPress(message.id, message.senderId)}
            >
              {message.content && (
                <View
                  style={[
                    styles.messageBubble,
                    message.senderId === Number(props.userId)
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
                    message.senderId === Number(props.userId)
                      ? { alignSelf: "flex-end" }
                      : { alignSelf: "flex-start" },
                  ]}
                >
                  {message.fileUrls.map((file: string, fileIndex: number) =>
                    isImage(file) ? (
                      <RenderImage
                        key={`image-${message.id || props.index}-${fileIndex}`}
                        file={file}
                        messageId={message.id || `${props.index}`}
                        index={fileIndex}
                      />
                    ) : isVideo(file) ? (
                      <RenderVideo
                        key={`video-${message.id || props.index}-${fileIndex}`}
                        file={file}
                        messageId={message.id || `${props.index}`}
                        index={fileIndex}
                      />
                    ) : isAudio(file) ? (
                      <AudioPlayer
                        key={`audio-${message.id || props.index}-${fileIndex}`}
                        file={file}
                        sliderWidth="100%"
                      />
                    ) : null
                  )}
                </View>
              )}
            </TouchableOpacity>
            {props.selectedMessageId === message.id && (
              <Animated.View style={{ opacity: props.fadeAnim }}>
                <Text
                  style={[
                    styles.timestampText,
                    message.senderId === props.userId
                      ? styles.sentTimestamp
                      : styles.receivedTimestamp,
                  ]}
                >
                  {props.formatMessageTime(message.createdAt)}
                </Text>
              </Animated.View>
            )}
          </View>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
