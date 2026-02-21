import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const BLOCO_LABELS: Record<string, string> = {
  descricao: 'Descrição da Ação',
  ancoragem: 'Ancoragem Estratégica',
  destaque: 'Destaque Estratégico',
  panoramico: 'Quadro Panorâmico',
  fichas: 'Fichas Detalhadas de Enquadramento',
  fundamentacao: 'Fundamentação: O Problema que esta Ação Resolve',
  nota_institucional: 'Nota sobre Arranjo Institucional',
}

export const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  em_analise: { label: 'Em análise', color: 'text-yellow-700', bg: 'bg-yellow-100' },
  absorvida: { label: 'Absorvida', color: 'text-green-700', bg: 'bg-green-100' },
  indeferida: { label: 'Indeferida', color: 'text-red-700', bg: 'bg-red-100' },
}
