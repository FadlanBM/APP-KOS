import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { createHttpHelperFunctions } from "./httpHelperFunctions";

const TOKEN_KEY = "auth_token";
const { GET, POST } = createHttpHelperFunctions();

export const useAuthStore = create((set, get) => ({
  token: null,
  user: null,
  hasProfile: true,
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
      });

      // Jika ada token, cek profil terbaru ke API
      if (storedToken) {
        await get().checkProfile(storedToken);
      }

      set({ isLoading: false });
    } catch (error) {
      set({ token: null, user: null, hasProfile: true, isLoading: false });
    }
  },
  checkProfile: async (token) => {
    try {
      await GET({
        url: "/profile",
        token: token || get().token,
        showToast: false,
        handleErrorStatus: false,
      });
      await get().setHasProfile(true);
    } catch (error) {
      if (error.status === 401) {
        // Jika unauthorized, langsung logout
        await get().logout();
      } else if (
        error.status === 404 ||
        error.message?.includes("Profil belum dibuat")
      ) {
        await get().setHasProfile(false);
      } else {
        // Jika error lain (misal network), kita asumsikan punya profil dulu agar tidak mental ke screen complete profile
        await get().setHasProfile(true);
      }
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
