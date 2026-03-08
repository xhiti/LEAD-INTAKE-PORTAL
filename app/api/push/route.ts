import { NextResponse } from 'next/server'
import webpush from 'web-push'

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function POST(request: Request) {
  try {
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
