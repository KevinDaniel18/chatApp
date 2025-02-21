import {
  FlatList,
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { getStyles } from "@/constants/getStyles";
import { useTheme } from "@/hooks/theme/ThemeContext.";
import { format, parseISO } from "date-fns";
import { enUS } from "date-fns/locale";
import RenderMessage from "../files/RenderMessage";

export default function MessageList(props: any) {
  const {
    groupedMessages,
    userId,
    handleMessagePress,
    selectedMessageId,
    fadeAnim,
    historyVisible,
    handleDeleteMessage,
    setSelectedMessageDeleteId,
    setShowDelete,
  } = props;

  const flatListRef = useRef<FlatList>(null);
  const fadeHistoryAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [selectedHistoryMessage, setSelectedHistoryMessage] = useState<
    string | null
  >(null);

  const { theme } = useTheme();
  const dynamicStyles = getStyles(theme);

  useEffect(() => {
    Animated.timing(fadeHistoryAnim, {
      toValue: historyVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    Animated.timing(scaleAnim, {
      toValue: historyVisible ? 0.8 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [historyVisible]);

  const handleHistoryItemPress = (messageId: string, index: number) => {
    setSelectedHistoryMessage(messageId);
    handleMessagePress(messageId);
    flatListRef.current?.scrollToIndex({ animated: true, index });
  };

  const messageProps = {
    handleMessagePress,
    selectedMessageId,
    fadeAnim,
    userId,
  };
  const deleteProps = {
    handleDeleteMessage,
    setSelectedMessageDeleteId,
    setShowDelete,
  };

  const formatMessageTime = (date: string) => {
    return format(parseISO(date), "HH:mm - d MMM yyyy", { locale: enUS });
  };


  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.content, { transform: [{ scale: scaleAnim }] }]}
      >
        <FlatList
          ref={flatListRef}
          data={Object.keys(groupedMessages)}
          keyExtractor={(item) => item}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <RenderMessage
              item={item}
              index={index}
              groupedMessages={groupedMessages}
              formatMessageTime={formatMessageTime}
              {...messageProps}
              {...deleteProps}
            />
          )}
        />
      </Animated.View>
      {historyVisible && (
        <Animated.View
          style={[
            styles.historyContainer,
            dynamicStyles.changeBackgroundColor,
            { opacity: fadeHistoryAnim, width: historyVisible ? 100 : 0 },
          ]}
        >
          <FlatList
            data={Object.keys(groupedMessages)}
            keyExtractor={(item) => item}
            renderItem={({ item, index }) => (
              <View>
                <Text
                  style={[{ fontSize: 12, fontWeight: "bold", marginBottom: 15 }, dynamicStyles.changeTextColor]}
                >
                  {item.length > 5
                    ? item.split(" ").slice(2, 4).join("-")
                    : item}
                </Text>
                {groupedMessages[item].map((message: any, msgIndex: number) => (
                  <TouchableOpacity
                    key={message.id}
                    onPress={() => handleHistoryItemPress(message.id, index)}
                    style={styles.historyItem}
                  >
                    <Text
                      style={[
                        styles.historyItemText,
                        message.id === selectedHistoryMessage && {
                          color: "#40b034",
                        },
                      ]}
                    >
                      {formatMessageTime(message.createdAt)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
  content: {
    flex: 1,
    marginHorizontal: 20,
  },
  historyContainer: {
    padding: 10,
    overflow: "hidden",
  },
  historyDateLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginVertical: 5,
    color: "#888",
  },
  historyItem: {
    marginBottom: 5,
    paddingVertical: 5,
  },
  historyItemText: {
    fontSize: 12,
    color: "#a7a7a7",
  },
});
