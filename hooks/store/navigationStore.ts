import { create } from "zustand";
import { router } from "expo-router";

type UserInfo = {
  id: number;
  name?: string;
  profilePicture?: string;
  likes?: number;
  about?: string;
};

type NavigationStore = {
  history: UserInfo[];
  currentIndex: number;
  addToHistory: (userInfo: UserInfo) => void;
  navigateBack: () => void;
  clearHistory: () => void;
  debug: () => void;
};

export const useNavigationStore = create<NavigationStore>((set, get) => ({
  history: [],
  currentIndex: -1,
  
  addToHistory: (userInfo: UserInfo) => {
    set((state) => {
      if (state.history.length > 0 && state.history[state.history.length - 1].id === userInfo.id) {
        return state;
      }
      
      return {
        history: [...state.history, userInfo],
        currentIndex: state.history.length
      };
    });
  },

  navigateBack: () => {
    const { history, currentIndex } = get();
    
    if (history.length > 1 && currentIndex > 0) {
      const previousUser = history[currentIndex - 1];
      
      router.replace({
        pathname: "/user/user-profile",
        params: {
          id: Number(previousUser.id),
          name: previousUser.name,
          profilePicture: previousUser.profilePicture,
          likes: Number(previousUser.likes),
          about: previousUser.about,
        },
      });
      
      set((state) => ({
        history: state.history.slice(0, currentIndex),
        currentIndex: currentIndex - 1
      }));
    } else {
      router.back();
      get().clearHistory();
    }
  },

  clearHistory: () => {
    set({ history: [], currentIndex: -1 });
  },

  debug: () => {
    const state = get();
    console.log('Current Navigation State:', {
      historyLength: state.history.length,
      currentIndex: state.currentIndex,
      history: state.history.map(u => u.id)
    });
  }
}));