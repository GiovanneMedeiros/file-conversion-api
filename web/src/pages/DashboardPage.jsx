import { useState } from 'react';
import { useUserConversions } from '../hooks/useConversion';
import Layout from '../components/Layout/Layout';
import { useAuth } from '../hooks/useAuth';
import { Loading, Alert } from '../components/Common';
import ConversionCard from '../components/Conversion/ConversionCard';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { data: conversions, isLoading, error } = useUserConversions();

  const recentConversions = conversions?.slice(0, 5) || [];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Greeting */}
        <div>
          <h1 className="text-3xl font-bold">
            Bem-vindo, <span className="text-blue-600">{user?.name}</span>!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Acompanhe suas conversões recentes
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { label: 'Conversões Totais', value: conversions?.length || 0 },
            {
              label: 'Concluídas',
              value: conversions?.filter((c) => c.status === 'completed').length || 0,
            },
            {
              label: 'Em Processamento',
              value: conversions?.filter((c) => c.status === 'processing').length || 0,
            },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
            >
              <p className="text-sm text-stone-400 mb-2">
                {stat.label}
              </p>
              <p className="text-3xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Recent Conversions */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Conversões Recentes</h2>

          {isLoading ? (
            <Loading />
          ) : error ? (
            <Alert type="error" message="Erro ao carregar conversões" className="border-white/10" />
          ) : recentConversions.length === 0 ? (
            <Alert type="info" message="Nenhuma conversão ainda. Comece convertendo um arquivo!" className="border-white/10" />
          ) : (
            <div className="grid gap-4">
              {recentConversions.map((conversion) => (
                <ConversionCard key={conversion.id} conversion={conversion} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
