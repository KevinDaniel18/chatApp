import { StyleSheet, Text, TouchableOpacity, View, Image, Dimensions } from "react-native";
import React from "react";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import { format } from "date-fns";
import VideoFeed from "./VideoFeed";
import { useTheme } from "@/hooks/theme/ThemeContext.";
import { getStyles } from "@/constants/getStyles";
import { router } from "expo-router";
import { Author } from "./Feeds";

type Props = {
  author: Author;
  createdAt: string;
  file: string;
  description: string;
};

const { width } = Dimensions.get("window");

export default function RenderFeed({
  author,
  createdAt,
  file,
  description,
}: Props) {
  const { theme } = useTheme();
  const dynamicStyles = getStyles(theme);
  const {profilePicture, name} = author

  function isImage(fileUrl: string) {
    const ext = fileUrl.split(".").pop()?.toLowerCase();
    return ["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "");
  }

  function isVideo(fileUrl: string) {
    const ext = fileUrl.split(".").pop()?.toLowerCase();
    return ["mp4", "mov", "avi", "mkv", "webm"].includes(ext || "");
  }

  function navigateToViewPost() {
    const props = {
      author: JSON.stringify(author),
      createdAt,
      file,
      description,
    };
    router.navigate({ pathname: "/media/view-post", params: { ...props } });
  }

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme === "dark" ? "#2a2a2a" : "#fff",
          shadowColor: theme === "dark" ? "#000" : "#aaa",
        },
      ]}
    >
      <View style={styles.authorContainer}>
        <Image
          style={styles.avatar}
          source={
            profilePicture
              ? { uri: profilePicture }
              : require("@/assets/images/defaultProfile.jpg")
          }
        />
        <Text style={[dynamicStyles.changeTextColor, { fontWeight: "bold" }]}>
          {name}
        </Text>
      </View>

      <Text style={{ color: "#b5b5b5", marginLeft: 10, fontSize: 12 }}>
        {format(new Date(createdAt), "MM/dd/yyyy")}
      </Text>

      {file && isImage(file) && (
        <Image
          source={{ uri: file }}
          style={styles.cardImage}
          resizeMode="cover"
        />
      )}

      {file && isVideo(file) && <VideoFeed uri={file} />}

      {description && (
        <Text
          style={[
            styles.cardText,
            { color: theme === "dark" ? "#eee" : "#333" },
          ]}
        >
          {description}
        </Text>
      )}

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
          paddingVertical: 10,
        }}
      >
        <TouchableOpacity>
          <AntDesign name="hearto" size={20} color="black" />
        </TouchableOpacity>
        <TouchableOpacity>
          <FontAwesome name="comment-o" size={20} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={navigateToViewPost}>
          <AntDesign name="arrowright" size={20} color="black" />
        </TouchableOpacity>
      </View>
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
  feedContent: {
    flex: 1,
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

  card: {
    flex: 1,
    margin: 8,
    borderRadius: 12,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    maxWidth: "48%",
  },
  cardImage: {
    width: width - 40,
    height: (width - 40) * 0.75,
    borderRadius: 20,
    overflow: "hidden",
    alignSelf: "center",
  },
  authorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
  },
  avatar: {
    height: 20,
    width: 20,
  },

  video: {
    width: 350,
    height: 275,
  },

  cardText: {
    padding: 10,
    fontSize: 14,
    fontWeight: "500",
  },

  fullscreenButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
});
