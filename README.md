# Hydratation

Aplicativo de hidratação com registro rápido de consumo, metas diárias e ranking entre participantes.

## Estado atual

Este repositório começa pelo protótipo frontend. As três experiências principais já estão disponíveis:

- **Login e cadastro:** fluxo demonstrativo para entrar ou criar um perfil local.
- **Minha hidratação:** copo animado, progresso diário, meta ajustável, registros de consumo e recipientes personalizados.
- **Ranking:** classificação demonstrativa com filtros diário, semanal e mensal.

Os dados são armazenados no `localStorage` do navegador. A autenticação ainda não é real e o ranking usa participantes e valores de demonstração; nada é sincronizado entre dispositivos ou usuários.

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

## Próxima etapa

Conectar os serviços de dados a uma API em Cloudflare Workers e persistir usuários, recipientes, registros e ranking no Cloudflare D1. O protótipo não deve ser usado como sistema de autenticação ou acompanhamento clínico.

 
## Backend em Cloudflare

O Worker, a configuração Wrangler, a migration inicial e os endpoints REST estão sendo preparados em paralelo ao protótipo. Veja docs/cloudflare-worker.md para configuração local e implantação.

Os nomes hydratation-api e hydratation-db e o UUID em wrangler.jsonc são provisórios. O UUID deve ser substituído pelo ID real do D1 antes de executar uma migration remota ou publicar o Worker.
