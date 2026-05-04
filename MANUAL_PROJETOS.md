# Manual de Utilização — Gestão de Projetos (SIGPLAN)

---

## 1. Características gerais do sistema

Estas regras se aplicam a **todos os perfis** (usuário, gestor, master) e são comportamentos inerentes ao sistema.

### 1.1 Visibilidade universal

Todos os usuários autenticados enxergam **todos os projetos** e seus detalhes completos: entregas, atividades, participantes, indicadores, datas e status. Não existe restrição de visualização por setor ou perfil — a restrição é apenas sobre **quem pode editar**.

### 1.2 Hierarquia de entidades

A estrutura de dados é hierárquica:

```
Projeto
  └─ Entregas (1:N)
       └─ Atividades (1:N)
```

Cada projeto tem um **setor líder** e um **líder** (pessoa responsável pelo projeto). Cada entrega tem um **órgão responsável** (setor) e um **responsável pela entrega** (pessoa). Cada atividade tem um **responsável pela atividade** (pessoa).

### 1.3 Indicadores

Cada projeto pode ter **nenhum ou múltiplos indicadores**. Cada indicador é composto por 7 campos estruturados: nome (obrigatório), fórmula, fonte de dados, periodicidade, unidade de medida, responsável e meta.

### 1.4 Matriz de Riscos

Cada projeto pode ter **nenhum ou múltiplos riscos** cadastrados em sua matriz de riscos. Cada risco é composto por 4 campos:

| Campo | Descrição | Obrigatoriedade |
|-------|-----------|-----------------|
| **Natureza** | O que pode acontecer — evento ou condição incerta que pode afetar o projeto | Obrigatório (se qualquer campo for preenchido) |
| **Probabilidade** | Chance de ocorrência: **Baixa**, **Média** ou **Alta** | Opcional |
| **Impacto** | Magnitude das consequências caso o risco se concretize: **Alto**, **Médio** ou **Baixo** | Opcional |
| **Medida de Resposta** | Ação concreta para reduzir, contornar ou mitigar os efeitos do risco | Opcional |

O formato é idêntico ao de indicadores: o usuário pode adicionar quantos riscos achar necessário usando o botão "+ Risco", e cada risco pode ser removido individualmente. Se qualquer campo de um risco for preenchido, o campo **Natureza** torna-se obrigatório.

Cada campo possui um botão de orientação (?) que abre um modal explicativo com exemplos e diretrizes para preenchimento.

### 1.5 Dependências críticas do projeto

O campo **Dependências críticas do projeto** permite registrar todas as dependências que podem afetar o andamento do projeto, incluindo:

- **Dependências de entrada** — o que o projeto precisa receber de outros projetos, órgãos ou processos
- **Dependências de saída** — o que outros projetos ou processos aguardam deste projeto
- **Dependências orçamentárias** — aprovações de crédito, processos licitatórios
- **Dependências normativas** — publicações, autorizações legais, pareceres
- **Dependências de recursos** — pessoal, equipamentos, infraestrutura
- **Dependências externas** — decisões de outros órgãos, fornecedores, parceiros

Esse mapeamento permite ao Gabinete de Projetos identificar riscos de bloqueio antecipadamente.

### 1.6 Status de projetos

Os projetos possuem três estados de visualização:

- **Ativos** — projetos que possuem, ao menos, uma entrega não resolvida (padrão)
- **Concluídos** — todas as entregas finalizadas (calculado automaticamente)
- **Hibernando** — projetos pausados (definido manualmente, apenas por master/admin)

Na lista de projetos, o usuário alterna entre as três abas para filtrar a exibição.

### 1.7 Pontualidade das entregas

Cada entrega exibe um indicador visual de pontualidade baseado na data final prevista:

| Indicador | Condição |
|-----------|----------|
| Verde (em dia) | Prazo em mais de 15 dias |
| Amarelo (atenção) | Prazo dentro dos próximos 15 dias |
| Vermelho (atrasado) | Prazo já vencido |

### 1.8 Validações de datas

O sistema aplica validações bidirecionais de datas:

- A **data de início de uma entrega** não pode ser anterior à data de início do projeto.
- A **data final prevista de uma entrega** não pode ser anterior à data de início do projeto.
- A **data prevista de uma atividade** deve estar dentro do intervalo da entrega (entre `data_inicio` e `data_final_prevista`).
- **Não é possível alterar a data de início de uma entrega** para uma data posterior à data prevista de qualquer atividade já cadastrada. O sistema bloqueia a alteração e informa quais atividades possuem datas incompatíveis, exigindo que sejam ajustadas primeiro.

