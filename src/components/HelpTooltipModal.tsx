'use client'

import { X } from 'lucide-react'
import { useState, useEffect } from 'react'

export type HelpType = 'projeto' | 'entrega' | 'atividade' | null

interface Props {
  type: HelpType
  onClose: () => void
}

export default function HelpTooltipModal({ type, onClose }: Props) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !type) return null

  const content = {
    projeto: {
      title: 'O que é um Projeto?',
      body: (
        <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
          <p>
            Um Projeto é uma iniciativa estruturada, com início e término definidos, que visa produzir uma mudança institucional relevante. Ele responde à pergunta: <span className="italic font-medium">"O que queremos transformar ou construir?"</span>
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
            Uma Entrega é um resultado concreto e verificável produzido dentro de um Projeto, com prazo e responsável definidos. Ela responde à pergunta: <span className="italic font-medium">"O que ficará em pé ao final do esforço — algo que pode ser visto, usado ou auditado?"</span>
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
              <li><span className="italic">"Realizar reunião de alinhamento com os municípios"</span> → isso é uma <span className="font-bold">Atividade</span>, não uma Entrega. Reuniões, revisões e aplicações de questionário são trabalho — não produto.</li>
              <li><span className="italic">"Estruturação da rede de voluntários"</span> → isso é um <span className="font-bold">Projeto</span> inteiro, não uma Entrega.</li>
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
            Uma Atividade é uma ação concreta realizada pela equipe dentro do ciclo de uma Entrega. Ela responde à pergunta: <span className="italic font-medium">"O que precisamos fazer para chegar à Entrega?"</span>
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
    }
  }

  const currentContent = content[type]

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
