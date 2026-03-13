'use client'

import { X } from 'lucide-react'
import { useState, useEffect } from 'react'

interface Props {
  isOpen: boolean
  onClose: () => void
  showCheckbox: boolean
}

export default function ProjectGuidelineModal({ isOpen, onClose, showCheckbox }: Props) {
  const [naoMostrarNovamente, setNaoMostrarNovamente] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !isOpen) return null

  const handleClose = () => {
    if (showCheckbox && naoMostrarNovamente) {
      localStorage.setItem('hideProjectGuideline', 'true')
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
          aria-label="Fechar"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">
            Diretriz simples para nossos projetos e reuniões:
          </h2>
          
          <div className="space-y-4 text-gray-700 leading-relaxed text-sm lg:text-base">
            <p className="font-medium text-gray-900">
              Antes de discutir soluções, precisamos identificar claramente qual problema queremos resolver.
            </p>
            <p>
              Para organizar esse raciocínio, devemos utilizar cinco perguntas simples, na ordem correta:
            </p>

            <div className="bg-orange-50 rounded-lg p-5 my-6 border border-orange-100">
              <ol className="list-decimal pl-5 space-y-3 font-medium text-orange-900">
                <li>Qual é o problema?</li>
                <li>Por que ele acontece?</li>
                <li>O que podemos fazer para reduzir isso?</li>
                <li>Como saberemos que melhorou?</li>
                <li>Quem conduzirá essa ação?</li>
              </ol>
            </div>

            <p>
              Essa estrutura ajuda a melhorar a qualidade das decisões e a conectar nossas iniciativas a resultados concretos.
            </p>

            <div className="bg-gray-50 rounded-lg p-5 mt-6 border border-gray-100 text-sm">
              <p className="font-semibold text-gray-800 mb-3">No âmbito do cadastramento de projetos:</p>
              <ul className="space-y-2">
                <li><span className="font-medium">Perguntas 1 e 2:</span> entram no campo <span className="italic">"Problema que soluciona — Por quê"</span>;</li>
                <li><span className="font-medium">Pergunta 3:</span> entra no campo <span className="italic">"Descrição da solução proposta — O quê"</span>;</li>
                <li><span className="font-medium">Pergunta 4:</span> entra no campo <span className="italic">"Indicador(es) de sucesso"</span>;</li>
                <li><span className="font-medium">Pergunta 5:</span> entra nos campos <span className="italic">"Setor líder, Responsável pelo projeto e Participantes das entregas e atividades"</span>.</li>
              </ul>
            </div>

            {/* Exemplos Práticos */}
            <div className="mt-8 rounded-xl border border-blue-100 overflow-hidden">
              <div className="bg-blue-50 px-5 py-3 border-b border-blue-100">
                <h3 className="font-bold text-blue-900 flex items-center gap-2">
                  <span className="text-xl">💡</span> Exemplos Práticos para Inspiração
                </h3>
              </div>
              <div className="bg-white p-5 space-y-6 text-[13px] lg:text-sm">
                
                {/* Exemplo 1 */}
                <div className="space-y-2">
                  <h4 className="font-bold text-gray-800 border-l-4 border-orange-400 pl-3">Exemplo 1: Portfólio de Projetos (Foco em Efetividade)</h4>
                  <ul className="space-y-1.5 pl-4 text-gray-700">
                    <li><span className="font-semibold text-gray-900">Qual é o problema?</span> Baixa implementação de projetos de proteção comunitária nos municípios.</li>
                    <li><span className="font-semibold text-gray-900">Por que ele acontece?</span> As COMDECs não possuem modelos técnicos ou metodologias prontas para replicar.</li>
                    <li><span className="font-semibold text-gray-900">O que podemos fazer para reduzir isso?</span> Criar um "Portfólio de Projetos-Prateleira" com modelos validados pela SEDEC.</li>
                    <li><span className="font-semibold text-gray-900">Como saberemos que melhorou?</span> Aumento do número de municípios que implementaram ao menos um projeto do portfólio.</li>
                    <li><span className="font-semibold text-gray-900">Quem conduzirá essa ação?</span> DGAC (Líder) e participantes técnicos do ICTDEC/DAEAD.</li>
                  </ul>
                </div>

                <hr className="border-gray-100" />

                {/* Exemplo 2 */}
                <div className="space-y-2">
                  <h4 className="font-bold text-gray-800 border-l-4 border-orange-400 pl-3">Exemplo 2: Sistematização de Processos (Foco em Governança)</h4>
                  <ul className="space-y-1.5 pl-4 text-gray-700">
                    <li><span className="font-semibold text-gray-900">Qual é o problema?</span> Perda de memória técnica e atraso em processos durante trocas de comando.</li>
                    <li><span className="font-semibold text-gray-900">Por que ele acontece?</span> O conhecimento é personalista e não está institucionalizado em normas ou fluxos.</li>
                    <li><span className="font-semibold text-gray-900">O que podemos fazer para reduzir isso?</span> Mapear as tarefas críticas do setor e criar Manuais de Procedimentos Padrão (POP).</li>
                    <li><span className="font-semibold text-gray-900">Como saberemos que melhorou?</span> Redução do tempo de tramitação de processos após movimentações de pessoal.</li>
                    <li><span className="font-semibold text-gray-900">Quem conduzirá essa ação?</span> Chefia do Setor (Líder) e suporte técnico da DDO/ICTDEC.</li>
                  </ul>
                </div>

                <hr className="border-gray-100" />

                {/* Exemplo 3 */}
                <div className="space-y-2">
                  <h4 className="font-bold text-gray-800 border-l-4 border-orange-400 pl-3">Exemplo 3: Qualificação Técnica (Foco em Doutrina)</h4>
                  <ul className="space-y-1.5 pl-4 text-gray-700">
                    <li><span className="font-semibold text-gray-900">Qual é o problema?</span> Decisões operacionais pautadas em percepções individuais em vez de doutrina técnica.</li>
                    <li><span className="font-semibold text-gray-900">Por que ele acontece?</span> Falta de uma trilha de formação específica para gestores de Defesa Civil no Estado.</li>
                    <li><span className="font-semibold text-gray-900">O que podemos fazer para reduzir isso?</span> Implementar o Curso para Formação de Gestores Estaduais com Foco em Gestão Integrada de Riscos e Desastres - GEGIRD-RJ.</li>
                    <li><span className="font-semibold text-gray-900">Como saberemos que melhorou?</span> 70% dos gestores da SUOP certificados e aplicando terminologia padrão em relatórios.</li>
                    <li><span className="font-semibold text-gray-900">Quem conduzirá essa ação?</span> DFPC/ICTDEC, CEPEDEC e ESDEC.</li>
                  </ul>
                </div>

              </div>
            </div>

          </div>

          <div className="mt-8 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            {showCheckbox ? (
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                <input
                  type="checkbox"
                  checked={naoMostrarNovamente}
                  onChange={(e) => setNaoMostrarNovamente(e.target.checked)}
                  className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                Não aparecer essa mensagem novamente
              </label>
            ) : (
              <div /> // Espaçador
            )}
            
            <button
              onClick={handleClose}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors w-full sm:w-auto"
            >
              Entendi
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
