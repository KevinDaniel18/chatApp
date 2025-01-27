import { VideoView, useVideoPlayer } from "expo-video";

const VideoItem = ({ fileUrl, onLoad, index }: any) => {
  const player = useVideoPlayer(fileUrl, (player) => {
    player.loop = true;
    player.play();
    player.addListener("statusChange", () => onLoad(index));
  });

  return (
    <VideoView
      key={`video-${index}`}
      player={player}
      style={{ width: 40, height: 40 }}
    />
  );
};

export default VideoItem