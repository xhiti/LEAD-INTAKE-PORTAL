import { NextResponse } from 'next/server'
import webpush from 'web-push'

let isInitialized = false

function initWebPush() {
  if (isInitialized) return true

  const email = process.env.VAPID_EMAIL
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY

  if (!email || !publicKey || !privateKey) {
    console.warn('VAPID keys are missing. Push notifications are disabled.')
    return false
  }

  try {
    webpush.setVapidDetails(email, publicKey, privateKey)
    isInitialized = true
    return true
  } catch (error) {
    console.error('Failed to set VAPID details:', error)
    return false
  }
}

export async function POST(request: Request) {
  try {
    if (!initWebPush()) {
      return NextResponse.json(
        { error: 'Push notification service is not configured' },
        { status: 503 }
      )
    }

    const { subscription, title, body, url } = await request.json()

    if (!subscription || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const payload = JSON.stringify({
      title,
      body,
      url: url ?? '/',
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
    })

    await webpush.sendNotification(subscription, payload)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Push notification error:', error)
    return NextResponse.json({ error: 'Failed to send push notification' }, { status: 500 })
  }
}
