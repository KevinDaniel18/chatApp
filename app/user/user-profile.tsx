import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  Keyboard,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import {
  AntDesign,
  Feather,
  MaterialCommunityIcons,
  Octicons,
} from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient"
import { getStyles } from "@/constants/getStyles";
import {
  getLikedUsers,
  getUsersWhoLiked,
  getUsersWithPendingMessages,
  likeUser,
  updateUser,
} from "@/endpoints/endpoint";
import { useUser } from "@/hooks/user/userContext";
import { useTheme } from "@/hooks/theme/ThemeContext.";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TextInput } from "react-native-gesture-handler";
import { showToast } from "@/constants/toast";
import BottomLikedUsers from "@/components/bottomSheets/BottomLikedUsers";
import { useNavigationStore } from "@/hooks/store/navigationStore";
import { navigateToChat } from "@/constants/navigateToChat";
import BottomSendMsg from "@/components/bottomSheets/BottomSendMsg";
import LoadingScreen from "@/components/LoadingScreen";

export interface LikedUserProps {
  id: number;
  name: string;
  profilePicture: string;
  likes: number;
  about: string;
}

export default function UserProfile() {
  const { id, name, profilePicture, likes, about } = useLocalSearchParams();
  const { userId, fetchUser, userData } = useUser();
  const { theme } = useTheme();
  const dynamicStyles = getStyles(theme);
  const [loading, setLoading] = useState(false);
  const [loadingLike, setLoadingLike] = useState(false);
  const [isEditAbout, setIsEditAbout] = useState(false);
  const [aboutText, setAboutText] = useState<string>("");
  const [isLiked, setIsLiked] = useState(false);
  const [likedUsers, setLikedUsers] = useState<LikedUserProps[]>([]);
  const [usersILiked, setUsersILiked] = useState<LikedUserProps[]>([]);
  const [selectedUser, setSelectedUser] = useState<LikedUserProps | null>(null);
  const [firstMsg, setFirstMsg] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMsg, setModalMsg] = useState(false);
  const [likeCount, setLikeCount] = useState<string | number>(Number(likes));
  const [usersILikedCount, setUsersILikedCount] = useState<number | null>(null);
  const [scaleAnim] = useState(new Animated.Value(1));
  const insets = useSafeAreaInsets();
  const [showUsersILiked, setShowUsersILiked] = useState(false);

  const handleBack = () => {
    useNavigationStore.getState().navigateBack();
  };

  useEffect(() => {
    setSelectedUser({
      id: Number(id),
      name: Array.isArray(name) ? name[0] : name,
      profilePicture: Array.isArray(profilePicture)
        ? profilePicture[0]
        : profilePicture,
      likes: Number(likes),
      about: Array.isArray(about) ? about[0] : about,
    });
  }, [id, name, profilePicture, likes, about]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        handleBack();
        return true;
      }
    );

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    return () => {
      if (router.canGoBack()) {
        useNavigationStore.getState().clearHistory();
      }
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      try {
        async function getFirstMessage() {
          const res = await getUsersWithPendingMessages(userId!);
          const pendingUserId =
            res.data.users.find(
              (user: { id: number | undefined }) => user.id === Number(id)
            )?.id || null;
          setFirstMsg(pendingUserId);

          return pendingUserId;
        }
        getFirstMessage();
      } catch (error) {
        console.error(error);
      }
    }, [userId, id])
  );

  function goToChat() {
    if (firstMsg === null) {
      navigateToChat(Number(id), JSON.parse(JSON.stringify(name)));
      return;
    }
    setModalMsg(true);
    return;
  }

  async function checkLikedStatus(showLoading = true) {
    if (!userId || !Number(id)) return;
    if (showLoading) setLoadingLike(true);
    try {
      const likedRes = await getUsersWhoLiked(Number(id));
      const usersILikedRes = await getLikedUsers(Number(id));

      setLikeCount(likedRes.data.length);
      setUsersILikedCount(usersILikedRes.data.length);

      setIsLiked(
        likedRes.data.some((user: { id: number }) => user.id === userId)
      );

      setLikedUsers(likedRes.data);
      setUsersILiked(usersILikedRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingLike(false);
      if (showLoading) setLoadingLike(false);
    }
  }

  useEffect(() => {
    checkLikedStatus();
  }, [userId, id]);

  async function toggleLike() {
    try {
      await likeUser(userId!, Number(id));
      setIsLiked((prev) => !prev);
      setLikeCount((prev: any) => (isLiked ? prev - 1 : prev + 1));
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      await checkLikedStatus(false);
    } catch (error) {
      console.error(error);
    }
  }

  const handleTextChange = (text: string) => {
    const trimmedText = text.replace(/\s/g, "");
    if (trimmedText.length <= 100) {
      setAboutText(text);
    }
  };

  async function saveAbout() {
    setLoading(true);
    try {
      const trimmedData = {
        about: aboutText.trim(),
      };
      const res = await updateUser(userId!, trimmedData);
      if (res.status === 200) {
        const updatedFields = res.data.updatedFields.join(", ") || [];
        if (updatedFields === "about") {
          showToast("About me updated successfully");
          fetchUser();
          setIsEditAbout(false);
        }
      }
      setAboutText("");
      Keyboard.dismiss();
      return res;
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (loadingLike) {
    return (
      <LoadingScreen/>
    );
  }

  return (
    <View style={[dynamicStyles.changeBackgroundColor, styles.container]}>
      <View style={[styles.header, { marginTop: insets.top }]}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={handleBack}>
            <AntDesign
              name="arrowleft"
              size={28}
              color={theme === "dark" ? "white" : "black"}
            />
          </TouchableOpacity>
          <Text style={[styles.text, dynamicStyles.changeTextColor]}>
            {name}
          </Text>
        </View>
        <View>
          {loading ? (
            <ActivityIndicator
              size={"small"}
              color={theme === "dark" ? "#fff" : "#000"}
            />
          ) : aboutText.replace(/\s/g, "").length > 0 && isEditAbout ? (
            <Text
              style={{ color: "#3b9e2d", fontWeight: "bold", fontSize: 15 }}
              onPress={saveAbout}
            >
              Save
            </Text>
          ) : userId === Number(id) ? (
            <TouchableOpacity onPress={() => router.push("/user/update-user")}>
              <MaterialCommunityIcons
                name="account-settings"
                size={24}
                color={theme === "dark" ? "#fff" : "#000"}
              />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
      <View style={styles.profileInfo}>
        <Image
          source={
            profilePicture
              ? { uri: profilePicture }
              : require("@/assets/images/defaultProfile.jpg")
          }
          style={styles.avatar}
        />
        <Text style={[styles.name, dynamicStyles.changeTextColor]}>{name}</Text>
        <View style={styles.statsContainer}>
          <TouchableOpacity
            style={styles.stat}
            onPress={() => {
              setModalVisible(true);
              setShowUsersILiked(false);
            }}
            disabled={likeCount === 0}
          >
            <Text style={[styles.statNumber, dynamicStyles.changeTextColor]}>
              {likeCount}
            </Text>
            <Text style={[styles.statLabel, dynamicStyles.changeTextColor]}>
              Likes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.stat}
            onPress={() => {
              setModalVisible(true);
              setShowUsersILiked(true);
            }}
            disabled={usersILikedCount === 0}
          >
            <Text style={[styles.statNumber, dynamicStyles.changeTextColor]}>
              {usersILikedCount}
            </Text>
            <Text style={[styles.statLabel, dynamicStyles.changeTextColor]}>
              Liked
            </Text>
          </TouchableOpacity>

          {userId !== Number(id) && (
            <View style={styles.stat}>
              <Octicons
                name="report"
                size={24}
                color={theme === "dark" ? "white" : "black"}
              />

              <Text style={[styles.statLabel, dynamicStyles.changeTextColor]}>
                Report
              </Text>
            </View>
          )}
        </View>

        {userId !== Number(id) && (
          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={toggleLike} style={styles.actionButton}>
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <AntDesign
                  name={isLiked ? "heart" : "hearto"}
                  size={24}
                  color={
                    isLiked ? "#ff3b30" : theme === "dark" ? "white" : "black"
                  }
                />
              </Animated.View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={goToChat}>
              <Feather
                name="message-square"
                size={24}
                color={theme === "dark" ? "white" : "black"}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
      <View style={styles.bioContainer}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={[styles.bioTitle, dynamicStyles.changeTextColor]}>
            About Me
          </Text>
          {isEditAbout ? (
            <TouchableOpacity onPress={() => setIsEditAbout(false)}>
              <AntDesign name="close" size={24} color="red" />
            </TouchableOpacity>
          ) : userId === Number(id) ? (
            <TouchableOpacity onPress={() => setIsEditAbout(true)}>
              <Feather
                name="edit"
                size={20}
                color={theme === "dark" ? "white" : "black"}
              />
            </TouchableOpacity>
          ) : null}
        </View>

        {isEditAbout ? (
          <View style={{ gap: 10 }}>
            <TextInput
              style={[
                styles.input,
                dynamicStyles.changeTextColor,
                { borderBottomColor: theme === "dark" ? "#fff" : "#000", color: theme === "dark" ? "#fff" : "#000" },
              ]}
              placeholder="Tell about yourself..."
              placeholderTextColor={"#d3d3d3"}
              multiline
              value={aboutText}
              onChangeText={handleTextChange}
            />
            <Text
              style={[dynamicStyles.changeTextColor, { textAlign: "center" }]}
            >
              {aboutText.replace(/\s/g, "").length}/100
            </Text>
          </View>
        ) : userId === Number(id) ? (
          <Text style={[styles.bioText, dynamicStyles.changeTextColor]}>
            {userData?.about ?? "No info"}
          </Text>
        ) : (
          <Text style={[styles.bioText, dynamicStyles.changeTextColor]}>
            {about ?? "No info"}
          </Text>
        )}
      </View>
      <BottomLikedUsers
        modalVisible={modalVisible || false}
        setModalVisible={() => setModalVisible(false)}
        likedUsers={likedUsers}
        usersILiked={usersILiked}
        showUsersILiked={showUsersILiked}
        setShowUsersILiked={setShowUsersILiked}
        setIsEditAbout={setIsEditAbout}
        myId={userId!}
        userId={Number(id)}
        name={Array.isArray(name) ? name[0] : name}
      />
      <BottomSendMsg
        modalVisible={modalMsg || false}
        setModalVisible={() => setModalMsg(false)}
        selectedUser={selectedUser}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginHorizontal: 20,
    justifyContent: "space-between",
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 15,
  },
  banner: {
    height: 150,
    width: "100%",
  },
  profileInfo: {
    alignItems: "center",
    // marginTop: -50,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "white",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 20,
    paddingHorizontal: 20,
  },
  stat: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 12,
    color: "#888",
  },
  actionButtons: {
    flexDirection: "row",
    marginTop: 20,
  },
  actionButton: {
    marginHorizontal: 20,
    padding: 10,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  bioContainer: {
    padding: 20,
    marginTop: 20,
  },
  bioTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
  },
  input: {
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
});
