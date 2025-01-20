import useAuthStore from "@/hooks/store/authStore";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StatusBar, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { UserProvider } from "@/hooks/user/userContext";
import { ThemeProvider } from "@/hooks/theme/ThemeContext.";

export default function RootLayout() {
  const setRootReady = useAuthStore((state) => state.setRootReady);
  const initialize = useAuthStore((state) => state.initialize);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    initialize();
    setRootReady(true);
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <GestureHandlerRootView>
          <StatusBar translucent backgroundColor="transparent" />
          <BottomSheetModalProvider>
            <UserProvider>
              <Stack>
                <Stack.Screen
                  name="(drawer)"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="user/chat"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="sign-in"
                  options={{ animation: "fade", headerShown: false }}
                />
                <Stack.Screen
                  name="sign-up"
                  options={{ animation: "fade", headerShown: false }}
                />
              </Stack>
            </UserProvider>
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
