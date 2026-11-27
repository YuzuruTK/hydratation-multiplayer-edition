# Cloudflare Worker

A API usa um Worker como backend e serve o build do React pelo recurso Static Assets do mesmo Worker. Assim, frontend e API ficam na mesma origem e a sessão usa cookie HttpOnly sem precisar configurar CORS.

## Recursos configurados

- Worker: hydratation-api (nome provisório em wrangler.jsonc).
- D1: hydratation-db (nome provisório).
- Compatibilidade Node: `nodejs_compat` para usar `node:crypto` no hash de senhas.
- Binding do banco: DB.
- Binding dos arquivos estáticos: ASSETS.
- Fuso dos períodos: America/Sao_Paulo.

O database_id no Wrangler é um UUID fictício para a configuração inicial. Substitua-o pelo ID real do D1 antes de qualquer migração remota ou deploy. O nome do Worker e o nome do D1 também podem ser ajustados quando os recursos forem criados na conta Cloudflare.

## Desenvolvimento local

Requisitos: Node.js 20.19+.

Instale as dependências:

    npm install

Gere o build do frontend (o diretório dist é servido pelo Worker):

    npm run build

Aplique a migration no D1 local:

    npm run db:migrate:local

Inicie o Worker em um terminal:

    npm run dev:worker

Inicie o Vite em outro terminal:

    npm run dev

O Vite encaminha /api/* para http://127.0.0.1:8787. A variável APP_ORIGIN é injetada somente no comando de desenvolvimento. A interface ainda usa seu armazenamento local nesta etapa; a API será conectada à interface na integração seguinte.

## Migrações e publicação

Após substituir o database_id pelo UUID fornecido pelo Cloudflare:

    npm run db:migrate:remote
    npm run deploy

A migration remota altera o banco real. Execute-a apenas depois de conferir o nome e o ID do D1.

## Endpoints

| Método | Rota | Autenticação |
|---|---|---|
| GET | /api/health | Não |
| POST | /api/auth/register | Não |
| POST | /api/auth/login | Não |
| POST | /api/auth/logout | Sessão, quando existente |
| GET | /api/me | Sim |
| PATCH | /api/me | Sim |
| GET / POST | /api/containers | Sim |
| PATCH / DELETE | /api/containers/:id | Sim |
| GET | /api/water/today | Sim |
| POST | /api/water | Sim |
| DELETE | /api/water/:id | Sim |
| GET | /api/ranking?period=day|week|month | Sim |

## Decisões de segurança

- O hash de senha usa scrypt com N=2^14, r=8 e p=5 (16 MiB), uma das configurações mínimas alternativas indicadas pela OWASP quando Argon2id não está disponível.
- **A autenticação própria por senha exige validar o plano Workers.** O Workers Free limita CPU a 10 ms por requisição; scrypt deliberadamente custa mais CPU/memória. Não reduzir o custo do hash para tentar caber no Free. Se a conta estiver no Free, devemos trocar a identidade para Cloudflare Access ou um provedor externo antes de publicar.

- Senhas são armazenadas com scrypt e salt aleatório individual.
- O token de sessão é aleatório; somente seu SHA-256 fica no D1.
- A sessão é transportada em cookie HttpOnly, Secure e SameSite=Lax.
- Requisições com origem declarada são verificadas contra a origem do Worker e APP_ORIGIN.
- Todas as operações de recipientes e consumo verificam a propriedade do usuário no servidor.
- O ranking compartilha apenas identificador, nome e volume total, nunca e-mail, peso, altura ou meta pessoal.

Antes de disponibilizar publicamente, ainda precisamos configurar proteção contra tentativas repetidas de login e revisar limites operacionais para o uso esperado.
