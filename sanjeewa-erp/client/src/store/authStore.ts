import { create } from 'zustand';

interface AuthState {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'REF';
    token: string;
  } | null;
  login: (userData: AuthState['user']) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  login: (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    set({ user: userData });
  },
  logout: () => {
    localStorage.removeItem('user');
    set({ user: null });
  },
}));
