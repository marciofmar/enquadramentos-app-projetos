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

const ClaudeLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
    <path
      fill="#D97757"
      d="M4.709 15.955l4.72-2.647.079-.23-.079-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.448.255h.389l.055-.157-.134-.098-.103-.097-2.357-1.6-2.552-1.689-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.834.365.304.146-.103.018-.072-.164-.274-1.355-2.45-1.446-2.49-.644-1.032-.17-.619a2.972 2.972 0 01-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.42 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.583.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76.566-.34 1.103-1.064 1.346-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.087-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.31-.006.004z"
    />
  </svg>
)

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
    name: 'Claude',
    description: 'Projeto orientador no Claude',
    url: 'https://claude.ai/project/019d4eb1-ae4a-74ac-89ae-adc7f0ef2215',
    bgClass: 'bg-orange-50',
    borderClass: 'border-orange-200',
    hoverClass: 'hover:bg-orange-100 hover:border-orange-300',
    textClass: 'text-orange-800',
    logo: <ClaudeLogo />,
  },
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
