import {
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Switch,
} from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { useTheme } from "@/hooks/theme/ThemeContext.";
import { getStyles } from "@/constants/getStyles";
import { Feather } from "@expo/vector-icons";

export default function Greeting() {
  const router = useRouter();

  const { theme, toggleTheme } = useTheme();

  const dynamicStyles = getStyles(theme);

  const gotToLogin = async () => {
    router.replace("/sign-in");
  };

  const goToRegister = async () => {
    router.replace("/sign-up");
  };

  //#6ED5A9

  return (
    <View style={[styles.container, dynamicStyles.changeBackgroundColor]}>
      <View style={[styles.header]}>
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
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Feather
            name={theme === "dark" ? "moon" : "sun"}
            size={20}
            color={theme === "dark" ? "#fff" : "#000"}
          />
          <Switch value={theme === "dark"} onValueChange={toggleTheme} />
        </View>
      </View>
      <View style={{ alignSelf: "center" }}>
        {theme === "dark" ? (
          <Image
            style={styles.imgGreeting}
            source={require("@/assets/images/whiteGreeting.png")}
          />
        ) : (
          <Image
            style={styles.imgGreeting}
            source={require("@/assets/images/download.jpg")}
          />
        )}
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, dynamicStyles.changeTextColor]}>
          Hello!
        </Text>
        <Text style={styles.text}>
          Welcome to ChatApp, the app just for chatting.
        </Text>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.button} onPress={gotToLogin}>
          <Text
            style={{ textAlign: "center", fontWeight: "bold", color: "#fff" }}
          >
            Login
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={
            theme === "dark" ? styles.dynamicButton1 : styles.dynamicButton2
          }
          onPress={goToRegister}
        >
          <Text
            style={[
              dynamicStyles.changeTextColor,
              { textAlign: "center", fontWeight: "bold" },
            ]}
          >
            Sign Up
          </Text>
        </TouchableOpacity>
      </View>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  img: {
    height: 60,
    width: 60,
    alignSelf: "center",
  },
  imgGreeting: {
    height: 100,
    width: 100,
  },
  content: {
    marginTop: 20,
    alignSelf: "center",
    gap: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
  },
  text: {
    color: "#bdbdbd",
    textAlign: "center",
  },
  buttons: {
    marginTop: 35,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  button: {
    backgroundColor: "#6ED5A9",
    padding: 15,
    borderRadius: 15,
    width: 100,
  },
  dynamicButton1: {
    padding: 15,
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 15,
    width: 100,
  },
  dynamicButton2: {
    padding: 15,
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 15,
    width: 100,
  },
});
