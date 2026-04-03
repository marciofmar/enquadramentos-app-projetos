/**
 * Envia push notifications para os mesmos destinatários de um conjunto de alertas.
 * Chamado do lado do cliente (browser) via API route.
 * Silently fails — push é best-effort, nunca deve bloquear o fluxo principal.
 */
export async function sendPushForAlerts(
  alertas: { destinatario_id: string; descricao: string; projeto_nome?: string; projeto_id?: number }[]
): Promise<void> {
  if (!alertas || alertas.length === 0) return

  try {
    // Group by destinatario to avoid duplicate pushes
    const byUser = new Map<string, { descricao: string; projeto_nome: string; projeto_id: number }>()
    for (const al of alertas) {
      if (!byUser.has(al.destinatario_id)) {
        byUser.set(al.destinatario_id, {
          descricao: al.descricao,
          projeto_nome: al.projeto_nome || 'Projeto',
          projeto_id: al.projeto_id || 0,
        })
      }
    }

    const userIds = Array.from(byUser.keys())
    // Build a summary message
    const firstAlert = byUser.values().next().value
    const title = 'SIGPLAN — Nova notificação'
    const body = userIds.length === 1 && firstAlert
      ? firstAlert.descricao
      : `Você tem ${alertas.length} nova(s) notificação(ões)`

    await fetch('/api/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userIds,
        title,
        body,
        url: firstAlert?.projeto_id ? `/dashboard/projetos/${firstAlert.projeto_id}` : '/dashboard/projetos',
      }),
    })
  } catch (err) {
    // Silent fail - push is best-effort
    console.error('[Push Client] Erro ao enviar push:', err)
  }
}
