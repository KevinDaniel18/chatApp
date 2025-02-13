import { create } from "zustand";

interface MessageStore {
  draftsPerUser: { [key: string]: string };
  setDraftForUser: (receiverId: string, text: string) => void;
  getDraftForUser: (receiverId: string) => string;
  clearDraftForUser: (receiverId: string) => void;
}

const useMessageStore = create<MessageStore>((set, get) => ({
  draftsPerUser: {},

  setDraftForUser: async (receiverId: string, text: string) => {
    try {
      if (text.trim() === "") {
        set((state) => {
          const { [receiverId]: _, ...remainingDrafts } = state.draftsPerUser;
          return { draftsPerUser: remainingDrafts };
        });
      } else {
        set((state) => ({
          draftsPerUser: { ...state.draftsPerUser, [receiverId]: text },
        }));
      }
    } catch (error) {
      console.error("Error saving draft:", error);
    }
  },

  getDraftForUser: (receiverId: string) =>
    get().draftsPerUser[receiverId] || "",

  clearDraftForUser: async (receiverId: string) => {
    set((state) => {
      const { [receiverId]: _, ...remainingDrafts } = state.draftsPerUser;
      return { draftsPerUser: remainingDrafts };
    });
  },
}));
export default useMessageStore;
