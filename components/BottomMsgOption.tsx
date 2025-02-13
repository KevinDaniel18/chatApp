import {
  BackHandler,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@/hooks/theme/ThemeContext.";
import { getStyles } from "@/constants/getStyles";
import MessageImage from "./MessageImage";
import { FontAwesome } from "@expo/vector-icons";

export default function BottomMsgOption({
  modalVisible,
  setModalVisible,
  setFiles,
  setLoadingFiles,
  setUploadProgress,
  historyVisible,
  setHistoryVisible,
  setShowDelete,
}: any) {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["10%"], []);

  const { theme } = useTheme();

  const dynamicStyles = getStyles(theme);

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

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (historyVisible) {
          setHistoryVisible(false);
          return true;
        }
        return false;
      }
    );

    return () => backHandler.remove();
  }, [historyVisible]);

  useEffect(() => {
    if (historyVisible) {
      setModalVisible(false);
      setShowDelete(false);
    }
  }, [historyVisible]);

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
      }}
      backgroundStyle={dynamicStyles.changeBackgroundColor}
    >
      <BottomSheetView
        style={[styles.container, dynamicStyles.changeBackgroundColor]}
      >
        <View style={[styles.content]}>
          <MessageImage
            setFiles={setFiles}
            setLoadingFiles={setLoadingFiles}
            setUploadProgress={setUploadProgress}
            setModalVisible={setModalVisible}
          />

          <TouchableOpacity
            onPress={() => setHistoryVisible(true)}
            style={[
              styles.bottom,
              theme === "dark" && { backgroundColor: "#000" },
            ]}
          >
            <FontAwesome
              name="history"
              size={24}
              color={theme === "dark" ? "#fff" : "black"}
            />
            <Text
              style={[{ fontWeight: "700" }, dynamicStyles.changeTextColor]}
            >
              Message Time
            </Text>
          </TouchableOpacity>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    flex: 1,
    padding: 20,
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  bottom: {
    padding: 15,
    borderRadius: 20,
    backgroundColor: "#F2F2F2",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