### 1.9 Validações de campos obrigatórios

Em qualquer formulário de criação ou edição:

- **Projeto:** nome, descrição, problema que resolve, setor líder, líder e ao menos uma ação estratégica.
- **Entrega:** nome, descrição, critérios de aceite, órgão responsável, responsável pela entrega e ao menos um participante com papel definido.
- **Atividade:** nome, descrição e responsável pela atividade.
- **Indicador:** se qualquer campo do indicador for preenchido, o campo **nome** é obrigatório.
- **Risco:** se qualquer campo do risco for preenchido, o campo **natureza** é obrigatório.

O sistema não permite salvar formulários com campos obrigatórios vazios, informando qual campo está faltando.

### 1.10 Elegibilidade para papéis

| Papel | Perfis elegíveis |
|-------|-----------------|
| Líder do projeto | Gestor e master |
| Responsável por entrega | Gestor e master |
| Responsável por atividade | Gestor e master |
| Participante de entrega | Qualquer setor (entidade organizacional) |
| Participante de atividade | Gestor, master e usuário (pessoas) |

O perfil **usuário** pode ser participante de atividades, mas não pode ser líder ou responsável, pois essas funções exigem permissão de edição que o perfil somente-leitura não possui.

### 1.11 Ações estratégicas especiais

Existem duas ações estratégicas que **não aparecem no módulo de enquadramento** (cards do dashboard principal):

- **AE CAML** — Projetos da Coordenadoria de Apoio à Medicina Legal
- **Sem AE** — Fora de enquadramento

Elas estão disponíveis apenas na seleção de ações ao criar ou editar projetos, permitindo cadastrar projetos que não se enquadram na estrutura estratégica regular.

### 1.12 Órgão responsável e participantes

Ao salvar uma entrega, o sistema **inclui automaticamente** o órgão responsável como participante, caso ele ainda não esteja na lista. Isso garante que o setor responsável pela entrega sempre aparece entre os participantes.

---

## 2. Permissões por perfil

### 2.1 Perfil "usuário"

O perfil **usuário** possui acesso **somente leitura** ao módulo de projetos:

- Visualiza todos os projetos, entregas, atividades e seus detalhes
- **Não pode** criar, editar ou excluir nenhuma entidade
- **Pode** ser adicionado como participante de atividades (por um gestor/master do setor dele)
- Recebe alertas quando é nomeado como participante

### 2.2 Perfil "gestor"

O perfil **gestor** pode criar e editar entidades, com as seguintes restrições:

#### Restrição de setor

O gestor só pode designar **membros e setores do seu próprio setor**. Isso significa:

- **Setor líder do projeto:** é automaticamente o setor do gestor (não pode escolher outro)
- **Líder do projeto:** apenas pessoas do seu setor
- **Participantes de entrega (setores):** apenas o próprio setor
- **Órgão responsável da entrega:** apenas o próprio setor
- **Responsável pela entrega:** apenas pessoas do seu setor
- **Responsável pela atividade:** apenas pessoas do seu setor
- **Participantes de atividade (pessoas):** apenas pessoas do seu setor

Se o gestor tentar designar membros de outro setor, o sistema bloqueia a operação e informa:

> *"Gestores só podem designar membros do próprio setor. Para designar outros setores ou pessoas, entre em contato com o Gabinete de Projetos."*

#### Permissões condicionais (dependem das configurações)

As ações do gestor dependem de **três fatores combinados:**

1. Seu **perfil** (gestor)
2. Seu **papel no projeto** (setor líder, responsável por entrega, responsável por atividade)
3. As **configurações** definidas pelo master no painel administrativo

Veja a seção 3 para a matriz completa.

### 2.3 Perfil "master"

O perfil **master** (Gabinete de Projetos) possui acesso amplo:

