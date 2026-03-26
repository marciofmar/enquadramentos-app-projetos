'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { X, Search, BookOpen, ChevronRight, ArrowUp } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface ManualModalProps {
  open: boolean
  onClose: () => void
}

interface TocItem {
  level: number
  text: string
  id: string
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function extractToc(markdown: string): TocItem[] {
  const lines = markdown.split('\n')
  const toc: TocItem[] = []
  let inCodeBlock = false

  for (const line of lines) {
    if (line.trim().startsWith('```')) { inCodeBlock = !inCodeBlock; continue }
    if (inCodeBlock) continue

    const match = line.match(/^(#{1,4})\s+(.+)/)
    if (match) {
      const level = match[1].length
      const text = match[2].replace(/\*\*/g, '').trim()
      toc.push({ level, text, id: slugify(text) })
    }
  }
  return toc
}

function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)
  return parts.map((part, i) =>
    regex.test(part) ? <mark key={i} className="bg-yellow-200 text-yellow-900 rounded px-0.5">{part}</mark> : part
  )
}

export default function ManualModal({ open, onClose }: ManualModalProps) {
  const [markdown, setMarkdown] = useState('')
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showToc, setShowToc] = useState(true)
  const [activeSection, setActiveSection] = useState('')
  const contentRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    fetch('/api/manual')
      .then(r => r.json())
      .then(data => { setMarkdown(data.content || ''); setLoading(false) })
      .catch(() => { setMarkdown('Erro ao carregar o manual.'); setLoading(false) })
  }, [open])

  // Focus search on Ctrl+F
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return }
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  // Track active section on scroll
  useEffect(() => {
    if (!open || !contentRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        }
      },
      { root: contentRef.current, rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    )
    const headings = contentRef.current.querySelectorAll('h1[id], h2[id], h3[id], h4[id]')
    headings.forEach(h => observer.observe(h))
    return () => observer.disconnect()
  }, [open, markdown, loading])

  const toc = extractToc(markdown)

  const scrollToSection = useCallback((id: string) => {
    const el = contentRef.current?.querySelector(`#${CSS.escape(id)}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveSection(id)
    }
  }, [])

  const scrollToTop = useCallback(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Filter TOC based on search
  const filteredToc = search.trim()
    ? toc.filter(item => item.text.toLowerCase().includes(search.toLowerCase()))
    : toc

  // Search match count in full text
  const searchMatchCount = search.trim()
    ? (markdown.toLowerCase().match(new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').toLowerCase(), 'g')) || []).length
    : 0

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative mx-auto my-4 sm:my-6 flex w-full max-w-5xl max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Sidebar TOC (desktop) */}
        {showToc && (
          <aside className="hidden lg:flex flex-col w-72 border-r border-gray-200 bg-gray-50/80">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-2 text-sedec-600 mb-3">
                <BookOpen size={18} />
                <span className="font-bold text-sm">Sumário</span>
              </div>
              {/* Search */}
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar no manual..."
                  className="w-full text-xs pl-8 pr-8 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sedec-400 focus:border-transparent"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X size={12} />
                  </button>
                )}
              </div>
              {search.trim() && (
                <p className="text-[10px] text-gray-400 mt-1.5">{searchMatchCount} ocorrência{searchMatchCount !== 1 ? 's' : ''} encontrada{searchMatchCount !== 1 ? 's' : ''}</p>
              )}
            </div>
            <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
              {filteredToc.map((item, i) => {
                const isActive = activeSection === item.id
                return (
                  <button
                    key={`${item.id}-${i}`}
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full text-left text-xs py-1.5 px-2 rounded-md transition-colors flex items-start gap-1.5 ${
                      isActive
                        ? 'bg-sedec-50 text-sedec-700 font-semibold'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                    style={{ paddingLeft: `${(item.level - 1) * 12 + 8}px` }}
                  >
                    {item.level > 1 && <ChevronRight size={10} className="mt-0.5 shrink-0 text-gray-400" />}
                    <span className="leading-snug">{highlightText(item.text, search)}</span>
                  </button>
                )
              })}
            </nav>
          </aside>
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-white sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowToc(!showToc)}
                className="hidden lg:flex items-center gap-1.5 text-xs text-gray-500 hover:text-sedec-600 transition-colors"
                title={showToc ? 'Ocultar sumário' : 'Mostrar sumário'}
              >
                <BookOpen size={15} />
              </button>
              <h1 className="font-bold text-gray-800 text-base">Manual de Utilização</h1>
              <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Gestão de Projetos</span>
            </div>
            <div className="flex items-center gap-2">
              {/* Mobile search */}
              <div className="lg:hidden relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar..."
                  className="text-xs pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg w-36 focus:outline-none focus:ring-2 focus:ring-sedec-400"
                />
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-lg hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div ref={contentRef} className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-pulse text-sedec-500 font-medium">Carregando manual...</div>
              </div>
            ) : (
              <article className="manual-content px-6 sm:px-8 py-6 max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => {
                      const text = typeof children === 'string' ? children : extractText(children)
                      const id = slugify(text)
                      return <h1 id={id} className="text-2xl font-bold text-gray-900 mb-4 pt-2 border-b-2 border-sedec-200 pb-3 scroll-mt-16">{highlightText(text, search)}</h1>
                    },
                    h2: ({ children }) => {
                      const text = typeof children === 'string' ? children : extractText(children)
                      const id = slugify(text)
                      return <h2 id={id} className="text-xl font-bold text-gray-800 mt-10 mb-3 pt-6 border-t border-gray-200 scroll-mt-16">{highlightText(text, search)}</h2>
                    },
                    h3: ({ children }) => {
                      const text = typeof children === 'string' ? children : extractText(children)
                      const id = slugify(text)
                      return <h3 id={id} className="text-base font-bold text-gray-700 mt-6 mb-2 scroll-mt-16">{highlightText(text, search)}</h3>
                    },
                    h4: ({ children }) => {
                      const text = typeof children === 'string' ? children : extractText(children)
                      const id = slugify(text)
                      return <h4 id={id} className="text-sm font-bold text-gray-600 mt-4 mb-1.5 scroll-mt-16">{highlightText(text, search)}</h4>
                    },
                    p: ({ children }) => (
                      <p className="text-sm text-gray-700 leading-relaxed mb-3">{search ? highlightInChildren(children, search) : children}</p>
                    ),
                    ul: ({ children }) => <ul className="list-disc list-outside ml-5 mb-4 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-outside ml-5 mb-4 space-y-1">{children}</ol>,
                    li: ({ children }) => (
                      <li className="text-sm text-gray-700 leading-relaxed">{search ? highlightInChildren(children, search) : children}</li>
                    ),
                    strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                    em: ({ children }) => <em className="italic text-gray-600">{children}</em>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-sedec-300 bg-sedec-50/50 pl-4 pr-3 py-2 my-3 rounded-r-lg">
                        {children}
                      </blockquote>
                    ),
                    code: ({ children, className }) => {
                      const isBlock = className?.includes('language-')
                      if (isBlock) {
                        return (
                          <code className="block bg-gray-900 text-gray-100 text-xs p-4 rounded-lg my-3 overflow-x-auto font-mono leading-relaxed">
                            {children}
                          </code>
                        )
                      }
                      return <code className="bg-gray-100 text-sedec-700 text-xs px-1.5 py-0.5 rounded font-mono">{children}</code>
                    },
                    pre: ({ children }) => <pre className="my-3">{children}</pre>,
                    table: ({ children }) => (
                      <div className="my-4 overflow-x-auto rounded-lg border border-gray-200">
                        <table className="w-full text-sm">{children}</table>
                      </div>
                    ),
                    thead: ({ children }) => <thead className="bg-gray-50 border-b border-gray-200">{children}</thead>,
                    tbody: ({ children }) => <tbody className="divide-y divide-gray-100">{children}</tbody>,
                    tr: ({ children }) => <tr className="hover:bg-gray-50/50">{children}</tr>,
                    th: ({ children }) => (
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{children}</th>
                    ),
                    td: ({ children }) => (
                      <td className="px-3 py-2 text-sm text-gray-700">{search ? highlightInChildren(children, search) : children}</td>
                    ),
                    hr: () => <hr className="my-8 border-gray-200" />,
                    a: ({ href, children }) => (
                      <a href={href} className="text-sedec-600 hover:text-sedec-800 underline underline-offset-2">{children}</a>
                    ),
                  }}
                >
                  {markdown}
                </ReactMarkdown>
              </article>
            )}

            {/* Scroll to top */}
            <button
              onClick={scrollToTop}
              className="fixed bottom-6 right-6 bg-sedec-500 hover:bg-sedec-600 text-white p-2.5 rounded-full shadow-lg transition-colors z-50"
              title="Voltar ao topo"
            >
              <ArrowUp size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper: extract plain text from React children
function extractText(children: any): string {
  if (typeof children === 'string') return children
  if (Array.isArray(children)) return children.map(extractText).join('')
  if (children?.props?.children) return extractText(children.props.children)
  return ''
}

// Helper: recursively highlight search term in children
function highlightInChildren(children: any, query: string): any {
  if (!query.trim()) return children
  if (typeof children === 'string') return highlightText(children, query)
  if (Array.isArray(children)) return children.map((c, i) => <span key={i}>{highlightInChildren(c, query)}</span>)
  if (children?.props?.children) {
    return { ...children, props: { ...children.props, children: highlightInChildren(children.props.children, query) } }
  }
  return children
}
