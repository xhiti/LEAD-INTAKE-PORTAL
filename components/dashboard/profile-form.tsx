'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Loader2, Camera, CheckCircle2, User, Briefcase, Globe, Mail,
  Phone, ShieldCheck, Shield, Eye, CalendarDays, MapPin, Edit3, Save
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import type { Database } from '@/lib/supabase/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

const profileSchema = z.object({
  name: z.string().min(2, 'Must be at least 2 characters'),
  surname: z.string().min(2, 'Must be at least 2 characters'),
  phone: z.string().optional(),
  gender: z.enum(['male', 'female', 'non_binary', 'prefer_not_to_say']).optional(),
  bio: z.string().max(500).optional(),
  company: z.string().optional(),
  job_title: z.string().optional(),
  timezone: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

const TIMEZONES = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Tirane', 'Asia/Tokyo',
  'Asia/Shanghai', 'Australia/Sydney',
]

const ROLE_META: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  admin: {
    label: 'Admin',
    className: 'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400',
    icon: <ShieldCheck className="h-3 w-3" />,
  },
  moderator: {
    label: 'Moderator',
    className: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400',
    icon: <Shield className="h-3 w-3" />,
  },
  viewer: {
    label: 'Viewer',
    className: 'bg-slate-500/10 text-slate-600 border-slate-500/20 dark:text-slate-400',
    icon: <Eye className="h-3 w-3" />,
  },
  user: {
    label: 'User',
    className: 'bg-primary/10 text-primary border-primary/20',
    icon: <User className="h-3 w-3" />,
  },
}

