import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import Chat from "@/components/chat/Chat";

export default function ChatScreen() {
  const { receiverId, userName, isPending } = useLocalSearchParams();

  return (
    <View style={{ flex: 1 }}>
      <Chat receiverId={receiverId} userName={userName} isPending={isPending} />
    </View>
  );
}
