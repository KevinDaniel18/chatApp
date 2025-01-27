import { StyleSheet } from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";

const RenderVideo = ({
  file,
  messageId,
  index,
}: {
  file: string;
  messageId: string;
  index: number;
}) => {
  const player = useVideoPlayer(file, (player) => {
    player.loop = true;
  });

  return (
    <VideoView
      key={`${messageId}-${index}`}
      style={styles.messageVideo}
      player={player}
      allowsFullscreen
      allowsPictureInPicture
    />
  );
};

const styles = StyleSheet.create({
  messageVideo: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: "black",
  },
});

export default RenderVideo