export function ProfileForm({ profile }: { profile: Profile }) {
  const { toast } = useToast()
  const supabase = createClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? '')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [saved, setSaved] = useState(false)

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile.name,
      surname: profile.surname,
      phone: profile.phone ?? '',
      gender: profile.gender ?? undefined,
      bio: profile.bio ?? '',
      company: profile.company ?? '',
      job_title: profile.job_title ?? '',
      timezone: profile.timezone ?? 'UTC',
    },
  })

  async function uploadAvatar(file: File) {
    setUploadingAvatar(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${profile.id}/avatar.${ext}`
      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      await (supabase as any).from('profiles').update({ avatar_url: publicUrl }).eq('id', profile.id)
      setAvatarUrl(publicUrl)
      toast({ title: 'Avatar updated!' })
    } catch {
      toast({ title: 'Upload failed', variant: 'destructive' })
    } finally {
      setUploadingAvatar(false)
    }
  }

  async function onSubmit(data: ProfileFormData) {
    const { error } = await (supabase as any)
      .from('profiles')
      .update({
        name: data.name,
        surname: data.surname,
        phone: data.phone || null,
        gender: data.gender ?? null,
        bio: data.bio || null,
        company: data.company || null,
        job_title: data.job_title || null,
        timezone: data.timezone ?? 'UTC',
      })
      .eq('id', profile.id)

    if (error) {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' })
      return
    }
    setSaved(true)
    toast({ title: 'Profile updated!' })
    setTimeout(() => setSaved(false), 3000)
  }

  const bioValue = watch('bio') ?? ''
  const roleMeta = ROLE_META[profile.role] ?? ROLE_META.user
  const joinedDate = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—'

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* ── Left sidebar: avatar + info card ── */}
        <div className="space-y-4">
          {/* Profile Card */}
          <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
            {/* Cover gradient */}
            <div className="h-28 bg-gradient-to-br from-primary/30 via-primary/10 to-background relative">
              <div className="absolute inset-0 opacity-20"
                style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, hsl(var(--primary)) 0%, transparent 60%)' }}
              />
            </div>

            <CardContent className="px-6 pb-6 -mt-10">
              {/* Avatar */}
              <div className="relative mb-4 w-fit">
                <Avatar className="h-20 w-20 border-4 border-background shadow-md ring-1 ring-border/50">
                  <AvatarImage src={avatarUrl} alt={profile.full_name ?? ''} className="object-cover" />
                  <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
                    {profile.initials}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
                  title="Change avatar"
                >
                  {uploadingAvatar
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : <Camera className="h-3.5 w-3.5" />
                  }
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={e => { const file = e.target.files?.[0]; if (file) uploadAvatar(file) }}
                />
              </div>

              {/* Name + role */}
              <h2 className="text-xl font-bold tracking-tight">{profile.full_name}</h2>
              <p className="text-sm text-muted-foreground mb-3">{watch('job_title') || profile.job_title || 'No title set'}</p>

              <Badge variant="outline" className={cn('gap-1.5 text-xs font-semibold px-2.5 py-0.5', roleMeta.className)}>
                {roleMeta.icon}
                {roleMeta.label}
              </Badge>
            </CardContent>
          </Card>

          {/* Info tags */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
            <CardHeader className="pb-3 pt-4 px-5">
              <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Account Info</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-3">
              <InfoRow icon={<Mail className="h-3.5 w-3.5 shrink-0" />} label={profile.email} />
              {profile.phone && <InfoRow icon={<Phone className="h-3.5 w-3.5 shrink-0" />} label={profile.phone} />}
              {(profile.company || profile.job_title) && (
                <InfoRow icon={<Briefcase className="h-3.5 w-3.5 shrink-0" />} label={[profile.job_title, profile.company].filter(Boolean).join(' @ ')} />
              )}
              {profile.timezone && (
                <InfoRow icon={<Globe className="h-3.5 w-3.5 shrink-0" />} label={profile.timezone} />
              )}
              <InfoRow icon={<CalendarDays className="h-3.5 w-3.5 shrink-0" />} label={`Joined ${joinedDate}`} muted />
            </CardContent>
          </Card>

          {/* Status */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
            <CardContent className="px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={cn('h-2 w-2 rounded-full', profile.is_active ? 'bg-emerald-500' : 'bg-muted-foreground')} />
                <span className="text-sm font-medium">{profile.is_active ? 'Active' : 'Inactive'}</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {(profile as any).status || 'Active'}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* ── Right: form panels ── */}
        <div className="space-y-4">
          {/* Personal Information */}
          <FormSection
            icon={<User className="h-4 w-4" />}
            title="Personal Information"
            description="Your basic public-facing identity."
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="First name" required error={errors.name?.message}>
                <Input {...register('name')} placeholder="John" className="h-10" />
              </Field>
              <Field label="Last name" required error={errors.surname?.message}>
                <Input {...register('surname')} placeholder="Doe" className="h-10" />
              </Field>
            </div>
            <Field label="Email address">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={profile.email} readOnly className="h-10 pl-9 bg-muted/30 cursor-not-allowed text-muted-foreground" />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Email cannot be changed here</p>
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Phone" optional>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input {...register('phone')} placeholder="+1 555 000 0000" className="h-10 pl-9" />
                </div>
              </Field>
              <Field label="Gender" optional>
                <Select value={watch('gender') ?? ''} onValueChange={v => setValue('gender', v as ProfileFormData['gender'])}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="non_binary">Non-binary</SelectItem>
                    <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </FormSection>

          {/* About / Bio */}
          <FormSection
            icon={<Edit3 className="h-4 w-4" />}
            title="About"
            description="A short bio that appears on your profile."
          >
            <Field label="Bio" optional>
              <Textarea
                {...register('bio')}
                placeholder="Tell us a bit about yourself..."
                className="resize-none min-h-[110px]"
                maxLength={500}
              />
              <div className="flex justify-end mt-1">
                <span className={cn('text-[11px] tabular-nums', bioValue.length > 460 ? 'text-amber-500' : 'text-muted-foreground')}>
                  {bioValue.length}/500
                </span>
              </div>
            </Field>
          </FormSection>

          {/* Professional */}
          <FormSection
            icon={<Briefcase className="h-4 w-4" />}
            title="Professional"
            description="Your work information and preferences."
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Company" optional>
                <Input {...register('company')} placeholder="Acme Inc." className="h-10" />
              </Field>
              <Field label="Job title" optional>
                <Input {...register('job_title')} placeholder="Software Engineer" className="h-10" />
              </Field>
            </div>
            <Field label="Timezone" optional>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Select value={watch('timezone')} onValueChange={v => setValue('timezone', v)}>
                  <SelectTrigger className="h-10 pl-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map(tz => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </Field>
          </FormSection>

          {/* Save */}
          <div className="flex justify-end pt-1">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 min-w-[150px] gap-2 shadow-sm"
            >
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Saving...</>
              ) : saved ? (
                <><CheckCircle2 className="h-4 w-4" />Saved!</>
              ) : (
                <><Save className="h-4 w-4" />Save Changes</>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}

/* ── helpers ── */

function FormSection({
  icon,
  title,
  description,
  children,
}: {
  icon?: React.ReactNode
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
      <CardHeader className="border-b border-border/40 bg-muted/20 px-6 py-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              {icon}
            </div>
          )}
          <div>
            <CardTitle className="text-sm font-semibold">{title}</CardTitle>
            {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {children}
      </CardContent>
    </Card>
  )
}

function InfoRow({ icon, label, muted }: { icon: React.ReactNode; label: string; muted?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 text-sm">
      <span className="text-muted-foreground">{icon}</span>
      <span className={cn('truncate', muted ? 'text-muted-foreground text-xs' : '')}>{label}</span>
    </div>
  )
}

function Field({
  label,
  required,
  optional,
  error,
  children,
}: {
  label: string
  required?: boolean
  optional?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <label className="text-sm font-medium leading-none">{label}</label>
        {required && <span className="text-xs text-destructive">*</span>}
        {optional && <span className="text-xs text-muted-foreground">(optional)</span>}
      </div>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
