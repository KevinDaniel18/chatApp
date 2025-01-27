import { Image, StyleSheet } from "react-native";

const RenderImage = ({
  file,
  messageId,
  index,
}: {
  file: string;
  messageId: string;
  index: number;
}) => (
  <Image
    key={`${messageId}-${index}`}
    source={{ uri: file }}
    style={styles.messageImage}
    resizeMode="cover"
  />
);

const styles = StyleSheet.create({
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: "transparent",
  },
});

export default RenderImage
