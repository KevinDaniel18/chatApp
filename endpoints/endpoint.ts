import axios from "axios";
const instance = axios.create({ baseURL: process.env.EXPO_PUBLIC_API_URL });

export function authRegister(name: string, email: string, password: string) {
  return instance.post("/auth/register", { name, email, password });
}
export function authLogin(email: string, password: string) {
  return instance.post("/auth/login", { email, password });
}

export function updateProfilePicture(userId: number, profilePicture: string) {
  return instance.post("/user/updateProfilePicture", {
    userId,
    profilePicture,
  });
}

export function getUserById(id: number) {
  return instance.get(`/user/${id}`);
}

export function getAllUsers() {
  return instance.get("/user/allUsers");
}

export function saveNotificationToken(
  userId: number,
  notificationToken: string | null
) {
  return instance.patch("/user/token", { userId, notificationToken });
}

export function likeUser(likerId: number, likedId: number) {
  return instance.post("/user/like", { likerId, likedId });
}

export function getLikedUsers(userId: number) {
  return instance.get("/user/likedUser", {
    params: { userId },
  });
}

export function getUsersWhoLiked(userId: number) {
  return instance.get("/user/usersWhoLiked", { params: { userId } });
}

export function removeProfilePicture(userId: number) {
  return instance.post("/user/deleteProfilePicture", { userId });
}

export function getUsersSentMessages(userId: number) {
  return instance.get("/user/sent-messages", { params: { userId } });
}
export function getMessages(senderId: number, receiverId: number) {
  return instance.get(`/messages/${senderId}/${receiverId}`);
}

export function getUsersWithPendingMessages(userId: number) {
  return instance.get("/user/pending-messages", { params: { userId } });
}

export function markPendingMessagesAsRead(userId: number, senderId: number) {
  return instance.post("/messages/markAsRead", { userId, senderId });
}

export function deleteMessageForUser(userId: number, receiverId: number) {
  return instance.post("/messages/delete-message-for-user", {
    userId,
    receiverId,
  });
}

export function updateUser(userId: number, data: object) {
  return instance.post("/user/update-user", { userId, ...data });
}
