# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:


## React Compiler
The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

# Convertly Frontend

Frontend React para o serviço de conversão de arquivos Convertly.

## Setup Local

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação

1. **Clone o repositório** (se necessário)
```bash
cd web
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**

Crie um arquivo `.env` na raiz do projeto (cópie de `.env.example`):
```bash
VITE_API_BASE_URL=http://localhost:3000
VITE_API_TIMEOUT=30000
```

### Executar em Desenvolvimento

```bash
npm run dev
```

O servidor está rodando em `http://localhost:5173`

### Build para Produção

```bash
npm run build
```

### Preview do Build

```bash
npm run preview
```

## Arquitetura

### Estrutura de Pastas

```
src/
├── components/          # Componentes React reutilizáveis
│   ├── Auth/           # Login e Register
│   ├── Conversion/     # Upload e status de conversão
│   ├── File/           # Upload de arquivos
│   ├── Layout/         # Layout, Header, Rotas protegidas
│   └── Common/         # Componentes genéricos (Button, Input, etc)
├── pages/              # Páginas da aplicação
├── hooks/              # Hooks customizados
├── services/           # Serviços de API
├── store/              # State management (Zustand)
├── utils/              # Utilitários
├── styles/             # Estilos globais
├── App.jsx             # Roteamento principal
└── main.jsx            # Entry point
```

### Stack Tecnológico

- **React 18** - UI framework
- **React Router v6** - Roteamento
- **TanStack React Query** - Sync com API
- **Zustand** - State management
- **Axios** - HTTP client
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas
- **Tailwind CSS** - Styling
- **Lucide React** - Ícones
- **Vite** - Build tool

## Fluxo de Autenticação

1. **Login/Register** → User é armazenado em Zustand store
2. **Token JWT** → Armazenado em localStorage
3. **Interceptador Axios** → Adiciona token em todas as requisições
4. **401 Unauthorized** → Limpa dados e redireciona para login

## Fluxo de Conversão

1. **Upload** → Arquivo é enviado via multipart/form-data
2. **Request Conversion** → Solicita conversão com fileId + targetFormat
3. **Polling Status** → A cada 2 segundos, busca o status (GET /conversions/{id})
4. **Download** → Quando status = "completed", download do arquivo

## Variáveis de Ambiente

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `VITE_API_BASE_URL` | `http://localhost:3000` | URL base da API |
| `VITE_API_TIMEOUT` | `30000` | Timeout das requisições em ms |

## Componentes Principais

### Auth
- `LoginForm` - Formulário de login
- `RegisterForm` - Formulário de registro

### File
- `FileUploader` - Upload de arquivo com drag-drop

### Conversion
- `ConversionForm` - Seletor de formato
- `ConversionStatus` - Status em tempo real com polling
- `ConversionCard` - Card no histórico

### Layout
- `Header` - Nav bar
- `Layout` - Wrapper
- `ProtectedRoute` - Rota autenticada

### Common
- `Button` - Botão customizado
- `Input` - Input com validação
- `Alert` - Alerta (info/success/error/warning)
- `Loading` - Spinner de carregamento
- `Modal` - Modal genérico

## Hooks Customizados

- `useAuth()` - Autenticação e logout
- `useFileUpload()` - Upload de arquivo
- `useRequestConversion()` - Solicitar conversão
- `useConversionStatus()` - Status da conversão (com polling)
- `useUserConversions()` - Histórico de conversões
- `useDownloadConvertedFile()` - Download de arquivo

## Stores (Zustand)

- `useAuthStore` - Dados do usuário e token
- `useNotificationStore` - Notificações do sistema

## API Interceptors

O Axios está configurado com:
- **Request Interceptor** - Adiciona Authorization header
- **Response Interceptor** - Trata 401 e redireciona para login

## Páginas

- `/` - Home (landing)
- `/login` - Login
- `/register` - Registro
- `/dashboard` - Dashboard (protegida)
- `/convert` - Converter arquivo (protegida)
- `/history` - Histórico de conversões (protegida)

## Troubleshooting

### "Cannot connect to API"
- Verifique se a API está rodando em `http://localhost:3000`
- Verificar VITE_API_BASE_URL em `.env`

### "Token expirado"
- Faça login novamente
- O token será limpo automaticamente

### "File upload fails"
- Verifique o tamanho (máximo 20MB)
- Verifique o formato (jpg, jpeg, png)

## Build & Deploy

```bash
# Build
npm run build

# Isso gera pasta 'dist/' pronta para deploy
```

Pode ser deployada em:
- Vercel
- Netlify
- GitHub Pages
- Qualquer servidor HTTP

## Licença

MIT

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
