# Enquadramentos Estratégicos — SEDEC-RJ

Sistema de consulta, colaboração e gestão dos Enquadramentos Estratégicos Setoriais da SEDEC-RJ.

## Pré-requisitos

- Node.js 18+
- Conta no Supabase (supabase.com)

## Setup

### 1. Supabase

1. Crie um projeto no [Supabase](https://app.supabase.com)
2. No **SQL Editor**, execute os arquivos na ordem:
   - `01_ddl_estrutura_v2.sql` (cria tabelas de dados)
   - `02_dml_dados_v2.sql` (popula com as 30 AEs)
   - `03_ddl_app.sql` (cria tabelas da aplicação: profiles, observações, projetos)
3. Em **Settings > API**, copie:
   - Project URL
   - anon/public key

### 2. Aplicação

```bash
# Clone e entre no diretório
cd enquadramentos-app

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.local.example .env.local
# Edite .env.local com seus dados do Supabase

# Rode em desenvolvimento
npm run dev
```

Acesse http://localhost:3000

### 3. Primeiro admin

1. Crie uma conta pelo formulário de cadastro
2. Confirme o email (verifique a caixa de entrada)
3. No Supabase SQL Editor, rode:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'seu-email@exemplo.com';
```

## Estrutura

```
src/
├── app/
│   ├── login/          # Tela de login/cadastro
│   ├── dashboard/      # Painel com cards das ações
│   │   └── acao/[numero]/ # Detalhe de uma ação
│   └── admin/          # Área administrativa
├── lib/
│   ├── supabase.ts     # Client browser
│   ├── supabase-server.ts # Client server
│   ├── types.ts        # TypeScript types
│   └── utils.ts        # Utilities
└── middleware.ts        # Auth guard
```

## Perfis de Acesso

| Perfil | Pode ver | Pode observar | Pode gerenciar |
|--------|----------|---------------|----------------|
| usuario | Tudo | Sim | Não |
| gestor | Tudo | Sim | Observações do setor |
| admin | Tudo | Sim | Tudo (obs, conteúdo, usuários) |

## Fase 2 (futuro)

As tabelas `projetos`, `entregas` e `atividades` já estão criadas no banco. A interface será adicionada quando necessário.
