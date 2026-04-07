'use client'

import { Sparkles } from 'lucide-react'

type Assistant = {
  name: string
  description: string
  url: string
  bgClass: string
  borderClass: string
  hoverClass: string
  textClass: string
  logo: React.ReactNode
}

const ChatGPTLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
    <path
      fill="#10A37F"
      d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"
    />
  </svg>
)

const GeminiLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
    <defs>
      <linearGradient id="gemini-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4796E3" />
        <stop offset="50%" stopColor="#9168C0" />
        <stop offset="100%" stopColor="#FF8B8B" />
      </linearGradient>
    </defs>
    <path
      fill="url(#gemini-grad)"
      d="M12 24A14.304 14.304 0 0 0 0 12 14.304 14.304 0 0 0 12 0a14.305 14.305 0 0 0 12 12 14.305 14.305 0 0 0-12 12Z"
    />
  </svg>
)

const ASSISTANTS: Assistant[] = [
  {
    name: 'ChatGPT',
    description: 'GPT orientador da SEDEC-RJ',
    url: 'https://chatgpt.com/g/g-69cfafffd2508191abd73c54a2e7751e-orientador-para-elaboracao-de-projetos-sedec-rj',
    bgClass: 'bg-emerald-50',
    borderClass: 'border-emerald-200',
    hoverClass: 'hover:bg-emerald-100 hover:border-emerald-300',
    textClass: 'text-emerald-800',
    logo: <ChatGPTLogo />,
  },
  {
    name: 'Gemini',
    description: 'Gem orientador no Google Gemini',
    url: 'https://gemini.google.com/gem/1A0dlrBMvMuO5jfsI2SCt0OhyXWhoup1C?usp=sharing',
    bgClass: 'bg-blue-50',
    borderClass: 'border-blue-200',
    hoverClass: 'hover:bg-blue-100 hover:border-blue-300',
    textClass: 'text-blue-800',
    logo: <GeminiLogo />,
  },
]

export default function AIAssistantsCard() {
  return (
    <div className="bg-gradient-to-br from-violet-50 via-white to-orange-50 border border-violet-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-orange-500 text-white shrink-0">
          <Sparkles size={15} />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-gray-800 leading-tight">Assistentes de IA para elaboração de projetos</h3>
          <p className="text-xs text-gray-600 leading-tight">Tire dúvidas e estruture seu projeto com um dos orientadores abaixo.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {ASSISTANTS.map(a => (
          <a
            key={a.name}
            href={a.url}
            target="_blank"
            rel="noopener noreferrer"
            title={`Abrir ${a.name} em nova aba`}
            className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-lg border ${a.bgClass} ${a.borderClass} ${a.hoverClass} transition-all`}
          >
            <span className="shrink-0">{a.logo}</span>
            <span className="min-w-0 flex-1">
              <span className={`block text-sm font-semibold ${a.textClass} leading-tight`}>{a.name}</span>
              <span className="block text-[11px] text-gray-600 leading-tight truncate">{a.description}</span>
            </span>
          </a>
        ))}
      </div>
    </div>
  )
}
