import { useState } from 'react';
import { useUserConversions } from '../hooks/useConversion';
import Layout from '../components/Layout/Layout';
import { Loading, Alert } from '../components/Common';
import ConversionCard from '../components/Conversion/ConversionCard';

export const HistoryPage = () => {
  const { data: conversions, isLoading, error } = useUserConversions();
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredConversions = statusFilter === 'all'
    ? conversions
    : conversions?.filter((c) => c.status === statusFilter);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Histórico de Conversões</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Veja todas as suas conversões realizadas
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {['all', 'completed', 'processing', 'failed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-amber-300 text-stone-950'
                  : 'bg-white/10 text-stone-100 hover:bg-white/15 border border-white/10'
              }`}
            >
              {status === 'all' ? 'Todos' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Conversions List */}
        {isLoading ? (
          <Loading />
        ) : error ? (
          <Alert type="error" message="Erro ao carregar histórico" className="border-white/10" />
        ) : filteredConversions?.length === 0 ? (
          <Alert type="info" message="Nenhuma conversão encontrada" className="border-white/10" />
        ) : (
          <div className="grid gap-4">
            {filteredConversions?.map((conversion) => (
              <ConversionCard key={conversion.id} conversion={conversion} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default HistoryPage;
