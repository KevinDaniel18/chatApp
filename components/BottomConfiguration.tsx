import {
  BackHandler,
  Image,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useUser } from "@/hooks/user/userContext";
import { getStyles } from "@/constants/getStyles";
import { useTheme } from "@/hooks/theme/ThemeContext.";
import { router } from "expo-router";

export default function BottomConfiguration({
  modalVisible,
  setModalVisible,
}: any) {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["24%", "50%", "90%"], []);
  const { userData, fetchUser } = useUser();
  const { theme, toggleTheme } = useTheme();

  const dynamicStyles = getStyles(theme);
  useEffect(() => {
    if (modalVisible) {
      fetchUser();

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

  function navigateToUpdateUser() {
    setModalVisible(false);
    router.push("/user/update-user");
  }

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
        <BottomSheetScrollView>
          <Text style={[styles.header, dynamicStyles.changeTextColor]}>
            Settings
          </Text>

          <Text style={[styles.title, dynamicStyles.changeTextColor]}>
            Account
          </Text>
          <TouchableOpacity
            style={styles.accountContainer}
            onPress={navigateToUpdateUser}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 15 }}
            >
              <Image
                source={
                  userData?.profilePicture
                    ? { uri: userData?.profilePicture }
                    : require("@/assets/images/defaultProfile.jpg")
                }
                style={styles.image}
              />
              <View style={{ gap: 4 }}>
                <Text
                  style={[{ fontWeight: "700" }, dynamicStyles.changeTextColor]}
                >
                  {userData?.name}
                </Text>
                <Text
                  style={[{ color: "gray" }, dynamicStyles.changeTextColor]}
                >
                  Personal Info
                </Text>
              </View>
            </View>
            <AntDesign
              name="right"
              size={24}
              color={theme === "dark" ? "#fff" : "#000"}
            />
          </TouchableOpacity>

          <Text style={[styles.title, dynamicStyles.changeTextColor]}>
            Setting
          </Text>

          <View style={{ gap: 20 }}>
            <TouchableOpacity style={styles.settingItem}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 20 }}
              >
                <View style={[styles.icon, { backgroundColor: "#E8F5E9" }]}>
                  <Ionicons name="notifications" size={24} color="#009929" />
                </View>

                <Text style={dynamicStyles.changeTextColor}>Notifications</Text>
              </View>
              <Switch />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem} onPress={toggleTheme}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 20 }}
              >
                <View style={[styles.icon, { backgroundColor: "#81c9fa" }]}>
                  <Ionicons name="moon" size={24} color="#1465bb" />
                </View>
                <Text style={dynamicStyles.changeTextColor}>Dark Mode</Text>
              </View>
              <Switch value={theme === "dark"} onValueChange={toggleTheme} />
            </TouchableOpacity>
          </View>
        </BottomSheetScrollView>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    overflow: "hidden",
    flex: 1,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 20,
  },
  accountContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  image: {
    height: 60,
    width: 60,
    borderRadius: 15,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  icon: {
    padding: 15,
    borderRadius: 20,
  },
});
