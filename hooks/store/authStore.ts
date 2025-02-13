import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { authLogin, authRegister } from "@/endpoints/endpoint";
import { router } from "expo-router";
import { supabase } from "@/endpoints/supabase";
import { AxiosError } from "axios";

// Define the store types
interface AuthState {
  rootReady: boolean;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isFirstTime: boolean;
  error: null;
  setIsFirstTime: (value: boolean) => void;
  register: (name: string, email: string, password: string) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  loginWithSupabase: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  setRootReady: (ready: boolean) => void;
}

const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  isLoading: true,
  isAuthenticated: false,
  rootReady: false,
  isFirstTime: false,
  error: null,
  setRootReady: (ready: boolean) => set({ rootReady: ready }),
  setIsFirstTime: async (isFirst: boolean) => {
    await SecureStore.setItemAsync("HAS_LAUNCHED", "true");
    set({ isFirstTime: isFirst });
  },

  // Initialize the auth state from SecureStore
  initialize: async () => {
    try {
      const [token, hasLaunched, supabaseAccessToken, supabaseRefreshToken] =
        await Promise.all([
          SecureStore.getItemAsync("token"),
          SecureStore.getItemAsync("HAS_LAUNCHED"),
          SecureStore.getItemAsync("ACCESS_TOKEN"),
          SecureStore.getItemAsync("REFRESH_TOKEN"),
        ]);

      const isFirstTime = !hasLaunched;
      if (token) {
        set({
          token,
          isAuthenticated: true,
          isLoading: false,
          isFirstTime,
        });

        await supabase.auth.setSession({
          access_token: supabaseAccessToken!,
          refresh_token: supabaseRefreshToken!,
        });
      } else {
        set({ isLoading: false, isFirstTime });
      }
    } catch (error) {
      console.error("Failed to initialize auth store:", error);
      set({ isLoading: false });
    }
  },

  register: async (name: string, email: string, password: string) => {
    try {
      set({ error: null });
      await authRegister(name, email, password);

      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error("error autenticando en supabase", error.message);
      }

      set({ isLoading: false });
      const waitForRoot = () =>
        new Promise<void>((resolve) => {
          const interval = setInterval(() => {
            if (get().rootReady) {
              clearInterval(interval);
              resolve();
            }
          }, 100);
        });

      await waitForRoot();

      router.replace("/sign-in");
    } catch (error: any) {
      set({
        isLoading: false,
        isAuthenticated: false,
        error: error.response?.data?.message || "Register failed",
      });
      if (error instanceof AxiosError && error.response) {
        return {
          error: true,
          msg: error.response.data.message,
        };
      }
      throw error;
    }
  },

  // Login function
  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });

      const response = await authLogin(email, password);

      const data = response.data;
      console.log("token", data.token);

      // Store authentication data
      await SecureStore.setItemAsync("token", JSON.stringify(data.token));
      await SecureStore.setItemAsync("USER_ID", JSON.stringify(data.id));
      await SecureStore.setItemAsync(
        "USER_NAME",
        JSON.stringify(data.userName)
      );

      set({
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
      });

      const waitForRoot = () =>
        new Promise<void>((resolve) => {
          const interval = setInterval(() => {
            if (get().rootReady) {
              clearInterval(interval);
              resolve();
            }
          }, 100);
        });

      await waitForRoot();
      router.replace("/");
    } catch (error: any) {
      set({
        isLoading: false,
        isAuthenticated: false,
        error: error.response?.data?.message || "Login failed",
      });

      if (error instanceof AxiosError && error.response) {
        return {
          error: true,
          msg: error.response.data.message,
        };
      }
      throw error;
    }
  },

  loginWithSupabase: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error("Error al iniciar sesión con Supabase:", error.message);
      return { error: true };
    }

    const accessToken = data.session?.access_token;
    const refreshToken = data.session?.refresh_token;

    if (!accessToken || !refreshToken) {
      console.error("Error: No se recibieron tokens válidos.");
      return { error: true };
    }

    await SecureStore.setItemAsync("ACCESS_TOKEN", accessToken);
    await SecureStore.setItemAsync("REFRESH_TOKEN", refreshToken);

    return { error: false };
  },

  // Logout function
  logout: async () => {
    try {
      set({ token: null, isAuthenticated: false, isLoading: true });

      // set({
      //   token: null,
      //   isAuthenticated: false,
      //   isLoading: false,
      // });

      await new Promise((resolve) => setTimeout(resolve, 100));

      await SecureStore.deleteItemAsync("token");
      await SecureStore.deleteItemAsync("USER_ID");
      await SecureStore.deleteItemAsync("ACCESS_TOKEN");
      await SecureStore.deleteItemAsync("REFRESH_TOKEN");

      set({ isLoading: false });

      const waitForRoot = () =>
        new Promise<void>((resolve) => {
          if (get().rootReady) {
            resolve();
            return;
          }

          const interval = setInterval(() => {
            if (get().rootReady) {
              clearInterval(interval);
              resolve();
            }
          }, 100);
        });

      await waitForRoot();

      router.replace("/sign-in");
    } catch (error) {
      console.error("Logout failed:", error);
      set({ isLoading: false });
      throw error;
    }
  },
}));

export default useAuthStore;