- Pode designar **qualquer setor** e **qualquer pessoa** (de qualquer setor) em todos os papéis
- Pode criar, editar e excluir projetos, entregas e atividades **sem depender das configurações** do painel
- Pode **hibernar e reativar** projetos
- Pode alterar configurações do módulo de projetos no painel administrativo
- Pode gerenciar usuários (alterar perfis para solicitante/usuário/gestor, alterar setores, zerar senhas e excluir), **exceto** outros masters e admins
- **Não pode** atribuir os perfis "master" ou "admin" a outros usuários (isso é restrito ao admin)
- Recebe **alertas de todas as alterações** em projetos, entregas e atividades, desde que o fluxo de aprovação por solicitação **não** esteja ativo. Quando o fluxo de aprovação está ativo, o master acompanha as mudanças pela aba "Solicitações" no painel administrativo

---

## 3. Matriz de permissões detalhada

As permissões de edição são controladas em 5 níveis hierárquicos, cruzando o **papel do usuário no projeto** com as **configurações do painel**.

### 3.1 Dimensão: Papel no projeto

| Papel | Como é determinado |
|-------|-------------------|
| **Setor líder** | O setor do gestor coincide com o `setor_lider_id` do projeto |
| **Responsável pela entrega** | A pessoa é a designada como `responsavel_entrega_id` de uma entrega específica |
| **Responsável pela atividade** | A pessoa é a designada como `responsavel_atividade_id` de uma atividade específica |

### 3.2 Dimensão: Configurações do painel administrativo

| Configuração | Efeito quando desabilitada | Padrão |
|-------------|---------------------------|--------|
| Cadastro de projetos/entregas | Gestores não podem criar | Habilitado |
| Edição/exclusão de projetos/entregas | Gestores não podem editar nem excluir | Habilitado |
| Edição de quinzenas das entregas | Datas travadas para gestores | Habilitado |
| Cadastro de atividades | Gestores não podem criar atividades | Habilitado |
| Edição/exclusão de atividades | Gestores não podem editar nem excluir atividades | Habilitado |
| Edição de datas das atividades | Datas travadas para gestores | Habilitado |
| Exigir aprovação para edições | Edições de gestores ficam pendentes de aprovação | Desabilitado |

**Nota:** todas as configurações iniciam como habilitadas, exceto "Exigir aprovação" que inicia desabilitada. O master pode alterar esses valores a qualquer momento no painel administrativo. As mudanças têm efeito imediato.

### 3.3 Nível Projeto

| Ação | Setor líder | Outro gestor | Master/Admin |
|------|:-----------:|:------------:|:------------:|
| Criar projeto | Se cadastro habilitado | Se cadastro habilitado | Sempre |
| Editar dados do projeto | Se edição habilitada | Nunca | Sempre |
| Excluir projeto | Se edição habilitada | Nunca | Sempre |
| Hibernar/reativar | Nunca | Nunca | Sempre |

### 3.4 Nível Entrega

| Ação | Setor líder | Responsável pela entrega | Outro gestor | Master/Admin |
|------|:-----------:|:------------------------:|:------------:|:------------:|
| Criar entrega | Se cadastro habilitado | N/A | Nunca | Sempre |
| Editar todos os campos | Se edição habilitada | Nunca | Nunca | Sempre |
| Editar campos limitados (status, motivo) | N/A | Se edição habilitada | Nunca | Sempre |
| Editar datas/quinzena | Se datas habilitadas | Se datas habilitadas | Nunca | Sempre |
| Excluir entrega | Se edição habilitada | Nunca | Nunca | Sempre |

**Nota:** o responsável pela entrega pode editar campos limitados (status e motivo de status) quando a edição está habilitada, mas não pode editar os campos completos da entrega (nome, descrição, critérios, participantes). Essa capacidade é exclusiva do setor líder e do master/admin.

### 3.5 Nível Atividade

| Ação | Setor líder | Responsável pela entrega | Responsável pela atividade | Outro | Master/Admin |
|------|:-----------:|:------------------------:|:--------------------------:|:-----:|:------------:|
| Criar atividade | Se cadastro ativ. habilitado | Se cadastro ativ. habilitado | Nunca | Nunca | Sempre |
| Editar todos os campos | Se edição ativ. habilitada | Se edição ativ. habilitada | Nunca | Nunca | Sempre |
| Editar campos limitados (status, motivo) | N/A | N/A | Se edição ativ. habilitada | Nunca | Sempre |
| Editar data da atividade | Se datas ativ. habilitadas | Se datas ativ. habilitadas | Se datas ativ. habilitadas | Nunca | Sempre |
| Excluir atividade | Se edição ativ. habilitada | Se edição ativ. habilitada | Nunca | Nunca | Sempre |

