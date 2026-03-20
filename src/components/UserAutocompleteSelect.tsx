'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { UserPlus, X, ChevronDown } from 'lucide-react'

export interface EligibleUser {
  id: string
  nome: string
  email?: string
}

interface Props {
  value: string | null
  onChange: (userId: string | null) => void
  users: EligibleUser[]
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
  onRegisterNew?: () => void
}

export default function UserAutocompleteSelect({
  value,
  onChange,
  users,
  placeholder = 'Selecione...',
  required = false,
  disabled = false,
  className = '',
  onRegisterNew,
}: Props) {
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const selectedUser = value ? users.find(u => u.id === value) : null

  const filtered = search
    ? users.filter(u => u.nome.toLowerCase().includes(search.toLowerCase()))
    : users

  // Reset highlight when filtered list changes
  useEffect(() => {
    setHighlightIndex(-1)
  }, [search])

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[data-option]')
      if (items[highlightIndex]) {
        items[highlightIndex].scrollIntoView({ block: 'nearest' })
      }
    }
  }, [highlightIndex])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setSearch('')
        setHighlightIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSelect(user: EligibleUser) {
    onChange(user.id)
    setSearch('')
    setIsOpen(false)
    setHighlightIndex(-1)
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation()
    onChange(null)
    setSearch('')
  }

  function handleInputFocus() {
    if (!disabled) {
      setIsOpen(true)
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value)
    if (!isOpen) setIsOpen(true)
  }

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        setIsOpen(true)
        return
      }
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIndex(prev => {
        const next = prev + 1
        return next >= filtered.length ? 0 : next
      })
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIndex(prev => {
        const next = prev - 1
        return next < 0 ? filtered.length - 1 : next
      })
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightIndex >= 0 && highlightIndex < filtered.length) {
        handleSelect(filtered[highlightIndex])
      } else if (filtered.length === 1) {
        // Se só tem um resultado, seleciona automaticamente
        handleSelect(filtered[0])
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setSearch('')
      setHighlightIndex(-1)
    }
  }, [isOpen, highlightIndex, filtered])

  return (
    <div ref={wrapperRef} className={`relative flex gap-1.5 ${className}`}>
      <div className="relative flex-1">
        {selectedUser && !isOpen ? (
          <div
            className={`w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 flex items-center justify-between cursor-pointer ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-gray-400'}`}
            onClick={() => { if (!disabled) { setIsOpen(true); setTimeout(() => inputRef.current?.focus(), 50) } }}
          >
            <span className="truncate">{selectedUser.nome}</span>
            <div className="flex items-center gap-1 ml-2 flex-shrink-0">
              {!disabled && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-0.5 hover:bg-gray-100 rounded"
                  title="Limpar seleção"
                >
                  <X size={14} className="text-gray-400" />
                </button>
              )}
              <ChevronDown size={14} className="text-gray-400" />
            </div>
          </div>
        ) : (
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onKeyDown={handleKeyDown}
              placeholder={selectedUser ? selectedUser.nome : placeholder}
              disabled={disabled}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm text-gray-700 disabled:opacity-60 pr-8"
            />
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        )}

        {isOpen && !disabled && (
          <div ref={listRef} className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-400 italic">
                Nenhum usuário encontrado
              </div>
            ) : (
              filtered.map((u, idx) => (
                <button
                  key={u.id}
                  type="button"
                  data-option
                  onClick={() => handleSelect(u)}
                  onMouseEnter={() => setHighlightIndex(idx)}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                    idx === highlightIndex
                      ? 'bg-orange-100 text-orange-800'
                      : value === u.id
                        ? 'bg-orange-50 font-medium text-orange-700'
                        : 'text-gray-700 hover:bg-orange-50'
                  }`}
                >
                  <span>{u.nome}</span>
                  {u.email && <span className="text-gray-400 text-xs ml-2">({u.email})</span>}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {onRegisterNew && !disabled && (
        <button
          type="button"
          onClick={onRegisterNew}
          className="flex items-center justify-center w-9 h-9 mt-0 rounded-lg border border-dashed border-gray-300 text-gray-400 hover:border-orange-400 hover:text-orange-500 hover:bg-orange-50 transition-colors flex-shrink-0"
          title="Cadastrar novo gestor"
        >
          <UserPlus size={16} />
        </button>
      )}

      {required && (
        <input
          type="text"
          value={value || ''}
          required
          tabIndex={-1}
          className="absolute opacity-0 w-0 h-0 pointer-events-none"
          onChange={() => {}}
        />
      )}
    </div>
  )
}
