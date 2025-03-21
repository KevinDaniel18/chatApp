import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Linking,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "@react-navigation/drawer";
import useAuthStore from "@/hooks/store/authStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Avatar from "./user/Avatar";
import { useUser } from "@/hooks/user/userContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import BottomConfiguration from "./bottomSheets/BottomConfiguration";
import { useTheme } from "@/hooks/theme/ThemeContext.";
import { getStyles } from "@/constants/getStyles";
import { pushUserProfile } from "../constants/pushUserProfile";

export default function CustomDrawerContent(props: any) {
  const { logout } = useAuthStore();
  const { bottom } = useSafeAreaInsets();
  const { userData, userId } = useUser();
  const [modalVisible, setModalVisible] = useState(false);
  const { theme } = useTheme();

  const dynamicStyles = getStyles(theme);

  function contactMe() {
    const linkedinUrl =
      "https://www.linkedin.com/in/kevin-sierra-castro-b1448b279/";
    Linking.openURL(linkedinUrl).catch((err) =>
      console.error("Error opening linkedin", err)
    );
  }

  const goToUserProfile = () => {
    pushUserProfile({
      id: userId,
      name: userData?.name,
      profilePicture: userData?.profilePicture,
      likes: userData?.likes,
      about: userData?.about,
    });
  };

  async function onLogout() {
    try {
      await logout();
    } catch (error) {
      console.error("Error during logout", error);
    }
  }

  return (
    <View style={[{ flex: 1 }, dynamicStyles.changeBackgroundColor]}>
      <DrawerContentScrollView {...props}>
        <View style={{ paddingBottom: 20 }}>
          <Avatar size={100} url={userData?.profilePicture!} />
          <Text
            style={[styles.name, dynamicStyles.changeTextColor]}
            onPress={goToUserProfile}
          >
            {userData?.name}
          </Text>
        </View>

        <DrawerItemList {...props} />

        <DrawerItem
          label={"Logout"}
          labelStyle={{ color: theme === "dark" ? "#fff" : "#000" }}
          onPress={onLogout}
          icon={() => (
            <MaterialIcons
              name="exit-to-app"
              size={24}
              color={theme === "dark" ? "white" : "black"}
            />
          )}
        />
      </DrawerContentScrollView>

      <View style={[styles.footer, { paddingBottom: 20 + bottom }]}>
        <TouchableOpacity onPress={contactMe}>
          <Text style={{ color: "#1465bb" }}>Contact me</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons
            name="settings-outline"
            size={24}
            color={theme === "dark" ? "#fff" : "#000"}
          />
        </TouchableOpacity>
      </View>
      <BottomConfiguration
        modalVisible={modalVisible || false}
        setModalVisible={() => setModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    borderTopColor: "#EAEAEA",
    borderTopWidth: 1,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  image: {
    width: 100,
    height: 100,
    alignSelf: "center",
  },
  name: {
    alignSelf: "center",
    fontWeight: "500",
    fontSize: 18,
    paddingTop: 10,
  },
});
