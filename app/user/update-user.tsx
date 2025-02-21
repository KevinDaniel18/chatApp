import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  TextInput,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  BackHandler,
} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useTheme } from "@/hooks/theme/ThemeContext.";
import { getStyles } from "@/constants/getStyles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { updateUser } from "@/endpoints/endpoint";
import { useUser } from "@/hooks/user/userContext";
import { showToast } from "@/constants/toast";

interface UpdateUserProps {
  name?: string | undefined;
}

export default function UpdateUser() {
  const [data, setData] = useState<UpdateUserProps>({ name: "" });
  const { theme } = useTheme();

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
          fetchUser()
        }
      }
      setData({ name: "" });
      Keyboard.dismiss();
      return res;
    } catch (error) {
      console.error(error);
    }
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
});
