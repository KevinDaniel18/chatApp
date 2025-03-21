import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  TextInput,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  BackHandler,
  Alert,
} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useTheme } from "@/hooks/theme/ThemeContext.";
import { getStyles } from "@/constants/getStyles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { updateUser, deleteUser } from "@/endpoints/endpoint";
import { useUser } from "@/hooks/user/userContext";
import { showToast } from "@/constants/toast";
import * as LocalAuthentication from "expo-local-authentication";
import useAuthStore from "@/hooks/store/authStore";
import { Entypo } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";

interface UpdateUserProps {
  name?: string | undefined;
}

export default function UpdateUser() {
  const [data, setData] = useState<UpdateUserProps>({ name: "" });
  const [passwordDelete, setPasswordDelete] = useState("");
  const [isPassVisible, setIsPassVisible] = useState(false);
  const { theme } = useTheme();
  const { logout} = useAuthStore();

  const { userId, userData, fetchUser } = useUser();
  const dynamicStyles = getStyles(theme);
  const insets = useSafeAreaInsets();

  const isFormValid = Object.values(data).some((value) => value.trim() !== "");

  function handleInputChange(field: any, value: any) {
    setData((prevData) => ({ ...prevData, [field]: value }));
  }

  async function handleUpdate() {
    try {
      const trimmedData = {
        ...data,
        name: data.name?.trim(),
      };
      const res = await updateUser(userId!, trimmedData);
      if (res.status === 200) {
        const updatedFields = res.data.updatedFields.join(", ") || [];
        if (updatedFields === "name") {
          showToast("Name updated successfully");
          fetchUser();
        }
      }
      setData({ name: "" });
      Keyboard.dismiss();
      return res;
    } catch (error) {
      console.error(error);
    }
  }

  async function authAndDelete() {
    const hasBiometricAuth = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (hasBiometricAuth && isEnrolled) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Confirm your identity to delete the account",
        fallbackLabel: "Enter your password",
      });

      if (result.success) {
        return handleDeleteAccount(true);
      }
    }

    setIsPassVisible(true);
  }

  async function handleDeleteAccount(isBiometric = false) {
    try {
      const res = await deleteUser(
        Number(userId),
        isBiometric ? undefined : passwordDelete,
        isBiometric
      );
      if (res.status === 200) {
        showToast("User deleted successfully");
        await SecureStore.deleteItemAsync("USER_NAME");
        await logout();
      }
    } catch (error) {
      console.error(error);
    }
  }

  function confirmPassword() {
    if (passwordDelete.trim().length === 0) {
      return Alert.alert("Error", "Please enter your password");
    }

    setIsPassVisible(false);
    handleDeleteAccount(false);
  }

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        router.back();
        return true;
      }
    );

    return () => backHandler.remove();
  }, []);

  return (
    <View style={[styles.container]}>
      <View style={[styles.header, { marginTop: insets.top }]}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()}>
            <AntDesign
              name="arrowleft"
              size={28}
              color={theme === "dark" ? "white" : "black"}
            />
          </TouchableOpacity>
          <Text style={[styles.text, dynamicStyles.changeTextColor]}>
            Account
          </Text>
        </View>

        {isFormValid && (
          <TouchableOpacity onPress={handleUpdate}>
            <AntDesign name="check" size={24} color="green" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Name</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder={userData?.name.toString()}
              value={data.name}
              onChangeText={(text) => handleInputChange("name", text)}
            />
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => {
          setIsPassVisible(false);
          authAndDelete();
        }}
      >
        <Text style={{ color: "#f46748" }}>Delete Account</Text>
      </TouchableOpacity>

      {isPassVisible && (
        <View style={styles.passwordModal}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Text style={[styles.modalText, dynamicStyles.changeTextColor]}>
              Enter your password
            </Text>
            <TouchableOpacity onPress={() => setIsPassVisible(false)}>
              <AntDesign
                name="close"
                size={24}
                color={theme === "dark" ? "white" : "black"}
              />
            </TouchableOpacity>
          </View>
          <Text style={{ marginBottom: 10, color: "#a7a7a7" }}>
            To confirm that this account belongs to you, enter your password to
            delete your account.
          </Text>
          <TextInput
            style={styles.inputDelete}
            placeholder="Password"
            secureTextEntry
            value={passwordDelete}
            onChangeText={setPasswordDelete}
          />
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={confirmPassword}
          >
            <Text style={{ color: "white" }}>Confirm</Text>
          </TouchableOpacity>

          <View style={{ marginVertical: 20, alignSelf: "center" }}>
            <Text
              style={[
                { marginBottom: 10, fontWeight: "600" },
                dynamicStyles.changeTextColor,
              ]}
            >
              Or use
            </Text>
            <TouchableOpacity
              style={{
                padding: 8,
                borderRadius: 20,
                alignSelf: "center",
              }}
              onPress={() => {
                setIsPassVisible(false);
                authAndDelete();
              }}
            >
              <Entypo
                name="fingerprint"
                size={40}
                color={theme === "dark" ? "white" : "black"}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginHorizontal: 20,
    justifyContent: "space-between",
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 15,
  },
  content: {
    padding: 20,
  },
  inputContainer: {
    flexDirection: "column",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: "black",
    fontWeight: "500",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1, // Añadida línea inferior
    borderBottomColor: "#ccc", // Color de la línea
    paddingBottom: 10, // Espacio entre el texto y la línea
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  deleteButton: {
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "#f46748",
    borderRadius: 15,
    padding: 15,
  },
  passwordModal: {
    position: "absolute",
    top: "40%", // Center vertically
    left: "10%",
    right: "10%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8, // Android shadow
  },
  modalText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  inputDelete: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 15,
    textAlign: "center",
  },
  confirmButton: {
    backgroundColor: "#f46748",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
  },
});
