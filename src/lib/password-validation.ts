export const PASSWORD_RULES = [
  { test: (p: string) => p.length >= 8, label: 'Mínimo 8 caracteres' },
  { test: (p: string) => /[A-Z]/.test(p), label: 'Pelo menos 1 letra maiúscula' },
  { test: (p: string) => /[a-z]/.test(p), label: 'Pelo menos 1 letra minúscula' },
  { test: (p: string) => /[0-9]/.test(p), label: 'Pelo menos 1 número' },
]

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors = PASSWORD_RULES.filter(r => !r.test(password)).map(r => r.label)
  return { valid: errors.length === 0, errors }
}
