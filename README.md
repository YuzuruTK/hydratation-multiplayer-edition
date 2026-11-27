# Hydratation

Aplicativo de hidratação com registro rápido de consumo, metas diárias e ranking entre participantes.

## Estado atual

O projeto está dividido em etapas:

- **Frontend:** login/cadastro demonstrativo, hidratação, recipientes, histórico e ranking.
- **Backend:** API REST em Cloudflare Workers, persistência em D1 e autenticação por Cloudflare Access (OTP por e-mail).

O frontend continua usando `localStorage` até a etapa de integração dos serviços HTTP. O backend está sendo preparado separadamente para validar o ambiente Cloudflare antes de ligar as telas à API.

## Executar localmente

Requisitos: Node.js 20.19 ou superior.

```bash
npm install
npm run dev
```

Para validar a versão de produção:

```bash
npm run build
npm run preview
```

## Cloudflare

Consulte [docs/cloudflare-worker.md](docs/cloudflare-worker.md) para:
- Configuração do Worker e do D1.
- Configuração do Cloudflare Access com e-mail OTP.
- Migrations locais/remotas e deploy.
- Rotas e decisões de segurança.

O Worker está configurado para a conta Free com autenticação delegada ao Cloudflare Access. Não armazena senhas do aplicativo.
