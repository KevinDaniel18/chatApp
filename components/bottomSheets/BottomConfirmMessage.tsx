import {
  BackHandler,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTheme } from "@/hooks/theme/ThemeContext.";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { getStyles } from "@/constants/getStyles";
import { AntDesign } from "@expo/vector-icons";
import { User } from "../chat/PendingMessages";
import { router } from "expo-router";
import { useUser } from "@/hooks/user/userContext";
import { useSocket } from "@/hooks/store/socketStore";

interface BottomConfirmMessageProps {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  selectedUser: User | null;
}

export default function BottomConfirmMessage({
  modalVisible,
  setModalVisible,
  selectedUser,
}: BottomConfirmMessageProps) {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["40%"], []);
  const { theme } = useTheme();
  const { userId } = useUser();

  const dynamicStyles = getStyles(theme);
  const socket = useSocket();

  function navigateToChat(receiverId: number, userName: string) {
    setModalVisible(false);
    bottomSheetModalRef.current?.dismiss();
    
    socket!.emit("enterChat", { userId, receiverId: selectedUser?.id });
    router.push({
      pathname: "/user/chat",
      params: { receiverId, userName },
    });
  }

  useEffect(() => {
    if (modalVisible) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [modalVisible]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (modalVisible) {
          setModalVisible(false);
          return true;
        }
        return false;
      }
    );

    return () => backHandler.remove();
  }, [modalVisible]);

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
  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={1}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      onDismiss={() => setModalVisible(false)}
      handleIndicatorStyle={{
        backgroundColor: theme === "dark" ? "#ffffff" : "#000000",
        width: 40,
        height: 4,
      }}
      backgroundStyle={[
        styles.modalBackground,
        dynamicStyles.changeBackgroundColor,
      ]}
    >
      <BottomSheetView
        style={[styles.container, dynamicStyles.changeBackgroundColor]}
      >
        <View style={styles.header}>
          <TouchableOpacity>
            <AntDesign
              name="question"
              size={20}
              color={theme === "dark" ? "#fff": "#000"}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Image
            source={
              selectedUser?.profilePicture
                ? { uri: selectedUser?.profilePicture }
                : require("@/assets/images/defaultProfile.jpg")
            }
            style={styles.avatar}
          />
          <Text style={[styles.name, dynamicStyles.changeTextColor]}>
            {selectedUser?.name}
          </Text>
          <Text style={[styles.text, dynamicStyles.changeTextColor]}>
            Wants to connect with you!
          </Text>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.connectButton]}
            onPress={() =>
              navigateToChat(Number(selectedUser?.id), selectedUser?.name!)
            }
          >
            <Text style={[styles.buttonText, styles.connectButtonText]}>
              Connect
            </Text>
          </TouchableOpacity>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  container: {
    padding: 24,
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 20,
  },
  content: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  avatar: {
    height: 100,
    width: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    textAlign: "center",
    color: "#666666",
    marginBottom: 24,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
    marginRight: 8,
  },
  connectButton: {
    backgroundColor: "#007AFF",
    marginLeft: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  connectButtonText: {
    color: "#ffffff",
  },
});
