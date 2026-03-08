'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import {
    Save, Loader2 as LoaderIcon,
    Settings2, History, Sparkles,
    CheckCircle2, Info, Shield, Clock
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { FormLabel } from '@/components/ui/form-label'
import { Separator } from '@/components/ui/separator'
import { SubmissionHistory } from './submission-history'
import { updateSubmissionStatusAction, getSubmissionHistoryAction } from '@/lib/actions/submissions'
import { getStatusColor, getPriorityColor } from '@/lib/utils'

interface Props {
    submission: any
    history: any[]
    isAdmin: boolean
    userId: string
    locale: string
}

const STATUSES = ['new', 'reviewed', 'in_progress', 'closed', 'archived'] as const
const PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const

export function SubmissionManagement({ submission: initialSubmission, history: initialHistory, isAdmin, userId, locale }: Props) {
    const t = useTranslations('submissions')
    const { toast } = useToast()
    const router = useRouter()

    const [submission, setSubmission] = useState(initialSubmission)
    const [history, setHistory] = useState(initialHistory)
    const [saving, setSaving] = useState(false)

    const [status, setStatus] = useState(submission.status)
    const [note, setNote] = useState('')

    const handleUpdateStatus = async () => {
        setSaving(true)
        try {
            const res = await updateSubmissionStatusAction(submission.id, {
                status,
                note
            }, userId)

            if (res.error) throw new Error(res.error)

            toast({ title: t('updateSuccess') })

            const historyRes = await getSubmissionHistoryAction(submission.id)
            if (historyRes.success) {
                setHistory(historyRes.data)
            }

            setSubmission({ ...submission, status })
            setNote('')
            router.refresh()
        } catch (e: any) {
            toast({ title: t('edit.failed'), description: e.message, variant: 'destructive' })
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full animate-in fade-in duration-500">
            <div className="lg:col-span-8 space-y-6">
                <Card className="border-border/50 shadow-xl w-full bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm">
                    <CardContent className="pt-8 px-8 pb-10 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <FormLabel>{t('new.form.name')}</FormLabel>
                                <Input value={submission.name} readOnly className="bg-muted/30 cursor-default" />
                            </div>
                            <div className="space-y-2">
                                <FormLabel>{t('new.form.email')}</FormLabel>
                                <Input value={submission.email} readOnly className="bg-muted/30 cursor-default" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <FormLabel>{t('new.form.businessName')}</FormLabel>
                                <Input value={submission.business_name} readOnly className="bg-muted/30 cursor-default" />
                            </div>
                            <div className="space-y-2">
                                <FormLabel>{t('new.form.industry')}</FormLabel>
                                <Input value={submission.industry} readOnly className="bg-muted/30 cursor-default" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <FormLabel>{t('new.form.helpRequest')}</FormLabel>
                            <div className="bg-muted/30 dark:bg-muted/10 border border-border/40 rounded-xl overflow-hidden shadow-sm">
                                <div className="border-l-4 border-primary/30 p-4 sm:p-6">
                                    <p className="text-base sm:text-md text-foreground/90 leading-relaxed whitespace-pre-wrap tracking-normal">
                                        {submission.help_request}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {isAdmin && (submission.ai_summary || submission.ai_category) && (
                            <div className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/20 dark:to-emerald-950/20 border border-teal-100/50 dark:border-teal-900/30 rounded-xl p-6 relative">
                                <div className="flex items-center gap-2 mb-4">
                                    <Sparkles className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                                    <h4 className="text-xs font-semibold text-teal-800 dark:text-teal-300">
                                        {t('aiInsights.title')}
                                    </h4>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-teal-600/60 dark:text-teal-400/60">
                                            {t('aiInsights.category')}
                                        </span>
                                        <Badge variant="secondary" className="bg-teal-100/80 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300 border-none font-medium text-[10px] h-5">
                                            {t(`categories.${submission.ai_category}`)}
                                        </Badge>
                                        {submission.ai_confidence_score && (
                                            <span className="text-[10px] font-bold text-teal-600 ml-auto">
                                                {Math.round(submission.ai_confidence_score * 100)}% Confidence
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm text-teal-900/80 dark:text-teal-100/80 font-medium leading-relaxed italic">
                                            "{submission.ai_summary}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="lg:col-span-4 space-y-6">
                {isAdmin && !['closed', 'archived'].includes(submission.status) && (
                    <Card className="border-border/50 shadow-xl bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm">
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-2">
                                <Settings2 className="h-4 w-4 text-primary" />
                                <CardTitle className="text-sm font-bold">{t('edit.title')}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="space-y-2">
                                <FormLabel>{t('currentStatus')}</FormLabel>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger className="bg-background/50 h-11 rounded-xl">
                                        <div className="flex items-center gap-2">
                                            <div className={`h-2 w-2 rounded-full shrink-0 ${getStatusColor(status).split(' ')[0]}`} />
                                            <span className="capitalize">{t(`status.${status}`)}</span>
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {STATUSES.map(s => (
                                            <SelectItem key={s} value={s} className="capitalize">
                                                <div className="flex items-center gap-2">
                                                    <div className={`h-2 w-2 rounded-full ${getStatusColor(s).split(' ')[0]}`} />
                                                    {t(`status.${s}`)}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <FormLabel required>{t('changeNote')}</FormLabel>
                                <Textarea
                                    value={note}
                                    onChange={e => setNote(e.target.value)}
                                    placeholder={t('changeNotePlaceholder')}
                                    className="min-h-[100px] bg-background/50 resize-none rounded-xl border-border/40 focus:border-primary/50 transition-colors"
                                />
                            </div>

                            <Button
                                onClick={handleUpdateStatus}
                                disabled={saving || !note.trim()}
                                className="w-full font-bold shadow-lg h-11 rounded-xl"
                            >
                                {saving ? <LoaderIcon className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                {saving ? t('saving') : t('save')}
                            </Button>
                        </CardContent>
                    </Card>
                )}

                <Card className="border-border/50 shadow-xl bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm flex flex-col max-h-[600px]">
                    <CardHeader className="pb-4 shrink-0 border-b mb-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <History className="h-4 w-4 text-primary" />
                                <CardTitle className="text-sm font-bold">{t('historyTitle')}</CardTitle>
                            </div>
                            <Badge variant="secondary" className="font-mono tabular-nums h-5 px-1.5 opacity-60">
                                {history.length}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto scrollbar-thin pr-2 py-4">
                        <SubmissionHistory history={history} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
