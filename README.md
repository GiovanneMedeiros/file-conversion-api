# Convertly - File Conversion API

## 1. Titulo do Projeto
**Convertly - File Conversion API**

## 2. Descricao
Convertly e uma aplicacao web que permite converter arquivos entre diferentes formatos. O usuario pode fazer upload de um arquivo, escolher o formato de destino e baixar o arquivo convertido. O sistema tambem mantem o historico de conversoes realizadas.

## 3. Live Demo
- https://file-conversion-api.vercel.app

## 4. Funcionalidades
- Upload de arquivos
- Conversao entre formatos (PNG, JPG, PDF)
- Historico de conversoes
- Download de arquivos convertidos
- API REST documentada

## 5. Tecnologias Utilizadas
- Node.js
- Express
- Prisma ORM
- PostgreSQL (Neon)
- Vercel (Frontend)
- Render (API)

## 6. Arquitetura do Sistema
- Frontend hospedado na Vercel
- API hospedada no Render
- Banco de dados PostgreSQL no Neon

Fluxo principal:
1. O usuario envia um arquivo no frontend.
2. O frontend envia a solicitacao para a API.
3. A API processa a conversao e registra o historico no banco.
4. O usuario baixa o arquivo convertido.

## 7. Como Rodar o Projeto Localmente
1. Clonar o repositorio:

```bash
git clone <URL_DO_REPOSITORIO>
cd conversor-de-arquivo
```

2. Instalar dependencias:

```bash
npm install
```

3. Criar um arquivo `.env` na raiz do projeto.

4. Rodar o projeto:

```bash
npm run dev
```

## 8. Variaveis de Ambiente
Exemplo:

```env
NODE_ENV=development
DATABASE_URL=
JWT_SECRET=
PORT=3000
```

## 9. Autor
**Giovanne Medeiros**

- Estudante de Ciencia da Computacao
- Desenvolvedor focado em Backend e Full Stack
