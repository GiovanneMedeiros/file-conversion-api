# Convertly API

![Node](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13%2B-4169E1?logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7%2B-DC382D?logo=redis&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue)

API REST para conversao assincrona de arquivos com autenticacao JWT, fila com Redis/BullMQ e processamento em worker separado.

Projeto voltado para portfolio de backend: arquitetura modular, validacoes robustas, tratamento padronizado de erros, testes e validacao end-to-end.

## Sumario

- [Visao Geral](#visao-geral)
- [Funcionalidades](#funcionalidades)
- [Stack Tecnologica](#stack-tecnologica)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Instalacao](#instalacao)
- [Configuracao de Ambiente](#configuracao-de-ambiente)
- [Execucao em Desenvolvimento](#execucao-em-desenvolvimento)
- [Testes e Validacao](#testes-e-validacao)
- [Documentacao da API](#documentacao-da-api)
- [Exemplos de Uso](#exemplos-de-uso)
- [Erros Comuns](#erros-comuns)
- [CI](#ci)
- [Melhorias Futuras](#melhorias-futuras)
- [Licenca](#licenca)

## Visao Geral

A Convertly API permite que usuarios autenticados:

- enviem arquivos fonte
- solicitem conversao para formatos suportados
- acompanhem status da conversao
- baixem o resultado final
- consultem historico das conversoes

O fluxo de conversao e assincrono: a API enfileira jobs e o worker processa em background.

## Funcionalidades

- Cadastro e login com JWT
- Upload autenticado de arquivo
- Solicitacao de conversao assincrona
- Consulta de status por conversionId
- Download de arquivo convertido
- Historico de conversoes por usuario
- Rate limit em autenticacao e API geral
- Validacao de body, params, query e headers
- Swagger em `/docs`
- Smoke test E2E automatizado

## Stack Tecnologica

- Runtime: Node.js
- HTTP: Express
- Banco de dados: PostgreSQL
- ORM: Prisma
- Queue/Worker: Redis + BullMQ
- Conversao: Sharp, pdf-lib
- Auth: JWT, bcrypt
- Upload: Multer
- Validacao: Zod
- Logs: Winston
- Testes: Jest + Supertest
- Docs: Swagger (swagger-jsdoc + swagger-ui-express)

## Live Deployment

Frontend  
https://file-conversion-api.vercel.app

Backend  
https://file-conversion-api.onrender.com

## Estrutura do Projeto

```text
src/
  app/
    routes.js
  modules/
    auth/
      auth.controller.js
      auth.routes.js
      auth.service.js
      auth.validation.js
    file/
      file.controller.js
      file.routes.js
      file.service.js
      file.validation.js
    conversion/
      conversion.controller.js
      conversion.routes.js
      conversion.service.js
      conversion.validation.js
      download.routes.js
    user/
      user.routes.js
  shared/
    errors/
      httpError.js
    http/
      response.js
    middlewares/
      auth.middleware.js
      error.middleware.js
      rateLimit.middleware.js
      validateRequest.middleware.js
    security/
      jwt.js
    utils/
      logger.js
  queue/
    conversion.queue.js
  workers/
    conversion.worker.js
  database/
    prismaClient.js
  app.js
  server.js

scripts/
  smoke.ps1
  validate-local.ps1

prisma/
  schema.prisma
  migrations/
```

## Instalacao

1. Clone o repositorio:

```bash
git clone <URL_DO_REPOSITORIO>
cd convertly-api
```

2. Instale dependencias:

```bash
npm install
```

3. Gere o client Prisma:

```bash
npx prisma generate
```

4. Aplique migrations:

```bash
npx prisma migrate deploy
```

## Configuracao de Ambiente

Crie o arquivo `.env` na raiz com base em `.env.example`.

Exemplo:

```env
PORT=3000
LOG_LEVEL="info"
JSON_BODY_LIMIT="1mb"

DATABASE_URL="postgresql://db_user:db_password@localhost:5432/convertly"

JWT_SECRET="change_me_with_at_least_16_chars"
JWT_EXPIRES_IN="1h"
JWT_ISSUER="convertly-api"
JWT_AUDIENCE="convertly-clients"

BCRYPT_SALT_ROUNDS=10

REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_CONNECT_TIMEOUT_MS=5000

AUTH_RATE_LIMIT_WINDOW_MS=900000
AUTH_RATE_LIMIT_MAX=50
API_RATE_LIMIT_WINDOW_MS=900000
API_RATE_LIMIT_MAX=300
```

Requisitos:

- Node.js 20+
- PostgreSQL 13+
- Redis 7+
- PowerShell 5.1+ (scripts locais no Windows)

## Execucao em Desenvolvimento

Terminal 1 (API):

```bash
npm run dev
```

Terminal 2 (worker):

```bash
npm run worker
```

## Testes e Validacao

Testes automatizados:

```bash
npm test
```

Smoke test E2E (API + worker + Redis ativos):

```bash
npm run smoke
```

Validacao local completa (single command):

```bash
npm run validate
```

Esse comando sobe dependencias necessarias, espera o `/health`, executa smoke e finaliza os processos iniciados.

## Documentacao da API

Com a API em execucao:

- Swagger UI: `http://localhost:3000/docs`
- Health: `http://localhost:3000/health`

Endpoints principais:

- Publicos:
  - `GET /health`
  - `POST /auth/register`
  - `POST /auth/login`
- Protegidos (Bearer JWT):
  - `POST /files/upload`
  - `POST /conversions` (recomendado)
  - `POST /convert` (alias legado)
  - `GET /conversions/:id` (recomendado)
  - `GET /convert/:id` (alias legado)
  - `GET /downloads/:filename`
  - `GET /users/conversions`

## Exemplos de Uso

Registrar usuario:

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

Login:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

Upload:

```bash
curl -X POST http://localhost:3000/files/upload \
  -H "Authorization: Bearer <TOKEN>" \
  -F "file=@./scripts/smoke-sample.jpg"
```

Solicitar conversao:

```bash
curl -X POST http://localhost:3000/conversions \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"fileId":"<FILE_ID>","targetFormat":"png"}'
```

Consultar status:

```bash
curl -X GET http://localhost:3000/conversions/<CONVERSION_ID> \
  -H "Authorization: Bearer <TOKEN>"
```

Download:

```bash
curl -X GET http://localhost:3000/downloads/<RESULT_FILE> \
  -H "Authorization: Bearer <TOKEN>" \
  -o test-result.png
```

Historico:

```bash
curl -X GET http://localhost:3000/users/conversions \
  -H "Authorization: Bearer <TOKEN>"
```

## Erros Comuns

Formato padrao:

```json
{
  "error": "Validation error",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "email",
      "message": "email must be a valid email address",
      "code": "invalid_string"
    }
  ]
}
```

Cenarios frequentes:

- `400 VALIDATION_ERROR`: entrada invalida
- `400 INVALID_JSON`: JSON malformado
- `401 UNAUTHORIZED`: token ausente/invalido/expirado
- `404 NOT_FOUND`: recurso nao encontrado
- `409 CONFLICT`: email ja cadastrado
- `429 TOO_MANY_REQUESTS`: limite excedido
- `503 QUEUE_UNAVAILABLE`: Redis/fila indisponivel

## CI

Workflow em `.github/workflows/ci.yml`:

- roda em push e pull_request
- provisiona PostgreSQL e Redis
- aplica migrations
- sobe API e worker
- espera `/health`
- executa smoke test
- falha em qualquer regressao do fluxo principal

## Melhorias Futuras

- Refresh token e revogacao de sessao
- Armazenamento externo (S3/GCS)
- Mais testes para cenarios de seguranca e carga
- Versionamento de API (`/v1`)
- Cobertura minima e lint no CI

## Architecture note

- The original architecture used Redis queue and background workers for asynchronous processing.

- For the free deployment version, file conversion runs directly inside the API due to platform limitations.

## Licenca

MIT
