import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { supabase } from "@/endpoints/supabase";
import { FontAwesome } from "@expo/vector-icons";
import { useTheme } from "@/hooks/theme/ThemeContext.";
import { getStyles } from "@/constants/getStyles";

export default function MessageImage({
  setFiles,
  setLoadingFiles,
  setUploadProgress,
  setModalVisible,
}: any) {
  const { theme } = useTheme();
  const dynamicStyles = getStyles(theme)

  async function uploadFile() {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Debes estar autenticado para subir una imagen");
      }

      setModalVisible(false);
      setLoadingFiles(true);
      setUploadProgress(0);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images", "videos"],
        allowsMultipleSelection: true,
        allowsEditing: true,
        quality: 1,
        exif: false,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        console.log("User cancelled image picker.");
        return;
      }

      const fileUrls = await Promise.all(
        result.assets.map(async (file) => {
          try {
            const arrayBuffer = await fetch(file.uri).then((res) =>
              res.arrayBuffer()
            );

            const fileExt = file.uri.split(".").pop()?.toLowerCase();
            if (!fileExt)
              throw new Error("No se pudo determinar la extensión del archivo");

            const path = `${Date.now()}.${fileExt}`;

            for (let progress = 0; progress <= 100; progress += 10) {
              await new Promise((resolve) => setTimeout(resolve, 100));
              setUploadProgress(progress);
            }

            const { data, error: uploadError } = await supabase.storage
              .from("messageImg")
              .upload(path, arrayBuffer, {
                contentType: file.type || `image/${fileExt}`,
              });

            if (uploadError) throw uploadError;

            const { publicUrl } = supabase.storage
              .from("messageImg")
              .getPublicUrl(path).data;

            if (!publicUrl)
              throw new Error("No se pudo obtener la URL pública");

            console.log("Archivo subido:", publicUrl);
            return publicUrl;
          } catch (error) {
            console.error("Error al subir archivo:", error);
            throw error;
          }
        })
      );

      console.log("archivos:", fileUrls);
      setFiles((prevFiles: string[]) => [...prevFiles, ...fileUrls]);
    } catch (error) {
      console.error("error", error);
    } finally {
      setLoadingFiles(false);
      setUploadProgress(0);
    }
  }

  return (
    <TouchableOpacity
      onPress={uploadFile}
      style={[styles.bottom,  theme === "dark" && { backgroundColor: "#000" }]}
    >
      <FontAwesome
        name="image"
        size={24}
        color={theme === "dark" ? "white" : "black"}
      />
      <Text style={[{fontWeight: "700"}, dynamicStyles.changeTextColor]}>Upload</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bottom: {
    padding: 15,
    borderRadius: 20,
    backgroundColor: "#F2F2F2",
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  }
})