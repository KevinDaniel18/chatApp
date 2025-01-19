import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { getUserById } from "@/endpoints/endpoint";
import * as SecureStore from "expo-secure-store";
import { LayoutAnimation } from "react-native";

interface UserData {
  name: string;
  email: string;
  profilePicture: string;
}

interface UserContextType {
  userData: UserData | null;
  userId: number | null;
  profilePicture: string;
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
  setProfilePicture: React.Dispatch<React.SetStateAction<string>>;
  fetchUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProvider {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProvider> = ({ children }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [profilePicture, setProfilePicture] = useState<string>("");
  const [userId, setUserId] = useState<number | null>(null);

  const fetchUser = async () => {
    try {
      const userId = await SecureStore.getItemAsync("USER_ID");
      if (!userId) return;
      const parseId = Number(userId);
      setUserId(parseId);
      const user = await getUserById(parseId);

      setUserData({
        name: user.data.name,
        email: user.data.email,
        profilePicture: user.data.profilePicture,
      });
      setProfilePicture(user.data.profilePicture);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider
      value={{
        userData,
        profilePicture,
        setUserData,
        setProfilePicture,
        fetchUser,
        userId,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
