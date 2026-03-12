import { Link } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import LoginForm from '../components/Auth/LoginForm';

export const LoginPage = () => {
  return (
    <Layout>
      <div className="max-w-md mx-auto py-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold mb-2">Bem-vindo</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Faça login para continuar
          </p>

          <LoginForm />

          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
            Não tem conta?{' '}
            <Link to="/register" className="text-blue-600 hover:underline font-medium">
              Criar uma
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;