**Pré-requisito:** a criação de atividades **exige** que a entrega tenha um responsável definido. Se a entrega não possui responsável, ninguém (exceto master/admin) pode criar atividades nela.

---

## 4. Sistema de alertas

### 4.1 Faixa amarela — Prazo próximo

Aparece no topo do dashboard quando o usuário logado é:
- **Responsável por atividades** com data prevista nos próximos 7 dias; ou
- **Responsável por entregas** com data final prevista nos próximos 7 dias (independentemente de terem atividades cadastradas).

No caso de entregas, o alerta permite que o responsável acompanhe o prazo e possa cobrar os responsáveis pelas atividades vinculadas.

Ao clicar na faixa, o sistema filtra a lista de projetos para mostrar apenas os projetos afetados.

### 4.2 Faixa laranja — Alertas de edição

Aparece quando o usuário possui alertas não lidos de alterações em projetos. Os alertas são **agrupados por projeto** e podem ser **dispensados individualmente**. Ao clicar no nome de um projeto na lista de alertas, o sistema redireciona para o projeto.

### 4.3 Tipos de alerta

| Tipo | Quando é gerado | Quem recebe |
|------|-----------------|-------------|
| Edição de projeto | Dados do projeto são alterados | Líder, responsáveis por entregas e masters |
| Criação de entrega | Nova entrega é adicionada | Líder do projeto e masters |
| Edição de entrega | Dados de uma entrega são alterados | Líder, responsável pela entrega e masters |
| Exclusão de entrega | Uma entrega é removida | Líder, responsável, participantes e masters |
| Criação de atividade | Nova atividade é adicionada | Líder, responsável pela entrega e masters |
| Edição de atividade | Dados de uma atividade são alterados | Líder, resp. entrega, resp. atividade e masters |
| Exclusão de atividade | Uma atividade é removida | Líder, resp. entrega, resp. atividade, participantes e masters |
| Nomeação de líder | Líder é designado ou trocado | Pessoa nomeada, pessoa removida, gestores do setor líder e masters |
| Nomeação resp. entrega | Responsável por entrega é designado ou trocado | Pessoa nomeada, pessoa removida e masters |
| Nomeação resp. atividade | Responsável por atividade é designado ou trocado | Pessoa nomeada, pessoa removida e masters |
| Nomeação participante | Participante adicionado a uma atividade | Pessoa adicionada e masters |
| Alteração setor líder | Setor líder do projeto é trocado | Gestores do setor antigo, gestores do setor novo e masters |
| Alteração setor entrega | Órgão responsável de uma entrega é trocado | Gestores do setor antigo, gestores do setor novo e masters |

**Regras gerais:**
- O **autor** da ação nunca recebe alerta de sua própria ação.
- Os alertas para **masters** são gerados quando o fluxo de aprovação por solicitação **não** está ativo. Quando está ativo, os masters acompanham pela aba "Solicitações".

---

## 5. Fluxo de aprovação (quando ativo)

Quando a configuração "Exigir aprovação para edições/exclusões de gestores" está **ativa**:

1. Gestores continuam preenchendo os formulários normalmente
2. Ao salvar, em vez de gravar diretamente, o sistema gera uma **solicitação de alteração**
3. A solicitação fica pendente na aba "Solicitações" do painel administrativo
4. O master ou admin revisa e **aprova** ou **rejeita** cada solicitação
5. Se aprovada, a alteração é efetivada automaticamente

Masters e admins **não são afetados** por essa configuração — suas edições sempre são aplicadas diretamente.

---

## 6. Operações administrativas sobre usuários

Estas operações são realizadas pelo **admin** e pelo **master** (com as restrições descritas abaixo) na aba "Usuários" do painel administrativo.

### 6.1 Quem pode gerenciar quem

| Operação | Admin | Master |
|----------|:-----:|:------:|
| Alterar perfil de solicitante/usuário/gestor | Todos os perfis disponíveis | Apenas para solicitante, usuário e gestor |
| Alterar perfil para master ou admin | Sim | Nunca |
| Alterar setor de usuário | Qualquer usuário | Apenas solicitante, usuário e gestor |
| Zerar senha | Qualquer usuário | Apenas solicitante, usuário e gestor |
| Excluir usuário | Qualquer usuário | Apenas solicitante, usuário e gestor |
| Editar nome | Qualquer usuário | Apenas solicitante, usuário e gestor |

O master **não pode** modificar outros masters nem admins.

