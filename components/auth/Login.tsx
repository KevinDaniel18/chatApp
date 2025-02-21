import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  BackHandler,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import useAuthStore from "@/hooks/store/authStore";
import { router, useFocusEffect } from "expo-router";
import { useTheme } from "@/hooks/theme/ThemeContext.";
import { getStyles } from "@/constants/getStyles";
import { showToast } from "@/constants/toast";
import { AntDesign } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";

interface LoginProps {
  login: (email: string, password: string) => Promise<any>;
  loginWithSupabase: (email: string, password: string) => Promise<any>;
}
export default function Login({ login, loginWithSupabase }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const isLoading = useAuthStore((state) => state.isLoading);
  const isFirstTime = useAuthStore((state) => state.isFirstTime);
  const setIsFirstTime = useAuthStore((state) => state.setIsFirstTime);
  const { theme } = useTheme();

  const dynamicStyles = getStyles(theme);

  useEffect(() => {
    const backAction = () => {
      BackHandler.exitApp();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  async function handleLogin() {
    if (!email || !password) {
      showToast("Please enter both email and password");
      return;
    }

    try {
      const res = await login(email, password); //llamo al login de authStore
      if (res && res.error) {
        showToast(res.msg);
        return;
      }
      const resSupabase = await loginWithSupabase(email, password);
      if (resSupabase && resSupabase.error) {
        return;
      }
      setIsFirstTime(false);
    } catch (error: any) {
      Alert.alert("Login failed, Please check your credentials and try again");
    }
  }

  useFocusEffect(
    useCallback(() => {
      async function getStorageName() {
        const storageName = await SecureStore.getItemAsync("USER_NAME");
        if (storageName) {
          setUserName(JSON.parse(storageName));
        }
      }
      getStorageName();
    }, [])
  );

  return (
    <View style={[styles.container, dynamicStyles.changeBackgroundColor]}>
      <View style={styles.header}>
        <View
          style={
            theme === "light"
              ? { backgroundColor: "#6ED5A9", width: 100, borderRadius: 20 }
              : {
                  borderWidth: 1,
                  borderColor: "#6ED5A9",
                  width: 100,
                  borderRadius: 20,
                }
          }
        >
          <Image
            style={styles.img}
            source={require("@/assets/images/chatApp-logo.png")}
          />
        </View>
      </View>
      <View style={{ paddingVertical: 20, gap: 10 }}>
        {isFirstTime ? (
          <>
            <Text style={[styles.title, dynamicStyles.changeTextColor]}>
              Sign In
            </Text>
            <Text style={{ color: "#a7a7a7" }}>Enter your credentials</Text>
          </>
        ) : (
          <>
            <Text style={[styles.title, dynamicStyles.changeTextColor]}>
              Welcome Back! {userName && userName.split(" ").at(0)}
            </Text>
            <Text style={{ color: "#a7a7a7" }}>Sign in to continue</Text>
          </>
        )}
      </View>
      <View style={styles.content}>
        <View style={{ marginBottom: 40 }}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={[styles.input, theme === "dark" && { color: "#fff" }]}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        <View style={{ marginBottom: 20 }}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={[styles.input, theme === "dark" && { color: "#fff" }]}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
          }}
        >
          <Text style={dynamicStyles.changeTextColor}>Forgot Password?</Text>
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Sign in</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={{ marginVertical: 50, alignSelf: "center" }}>
        <Text
          style={[
            { marginBottom: 10, fontWeight: "600" },
            dynamicStyles.changeTextColor,
          ]}
        >
          Or via
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: "#E3483E",
            padding: 8,
            borderRadius: 20,
            alignSelf: "center",
          }}
        >
          <AntDesign name="google" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={{ alignSelf: "center" }}>
        <Text style={[dynamicStyles.changeTextColor]}>
          Don't have an account?{" "}
          <Text
            style={{ color: "#6ED5A9" }}
            onPress={() => router.navigate("/sign-up")}
          >
            Sign Up
          </Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginTop: 15,
  },
  title: {
    fontSize: 25,
    fontWeight: "400",
  },
  img: {
    height: 60,
    width: 60,
    alignSelf: "center",
  },
  content: {
    marginTop: 20,
  },
  label: {
    fontSize: 15,
    marginBottom: 8,
    color: "#a7a7a7",
  },
  input: {
    width: "100%",
    height: 40,
    borderBottomColor: "gray",
    borderBottomWidth: 1,
    paddingHorizontal: 10,
    color: "#000",
  },
  button: {
    marginTop: 30,
    backgroundColor: "#6ED5A9",
    padding: 10,
    borderRadius: 15,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
});
