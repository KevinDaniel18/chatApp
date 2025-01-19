import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import useAuthStore from "@/hooks/store/authStore";
import { Redirect } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import CustomDrawerContent from "@/components/CustomDrawerContent";
import { UserProvider, useUser } from "@/hooks/user/userContext";
import SearchBar from "@/components/SearchBar";
import { SearchProvider } from "@/hooks/search/searchContext";
import { useSocketStore } from "@/hooks/store/socketStore";
import { useEffect } from "react";
import { usePushNotifications } from "@/notifications/setupNotifications";
import { saveNotificationToken } from "@/endpoints/endpoint";
import * as SecureStore from "expo-secure-store";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DrawerLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { initializeSocket } = useSocketStore((state) => state);
  const { expoPushToken, notification } = usePushNotifications();

  useEffect(() => {
    async function expoPush() {
      try {
        const userId = await SecureStore.getItemAsync("USER_ID");
        await saveNotificationToken(Number(userId), expoPushToken);
        console.log("expo push token enviado:", expoPushToken);
      } catch (error) {
        console.error(error);
      }
    }
    expoPush();
  }, [expoPushToken]);

  useEffect(() => {
    if (notification) {
      console.log("Notificacion recibida", notification);
    }
  }, [notification]);

  useEffect(() => {
    if (isAuthenticated) {
      initializeSocket();
    }
  }, [isAuthenticated, initializeSocket]);

  return isAuthenticated ? (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SearchProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
          <Drawer
            drawerContent={CustomDrawerContent}
            screenOptions={{
              drawerActiveBackgroundColor: "#E8F5E9",
              drawerActiveTintColor: "black",
            }}
          >
            <Drawer.Screen
              name="index"
              options={{
                title: "Home",
                drawerIcon: ({ size, color }) => (
                  <AntDesign name="home" size={size} color={color} />
                ),
                header: (props) => <SearchBar {...props} />,
              }}
            />
            <Drawer.Screen
              name="current-chat"
              options={{
                title: "Chat",
                drawerIcon: ({ size, color }) => (
                  <Ionicons name="chatbox-outline" size={size} color={color} />
                ),
                headerShown: false,
              }}
            />
          </Drawer>
        </SafeAreaView>
      </SearchProvider>
    </GestureHandlerRootView>
  ) : (
    <Redirect href={"/sign-in"} />
  );
}
