import { create } from "zustand";

import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
} from "@/lib/auth-tokens";
import { api } from "@/services/api";
import type { AuthUser, LoginResponse } from "@/types/auth";

type LoginPayload = {
  email: string;
  password: string;
};

type AuthState = {
  user: AuthUser | null;
  isLoading: boolean;
  initialized: boolean;
  initialize: () => Promise<void>;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  initialized: false,

  initialize: async () => {
    if (get().initialized) {
      return;
    }

    const access = getAccessToken();
    if (!access) {
      set({ initialized: true });
      return;
    }

    set({ isLoading: true });
    try {
      const response = await api.get<AuthUser>("/auth/me/");
      set({ user: response.data, initialized: true, isLoading: false });
    } catch {
      clearAuthTokens();
      set({ user: null, initialized: true, isLoading: false });
    }
  },

  login: async ({ email, password }) => {
    set({ isLoading: true });
    try {
      const response = await api.post<LoginResponse>("/auth/login/", { email, password });
      const { access, refresh, user } = response.data;
      setAuthTokens(access, refresh);
      set({ user, isLoading: false, initialized: true });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    const refresh = getRefreshToken();
    try {
      if (refresh) {
        await api.post("/auth/logout/", { refresh });
      }
    } catch {
      // token can already be expired/blacklisted; clear local session anyway
    } finally {
      clearAuthTokens();
      set({ user: null, initialized: true, isLoading: false });
    }
  },

  fetchMe: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get<AuthUser>("/auth/me/");
      set({ user: response.data, isLoading: false, initialized: true });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
}));
