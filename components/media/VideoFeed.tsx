import { getStyles } from "@/constants/getStyles";
import { useTheme } from "@/hooks/theme/ThemeContext.";
import { AntDesign, EvilIcons, FontAwesome, FontAwesome6 } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useVideoPlayer, VideoView } from "expo-video";
import React from "react";
import { useState, useRef, useEffect } from "react";
import { StyleSheet, TouchableOpacity, View, Text, Image, Dimensions } from "react-native";

type VideoCardProps = {
  uri: string;
};

const { width } = Dimensions.get("window");

const VideoFeed = React.memo(({ uri}: VideoCardProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const { theme } = useTheme();

  const player = useVideoPlayer(uri, (player) => {
    player.play();
    player.loop = true;
    player.muted = true;
  });

  const videoRef = useRef<VideoView>(null);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;

    if (player && isFullscreen) {
      progressInterval = setInterval(() => {
        if (player.currentTime !== undefined && player.duration !== undefined) {
          setProgress(player.currentTime);
          setDuration(player.duration);
        }
      }, 200);
    }

    return () => {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };
  }, [player, isFullscreen]);

  const handleEnterFullscreen = () => {
    videoRef.current?.enterFullscreen();
    setIsFullscreen(true);
  };

  const handleExitFullscreen = () => {
    setIsFullscreen(false);
  };

  const handleProgressChange = (value: number) => {
    if (player && player.currentTime !== undefined) {
      player.currentTime = value;
      setProgress(value);
    }
  };

  return (
    <View style={styles.container}>
      <VideoView
        ref={videoRef}
        style={styles.cardImage}
        player={player}
        allowsFullscreen
        allowsPictureInPicture
        nativeControls={false}
      />

      {isFullscreen && (
        <View style={styles.progressContainer}>
          <Slider
            style={styles.progressBar}
            minimumValue={0}
            maximumValue={duration || 100}
            value={progress}
            onSlidingComplete={handleProgressChange}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="rgba(255, 255, 255, 0.5)"
            thumbTintColor="#FFFFFF"
          />
        </View>
      )}
      
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    marginTop: 10
  },
  cardImage: {
    width: width - 40,
    height: (width - 40) * 0.75,
    borderRadius: 20,
    overflow: "hidden",
    alignSelf: "center",
  },
  progressContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  progressBar: {
    width: "100%",
    height: 40,
  },
});

export default VideoFeed;
