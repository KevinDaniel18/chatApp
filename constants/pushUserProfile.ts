import { useNavigationStore } from "@/hooks/store/navigationStore";
import { router } from "expo-router";

type Props = {
  id: number | null;
  name?: string;
  profilePicture?: string;
  likes?: number;
  about?: string;
};

export function pushUserProfile({
  id,
  name,
  profilePicture,
  likes,
  about,
}: Props) {
  if (id === null) {
    return;
  }

  useNavigationStore.getState().addToHistory({
    id,
    name,
    profilePicture,
    likes,
    about,
  });

  router.push({
    pathname: "/user/user-profile",
    params: {
      id,
      name,
      profilePicture,
      likes,
      about,
    },
  });
}
