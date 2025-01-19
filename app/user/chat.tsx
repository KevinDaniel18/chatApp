import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import Chat from "@/components/Chat";

export default function ChatScreen() {
  const { receiverId, userName } = useLocalSearchParams();

  return (
    <View style={{ flex: 1 }}>
      <Chat receiverId={receiverId} userName={userName} />
    </View>
  );
}
