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
      localStorage.setItem('hideProjectGuidelineV2', 'true')
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
            Antes de começar: três minutos que vão fazer toda a diferença
          </h2>
          
          <div className="space-y-4 text-gray-700 leading-relaxed text-sm lg:text-base">
            <p>
              O formulário de cadastro foi organizado em uma sequência lógica e intencional. Cada campo prepara o raciocínio necessário para preencher o campo seguinte — e seguir essa ordem é o que garante que o projeto nasce com qualidade, clareza de propósito e chances reais de ser priorizado e executado com sucesso.
            </p>

            <div className="bg-orange-50 rounded-lg p-5 my-6 border border-orange-100">
              <ol className="list-decimal pl-5 space-y-3 font-medium text-orange-900">
                <li>Problema Identificado — POR QUÊ o projeto existe</li>
                <li>Causas do Problema — O QUE origina essa situação</li>
                <li>Consequências Diretas do Problema — O QUE acontece por causa dele</li>
                <li>Objetivo do Projeto — PARA QUÊ ele existe</li>
                <li>Descrição da Solução Proposta — O QUÊ será feito</li>
                <li>Indicador(es) de sucesso - Como saberemos que funcionou?</li>
                <li>Dependências com outros projetos</li>
              </ol>
            </div>

            <p>
              Cada campo do formulário possui um ícone de ajuda — o símbolo <span className="font-bold text-orange-600">(?)</span> ao lado do título. Antes de preencher qualquer campo, abra esse ícone e leia a orientação. Ela explica exatamente o que registrar ali, traz exemplos práticos e aponta os erros mais comuns a evitar. Esse pequeno gesto vai poupar retrabalho, tornar seu projeto mais sólido e facilitar sua aprovação pelo Gabinete de Projetos.
            </p>

            <div className="bg-blue-50 rounded-lg p-5 mt-6 border border-blue-100 text-sm">
              <p className="font-semibold text-blue-900 mb-2">💡 Dica: resista à tentação de começar pela solução.</p>
              <p className="text-blue-800">
                O formulário foi desenhado para que a solução só apareça depois que o problema estiver completamente compreendido. Esse é o caminho mais curto para um projeto bem formulado.
              </p>
            </div>

            <p>
              Siga a ordem dos campos, consulte as orientações de ajuda e registre cada informação com objetividade. O tempo investido aqui é o que irá garantir o sucesso e efetividade de seu projeto.
            </p>

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
