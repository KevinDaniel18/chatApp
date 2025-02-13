import { supabase } from "@/endpoints/supabase";
import { useTheme } from "@/hooks/theme/ThemeContext.";
import { FontAwesome } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { useEffect, useState } from "react";
import { TouchableOpacity } from "react-native";
import * as FileSystem from "expo-file-system";

export default function AudioRecorder({
  setFiles,
  setLoadingFiles,
  setUploadProgress,
  setIsRecording
}: any) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const { theme } = useTheme();

  async function uploadAudio(fileUrl: string) {
    try {
      console.log("Fetching audio file from:", fileUrl);
      setLoadingFiles(true);
      setUploadProgress(0);
      const base64File = await FileSystem.readAsStringAsync(fileUrl, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const binaryString = atob(base64File);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const arrayBuffer = bytes.buffer;

      console.log("Audio file fetched, size:", arrayBuffer.byteLength);

      const fileName = `audio_${Date.now()}.m4a`;
      console.log("Uploading to Supabase:", fileName);
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        setUploadProgress(progress);
      }
      const { data, error } = await supabase.storage
        .from("recordings")
        .upload(fileName, arrayBuffer, { contentType: "audio/m4a" });

      if (error) {
        console.error("Error uploading audio:", error.message);
        return null;
      }

      console.log("Audio uploaded successfully:", data);

      // Obtener la URL pública
      const { data: publicUrlData } = supabase.storage
        .from("recordings")
        .getPublicUrl(fileName);

      console.log("Public URL:", publicUrlData.publicUrl);
      return publicUrlData.publicUrl;
    } catch (err) {
      console.error("Upload failed:", err);
      return null;
    }finally{
      setLoadingFiles(false);
      setUploadProgress(0);
    }
  }

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      console.log("Starting recording...");
      setIsRecording(true)
      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await newRecording.startAsync();
      console.log("Recording started");
      setRecording(newRecording);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  const stopRecording = async () => {
    if (recording) {
      console.log("Stopping recording...");
      setIsRecording(false)
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log("Recording stopped. Audio URI:", uri);
      setRecording(null);

      if (uri) {
        const audioUrl = await uploadAudio(uri);
        if (audioUrl) {
          console.log("Audio uploaded successfully:", audioUrl);
          setFiles((prevFiles: string[]) => [...prevFiles, audioUrl]);
        }
      }
    }
  };

  useEffect(() => {
    return () => {
      if (recording) {
        console.log("Component unmounted, checking recording status...");
        recording.getStatusAsync().then((status) => {
          if (status.isRecording) {
            console.log("Stopping active recording on unmount...");
            recording.stopAndUnloadAsync()
              .catch((err) => console.error("Error stopping recording on unmount:", err));
          }
        }).catch((err) => console.error("Error getting recording status:", err));
        
        setIsRecording(false);
        setRecording(null);
      }
    };
  }, [recording]);
  

  return (
    <TouchableOpacity
      onPress={recording ? stopRecording : startRecording}
      style={{ paddingHorizontal: 3 }}
    >
      <FontAwesome
        name={recording ? "microphone" : "microphone-slash"}
        size={24}
        color={theme === "dark" ? "#fff" : "black"}
      />
    </TouchableOpacity>
  );
}
