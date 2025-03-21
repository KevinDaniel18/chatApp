import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { VideoView, useVideoPlayer } from "expo-video";
import { useTheme } from "@/hooks/theme/ThemeContext.";
import { getStyles } from "@/constants/getStyles";
import { format } from "date-fns";
import { useUser } from "@/hooks/user/userContext";
import Slider from "@react-native-community/slider";

const { width } = Dimensions.get("window");

export default function ViewPosts() {
  const { profilePicture, author, createdAt, file, description } =
    useLocalSearchParams();

  const { userId } = useUser();
  const [progress, setProgress] = useState(0);
  const [previewProgress, setPreviewProgress] = useState<number | null>(null);
  const [duration, setDuration] = useState(0);
  const { theme } = useTheme();
  const dynamicStyles = getStyles(theme);
  const insets = useSafeAreaInsets();
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });

  const [lastUpdateTime, setLastUpdateTime] = useState(0);

  const data = {
    profilePicture: Array.isArray(profilePicture)
      ? profilePicture[0]
      : profilePicture,
    author: JSON.parse(author as string),
    createdAt: Array.isArray(createdAt) ? createdAt[0] : createdAt,
    file: Array.isArray(file) ? file[0] : file,
    description: Array.isArray(description) ? description[0] : description,
  };

  const videoRef = useRef<VideoView>(null);
  const player = useVideoPlayer(data.file, (player) => {
    player.play();
    player.loop = false;
    player.muted = true;
  });

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    if (player) {
      progressInterval = setInterval(() => {
        if (
          player &&
          player.currentTime !== undefined &&
          player.duration !== undefined
        ) {
          const now = Date.now();
          // Only update if at least 60ms have passed since last update
          if (now - lastUpdateTime >= 60) {
            setProgress(player.currentTime);
            setDuration(player.duration);
            setLastUpdateTime(now);
          }
        }
      }, 16); // More frequent checking, but controlled updates
    }

    return () => {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };
  }, [player, lastUpdateTime]);

  const handleEnterFullscreen = () => {
    videoRef.current?.enterFullscreen();
  };

  const handleExitFullscreen = () => {
    videoRef.current?.exitFullscreen();
  };

  const handleProgressChange = (value: number) => {
    if (player && player.currentTime !== undefined) {
      player.currentTime = value;
      setProgress(value);
      player.play();
    }
  };

  function isImage(fileUrl: string) {
    const ext = fileUrl.split(".").pop()?.toLowerCase();
    return ["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "");
  }

  function isVideo(fileUrl: string) {
    const ext = fileUrl.split(".").pop()?.toLowerCase();
    return ["mp4", "mov", "avi", "mkv", "webm"].includes(ext || "");
  }

  useEffect(() => {
    if (data.file && isImage(data.file)) {
      Image.getSize(data.file, (imgWidth, imgHeight) => {
        const maxWidth = width - 40;
        const scaleFactor = imgWidth / maxWidth;
        const imageHeight = imgHeight / scaleFactor;
        setImageDimensions({ width: maxWidth, height: imageHeight });
      });
    }
  }, [data.file]);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { marginTop: insets.top }]}>
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity onPress={() => router.back()}>
            <AntDesign name="arrowleft" size={24} color="black" />
          </TouchableOpacity>

          <Text style={[styles.headerText, dynamicStyles.changeTextColor]}>
            {data.author.name}'s post
          </Text>
        </View>

        <Image
          style={{ width: 30, height: 30, borderRadius: 20 }}
          source={
            data.profilePicture
              ? { uri: data.profilePicture }
              : require("@/assets/images/defaultProfile.jpg")
          }
        />
      </View>

      <ScrollView style={{ borderBottomWidth: 1, borderBottomColor: "#eee" }}>
        {data.file && isImage(data.file) && (
          <View
            style={[
              styles.image,
              { width: imageDimensions.width, height: imageDimensions.height },
            ]}
          >
            <Image
              style={{ width: "100%", height: "100%" }}
              source={{ uri: data.file }}
              resizeMode="contain"
            />
          </View>
        )}

        {data.file && isVideo(data.file) && (
          <>
            <View style={styles.video}>
              <VideoView
                style={{ width: "100%", height: "100%" }}
                ref={videoRef}
                player={player}
                allowsFullscreen
                allowsPictureInPicture
                nativeControls={false}
              />
            </View>

            {player && (
              <>
                <Slider
                  style={styles.progressBar}
                  minimumValue={0}
                  maximumValue={duration || 100}
                  value={progress}
                  onSlidingStart={() => {
                    if (player) {
                      player.pause();
                    }
                  }}
                  onValueChange={(value) => {
                    setPreviewProgress(value);
                  }}
                  onSlidingComplete={(value) => {
                    handleProgressChange(value);
                    setPreviewProgress(null);
                  }}
                  minimumTrackTintColor={theme === "dark" ? "#fff" : "#000"}
                  maximumTrackTintColor="gray"
                  thumbTintColor={theme === "dark" ? "#fff" : "#000"}
                />

                <Text style={{ textAlign: "center" }}>
                  {formatTime(
                    previewProgress !== null ? previewProgress : progress
                  )}{" "}
                  / {formatTime(duration)}
                </Text>
              </>
            )}
          </>
        )}

        {!data.file && (
          <View style={styles.postInfo}>
            {data.description && (
              <Text
                style={[dynamicStyles.changeTextColor, { marginBottom: 10 }]}
              >
                {data.description}
              </Text>
            )}
            <Text style={{ color: "#b5b5b5", fontSize: 12 }}>
              {format(new Date(data.createdAt), "MM/dd/yyyy")}
            </Text>
          </View>
        )}

        <View style={styles.postOptions}>
          <TouchableOpacity>
            <AntDesign name="hearto" size={20} color="black" />
          </TouchableOpacity>
          {data.file && (
            <TouchableOpacity>
              <AntDesign name="download" size={20} color="black" />
            </TouchableOpacity>
          )}
          {Number(data.author.id) === userId && (
            <TouchableOpacity>
              <AntDesign name="delete" size={20} color="red" />
            </TouchableOpacity>
          )}
        </View>

        {data.file && (
          <View style={styles.postInfo}>
            {data.description && (
              <Text
                style={[dynamicStyles.changeTextColor, { marginBottom: 10 }]}
              >
                {data.description}
              </Text>
            )}
            <Text style={{ color: "#b5b5b5", fontSize: 12 }}>
              {format(new Date(data.createdAt), "MM/dd/yyyy")}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginHorizontal: 20,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 15,
  },
  image: {
    borderRadius: 20,
    overflow: "hidden",
    alignSelf: "center",
    backgroundColor: "#000",
  },
  video: {
    overflow: "hidden",
    borderRadius: 20,
    width: width,
    height: width * 1.77,
    resizeMode: "cover",
  },
  postOptions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
    paddingHorizontal: 20,
  },
  postInfo: {
    padding: 20,
  },
  progressBar: {
    width: "100%",
    height: 40,
  },
});