### 6.2 Mudança de setor de um usuário

Quando o setor de um usuário é alterado:

- Se o usuário era **líder de algum projeto** cujo setor líder era o setor antigo, ele permanece como líder, mas a restrição de setor faz com que ele agora consiga designar pessoas do novo setor. Cabe ao master/admin avaliar se o líder deve ser trocado.
- Se o usuário era **responsável por entregas ou atividades**, ele permanece como responsável. As permissões de edição continuam vinculadas ao papel (responsável), independentemente do setor.

### 6.3 Mudança de perfil de um usuário

- De **gestor** para **usuário:** o usuário perde todas as permissões de edição. Se era líder, responsável por entregas ou atividades, permanece nominalmente nesses papéis, mas sem capacidade de editar. Cabe ao master/admin redesignar essas funções.
- De **gestor** para **solicitante:** o usuário perde acesso ao sistema completamente. Mesmas consequências acima.
- De **usuário** para **gestor:** o usuário ganha permissões de edição conforme seu setor e as configurações do painel.

### 6.4 Exclusão de um usuário

Ao excluir um usuário, suas referências em projetos (líder, responsável, participante) ficam **órfãs**. Cabe ao master/admin:

1. Antes de excluir, verificar se o usuário possui papéis ativos em projetos
2. Redesignar esses papéis para outras pessoas
3. Só então excluir o usuário

O sistema **não** impede a exclusão automaticamente, mas os campos de responsável ficarão vazios nos projetos afetados.

---

## 7. Cadastro e aprovação de novos usuários

### 7.1 Fluxo de cadastro

1. O novo usuário acessa a tela de login e clica em "Criar conta"
2. Preenche: posto e nome de guerra, setor, perfil desejado (usuário ou gestor), email e senha
3. Ao submeter, o sistema cria a conta com perfil **solicitante**
4. O usuário é redirecionado para uma tela informando que sua solicitação está em avaliação
5. Enquanto estiver como solicitante, **não consegue acessar o sistema** — ao tentar fazer login, vê a mensagem: *"Sua solicitação de cadastro ainda está em avaliação"*

### 7.2 Aprovação pelo master/admin

1. No painel administrativo, aba "Usuários", os solicitantes aparecem destacados em amarelo
2. Um badge indica o perfil que o usuário solicitou (ex: "Solicitou: Gestor")
3. O master/admin altera o perfil de "Solicitante" para o perfil desejado (usuário, gestor etc.)
4. A partir desse momento, o usuário consegue fazer login e acessar o sistema

---

## 8. Mensagens do Projeto

O sistema possui uma ferramenta de comunicação integrada a cada projeto, permitindo a troca de mensagens entre os setores envolvidos.

### 8.1 Localização

As mensagens ficam em uma seção colapsável na página de detalhe de cada projeto, abaixo das informações gerais e acima do cronograma de entregas. Ao expandir a seção, o usuário visualiza o histórico completo de mensagens e a área de composição.

### 8.2 Quem pode enviar mensagens

| Perfil | Condição |
|--------|----------|
| **Admin** | Sempre pode enviar mensagens em qualquer projeto |
| **Master** | Sempre pode enviar mensagens em qualquer projeto |
| **Gestor** | Pode enviar se pertencer a um setor elegível (ver abaixo) ou se for pessoalmente responsável/participante |
| **Usuário** | Não pode enviar mensagens |

**Setores elegíveis** para um projeto são determinados automaticamente:
- Setor líder do projeto
- Órgão responsável de qualquer entrega do projeto
- Setores participantes de qualquer entrega do projeto
- Setores dos participantes de qualquer atividade do projeto
- Setores dos responsáveis por entregas e atividades do projeto

### 8.3 Destinatários

Cada mensagem deve ter **ao menos um setor destinatário**. O remetente seleciona os setores destinatários entre os setores elegíveis do projeto, utilizando botões com o formato **@CÓDIGO** (ex.: @GAP, @SUOP). É possível selecionar múltiplos destinatários ou usar o botão "Selecionar todos".

Embora os destinatários sejam setores, o **controle de leitura é individualizado por usuário**.

### 8.4 Controle de leitura

