import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
} from "react-native";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { FontAwesome, Feather } from "@expo/vector-icons";
import { useTheme } from "@/hooks/theme/ThemeContext.";
import { getStyles } from "@/constants/getStyles";

export default function UserImageOption({
  modalVisible,
  setModalVisible,
  uploadAvatar,
  deleteAvatar,
  avatarUrl,
}: {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  uploadAvatar: () => void;
  deleteAvatar: () => void;
  avatarUrl: string | null;
}) {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["30%"], []);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { theme } = useTheme();
  const dynamicStyles = getStyles(theme);

  useEffect(() => {
    if (modalVisible) {
      bottomSheetModalRef.current?.present();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => bottomSheetModalRef.current?.dismiss());
    }
  }, [modalVisible, fadeAnim]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
      />
    ),
    []
  );

  const OptionButton = ({
    onPress,
    icon,
    color,
    label,
    disabled = false,
  }: any) => (
    <View style={{ gap: 10 }}>
      <TouchableOpacity
        style={[
          styles.button,
          disabled && styles.buttonDisabled,
          theme === "dark" && { backgroundColor: "#000" },
        ]}
        onPress={onPress}
        disabled={disabled}
      >
        {icon === "image" ? (
          <FontAwesome name={icon} size={24} color={color} />
        ) : (
          <Feather name={icon} size={24} color={color} />
        )}
      </TouchableOpacity>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      onDismiss={() => setModalVisible(false)}
      handleIndicatorStyle={styles.indicator}
      backgroundStyle={[
        styles.bottomSheetBackground,
        theme === "dark" && { backgroundColor: "#171718" },
      ]}
    >
      <BottomSheetView>
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          <Text style={[styles.title, dynamicStyles.changeTextColor]}>
            Profile Picture Options
          </Text>
          <View style={styles.content}>
            <OptionButton
              onPress={uploadAvatar}
              icon="image"
              color={theme === "dark" ? "#fff" : "#000"}
              label="Select Image"
            />
            <OptionButton
              onPress={deleteAvatar}
              icon="trash"
              color="#F44336"
              label="Delete Image"
              disabled={!avatarUrl}
            />
          </View>
        </Animated.View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  bottomSheetBackground: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: "#fff",
  },
  container: {
    padding: 24,
    overflow: "hidden",
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  button: {
    alignItems: "center",
    padding: 20,
    borderRadius: 20,
    backgroundColor: "#F2F2F2",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    color: "#333",
  },
  indicator: {
    backgroundColor: "#bbb",
    width: 40,
  },
});
