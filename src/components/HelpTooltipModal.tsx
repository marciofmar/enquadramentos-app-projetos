'use client'

import { X } from 'lucide-react'
import { useState, useEffect } from 'react'

export type HelpType = 'projeto' | 'entrega' | 'atividade' | 'permissoes'
  | 'campo_problema' | 'campo_causas' | 'campo_consequencias'
  | 'campo_objetivo' | 'campo_descricao'
  | 'campo_ind_nome' | 'campo_ind_formula' | 'campo_ind_fonte'
  | 'campo_ind_periodicidade' | 'campo_ind_unidade' | 'campo_ind_responsavel'
  | 'campo_ind_meta' | 'campo_dependencias'
  | 'campo_risco_natureza' | 'campo_risco_probabilidade' | 'campo_risco_medida'
  | null

interface Props {
  type: HelpType
  onClose: () => void
  userRole?: string
}

export default function HelpTooltipModal({ type, onClose, userRole }: Props) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !type) return null

  const content: Record<string, { title: string; body: React.ReactNode }> = {
    projeto: {
      title: 'O que é um Projeto?',
      body: (
        <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
          <p>
            Um Projeto é uma iniciativa estruturada, com início e término definidos, que visa produzir uma mudança institucional relevante. Ele responde à pergunta: <span className="italic font-medium">&quot;O que queremos transformar ou construir?&quot;</span>
          </p>
          <p>
            Um projeto agrupa um conjunto de Entregas que, somadas, produzem o resultado esperado. Ele representa o esforço como um todo — não um produto isolado.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <p className="font-bold text-blue-900 mb-2">Exemplos:</p>
            <ul className="list-disc pl-5 space-y-1 text-blue-800">
              <li>Implantação do sistema de monitoramento de riscos em municípios prioritários <span className="italic">(CEMADEN-RJ)</span></li>
              <li>Estruturação da rede de voluntários de proteção e defesa civil no Estado <span className="italic">(Rede SALVAR)</span></li>
              <li>Desenvolvimento do Curso para Formação de Gestores Estaduais com Foco em Gestão Integrada de Riscos e Desastres <span className="italic">(ICTDEC)</span></li>
              <li>Implantação de metodologia simplificada similar a um PMRR nos municípios fluminenses - PLAMGERS <span className="italic">(SUOP)</span></li>
            </ul>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 text-orange-900">
            <span className="font-bold">Atenção:</span> Se o que você quer cadastrar é um documento ou relatório isolado, provavelmente é uma <span className="font-bold">Entrega</span>. Se é um evento — como um simulado, uma campanha ou um exercício de campo — provavelmente é o <span className="font-bold">Projeto</span> em si, salvo quando se trata de uma palestra ou oficina dentro de um programa maior, caso em que pode ser uma Entrega. Verifique antes de salvar.
          </div>
        </div>
      )
    },
    entrega: {
      title: 'O que é uma Entrega?',
      body: (
        <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
          <p>
            Uma Entrega é um resultado concreto e verificável produzido dentro de um Projeto, com prazo e responsável definidos. Ela responde à pergunta: <span className="italic font-medium">&quot;O que ficará em pé ao final do esforço — algo que pode ser visto, usado ou auditado?&quot;</span>
          </p>
          <p>
            Uma Entrega deve ser verificável: qualquer pessoa consegue confirmar objetivamente se ela foi concluída ou não.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <p className="font-bold text-blue-900 mb-2">Exemplos — o que cada Projeto poderia gerar como Entregas:</p>
            <ul className="list-disc pl-5 space-y-2 text-blue-800">
              <li>Projeto <span className="italic">Implantação do sistema de monitoramento</span> → Mapa de risco atualizado para os 20 municípios prioritários; Termo de adesão assinado com cada município participante</li>
              <li>Projeto <span className="italic">Estruturação da rede de voluntários</span> → Regulamento da rede elaborado e aprovado; Lista de voluntários cadastrados por regional</li>
              <li>Projeto <span className="italic">Desenvolvimento do Curso GEGIRD</span> → Programa do curso aprovado pela chefia; Material didático do módulo 1 finalizado</li>
              <li>Projeto <span className="italic">Implantação da metodologia PLAMGERS</span> → Metodologia adaptada documentada e validada; Piloto nos primeiros municípios concluído</li>
            </ul>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 text-orange-900">
            <p className="font-bold mb-2">Zona de confusão frequente:</p>
            <ul className="list-disc pl-5 space-y-2 mb-3">
              <li><span className="italic">&quot;Realizar reunião de alinhamento com os municípios&quot;</span> → isso é uma <span className="font-bold">Atividade</span>, não uma Entrega. Reuniões, revisões e aplicações de questionário são trabalho — não produto.</li>
              <li><span className="italic">&quot;Estruturação da rede de voluntários&quot;</span> → isso é um <span className="font-bold">Projeto</span> inteiro, não uma Entrega.</li>
            </ul>
            <p className="font-medium">Regra prática: se o que você quer registrar é algo que a equipe <span className="font-bold">faz</span>, mas que não deixa um produto verificável e durável — é uma Atividade. Se abrange um esforço com múltiplas fases e entregas distintas — é um Projeto.</p>
          </div>
        </div>
      )
    },
    atividade: {
      title: 'O que é uma Atividade?',
      body: (
        <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
          <p>
            Uma Atividade é uma ação concreta realizada pela equipe dentro do ciclo de uma Entrega. Ela responde à pergunta: <span className="italic font-medium">&quot;O que precisamos fazer para chegar à Entrega?&quot;</span>
          </p>
          <p>
            Atividades são o trabalho visível do dia a dia. Elas consomem tempo e esforço da equipe e alimentam o avanço em direção a um resultado — mas não são o resultado em si.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <p className="font-bold text-blue-900 mb-2">Exemplos — o que cada Entrega poderia exigir como Atividades:</p>
            <ul className="list-disc pl-5 space-y-2 text-blue-800">
              <li>Entrega <span className="italic">Mapa de risco dos municípios</span> → Visitar os municípios para coleta de dados de campo; Consolidar os dados no sistema e gerar versão preliminar do mapa</li>
              <li>Entrega <span className="italic">Regulamento da rede de voluntários</span> → Pesquisar modelos de regulamento de outros estados; Submeter minuta à revisão jurídica</li>
              <li>Entrega <span className="italic">Programa do curso aprovado</span> → Elaborar proposta inicial de programa do curso; Apresentar proposta à chefia para validação</li>
              <li>Entrega <span className="italic">Metodologia PMRR adaptada e documentada</span> → Realizar reunião técnica com municípios-piloto para levantamento de requisitos; Encaminhar documento para validação pela SUOP</li>
            </ul>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 text-orange-900">
            <p className="mb-2"><span className="font-bold">Atenção:</span> Toda Atividade deve estar vinculada a uma Entrega. Se você não consegue identificar claramente qual Entrega ela alimenta, revise o enquadramento antes de salvar — isso é sinal de que o cadastro ainda não está bem estruturado.</p>
            <p>Se o que você quer registrar pode ser auditado como produto concreto (um documento aprovado, um sistema implantado, um treinamento concluído) — é uma <span className="font-bold">Entrega</span>, não uma Atividade.</p>
          </div>
        </div>
      )
    },
    permissoes: {
      title: 'Regras de Permissão por Perfil',
      body: (
        <div className="space-y-5 text-sm text-gray-700 leading-relaxed">
          {(userRole === 'admin' || userRole === 'master') && (
            <>
              <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                <p className="font-bold text-red-900 mb-1">Admin</p>
                <p className="text-red-800">Acesso total a todas as funcionalidades do sistema.</p>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                <p className="font-bold text-orange-900 mb-1">Master</p>
                <p className="text-orange-800">Tudo do Admin, exceto: excluir usuários, editar nome/perfil/setor de usuários, gerenciar setores, zerar senhas e configurações de observações.</p>
              </div>
            </>
          )}

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <p className="font-bold text-blue-900 mb-2">Gestor <span className="font-normal text-blue-700">(5 níveis, condicionados às configurações do sistema)</span></p>
            <ul className="list-disc pl-5 space-y-2 text-blue-800">
              <li><span className="font-semibold">Nível 1</span> — Qualquer gestor: pode criar projeto (se configuração ativa)</li>
              <li><span className="font-semibold">Nível 2</span> — Gestor do setor líder do projeto: cria/edita/exclui o projeto e suas entregas</li>
              <li><span className="font-semibold">Nível 3</span> — Gestor do setor responsável pela entrega: cria/edita/exclui atividades daquela entrega</li>
              <li><span className="font-semibold">Nível 4</span> — Nível 3, mas setor diferente do líder: edita a entrega, exceto nome e descrição</li>
              <li><span className="font-semibold">Nível 5</span> — Responsável pela atividade (setor diferente do responsável da entrega): edita a atividade, exceto nome e descrição</li>
            </ul>
            <p className="mt-2 text-blue-700">Pode criar observações (se configuração ativa).</p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <p className="font-bold text-green-900 mb-1">Usuário</p>
            <p className="text-green-800">Somente visualização. Pode editar o próprio perfil. Não cria observações.</p>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
            <p className="font-bold text-gray-800 mb-1">Solicitante</p>
            <p className="text-gray-600">Sem acesso ao sistema (redirecionado para página de pendência).</p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
            <p className="font-bold text-purple-900 mb-2">Regras de Atribuição de Responsáveis</p>
            <ul className="list-disc pl-5 space-y-1 text-purple-800">
              <li>O responsável pela entrega deve ser um usuário do setor responsável pela entrega (órgão responsável).</li>
              <li>O responsável pela atividade deve ser um usuário de um dos setores participantes da entrega.</li>
              <li>Os participantes da atividade devem ser usuários de setores participantes da entrega.</li>
            </ul>
          </div>
        </div>
      )
    },
    campo_problema: {
      title: 'Problema Identificado',
      body: (
        <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
          <p>
            O problema é a situação negativa concreta que o projeto pretende transformar. Um erro comum é descrever a ausência da solução como se fosse o problema (ex.: &quot;falta de treinamento&quot;). O problema real é o impacto que essa ausência gera (ex.: &quot;população despreparada para situações de risco, com comportamentos que aumentam sua exposição a desastres&quot;).
          </p>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 text-orange-900">
            <p>Se o seu texto já contém palavras como &quot;implantar&quot;, &quot;desenvolver&quot; ou &quot;adquirir&quot;, você provavelmente está descrevendo a solução, não o problema. Volte uma etapa e pergunte: <span className="font-bold">qual situação negativa essa ação pretende resolver?</span></p>
          </div>
        </div>
      )
    },
    campo_causas: {
      title: 'Causas do Problema',
      body: (
        <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
          <p>
            As causas explicam por que o problema existe e persistem. Identificá-las corretamente é o que garante que a solução escolhida será efetiva — atacar o problema sem entender suas causas é como tratar sintomas sem diagnosticar a doença.
          </p>
          <p>
            O projeto não precisa eliminar todas as causas, mas deve deixar explícito sobre quais pretende atuar.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-blue-900">
            <p className="font-bold mb-2">Como verificar:</p>
            <p>Para verificar se você identificou uma causa real, pergunte-se: <span className="italic">&quot;Se esse fator fosse eliminado, o problema diminuiria ou desapareceria?&quot;</span> Se a resposta for sim, é uma causa. Se for não, pode ser uma consequência ou um fator irrelevante.</p>
          </div>
        </div>
      )
    },
    campo_consequencias: {
      title: 'Consequências Diretas do Problema',
      body: (
        <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
          <p>
            Registre apenas as consequências diretas — aquelas que decorrem imediatamente do problema identificado, sem depender de uma cadeia longa de eventos intermediários.
          </p>
          <p>
            Evite consequências indiretas ou especulativas: se você precisar de mais de um &quot;e por isso...&quot; para chegar ao impacto descrito, provavelmente está indo longe demais na cadeia causal.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-blue-900">
            <p className="font-bold mb-2">Exemplo:</p>
            <p>Se o problema é a baixa percepção de risco, uma consequência direta é o comportamento inadequado do morador em situação de emergência — <span className="font-bold">não</span> o aumento do número de vítimas em eventos climáticos extremos ou sobrecarga dos serviços de resposta ou elevação dos custos de recuperação pós-desastre ou o colapso do sistema de saúde, que dependem de muitos outros fatores.</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-100 text-green-900">
            <p>Consequências diretas bem mapeadas são o principal argumento para justificar a priorização do projeto: elas tornam visível o <span className="font-bold">custo institucional e social de não agir</span>.</p>
          </div>
        </div>
      )
    },
    campo_objetivo: {
      title: 'Objetivo do Projeto',
      body: (
        <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
          <p>
            O objetivo é a resposta à pergunta: <span className="italic font-medium">&quot;Se o projeto for bem-sucedido, o que terá mudado na realidade?&quot;</span> Ele deve estar diretamente conectado às causas que o projeto se propõe a atacar — não à entrega que será produzida.
          </p>
          <p>
            Entregar um manual não é um objetivo; é um meio. O objetivo é o que muda por causa desse manual. Um projeto pode ter mais de um objetivo, desde que todos decorram das causas identificadas e se mantenham coesos dentro do escopo definido.
          </p>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 text-orange-900">
            <p>Se o seu objetivo soa como uma atividade ou uma entrega, reformule: substitua verbos de ação (<span className="italic">publicar, adquirir, realizar</span>) por verbos de transformação (<span className="font-bold">aumentar, reduzir, fortalecer, garantir</span>).</p>
          </div>
        </div>
      )
    },
    campo_descricao: {
      title: 'Descrição da Solução Proposta',
      body: (
        <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
          <p>
            A solução é o meio pelo qual o projeto alcança seu objetivo. Antes de descrevê-la, verifique: ela atua diretamente sobre as causas que você identificou? Se não houver essa conexão, revise o diagnóstico ou a proposta.
          </p>
          <p>
            A solução deve representar uma condição estruturante — algo que gera mudança duradoura — e não apenas uma atividade pontual. Ela também deve ser viável dentro do escopo institucional do setor e possuir potencial de continuidade após o encerramento do projeto.
          </p>
        </div>
      )
    },
    campo_ind_nome: {
      title: 'Nome do Indicador',
      body: (
        <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
          <p>
            O nome do indicador deve deixar imediatamente claro o que está sendo medido e em que direção o projeto quer mover esse valor.
          </p>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 text-orange-900">
            <p>Evite nomes genéricos como &quot;índice de desempenho&quot; ou &quot;taxa de execução&quot; — esses são vagos e medem esforço, não transformação. Prefira indicadores que evidenciem mudança real na causa que o projeto ataca.</p>
          </div>
        </div>
      )
    },
    campo_ind_formula: {
      title: 'Fórmula de Cálculo',
      body: (
        <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
          <p>
            A fórmula garante que o indicador seja calculado sempre da mesma forma, independentemente de quem o apure.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-blue-900">
            <p>Se não houver cálculo (ex.: indicadores binários como &quot;plano elaborado: sim/não&quot;), registre isso explicitamente.</p>
          </div>
        </div>
      )
    },
    campo_ind_fonte: {
      title: 'Fonte de Dados',
      body: (
        <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
          <p>
            A fonte de dados deve ser uma referência concreta e acessível — não uma fonte que ainda precisará ser criada.
          </p>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 text-orange-900">
            <p>Se a fonte ainda não existe, isso pode indicar que o indicador precisa ser revisto ou que sua criação é ela própria uma entrega do projeto.</p>
          </div>
        </div>
      )
    },
    campo_ind_periodicidade: {
      title: 'Periodicidade/Frequência',
      body: (
        <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
          <p>
            A periodicidade deve ser compatível com a natureza do indicador.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-blue-900">
            <p className="mb-2">
              Para indicadores de <span className="font-bold">processo</span> — aqueles que medem o avanço das atividades e entregas — prefira periodicidades curtas que permitam identificar desvios enquanto ainda há tempo de agir.
            </p>
            <p>
              Para indicadores de <span className="font-bold">resultado</span> — aqueles que medem a transformação real da causa ou do problema — a periodicidade pode necessariamente ser maior que a duração do projeto, especialmente quando o fenômeno a ser medido ocorre de forma esparsa ou sazonal. Nesses casos, o projeto contribui para criar as condições de mudança, mas a verificação do impacto transcende seu horizonte temporal.
            </p>
          </div>
        </div>
      )
    },
    campo_ind_unidade: {
      title: 'Unidade de Medida',
      body: (
        <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
          <p>
            A unidade de medida deve ser coerente com a fórmula de cálculo e com a meta estabelecida.
          </p>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 text-orange-900">
            <p>Unidades vagas como &quot;nível&quot; ou &quot;grau&quot; dificultam a verificação objetiva do resultado.</p>
          </div>
        </div>
      )
    },
    campo_ind_responsavel: {
      title: 'Responsável pelo Indicador',
      body: (
        <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
          <p>
            O responsável pelo indicador não precisa ser o mesmo que lidera o projeto — pode ser quem tem acesso direto à fonte de dados.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-blue-900">
            <p>O importante é que haja uma pessoa claramente designada, para que a medição não fique dependente de iniciativa espontânea.</p>
          </div>
        </div>
      )
    },
    campo_ind_meta: {
      title: 'Meta',
      body: (
        <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
          <p>
            A meta deve ser específica, mensurável e com prazo definido. Evite metas vagas como &quot;melhorar&quot; ou &quot;aumentar&quot; sem um valor de referência.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-blue-900">
            <p className="font-bold mb-2">Quando não houver linha de base conhecida, duas abordagens são admissíveis:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Registrar explicitamente essa ausência e incluir a construção do indicador e a apuração da linha de base como entrega do projeto — sendo a meta inicial, nesse caso, a própria realização dessa apuração.</li>
              <li>Adotar um indicador qualitativo, expresso em escala descritiva ou avaliação estruturada, quando o fenômeno a ser medido não for facilmente quantificável.</li>
            </ul>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-100 text-green-900">
            <p>Em ambos os casos, o importante é que haja um compromisso claro com a forma e o momento em que o resultado será verificado.</p>
          </div>
        </div>
      )
    },
    campo_dependencias: {
      title: 'Dependências Críticas do Projeto',
      body: (
        <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
          <p>
            Dependências não mapeadas são uma das principais causas de atraso em projetos. Registre aqui <span className="font-bold">todas as dependências críticas</span> que podem afetar o andamento do projeto.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-blue-900">
            <p className="font-bold mb-2">Tipos de dependências a considerar:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><span className="font-bold">Dependências de entrada</span> — o que este projeto precisa receber de outros projetos, órgãos ou processos externos para avançar.</li>
              <li><span className="font-bold">Dependências de saída</span> — o que outros projetos ou processos aguardam deste projeto para prosseguirem.</li>
              <li><span className="font-bold">Dependências orçamentárias</span> — aprovações de crédito, liberação de empenho, processos licitatórios.</li>
              <li><span className="font-bold">Dependências normativas</span> — publicações em Diário Oficial, autorizações legais, pareceres jurídicos.</li>
              <li><span className="font-bold">Dependências de recursos</span> — disponibilidade de pessoal, equipamentos, infraestrutura ou sistemas.</li>
              <li><span className="font-bold">Dependências externas</span> — decisões de outros órgãos, fornecedores, parceiros ou instâncias superiores.</li>
            </ul>
          </div>
          <p>
            Esse mapeamento permite que o Gabinete de Projetos identifique riscos de bloqueio antes que eles ocorram e planeje reuniões com os setores e órgãos envolvidos.
          </p>
        </div>
      )
    },
    campo_risco_natureza: {
      title: 'Natureza do Risco — O que pode acontecer',
      body: (
        <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
          <p>
            Descreva o <span className="font-bold">evento ou condição incerta</span> que, caso se concretize, pode impactar negativamente o projeto — seja em prazo, custo, escopo ou qualidade das entregas.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-blue-900">
            <p className="font-bold mb-2">Exemplos:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Indisponibilidade de servidores capacitados para execução das atividades de campo</li>
              <li>Atraso na liberação orçamentária para aquisição de equipamentos</li>
              <li>Mudança de prioridade institucional que reduza o apoio ao projeto</li>
              <li>Falha no sistema de informação utilizado como base de dados</li>
            </ul>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 text-orange-900">
            <p>Evite descrições vagas como &quot;problemas de comunicação&quot; ou &quot;falta de recursos&quot;. Seja específico sobre <span className="font-bold">o que</span> pode acontecer e <span className="font-bold">em que contexto</span>.</p>
          </div>
        </div>
      )
    },
    campo_risco_probabilidade: {
      title: 'Probabilidade de Ocorrência',
      body: (
        <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
          <p>
            Avalie a <span className="font-bold">chance de o risco se concretizar</span>, considerando o histórico, o contexto atual e as condições do projeto.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-blue-900">
            <p className="font-bold mb-2">Escala de referência:</p>
            <ul className="space-y-2">
              <li><span className="font-bold text-green-700">Baixa</span> — O evento é possível, mas improvável nas condições atuais. Não há histórico recorrente nem sinais de que possa ocorrer em breve.</li>
              <li><span className="font-bold text-yellow-700">Média</span> — O evento já ocorreu antes em contextos semelhantes ou há sinais de que as condições estão propícias para sua ocorrência.</li>
              <li><span className="font-bold text-red-700">Alta</span> — O evento é provável, com indícios concretos ou histórico frequente. Sem ação preventiva, é esperado que ocorra.</li>
            </ul>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-100 text-green-900">
            <p>A probabilidade pode mudar ao longo do projeto. Reavalie periodicamente, especialmente quando houver mudanças no contexto ou nas condições iniciais.</p>
          </div>
        </div>
      )
    },
    campo_risco_medida: {
      title: 'Medida de Resposta',
      body: (
        <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
          <p>
            Descreva a <span className="font-bold">ação concreta</span> que será adotada para reduzir, contornar ou mitigar os efeitos do risco, caso ele se concretize — ou para evitar que ele ocorra.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-blue-900">
            <p className="font-bold mb-2">Tipos de resposta:</p>
            <ul className="space-y-2">
              <li><span className="font-bold">Evitar</span> — Alterar o plano do projeto para eliminar a condição que gera o risco.</li>
              <li><span className="font-bold">Mitigar</span> — Adotar ações antecipadas para reduzir a probabilidade ou o impacto do risco.</li>
              <li><span className="font-bold">Transferir</span> — Atribuir a gestão do risco a um terceiro (outro órgão, fornecedor, parceiro).</li>
              <li><span className="font-bold">Aceitar</span> — Reconhecer o risco e monitorá-lo, preparando um plano de contingência caso se concretize.</li>
            </ul>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 text-orange-900">
            <p>A medida de resposta deve ser <span className="font-bold">viável e proporcional</span> ao risco. Evite medidas genéricas como &quot;acompanhar o andamento&quot; — descreva o que será feito concretamente.</p>
          </div>
        </div>
      )
    },
  }

  const currentContent = content[type]
  if (!currentContent) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          aria-label="Fechar"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4 pr-8">
            {currentContent.title}
          </h2>

          {currentContent.body}

          <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
            <button
              onClick={onClose}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg font-medium transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
