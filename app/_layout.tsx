import useAuthStore from "@/hooks/store/authStore";
import { Stack, router } from "expo-router";
import { useEffect } from "react";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { UserProvider } from "@/hooks/user/userContext";
import { ThemeProvider } from "@/hooks/theme/ThemeContext.";
import LoadingScreen from "@/components/LoadingScreen";

export default function RootLayout() {
  const setRootReady = useAuthStore((state) => state.setRootReady);
  const initialize = useAuthStore((state) => state.initialize);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isFirstTime = useAuthStore((state) => state.isFirstTime);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const error = useAuthStore((state) => state.error);

  useEffect(() => {
    initialize();
    setRootReady(true);
  }, []);

  useEffect(() => {
    if (!isLoading && !error) {
      if (isAuthenticated) {
        router.replace("/(drawer)");
      } else if (isFirstTime) {
        router.replace("/greeting");
      } else {
        router.replace("/sign-in");
      }
    }
  }, [isLoading, isAuthenticated, isFirstTime, error]);

  if (isLoading) {
    return (
      <ThemeProvider>
        <LoadingScreen />
      </ThemeProvider>
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
                  name="greeting"
                  options={{
                    headerShown: false,
                    animation: "fade",
                  }}
                />
                <Stack.Screen
                  name="user/chat"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="user/update-user"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="user/user-profile"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="media/view-post"
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
