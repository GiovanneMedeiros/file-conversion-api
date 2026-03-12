import { Link } from 'react-router-dom';
import { ArrowRight, FileStack, ScanSearch, ShieldCheck, Sparkles, Upload, Waves, Zap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/Common';
import Layout from '../components/Layout/Layout';

export const HomePage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Layout>
      <div className="space-y-24 pb-10">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 px-6 py-16 backdrop-blur-sm md:px-12 md:py-24">
          <div className="absolute inset-0 opacity-60">
            <div className="absolute -left-20 top-0 h-56 w-56 rounded-full bg-amber-300/20 blur-3xl" />
            <div className="absolute right-0 top-24 h-72 w-72 rounded-full bg-sky-400/15 blur-3xl" />
          </div>

          <div className="relative grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-sm text-amber-100">
                <Sparkles className="h-4 w-4" />
                Conversão assíncrona com fila, autenticação e histórico
              </div>

              <div className="space-y-5">
                <h1 className="max-w-4xl text-5xl font-semibold leading-none tracking-tight md:text-7xl">
                  Seu backend já prova capacidade.
                  <span className="font-display ml-2 text-amber-300">Agora a interface também.</span>
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-stone-300 md:text-xl">
                  A Convertly apresenta upload, processamento e download com uma camada visual de portfólio:
                  direta, elegante e pronta para demonstrar produto de verdade.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                {isAuthenticated ? (
                  <Link to="/convert">
                    <Button size="lg" className="min-w-52">
                      Ir para conversão
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/register">
                      <Button size="lg" className="min-w-52">
                        Criar conta
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link to="/login">
                      <Button size="lg" variant="secondary" className="min-w-40">
                        Entrar
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  ['20MB por arquivo', 'Upload seguro com feedback imediato'],
                  ['5 formatos alvo', 'PNG, JPG, JPEG, WEBP e PDF'],
                  ['Histórico vivo', 'Atualização automática de conversões'],
                ].map(([title, description]) => (
                  <div key={title} className="rounded-2xl border border-white/10 bg-stone-900/70 p-4">
                    <p className="text-sm font-semibold text-stone-100">{title}</p>
                    <p className="mt-2 text-sm leading-6 text-stone-400">{description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="rounded-[1.75rem] border border-white/10 bg-stone-950/90 p-6 shadow-2xl shadow-black/30">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <p className="text-sm text-stone-400">Fluxo principal</p>
                    <p className="text-xl font-semibold text-stone-50">Upload para download</p>
                  </div>
                  <div className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-medium text-emerald-300">
                    Online
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {[
                    { icon: Upload, title: 'Envio de arquivo', text: 'FormData com o campo exato esperado pelo backend.' },
                    { icon: Waves, title: 'Processamento assíncrono', text: 'Fila Redis + worker com polling automático no frontend.' },
                    { icon: FileStack, title: 'Entrega final', text: 'Status completo, histórico e download protegido por JWT.' },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="flex items-start gap-3">
                          <div className="rounded-xl bg-amber-300/15 p-2 text-amber-300">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium text-stone-100">{item.title}</p>
                            <p className="mt-1 text-sm leading-6 text-stone-400">{item.text}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          {[
            {
              icon: Zap,
              title: 'Rápido no que importa',
              description: 'O frontend reage com polling e atualização automática sem virar uma interface confusa.',
            },
            {
              icon: ShieldCheck,
              title: 'Protegido por sessão',
              description: 'Autenticação JWT integrada ao cliente, com tratamento de expiração e rotas privadas.',
            },
            {
              icon: ScanSearch,
              title: 'Bom para demo técnica',
              description: 'Cada etapa deixa visível a arquitetura real por trás do produto: API, fila, worker e storage.',
            },
          ].map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <div className="mb-4 inline-flex rounded-2xl bg-sky-400/10 p-3 text-sky-300">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-semibold">{feature.title}</h2>
                <p className="mt-3 text-sm leading-7 text-stone-400">{feature.description}</p>
              </div>
            );
          })}
        </section>

        <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <p className="text-sm uppercase tracking-[0.3em] text-stone-500">Apresentação</p>
            <h2 className="font-display mt-4 text-5xl leading-none text-stone-50">
              Interface com cara de produto, não só de formulário.
            </h2>
            <p className="mt-6 text-base leading-8 text-stone-300">
              A proposta aqui não é esconder a engenharia. É expor o fluxo com clareza visual,
              deixando evidente que existe autenticação, upload robusto, enfileiramento, status e entrega final.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ['Upload', 'Seleção, validação e envio com feedback imediato.'],
              ['Conversão', 'Solicitação com status pendente, processando ou concluído.'],
              ['Histórico', 'Lista viva das conversões do usuário com auto-refresh.'],
              ['Download', 'Recuperação segura do arquivo convertido ao final do job.'],
            ].map(([title, description]) => (
              <div key={title} className="rounded-[1.5rem] border border-white/10 bg-stone-900/70 p-5">
                <p className="text-lg font-semibold text-stone-100">{title}</p>
                <p className="mt-2 text-sm leading-7 text-stone-400">{description}</p>
              </div>
            ))}
          </div>
        </section>

        {!isAuthenticated && (
          <section className="rounded-[2rem] border border-amber-300/20 bg-gradient-to-r from-amber-300/12 via-amber-200/8 to-sky-400/10 px-8 py-12 text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-amber-200/80">Pronto para demonstrar</p>
            <h2 className="mt-4 text-4xl font-semibold text-stone-50 md:text-5xl">
              Entre, envie um arquivo e deixe o fluxo vender o projeto.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-stone-300">
              O backend já está operacional. A interface agora acompanha com uma camada visual mais madura e convincente.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              {isAuthenticated ? (
                <Link to="/convert">
                  <Button size="lg">Começar Conversão</Button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <Button size="lg">Criar Conta</Button>
                  </Link>
                  <Link to="/login">
                    <Button size="lg" variant="secondary">
                      Entrar
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default HomePage;
