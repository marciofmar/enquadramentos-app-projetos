/// <reference lib="webworker" />

const SW_VERSION = '1.0.0'

// Install — pré-cache mínimo (sem cache agressivo para não quebrar queries dinâmicas)
self.addEventListener('install', (event) => {
  console.log('[SW] Install v' + SW_VERSION)
  self.skipWaiting()
})

// Activate — limpar caches antigos se houver
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate v' + SW_VERSION)
  event.waitUntil(self.clients.claim())
})

// Push — exibir notificação nativa
self.addEventListener('push', (event) => {
  console.log('[SW] Push received')

  let data = { title: 'SIGPLAN', body: 'Você tem uma nova notificação.', url: '/dashboard/projetos' }

  try {
    if (event.data) {
      const parsed = event.data.json()
      data = { ...data, ...parsed }
    }
  } catch (e) {
    console.error('[SW] Error parsing push data:', e)
  }

  const options = {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [200, 100, 200],
    tag: 'sigplan-notification',
    renotify: true,
    data: { url: data.url || '/dashboard/projetos' },
    actions: [
      { action: 'open', title: 'Abrir' },
      { action: 'dismiss', title: 'Dispensar' }
    ]
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// Notification Click — abrir/focar a aplicação
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click')
  event.notification.close()

  if (event.action === 'dismiss') return

  const targetUrl = event.notification.data?.url || '/dashboard/projetos'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Se já tem uma aba aberta, focar nela e navegar
      for (const client of clientList) {
        if (client.url.includes('/dashboard') && 'focus' in client) {
          client.focus()
          client.navigate(targetUrl)
          return
        }
      }
      // Se não, abrir nova janela
      return self.clients.openWindow(targetUrl)
    })
  )
})
