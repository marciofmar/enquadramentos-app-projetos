# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Comandos

```bash
npm run dev      # Servidor de desenvolvimento em localhost:3000
npm run build    # Build de produção
npm start        # Serve o build de produção
```

Não há scripts de lint ou testes configurados.

## Variáveis de ambiente

O arquivo `.env.local` requer:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Arquitetura

**Stack:** Next.js 14 (App Router) + TypeScript + Supabase + Tailwind CSS

### Autenticação e controle de acesso

O `src/middleware.ts` protege todas as rotas `/dashboard/*` e `/admin/*`, redirecionando para `/login` quando não autenticado. A rota `/admin` realiza uma segunda verificação de perfil no lado do cliente: apenas usuários com `role === 'admin'` chegam ao conteúdo.

Existem três perfis (`src/lib/types.ts`):
- `usuario` — somente leitura
- `gestor` — pode criar/editar projetos conforme `configuracoes`
- `admin` — acesso total, incluindo área administrativa

### Clientes Supabase

Dois helpers distintos:
- `src/lib/supabase.ts` — `createClient()` para uso em Client Components (`'use client'`)
- `src/lib/supabase-server.ts` — `createServerSupabase()` para Server Components e middleware

### Estrutura de dados principal

O domínio central é a **Ação Estratégica** (`acoes_estrategicas`). Cada ação possui:
- **Destaque estratégico** (`destaques_estrategicos` + `destaque_linhas`)
- **Quadro panorâmico** (`panoramico_linhas` + `panoramico_setores` N:N)
- **Fichas detalhadas** (`fichas` + `ficha_setores` N:N)
- **Fundamentação** (`fundamentacoes` + `fundamentacao_itens`)
- **Observações** de usuários (`observacoes`)

A tabela `ficha_setores` controla quais setores aparecem no filtro do dashboard. O campo `tipo_participacao` determina o grupo de exibição: `principal` e `coordenador` → "Participação específica"; demais valores → "Participação em conjunto".

Campos array do PostgreSQL (`contribuicao_esperada`, `nao_escopo`, `dependencias_criticas` em `fichas`) são editados na UI como texto com um item por linha, convertidos via `arrayToText`/`textToArray` em `src/app/admin/page.tsx`.

### Módulo de projetos

`projetos` → `entregas` → `atividades` (hierarquia). Participantes são referenciados via `entrega_participantes` e `atividade_participantes`. Os projetos são vinculados às ações via `projeto_acoes` (N:N).

### Configurações dinâmicas

A tabela `configuracoes` armazena feature flags como pares `chave/valor`. Chaves relevantes:
- `obs_permitir_criacao` / `obs_exibir_para_usuarios` — controle de observações
- `proj_permitir_cadastro` / `proj_permitir_edicao` / `proj_permitir_edicao_datas` — controle do módulo de projetos

### Padrões de UI

- Classes CSS utilitárias `card` e `input-field` estão definidas em `src/app/globals.css`
- Cor customizada `sedec-*` está configurada em `tailwind.config.js`
- Ícones via `lucide-react`; função utilitária `cn()` em `src/lib/utils.ts` combina `clsx` + `tailwind-merge`
- O dashboard preserva filtros ativos na query string da URL para restaurar estado ao voltar do detalhe da ação

### Migrações Supabase

Migrações ficam em `supabase/migrations/`. Para aplicar localmente use o Supabase CLI. O banco remoto é gerenciado via `supabase/config.toml`.
