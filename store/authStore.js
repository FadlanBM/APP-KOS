import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "auth_token";

export const useAuthStore = create((set, get) => ({
  token: null,
  user: null,
  hasProfile: true, // Default true agar tidak redirect saat loading
  isLoading: true,
  initialize: async () => {
    try {
      const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
      const storedUser = await SecureStore.getItemAsync("user_profile");
      const storedHasProfile = await SecureStore.getItemAsync("has_profile");

      set({
        token: storedToken,
        user: storedUser ? JSON.parse(storedUser) : null,
        hasProfile: storedHasProfile === "false" ? false : true,
        isLoading: false,
      });
    } catch (error) {
      set({ token: null, user: null, hasProfile: true, isLoading: false });
    }
  },
  setToken: async (token) => {
    if (token) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      set({ token });
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      set({ token: null });
    }
  },
  setHasProfile: async (status) => {
    await SecureStore.setItemAsync("has_profile", String(status));
    set({ hasProfile: status });
  },
  setProfile: async (user) => {
    if (user) {
      await SecureStore.setItemAsync("user_profile", JSON.stringify(user));
      set({ user });
    } else {
      await SecureStore.deleteItemAsync("user_profile");
      set({ user: null });
    }
  },
  logout: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync("user_profile");
    await SecureStore.deleteItemAsync("has_profile");
    set({ token: null, user: null, hasProfile: true });
  },
}));
