import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { trackLoginSessionAction } from '@/lib/actions/auth'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/en/dashboard'

  const host = request.headers.get('x-forwarded-host') || request.headers.get('host')
  const protocol = request.headers.get('x-forwarded-proto') || 'https'
  const origin = `${protocol}://${host}`

  if (code) {
    const supabase = await createClient()
    const { error, data: { session } } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      if (session?.user?.id) {
        const meta = session.user.user_metadata
        const googleAvatar = meta?.avatar_url || meta?.picture
        await (supabase as any).from('profiles').upsert({
          id: session.user.id,
          email: session.user.email,
          ...(meta?.given_name && { name: meta.given_name }),
          ...(meta?.family_name && { surname: meta.family_name }),
          ...(googleAvatar && { avatar_url: googleAvatar }),
          status: 'active',
          email_verified: true,
        }, { onConflict: 'id' })
      }

      const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown'
      const userAgent = request.headers.get('user-agent') || 'Unknown User-Agent'

      try {
        await trackLoginSessionAction(userAgent, 'google', session?.user?.id, ip)
      } catch (err) {
        console.error('Failed tracking Google login:', err)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/en/login?error=auth_callback_error`)
}
