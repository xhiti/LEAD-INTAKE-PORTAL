'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Loader2, Send, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { FormLabel } from '@/components/ui/form-label'
import { createInternalSubmissionAction, updateSubmissionAction, type SubmissionFormData } from '@/lib/actions/submissions'
import { PageHeader } from '@/components/layout/page-header'
import { ArrowLeft } from 'lucide-react'

const formSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email address'),
    business_name: z.string().min(2, 'Business Name is required'),
    industry: z.string().min(1, 'Industry is required'),
    help_request: z.string().min(10, 'Please provide more details on how we can help'),
})

interface Props {
    userId: string
    locale: string
    title: string
    description?: string
    submissionId?: string
    industries: string[]
    initialData: {
        name: string
        email: string
        business_name: string
        industry?: string
        help_request?: string
        ai_summary?: string
        ai_category?: string
        ai_confidence_score?: number
        ai_model_used?: string
    }
}

export function SubmissionForm({ userId, locale, title, description, submissionId, industries, initialData }: Props) {
    const t = useTranslations('submissions')
    const { toast } = useToast()
    const router = useRouter()
    const [isSubmittingForm, setIsSubmittingForm] = useState(false)

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<SubmissionFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData.name,
            email: initialData.email,
            business_name: initialData.business_name,
            industry: initialData.industry || '',
            help_request: initialData.help_request || '',
        },
    })

    const helpRequestText = watch('help_request')

    async function onSubmit(data: SubmissionFormData) {
        setIsSubmittingForm(true)

        const payload = {
            ...data
        }

        const result = submissionId
            ? await updateSubmissionAction(submissionId, payload, userId)
            : await createInternalSubmissionAction(payload, userId)

        setIsSubmittingForm(false)

        if (result.error) {
            toast({
                title: submissionId ? t('edit.failed') : t('new.form.failed'),
                description: result.error,
                variant: 'destructive',
            })
            return
        }

        toast({
            title: submissionId ? t('edit.success') : t('new.form.success'),
            description: submissionId ? t('edit.successMessage') : t('new.form.successMessage'),
        })

        if (!submissionId) {
            reset({
                name: initialData.name,
                email: initialData.email,
                business_name: initialData.business_name,
                industry: initialData.industry || '',
                help_request: '',
            })
        } else {
            router.push(`/${locale}/submissions`)
            router.refresh()
        }
    }

    return (
        <div className="space-y-6 w-full">
            <PageHeader title={title} description={description}>
                <div className="flex items-center gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push(`/${locale}/submissions`)}
                        disabled={isSubmittingForm}
                        className="bg-background/50 backdrop-blur-sm"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        {t('new.form.cancel')}
                    </Button>
                    <Button
                        type="submit"
                        form="internal-submission-form"
                        disabled={isSubmittingForm}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg px-8"
                    >
                        {isSubmittingForm ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                        {isSubmittingForm ? t('new.form.submitting') : (submissionId ? t('edit.save') : t('new.form.submit'))}
                    </Button>
                </div>
            </PageHeader>

            <Card className="border-border/50 shadow-xl w-full bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm">
                <CardContent className="pt-8 px-8 pb-10">
                    <form
                        id="internal-submission-form"
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-8 w-full"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <FormLabel required>{t('new.form.name')}</FormLabel>
                                <Input
                                    {...register('name')}
                                    placeholder={t('new.form.namePlaceholder')}
                                    className={errors.name ? 'border-destructive' : ''}
                                />
                                <p className="text-[11px] text-muted-foreground">{t('new.form.nameHint')}</p>
                                {errors.name && <p className="text-xs text-destructive font-medium">{errors.name.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <FormLabel required>{t('new.form.email')}</FormLabel>
                                <Input
                                    {...register('email')}
                                    type="email"
                                    placeholder={t('new.form.emailPlaceholder')}
                                    className={errors.email ? 'border-destructive bg-muted' : 'bg-muted'}
                                />
                                <p className="text-[11px] text-muted-foreground">{t('new.form.emailHint')}</p>
                                {errors.email && <p className="text-xs text-destructive font-medium">{errors.email.message}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <FormLabel required>{t('new.form.businessName')}</FormLabel>
                                <Input
                                    {...register('business_name')}
                                    placeholder={t('new.form.businessNamePlaceholder')}
                                    className={errors.business_name ? 'border-destructive' : ''}
                                />
                                <p className="text-[11px] text-muted-foreground">{t('new.form.businessNameHint')}</p>
                                {errors.business_name && <p className="text-xs text-destructive font-medium">{errors.business_name.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <FormLabel required>{t('new.form.industry')}</FormLabel>
                                <Select
                                    value={watch('industry')}
                                    onValueChange={(val) => setValue('industry', val, { shouldValidate: true })}
                                >
                                    <SelectTrigger className={errors.industry ? 'border-destructive' : ''}>
                                        <SelectValue placeholder={t('new.form.industryPlaceholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {industries.map(ind => (
                                            <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-[11px] text-muted-foreground">{t('new.form.industryHint')}</p>
                                {errors.industry && <p className="text-xs text-destructive font-medium">{errors.industry.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <FormLabel required>{t('new.form.helpRequest')}</FormLabel>
                            <Textarea
                                {...register('help_request')}
                                placeholder={t('new.form.helpRequestPlaceholder')}
                                className={`min-h-[120px] resize-y ${errors.help_request ? 'border-destructive' : ''}`}
                            />
                            <p className="text-[11px] text-muted-foreground">{t('new.form.helpRequestHint')}</p>
                            {errors.help_request && <p className="text-xs text-destructive font-medium">{errors.help_request.message}</p>}
                        </div>


                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
