import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Linking,
} from "react-native";
import React from "react";
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "@react-navigation/drawer";
import useAuthStore from "@/hooks/store/authStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Avatar from "./Avatar";
import { useUser } from "@/hooks/user/userContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function CustomDrawerContent(props: any) {
  const { logout } = useAuthStore();
  const { bottom } = useSafeAreaInsets();
  const { userData } = useUser();

  function contactMe() {
    const linkedinUrl =
      "https://www.linkedin.com/in/kevin-sierra-castro-b1448b279/";
    Linking.openURL(linkedinUrl).catch((err) =>
      console.error("Error opening linkedin", err)
    );
  }
  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props} scrollEnabled={false}>
        <View style={{paddingBottom: 20}}>
          <Avatar size={100} url={userData?.profilePicture!} />
          <Text style={styles.name}>{userData?.name}</Text>
        </View>

        <DrawerItemList {...props} />

        <DrawerItem
          label={"Logout"}
          onPress={logout}
          icon={() => (
            <MaterialIcons name="exit-to-app" size={24} color="black" />
          )}
        />
      </DrawerContentScrollView>

      <View style={[styles.footer, { paddingBottom: 20 + bottom }]}>
        <TouchableOpacity onPress={contactMe}>
          <Text style={{ color: "#1465bb" }}>Contact me</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>
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
