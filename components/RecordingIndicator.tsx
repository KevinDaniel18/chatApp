import { getStyles } from "@/constants/getStyles";
import { useTheme } from "@/hooks/theme/ThemeContext.";
import { useEffect, useRef } from "react";
import { View, Text, Animated } from "react-native";

export const RecordingIndicator = ({
  isRecording,
}: {
  isRecording: boolean;
}) => {
  const { theme } = useTheme();
  const dynamicStyles = getStyles(theme);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRecording) {
      // Create repeating pulse animation
      const pulseAnimation = Animated.parallel([
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ]);

      // Loop the animation
      Animated.loop(pulseAnimation).start();
    }

    return () => {
      // Reset animations when component unmounts or recording stops
      fadeAnim.setValue(1);
      scaleAnim.setValue(1);
    };
  }, [isRecording]);

  if (!isRecording) return null;

  return (
    <View>
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: "#ff0000",
              marginRight: 8,
            }}
          />
          <Text
            style={[dynamicStyles.changeTextColor, { textAlign: "center" }]}
          >
            Recording audio
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};
