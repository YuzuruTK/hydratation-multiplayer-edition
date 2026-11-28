# Cloudflare Worker

Frontend React e API são servidos pelo mesmo Worker; D1 guarda contas e dados de hidratação.

## Auth (padrão Thought Box)

- Cadastro público com e-mail e senha.
- Hash PBKDF2-HMAC-SHA-256 com 100.000 iterações e salt aleatório de 16 bytes, armazenado em `users.password_hash`.
- Login emite JWT HS256 com validade de 24 horas.
- API privada recebe `Authorization: Bearer <token>`.
- O secret de assinatura é configurado como Worker secret `JWT_SECRET`.
- Sem Cloudflare Access, Supabase ou tabela extra de sessão.
- Nesta versão não há confirmação de e-mail nem recuperação de senha; adicionar rate limit antes de escalar o cadastro público.

## Configuração

Worker: `hydration-multiplayer-edition`
D1: `hydratation-multiplayer-edition` (nome legado do recurso já provisionado no Cloudflare; mantido para preservar a conexão com o banco existente)
Binding D1: `DB`
Binding assets: `ASSETS`
Fuso: `America/Sao_Paulo`

Configure o secret:

```bash
npx wrangler secret put JWT_SECRET
```

## Desenvolvimento local

```bash
npm install
npm run build
npm run db:migrate:local
npm run dev:worker
```

Em outro terminal, `npm run dev`. O Vite encaminha `/api/*` ao Worker local.

## Migration remota e deploy

```bash
npm run db:migrate:remote
npm run build
npm run deploy
```

Execute a migration remota apenas quando estiver pronto para inicializar o D1 real.

## API

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/session`
- `POST /api/auth/logout`
- `GET/PATCH /api/me`
- `GET/POST /api/containers`
- `PATCH/DELETE /api/containers/:id`
- `GET /api/water/today`
- `POST /api/water`
- `DELETE /api/water/:id`
- `GET /api/ranking?period=day|week|month`

O frontend ainda precisa ser conectado aos endpoints; o protótipo atual usa localStorage.
