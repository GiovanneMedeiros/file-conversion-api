import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import authService from '../services/auth.service';

export const useAuth = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, token, setAuth, logout } = useAuthStore();

  const login = async (email, password) => {
    try {
      const response = await authService.login({ email, password });
      setAuth({
        user: response.user,
        token: response.token,
      });
      navigate('/dashboard');
      return response;
    } catch (error) {
      const message = error.response?.data?.error || 'Falha ao fazer login';
      useNotificationStore.getState().error(message);
      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await authService.register({ name, email, password });
      useNotificationStore.getState().success('Cadastro realizado com sucesso! Faça login.');
      navigate('/login');
      return response;
    } catch (error) {
      const message = error.response?.data?.error || 'Falha ao cadastrar usuário';
      useNotificationStore.getState().error(message);
      throw error;
    }
  };

  const handleLogout = async () => {
    logout();
    queryClient.clear();
    navigate('/');
  };

  return {
    user,
    token,
    isAuthenticated: !!token,
    login,
    register,
    logout: handleLogout,
  };
};

export default useAuth;
