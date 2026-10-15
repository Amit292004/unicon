// Real-time notification and cross-tab event bus for UNICON / CampusConnect

export type RealtimeEvent =
  | { type: 'NOTIFICATION_ADDED'; payload: { title: string; body: string; userId?: string } }
  | { type: 'REPORT_UPDATED'; payload: { reportId: string; status: string } }
  | { type: 'CLAIM_SUBMITTED'; payload: { reportId: string; itemName: string } }
  | { type: 'SYNC_STORE' }

type EventListener = (event: RealtimeEvent) => void

const listeners = new Set<EventListener>()
let broadcastChannel: BroadcastChannel | null = null

if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel('unicon_realtime_channel')
    broadcastChannel.onmessage = (event) => {
      if (event.data) {
        listeners.forEach((listener) => {
          try {
            listener(event.data)
          } catch (e) {
            console.error('Error in realtime listener:', e)
          }
        })
      }
    }
  } catch (err) {
    console.warn('BroadcastChannel not available:', err)
  }
}

export function subscribeRealtime(listener: EventListener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function publishRealtime(event: RealtimeEvent): void {
  // Notify local listeners
  listeners.forEach((listener) => {
    try {
      listener(event)
    } catch (e) {
      console.error('Error in local realtime listener:', e)
    }
  })

  // Broadcast to other tabs
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage(event)
    } catch (err) {
      console.warn('Broadcast postMessage failed:', err)
    }
  }
}
