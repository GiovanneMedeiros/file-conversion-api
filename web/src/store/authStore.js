import { create } from 'zustand';
import { persist } from 'zustand/middleware';

function getInitialAuthState() {
  try {
    const token = localStorage.getItem('auth_token');
    const userRaw = localStorage.getItem('auth_user');
    const user = userRaw ? JSON.parse(userRaw) : null;

    return {
      token: token || null,
      user,
    };
  } catch {
    return {
      token: null,
      user: null,
    };
  }
}

export const useAuthStore = create(
  persist(
    (set) => ({
      ...getInitialAuthState(),

      setAuth: ({ user, token }) => {
        set({ user, token });
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(user));
      },

      setUser: (user) => set({ user }),

      logout: () => {
        set({ user: null, token: null });
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      },

      isAuthenticated: () => {
        const { token } = useAuthStore.getState();
        return !!token;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);

export default useAuthStore;
