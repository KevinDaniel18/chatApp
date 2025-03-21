import { getStyles } from "@/constants/getStyles";
import { useTheme } from "@/hooks/theme/ThemeContext.";
import { FontAwesome6 } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { useEffect, useRef, useState } from "react";
import { TouchableOpacity, Text, View } from "react-native";
import Slider from "@react-native-community/slider";

export default function AudioPlayer({ file, sliderWidth = "100%" }: any) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(1);
  const [isSeeking, setIsSeeking] = useState(false);
  const animationFrameRef = useRef<number | null>(null);

  const { theme } = useTheme();
  const dynamicStyles: any = getStyles(theme);

  useEffect(() => {
    const updatePosition = async () => {
      if (isPlaying && sound) {
        const status = await sound.getStatusAsync();
        if (status.isLoaded && !status.didJustFinish) {
          setPosition(status.positionMillis);
          setDuration(status.durationMillis || 1);
        }
      }
      animationFrameRef.current = requestAnimationFrame(updatePosition);
    };

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updatePosition);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, sound]);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const handlePlaybackStatusUpdate = async (status: any) => {
    if (status.didJustFinish) {
      setIsPlaying(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      await sound?.setPositionAsync(0);
    } else {
      setPosition(status.positionMillis);
    }
  };

  const togglePlay = async () => {
    if (isSeeking) return;

    if (!sound) {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: file },
        { shouldPlay: true }
      );
      newSound.setOnPlaybackStatusUpdate(handlePlaybackStatusUpdate);
      setSound(newSound);
      setIsPlaying(true);
    } else {
      const status = await sound.getStatusAsync();

      if (status.isLoaded) {
        if (
          status.didJustFinish ||
          status.positionMillis >= status.durationMillis!
        ) {
          await sound.setPositionAsync(0);
          await sound.playAsync();
        } else {
          if (isPlaying) {
            await sound.pauseAsync();
          } else {
            await sound.playAsync();
          }
        }
        setIsPlaying(!isPlaying);
      }
    }
  };

  const seekAudio = async (value: number) => {
    if (sound) {
      await sound.setPositionAsync(value);
      setPosition(value);
      setIsSeeking(false);
    }
  };

  const handleSlidingStart = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
      setIsSeeking(true);
    }
  };

  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity onPress={togglePlay}>
          <FontAwesome6
            name={isPlaying ? "pause" : "play"}
            size={24}
            color={theme === "dark" ? "#fff" : "#000"}
          />
        </TouchableOpacity>
        <Slider
          style={{ width: sliderWidth, height: 40 }}
          minimumValue={0}
          maximumValue={duration}
          value={position}
          onSlidingStart={handleSlidingStart}
          onSlidingComplete={seekAudio}
          minimumTrackTintColor="#1EB1FC"
          maximumTrackTintColor="#8E8E93"
          thumbTintColor="#1EB1FC"
        />
      </View>
      <Text style={dynamicStyles.changeTextColor}>
        {Math.floor(position / 1000)} / {Math.floor(duration / 1000)} sec
      </Text>
    </View>
  );
}
