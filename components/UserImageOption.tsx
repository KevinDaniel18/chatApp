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
    <TouchableOpacity
      style={[styles.button, disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={styles.iconContainer}>
        {icon === "image" ? (
          <FontAwesome name={icon} size={24} color={color} />
        ) : (
          <Feather name={icon} size={24} color={color} />
        )}
      </View>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      onDismiss={() => setModalVisible(false)}
      handleIndicatorStyle={styles.indicator}
      backgroundStyle={styles.bottomSheetBackground}
    >
      <BottomSheetView>
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          <Text style={styles.title}>Profile Picture Options</Text>
          <View style={styles.content}>
            <OptionButton
              onPress={uploadAvatar}
              icon="image"
              color="#4CAF50"
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
    backgroundColor: "#f8f9fa",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  iconContainer: {
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
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
