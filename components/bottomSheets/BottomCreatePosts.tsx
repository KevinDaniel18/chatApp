import {
  ActivityIndicator,
  BackHandler,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Animated,
  Keyboard,
  Modal,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "@/hooks/theme/ThemeContext.";
import { getStyles } from "@/constants/getStyles";
import * as ImagePicker from "expo-image-picker";
import { Ionicons, Feather, MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createPost } from "@/endpoints/endpoint";
import { useUser } from "@/hooks/user/userContext";
import { showToast } from "@/constants/toast";
import { supabase } from "@/endpoints/supabase";
import { Video } from "expo-av";

interface PostsProps {
  authorId?: number | null;
  file?: string | null;
  description?: string | null;
}

export default function BottomCreatePosts({
  modalVisible,
  setModalVisible,
}: any) {
  const { userId } = useUser();
  const [data, setData] = useState<PostsProps>({
    authorId: userId ? userId : null,
    file: null,
    description: null,
  });
  const { theme } = useTheme();
  const dynamicStyles = getStyles(theme);
  const insets = useSafeAreaInsets();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const panY = useRef(new Animated.Value(0)).current;

  const closeAnim = Animated.timing(slideAnim, {
    toValue: 0,
    duration: 200,
    useNativeDriver: true,
  });

  const closeModal = () => {
    Keyboard.dismiss();
    setModalVisible(false);
  };

  useEffect(() => {
    if (modalVisible) {
      panY.setValue(0);
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } else {
      closeAnim.start();
    }
  }, [modalVisible]);

  const translateY = Animated.add(
    panY,
    slideAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [300, 0],
    })
  );

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (modalVisible) {
          setModalVisible(false);
          return true;
        }
        return false;
      }
    );

    return () => backHandler.remove();
  }, [modalVisible]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setData((prev) => ({ ...prev, file: result.assets[0].uri }));
    }
  };

  async function uploadFileToSupabase(uri: string) {
    try {
      const arrayBuffer = await fetch(uri).then((res) => res.arrayBuffer());

      const fileExt = uri.split(".").pop()?.toLowerCase();
      if (!fileExt)
        throw new Error("No se pudo determinar la extensión del archivo");

      const fileName = `${userId ?? "anonymous"}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const contentType = uri.startsWith("data:")
        ? uri.split(";")[0].replace("data:", "")
        : `image/${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("posts")
        .upload(filePath, arrayBuffer, {
          contentType,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("posts")
        .getPublicUrl(filePath);

      if (!publicUrlData?.publicUrl) {
        throw new Error("No se pudo obtener la URL pública");
      }

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error("Error al subir archivo a Supabase:", error);
      throw error;
    }
  }

  function validateInputs() {
    if (!data.description?.trim() && !data.file) {
      showToast("To post something you must provide a description or file");
      return true;
    }
    return false;
  }

  const handleSubmit = async () => {
    if (validateInputs()) return;

    setIsSubmitting(true);

    console.log("📝 DATA QUE SE ENVÍA:", data);
    try {
      let fileUrl = null;
      if (data.file) {
        fileUrl = await uploadFileToSupabase(data.file);
      }

      await createPost({ ...data, file: fileUrl });

      setData({ authorId: null, description: null, file: null });
      setModalVisible(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setData({ authorId: null, description: null, file: null });
    setModalVisible(false);
  };

  function isImage(fileUrl: string) {
    const ext = fileUrl.split(".").pop()?.toLowerCase();
    return (
      ext === "jpg" ||
      ext === "jpeg" ||
      ext === "png" ||
      ext === "gif" ||
      ext === "webp"
    );
  }

  function isVideo(fileUrl: string) {
    const ext = fileUrl.split(".").pop()?.toLowerCase();
    return (
      ext === "mp4" ||
      ext === "mov" ||
      ext === "avi" ||
      ext === "mkv" ||
      ext === "webm"
    );
  }

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="none"
      onRequestClose={closeModal}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalContent,
            dynamicStyles.changeBackgroundColor,
            { transform: [{ translateY }] },
            { paddingBottom: insets.bottom },
          ]}
        >
          <View
            style={[
              styles.header,
              { borderBottomColor: theme === "dark" ? "#333" : "#eee" },
            ]}
          >
            <Text
              style={[
                styles.headerTitle,
                { color: theme === "dark" ? "#fff" : "#333" },
              ]}
            >
              Create a post
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons
                name="close"
                size={24}
                color={theme === "dark" ? "#fff" : "#000"}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.contentContainer}>
            <TextInput
              style={[
                styles.textInput,
                {
                  color: theme === "dark" ? "#fff" : "#333",
                  backgroundColor: theme === "dark" ? "#333" : "#f5f5f5",
                },
              ]}
              placeholder="What's on your mind?"
              placeholderTextColor={theme === "dark" ? "#777" : "#aaa"}
              multiline
              value={data.description ?? ""}
              onChangeText={(text) =>
                setData((prev) => ({ ...prev, description: text }))
              }
            />

            {data.file && (
              <View style={styles.imagePreviewContainer}>
                {isImage(data.file) ? (
                  <Image
                    source={{ uri: data.file }}
                    style={styles.imagePreview}
                  />
                ) : isVideo(data.file) ? (
                  <Video
                    source={{ uri: data.file }}
                    style={styles.imagePreview}
                    useNativeControls
                    isLooping
                  />
                ) : null}

                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => setData({ ...data, file: null })}
                >
                  <Feather name="x-circle" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={[
                  styles.uploadButton,
                  { backgroundColor: theme === "dark" ? "#333" : "#f0f0f0" },
                ]}
                onPress={pickImage}
              >
                <MaterialIcons
                  name="add-photo-alternate"
                  size={24}
                  color={theme === "dark" ? "#fff" : "#333"}
                />
                <Text
                  style={[
                    styles.uploadButtonText,
                    { color: theme === "dark" ? "#fff" : "#333" },
                  ]}
                >
                  {data.file ? "Change Photo" : "Add Photo/Video"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  !data.description?.trim() &&
                    !data.file && {
                      backgroundColor: theme === "dark" ? "#444" : "#ccc",
                    },
                ]}
                onPress={handleSubmit}
                disabled={
                  (!data.description?.trim() && !data.file) || isSubmitting
                }
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Text style={styles.submitButtonText}>Post</Text>
                    <Feather
                      name="send"
                      size={18}
                      color="#fff"
                      style={{ marginLeft: 8 }}
                    />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: "20%",
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#DEDEDE",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    padding: 4,
  },
  contentContainer: {
    padding: 20,
  },
  textInput: {
    minHeight: 120,
    maxHeight: 200,
    fontSize: 16,
    lineHeight: 24,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    textAlignVertical: "top",
  },
  imagePreviewContainer: {
    position: "relative",
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 20,
    padding: 4,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 20,
  },
  uploadButtonText: {
    marginLeft: 8,
    fontWeight: "500",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#4a80f5",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
