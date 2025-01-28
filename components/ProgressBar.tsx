import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";

const ProgressBar = ({
  progress = 0,
  height = 10,
  backgroundColor = "#e0e0df",
  progressColor = "#3b82f6",
  borderRadius = 5,
  duration = 200,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: progress,
      duration: duration,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const progressWidth = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
    extrapolate: "clamp"
  });

  return (
    <View
      style={[
        styles.container,
        {
          height: height,
          backgroundColor: backgroundColor,
          borderRadius: borderRadius,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.progress,
          {
            width: progressWidth,
            backgroundColor: progressColor,
            borderRadius: borderRadius,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    overflow: "hidden",
  },
  progress: {
    height: "100%",
  },
});

export default ProgressBar;
