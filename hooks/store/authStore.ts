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
  register: (name: string, email: string, password: string) => Promise<void>;
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
  setRootReady: (ready: boolean) => set({ rootReady: ready }),

  // Initialize the auth state from SecureStore
  initialize: async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      const supabaseAccessToken = await SecureStore.getItemAsync(
        "ACCESS_TOKEN"
      );
      const supabaseRefreshToken = await SecureStore.getItemAsync(
        "REFRESH_TOKEN"
      );
      if (token) {
        set({
          token,
          isAuthenticated: true,
          isLoading: false,
        });

        await supabase.auth.setSession({
          access_token: supabaseAccessToken!,
          refresh_token: supabaseRefreshToken!,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error("Failed to initialize auth store:", error);
      set({ isLoading: false });
    }
  },

  register: async (name: string, email: string, password: string) => {
    try {
      set({ isLoading: true });
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
    } catch (error) {
      console.error("Register failed:", error);
      set({ isLoading: false });
      throw error;
    }
  },

  // Login function
  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true });

      const response = await authLogin(email, password);

      const data = response.data;
      console.log("token", data.token);

      // Store authentication data
      await SecureStore.setItemAsync("token", JSON.stringify(data.token));
      await SecureStore.setItemAsync("USER_ID", JSON.stringify(data.id));

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
      if (new AxiosError(error) && error.response) {
        return {
          error: true,
        };
      }
      console.error("Login failed:", error);
      set({ isLoading: false });
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
      set({ isLoading: true });

      set({
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      await SecureStore.deleteItemAsync("token");
      await SecureStore.deleteItemAsync("USER_ID");
      await SecureStore.deleteItemAsync("ACCESS_TOKEN");
      await SecureStore.deleteItemAsync("REFRESH_TOKEN");

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

      set({ isLoading: false });

      router.replace("/sign-in");
    } catch (error) {
      console.error("Logout failed:", error);
      set({ isLoading: false });
      throw error;
    }
  },
}));

export default useAuthStore;
