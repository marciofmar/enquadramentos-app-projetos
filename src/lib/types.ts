export interface Profile {
  id: string
  email: string
  nome: string
  setor_id: number | null
  role: 'admin' | 'gestor' | 'usuario'
  ativo: boolean
}

export interface AcaoEstrategica {
  id: number
  numero: string
  nome: string
  descricao_o_que: string
  descricao_para_que: string
  descricao_oficial_completa: string
  ancoragem: string
  nota_arranjo_institucional: string | null
  acoes_conectadas: string
  eixo_prioritario: { id: number; codigo: string; nome: string } | null
  objetivo_estrategico: { id: number; codigo: string; nome: string } | null
  estrategia: { id: number; codigo: string; nome: string } | null
}

export interface DestaqueEstrategico {
  id: number
  titulo: string
  header_contexto: string
  linhas: DestaqueLinha[]
}

export interface DestaqueLinha {
  id: number
  ordem: number
  tipo: 'label_conteudo' | 'header'
  label: string | null
  conteudo: string
}

export interface PanoramicoLinha {
  id: number
  ordem: number
  setor_display: string
  papel: string
  sintese_contribuicao: string
  nao_faz: string
}

export interface Ficha {
  id: number
  ordem: number
  titulo: string
  setor_display: string
  papel: string
  justificativa: string
  contribuicao_esperada: string[]
  nao_escopo: string[]
  dependencias_criticas: string[]
}

export interface Fundamentacao {
  id: number
  introducao: string
  conclusao: string
  itens: { id: number; ordem: number; conteudo: string }[]
}

export interface Observacao {
  id: number
  acao_estrategica_id: number
  bloco: string
  conteudo: string
  autor_nome: string
  autor_setor: string | null
  status: 'em_analise' | 'absorvida' | 'indeferida'
  resposta_admin: string | null
  respondido_por: string | null
  respondido_em: string | null
  created_at: string
}

export interface AcaoCard {
  id: number
  numero: string
  nome: string
  eixo_nome: string
  oe_nome: string
  estrategia_nome: string
  setores: string[]
}

export interface Projeto {
  id: number
  nome: string
  descricao: string
  problema_resolve: string
  setor_lider_id: number
  criado_por: string
  created_at: string
}

export interface Entrega {
  id: number
  projeto_id: number
  nome: string
  descricao: string
  dependencias_criticas: string | null
  data_final_prevista: string | null
  status: 'aberta' | 'em_andamento' | 'aguardando' | 'resolvida' | 'cancelada'
  motivo_status: string | null
}

export interface Atividade {
  id: number
  entrega_id: number
  nome: string
  descricao: string
}

export interface AuditLogEntry {
  id: number
  usuario_id: string
  usuario_nome: string
  tipo_acao: 'create' | 'update' | 'delete'
  entidade: string
  entidade_id: number
  conteudo_anterior: any
  conteudo_novo: any
  created_at: string
}
