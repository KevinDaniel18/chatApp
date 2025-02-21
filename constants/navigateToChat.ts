import { router } from "expo-router";

export function navigateToChat(receiverId: number, userName: string) {
  router.push({
    pathname: "/user/chat",
    params: { receiverId, userName },
  });
}
