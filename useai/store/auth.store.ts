import { create } from 'zustand';
import { clearAuth, getToken, getUser, saveToken } from '@/lib/auth';

export interface User {
    id: string;
    name: string;
    email: string;
    organization_id: string;
    organization_name: string;
    plan: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    setAuth: (token: string, user: User) => void;
    clearAuth: () => void;
    loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,

    setAuth: (token: string, user: User) => {
        saveToken(token, user);
        set({ token, user, isAuthenticated: true, isLoading: false });
    },

    clearAuth: () => {
        clearAuth();
        set({ token: null, user: null, isAuthenticated: false, isLoading: false });
    },

    loadFromStorage: () => {
        const token = getToken();
        const user = getUser() as User | null;

        if (token && user) {
            set({ token, user, isAuthenticated: true, isLoading: false });
        } else {
            set({ token: null, user: null, isAuthenticated: false, isLoading: false });
        }
    }
}));
