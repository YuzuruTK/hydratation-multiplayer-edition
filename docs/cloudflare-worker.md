# Cloudflare Worker

O frontend React e a API REST são servidos pelo mesmo Worker usando Static Assets. A autenticação é delegada ao Cloudflare Access (código temporário por e-mail), e os perfis, recipientes e registros ficam no D1.

## Recursos configurados

- Worker: `hydratation-multiplayer-edition`.
- D1: `hydratation-multiplayer-edition`.
- D1 ID: `2d015ed2-47f2-428b-8a8a-5f7ec43b1106`.
- Binding do banco: `DB`.
- Binding dos arquivos estáticos: `ASSETS`.
- Fuso dos períodos: `America/Sao_Paulo`.

## Configurar autenticação Cloudflare Access (plano Free)

A conta Free tem limite de 10 ms de CPU por requisição no Workers. Por isso, o aplicativo não armazena senhas nem executa KDF de senha no Worker. O Cloudflare Access autentica a identidade por e-mail OTP antes de encaminhar a requisição.

1. No painel Cloudflare, abra **Zero Trust** e conclua a configuração do Cloudflare One Free.
2. Em **Access controls → Applications**, crie uma aplicação para o Worker `hydratation-multiplayer-edition` (Self-hosted).
3. Habilite **One-time PIN** como método de login.
4. Crie uma policy **Allow**.
   - Para restringir aos seus amigos, use o seletor **Emails** e adicione os e-mails permitidos.
   - Para permitir que qualquer pessoa com e-mail válido entre, use **Login Methods → One-time PIN**. Essa configuração abre o cadastro a qualquer pessoa que consiga receber o OTP.
5. Ative a proteção do próprio Worker no painel Workers & Pages → hydratation-multiplayer-edition → Settings/Access, incluindo as URLs `workers.dev` de produção e preview, para que não exista um endereço alternativo sem Access.
6. Copie o **team domain** (por exemplo, `seu-time.cloudflareaccess.com`) e o **Application Audience (AUD) Tag** da aplicação.

Depois disso, adicione os dois valores como variáveis do Worker:

- `ACCESS_TEAM_DOMAIN`: somente o hostname do team domain, sem `https://`.
- `ACCESS_AUD`: Audience tag da aplicação criada.

A validação da API verifica a assinatura RS256 do header `Cf-Access-Jwt-Assertion`, além de issuer, audience, expiração e identidade. As chaves públicas do Access são obtidas do endpoint oficial de certificados e mantidas em cache no isolate por cinco minutos. A API não confia apenas na presença do header.

O Access Free é indicado para equipes com menos de 50 usuários. Veja a página de planos e os limites atuais antes de abrir o aplicativo para um público maior.

## Desenvolvimento local

Requisitos: Node.js 20.19+.

```bash
npm install
npm run build
npm run db:migrate:local
npm run dev:worker
```

Em outro terminal:

```bash
npm run dev
```

O Vite encaminha `/api/*` para `http://127.0.0.1:8787`. Para testar endpoints protegidos localmente, será necessário usar um token de Access válido ou adicionar um mock seguro de identidade nos testes. Não há bypass de autenticação habilitado no Worker.

## Migrações e publicação

O D1 já está configurado com o nome e o ID informados. Depois de revisar a migration e definir `ACCESS_TEAM_DOMAIN` e `ACCESS_AUD`, os comandos são:

```bash
npm run db:migrate:remote
npm run build
npm run deploy
```

A migration remota altera o banco real; execute-a somente quando estiver pronto para inicializar o banco.

## Endpoints

| Método | Rota | Autenticação |
|---|---|---|
| GET | `/api/health` | Access na borda |
| GET | `/api/auth/session` | Access |
| POST | `/api/auth/register` | Access |
| POST | `/api/auth/logout` | Access |
| GET | `/api/me` | Access + perfil |
| PATCH | `/api/me` | Access + perfil |
| GET / POST | `/api/containers` | Access + perfil |
| PATCH / DELETE | `/api/containers/:id` | Access + perfil |
| GET | `/api/water/today` | Access + perfil |
| POST | `/api/water` | Access + perfil |
| DELETE | `/api/water/:id` | Access + perfil |
| GET | `/api/ranking?period=day\|week\|month` | Access + perfil |

## Decisões de segurança

- Login e OTP são gerenciados pelo Cloudflare Access.
- A API valida a assinatura RS256 do JWT do Access, o issuer, a audiência e a expiração.
- O identificador imutável `sub` do Access é associado ao perfil por `access_sub`.
- E-mail e nome nunca são aceitos do corpo de registro: o e-mail vem da identidade verificada pelo Access.
- Todas as operações de recipientes e consumo verificam a propriedade do usuário no servidor.
- O ranking compartilha apenas identificador, nome e volume total, nunca e-mail, peso, altura ou meta pessoal.
- Não há senha local nem tabela de sessão própria.

A proteção do Worker no painel é obrigatória para produção. Não deixe uma URL alternativa de Worker/preview acessível sem Access.
