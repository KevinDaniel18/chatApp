import { AntDesign } from "@expo/vector-icons";
import { VideoView, useVideoPlayer } from "expo-video";
import { TouchableOpacity, View } from "react-native";

const VideoItem = ({ fileUrl, onLoad, index, deleteFile }: any) => {
  const player = useVideoPlayer(fileUrl, (player) => {
    player.loop = false;
    player.play();
    player.addListener("statusChange", () => onLoad(index));
    player.muted = true;
  });

  return (
    <View key={`video-${index}`} style={{ flexDirection: "row", gap: 4 }}>
      <VideoView
        player={player}
        style={{ width: 50, height: 50, borderRadius: 10 }}
      />
      <TouchableOpacity onPress={() => deleteFile(index)}>
        <AntDesign name="close" size={20} color="black" />
      </TouchableOpacity>
    </View>
  );
};

export default VideoItem;
