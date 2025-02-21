import {
  BackHandler,
  Image,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@/hooks/theme/ThemeContext.";
import { getStyles } from "@/constants/getStyles";
import { pushUserProfile } from "../../constants/pushUserProfile";
import { LikedUserProps } from "@/app/user/user-profile";

interface Props {
  modalVisible: boolean;
  setModalVisible: (value: boolean) => void;
  likedUsers: LikedUserProps[];
  usersILiked: LikedUserProps[];
  showUsersILiked: boolean;
  setShowUsersILiked: (value: boolean) => void;
  myId: number;
  userId: number;
  name: string;
  setIsEditAbout: (value: boolean) => void;
}

export default function BottomLikedUsers({
  modalVisible,
  setModalVisible,
  likedUsers,
  usersILiked,
  showUsersILiked,
  setShowUsersILiked,
  myId,
  userId,
  name,
  setIsEditAbout,
}: Props) {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["24%", "50%"], []);
  const { theme } = useTheme();

  const dynamicStyles = getStyles(theme);
  useEffect(() => {
    if (modalVisible) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [modalVisible]);

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

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
      />
    ),
    []
  );

  function getHeaderText() {
    if (myId === userId) {
      return showUsersILiked ? "Users you liked" : "Users who liked you";
    } else {
      return showUsersILiked
        ? `${name}'s liked users`
        : `Users who liked ${name}`;
    }
  }

  const disabledSwitch = likedUsers.length === 0 || usersILiked.length === 0;
  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={1}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      onDismiss={() => setModalVisible(false)}
      handleIndicatorStyle={{
        backgroundColor: theme === "dark" ? "#ffffff" : "#000000",
      }}
      backgroundStyle={dynamicStyles.changeBackgroundColor}
    >
      <BottomSheetScrollView
        style={[styles.container, dynamicStyles.changeBackgroundColor]}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View style={styles.switchContainer}>
          <Text style={dynamicStyles.changeTextColor}>{getHeaderText()}</Text>
          <Switch
            value={showUsersILiked}
            onValueChange={setShowUsersILiked}
            disabled={disabledSwitch}
          />
        </View>

        {(showUsersILiked ? usersILiked : likedUsers).map(
          ({ id, name, profilePicture, likes, about }) => (
            <TouchableOpacity
              key={id}
              onPress={() => {
                setIsEditAbout(false);
                pushUserProfile({ id, name, profilePicture, likes, about });
                setModalVisible(false);
              }}
              style={styles.content}
            >
              <Image
                style={styles.avatar}
                source={
                  profilePicture
                    ? { uri: profilePicture }
                    : require("@/assets/images/defaultProfile.jpg")
                }
              />
              <Text style={dynamicStyles.changeTextColor}>{name}</Text>
            </TouchableOpacity>
          )
        )}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    overflow: "hidden",
    flex: 1,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  avatar: {
    height: 40,
    width: 40,
    borderRadius: 20,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
});
