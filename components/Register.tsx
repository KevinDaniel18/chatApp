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
import React, { useEffect, useState } from "react";
import useAuthStore from "@/hooks/store/authStore";
import { useTheme } from "@/hooks/theme/ThemeContext.";
import { getStyles } from "@/constants/getStyles";
import { showToast } from "@/constants/toast";
import { AntDesign } from "@expo/vector-icons";
import { router } from "expo-router";

interface RegisterProps {
  register: (name: string, email: string, password: string) => Promise<any>;
}
export default function Register({ register }: RegisterProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false)
  const { theme } = useTheme();

  const dynamicStyles = getStyles(theme);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        router.push("/sign-in");
        return true;
      }
    );

    return () => backHandler.remove();
  }, []);

  async function handleRegister() {
    if (!name || !email || !password) {
      showToast("Please enter name, email and password");
      return;
    }
    setIsLoading(true)
    try {
      const res = await register(name, email, password);
      if (res && res.error) {
        showToast(res.msg);
        return;
      }
    } catch (error: any) {
      Alert.alert(
        "Register failed, Please check your credentials and try again"
      );
    }finally{
      setIsLoading(false)
    }
  }
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
        <Text style={[styles.title, dynamicStyles.changeTextColor]}>
          Sign Up
        </Text>
        <Text style={{ color: "#a7a7a7" }}>Create you account</Text>
      </View>

      <View style={{ marginTop: 20 }}>
        <View style={{ marginBottom: 40 }}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={[styles.input, theme === "dark" && { color: "#fff" }]}
            value={name}
            onChangeText={setName}
          />
        </View>
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
        <View>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={[styles.input, theme === "dark" && { color: "#fff" }]}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size={"small"} />
          ) : (
            <Text style={styles.buttonText}>Register</Text>
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
          Already have an account?{" "}
          <Text
            style={{ color: "#6ED5A9" }}
            onPress={() => router.navigate("/sign-in")}
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
  img: {
    height: 60,
    width: 60,
    alignSelf: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
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
  },
  button: {
    marginTop: 50,
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
