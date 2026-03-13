import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000;

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

function buildApiErrorMessage(error) {
  if (error.code === 'ECONNABORTED') {
    return 'Tempo de resposta excedido. Tente novamente.';
  }

  if (!error.response) {
    return 'Falha de conexão com o servidor. Verifique sua internet.';
  }

  const data = error.response.data;
  const serverMessage =
    (typeof data === 'string' ? data : null) ||
    data?.message ||
    data?.error ||
    data?.details ||
    (Array.isArray(data?.errors) ? data.errors.join(', ') : null);

  if (serverMessage) return serverMessage;

  switch (error.response.status) {
    case 400:
      return 'Dados inválidos. Revise os campos e tente novamente.';
    case 401:
      return 'Sessão expirada. Faça login novamente.';
    case 403:
      return 'Você não tem permissão para esta ação.';
    case 404:
      return 'Recurso não encontrado.';
    case 409:
      return 'Conflito de dados. Verifique as informações.';
    case 422:
      return 'Não foi possível processar os dados enviados.';
    case 500:
      return 'Erro interno no servidor.';
    default:
      return 'Erro inesperado. Tente novamente.';
  }
}

// Interceptador para adicionar JWT token em requisições privadas
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    const url = (config.url || '').toLowerCase();

    const isPublicAuthRoute =
      /\/(login|register|signup)(\/|$)/i.test(url) ||
      /\/auth\/(login|register|signup)(\/|$)/i.test(url);

    // NOVO: permite forçar rota pública na chamada
    const skipAuth = config.skipAuth === true || isPublicAuthRoute;

    if (token && !skipAuth) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (config.headers?.Authorization) {
      delete config.headers.Authorization;
    }

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptador para tratar erros de resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // Anexa uma mensagem amigável para uso na UI
    error.userMessage = buildApiErrorMessage(error);

    // Se receber 401 (Unauthorized), limpar token e redirecionar para login
    if (status === 401) {
      localStorage.removeItem('auth_token'); localStorage.removeItem('auth_user');

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Log útil para debug
    console.error('[API ERROR]', {
      url: error.config?.url,
      method: error.config?.method,
      status,
      response: error.response?.data,
      message: error.userMessage,
    });

    return Promise.reject(error);
  }
);

export const getApiErrorMessage = (error) =>
  error?.userMessage || error?.message || 'Erro inesperado.';

export default api;
