import { Link } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import RegisterForm from '../components/Auth/RegisterForm';

export const RegisterPage = () => {
  return (
    <Layout>
      <div className="max-w-md mx-auto py-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold mb-2">Crie sua conta</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Cadastre-se para começar a converter
          </p>

          <RegisterForm />

          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
            Já tem conta?{' '}
            <Link to="/login" className="text-blue-600 hover:underline font-medium">
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default RegisterPage;