- Cada mensagem possui controle individual de leitura por usuário
- Mensagens não lidas são destacadas visualmente (borda lateral azul)
- O usuário pode marcar mensagens como lidas individualmente (botão ✓) ou todas de uma vez ao expandir a seção
- Mensagens enviadas pelo próprio usuário são automaticamente consideradas como lidas
- Admin e Master visualizam todas as mensagens do projeto, independentemente dos setores destinatários

### 8.5 Notificações de mensagens não lidas

O sistema notifica o usuário sobre mensagens pendentes em dois pontos:

1. **Header da página** — Um badge azul no topo informa a quantidade total de mensagens não lidas em todos os projetos. Ao clicar, o usuário é direcionado para a lista de projetos.

2. **Cards dos projetos** — Na lista de projetos, cada card exibe um badge azul com a quantidade de mensagens não lidas daquele projeto específico, permitindo identificar rapidamente onde há comunicações pendentes.

### 8.6 Formato das mensagens

Cada mensagem exibe:
- **Nome do autor** e **código do setor** do autor
- **Data e hora** de envio
- **Tags dos setores destinatários** (formato @CÓDIGO)
- **Conteúdo** da mensagem

As mensagens enviadas pelo usuário logado aparecem alinhadas à direita com fundo azul claro, enquanto mensagens de outros aparecem alinhadas à esquerda.

## 9. Notificações Push (PWA)

O SIGPLAN pode ser instalado como aplicativo no celular ou computador e enviar notificações push nativas, mesmo quando o navegador está fechado.

### 9.1 Instalação como aplicativo (PWA)

No navegador do celular (Chrome, Edge, Safari), ao acessar o SIGPLAN aparecerá a opção "Instalar" ou "Adicionar à tela inicial". O aplicativo abrirá em modo standalone (sem barra de endereço), como um app nativo.

### 9.2 Ativação das notificações push

No cabeçalho do sistema, ao lado do botão de perfil, há um botão de sino:
- **"Ativar push"** — clique para habilitar notificações neste dispositivo
- **"Push ativo"** (verde) — notificações já estão ativas; clique para desativar
- **"Bloqueado"** (cinza) — as notificações foram bloqueadas nas configurações do navegador

Ao ativar, o navegador solicitará permissão para exibir notificações. É necessário aceitar para que o recurso funcione.

### 9.3 Quando as notificações são enviadas

As notificações push são disparadas nos mesmos eventos que geram alertas no sistema:
- Nomeação como líder, responsável por entrega ou atividade
- Nomeação como participante de entrega ou atividade
- Edição ou exclusão de entregas e atividades
- Criação de novas entregas e atividades

### 9.4 Comportamento da notificação

Ao receber uma notificação push:
- O dispositivo exibirá uma notificação nativa com título, descrição e ícone do SIGPLAN
- Ao clicar na notificação, o sistema abrirá diretamente na página do projeto relacionado
- Se o SIGPLAN já estiver aberto em uma aba, essa aba será focada e navegada

### 9.5 Gerenciamento de dispositivos

Cada dispositivo (celular, computador, tablet) mantém sua própria inscrição de push. Para receber notificações em múltiplos dispositivos, ative o push em cada um. Inscrições de dispositivos cujo push foi revogado ou expirou são automaticamente removidas pelo sistema.

### 9.6 Requisitos

- Navegador compatível: Chrome, Edge, Firefox ou Safari 16.4+ (iOS)
- Conexão com a internet (para receber o push; a notificação é exibida mesmo offline)
- Permissão de notificação concedida no navegador

---

## 10. Painel de projetos — agrupamento e subagrupamento

O painel `/dashboard/projetos` apresenta todos os projetos em forma de cards. Para facilitar a leitura, os cards são organizados em grupos, com dois modos de agrupamento e um modo opcional de subagrupamento.

### 10.1 Agrupamento principal

Na barra de controles, o botão **"Órgão / Status"** alterna entre dois modos:

- **Órgão (padrão):** os projetos são agrupados pelo **setor líder** de cada projeto. Cada grupo exibe o código e o nome do setor, o total de projetos e contadores por status (em andamento, concluído, cancelado).
- **Status:** os projetos são agrupados pelo **status do projeto** (Em andamento, Concluídos, Cancelados, Hibernando). Dentro de "Em andamento", os projetos são ordenados por pontualidade (atrasados primeiro).

### 10.2 Subagrupamento por líder do projeto

Quando o agrupamento principal é "Órgão", aparece ao lado um botão adicional **"Por líder"**. Ao ativá-lo, dentro de cada setor os cards são subdivididos por **líder do projeto** (o campo `responsavel_id`), permitindo enxergar de forma imediata como a carga de trabalho está distribuída entre os gestores do setor.

