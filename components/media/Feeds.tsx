import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
} from "react-native";
import React, {useEffect, useRef, useState } from "react";
import {
  Feather,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useTheme } from "@/hooks/theme/ThemeContext.";
import { getStyles } from "@/constants/getStyles";
import BottomCreatePosts from "../bottomSheets/BottomCreatePosts";
import { getPosts } from "@/endpoints/endpoint";
import LoadingScreen from "../LoadingScreen";
import RenderFeed from "./RenderFeed";

export interface Author {
  id: number
  name: string;
  profilePicture?: string;
}

interface FeedsData {
  id: number;
  author: Author;
  description?: string;
  file?: string;
  likes: number;
  createdAt: string;
}

export default function Feeds() {
  const { theme } = useTheme();
  const dynamicStyles = getStyles(theme);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLightOn, setIsLightOn] = useState(false);
  const [data, setData] = useState<FeedsData[]>([]);
  const [loading, setLoading] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const headerHeight = 70;

  const headerTranslate = scrollY.interpolate({
    inputRange: [0, headerHeight],
    outputRange: [0, -headerHeight],
    extrapolate: "clamp",
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setIsLightOn((prev) => !prev);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  async function fetchPosts() {
    setLoading(true);
    try {
      const res = await getPosts();
      setData(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <View style={[dynamicStyles.changeBackgroundColor, { flex: 1 }]}>
      <Animated.View
        style={[
          styles.header,
          {
            transform: [{ translateY: headerTranslate }],
            borderBottomColor: theme === "dark" ? "#333" : "#e0e0e0",
            backgroundColor: theme === "dark" ? "#1a1a1a" : "#ffffff",
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={[
            styles.createPostButton,
            {
              backgroundColor: theme === "dark" ? "#333" : "#f5f5f5",
              shadowColor: theme === "dark" ? "#000" : "#888",
            },
          ]}
        >
          <Text
            style={[
              styles.createPostText,
              { color: theme === "dark" ? "#e0e0e0" : "#555" },
            ]}
          >
            What are you thinking?
          </Text>
          <MaterialCommunityIcons
            name={isLightOn ? "lightbulb-on-outline" : "lightbulb-outline"}
            size={24}
            color={theme === "dark" ? "#FFD700" : "#FF8C00"}
            style={styles.lightbulbIcon}
          />
        </TouchableOpacity>
      </Animated.View>
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <LoadingScreen />
        </View>
      ) : data.length === 0 ? (
        <View style={styles.emptyFeedContainer}>
          <Feather
            name="inbox"
            size={50}
            color={theme === "dark" ? "#555" : "#ddd"}
          />
          <Text
            style={[
              styles.emptyFeedText,
              { color: theme === "dark" ? "#aaa" : "#888" },
            ]}
          >
            No posts yet
          </Text>
          <Text
            style={[
              styles.emptyFeedSubtext,
              { color: theme === "dark" ? "#777" : "#aaa" },
            ]}
          >
            Be the first to share your thoughts!
          </Text>
        </View>
      ) : (
        <Animated.FlatList
          data={data}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={[
            styles.collageContainer,
            { paddingTop: headerHeight + 10 },
          ]}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          initialNumToRender={4}
          maxToRenderPerBatch={6}
          windowSize={10}
          scrollEventThrottle={16}
          renderItem={({ item }) => (
            <RenderFeed
              author={item.author}
              createdAt={item.createdAt}
              file={item.file!}
              description={item.description!}
            />
          )}
        />
      )}

      <BottomCreatePosts
        modalVisible={modalVisible || false}
        setModalVisible={() => setModalVisible(false)}
        dynamicStyles={dynamicStyles}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 16,
    borderBottomWidth: 1,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  createPostButton: {
    flexDirection: "row",
    alignItems: "center",

    padding: 12,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  createPostText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "400",
  },
  lightbulbIcon: {
    marginLeft: 8,
  },
  emptyFeedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyFeedText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
  },
  emptyFeedSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  collageContainer: {
    padding: 8,
    gap: 8,
  },
});
