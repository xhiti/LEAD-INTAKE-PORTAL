import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileForm } from '@/components/dashboard/profile-form'

export default async function ProfilePage({ params }: { params: { locale: string } }) {
    const { locale } = await Promise.resolve(params)
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect(`/${locale}/login`)

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (!profile) redirect(`/${locale}/login`)

    return (
        <div className="w-full pb-20">
            <ProfileForm profile={profile} />
        </div>
    )
}