Cada subgrupo exibe:

- O **nome do líder do projeto**.
- O **total de projetos** sob responsabilidade dessa pessoa dentro do setor.
- **Mini-contadores de pontualidade** dos projetos em andamento: quantos estão *em dia*, *próximos do prazo* e *atrasados*.

Projetos que ainda não têm líder definido são agrupados em um subgrupo chamado **"Sem líder do projeto definido"**, sempre exibido por último.

**Observações:**

- O botão "Por líder" só aparece quando o agrupamento principal é "Órgão". Se o usuário trocar para "Status", o botão some automaticamente e os subgrupos são desativados.
- O subagrupamento é aplicado **depois** dos filtros, então ele respeita qualquer filtro ativo (setor, responsável/participante, status, busca textual etc.). Filtrar por uma pessoa específica + ativar o subagrupamento resulta em apenas um subgrupo por setor.
- Alternar entre as visualizações **Normal** e **Compacta** continua funcionando dentro de cada subgrupo, sem alterar o layout das colunas.
- Se um líder estava ativo quando o projeto foi criado mas depois foi removido do sistema, o subgrupo aparece com o rótulo **"Usuário removido"**.

## 11. Resultados e Produtos de entregas e atividades

No fundo de cada formulário de entrega e de atividade existe uma área destacada chamada **"Resultados e Produtos"**. Ela registra o que foi **efetivamente entregue** — o produto concreto, o resultado alcançado — e é diferente do escopo/descrição (que descreve o que se planejava fazer).

### 11.1 Campos

- **Descrição do resultado** (*opcional*) — textarea para descrever, de forma objetiva, o que foi entregue: produtos, documentos, valores alcançados, evidências verificáveis. Use referências específicas (números, datas, aprovações) e evite termos vagos como "realizado com sucesso".
- **PDF comprobatório** (*opcional, apenas em modo de edição*) — upload de um único arquivo PDF com tamanho máximo de **4 MB**. Se houver mais de um documento, consolide-os em um PDF único antes do upload. Substituir um PDF já anexado remove automaticamente o anterior.

O sistema fornece dicas inline (placeholder e tooltips) para orientar o preenchimento, e o ícone de ajuda (?) ao lado do título abre um modal com boas práticas de redação e regras de formato.

### 11.2 Quem pode editar

Seguem as mesmas permissões da edição da entrega/atividade:

- **Setor líder do projeto, master e admin** — editam livremente descrição e PDF em qualquer entrega/atividade.
- **Gestor do setor responsável pela entrega** — edita descrição e PDF nas entregas do seu setor.
- **Gestor responsável pela atividade** — edita descrição e PDF nas suas atividades.
- **Usuário comum e demais perfis** — apenas visualização.

Na tela de **criação** do projeto, o textarea pode ser preenchido normalmente e é salvo junto com o insert inicial. O **upload do PDF**, porém, só fica disponível após o primeiro save da entrega/atividade — até lá, o botão de anexar aparece com a mensagem *"Salve o projeto para anexar o PDF comprobatório."*.

### 11.3 Quem pode visualizar/baixar

Qualquer usuário autenticado do SIGPLAN pode visualizar a descrição do resultado e baixar o PDF anexado, em linha com a visibilidade universal do sistema (ver seção 1.1). **Não anexe documentos sigilosos ou com dados pessoais sensíveis.**

O download é servido por uma rota interna autenticada (`/api/resultados/download?path=...`), que verifica a sessão do usuário antes de liberar o arquivo.

### 11.4 Portabilidade e hospedagem futura

Os arquivos ficam hoje em um bucket privado do Supabase Storage. A arquitetura foi desenhada para permitir a **migração futura do backend de storage para hospedagem institucional** (por exemplo, filesystem local, MinIO ou S3 do órgão) **sem impacto nas URLs de download nem no banco de dados**:

- O banco guarda apenas um **path lógico relativo** (ex.: `entregas/42/7d3f…b91.pdf`), nunca URLs do provedor.
- Todo acesso a storage passa por um módulo único (`src/lib/resultados-storage.ts`) — trocar o backend se resume a reescrever esse arquivo.
- Os links de download apontam sempre para a rota interna `/api/resultados/download`, que continuará válida após a migração.
