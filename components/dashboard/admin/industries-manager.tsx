'use client'

import { useState, useMemo, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FormDialog } from '@/components/ui/form-dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Label } from '@/components/ui/label'
import { DataTable } from '@/components/ui/data-table'
import { EditButton, DeleteButton } from '@/components/ui/actions'
import { createIndustryAction, updateIndustryAction, deleteIndustryAction } from '@/lib/actions/industries'
import { Plus, Trash2, ToggleLeft, ToggleRight, Search, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { DateCell } from '@/components/ui/date-cell'

interface Industry {
    id: string
    code: string
    title: string
    description: string | null
    order_index: number
    is_active: boolean
    created_at: string
}

interface Props {
    initialIndustries: Industry[]
}

const defaultForm = { code: '', title: '', description: '', order_index: 0 }

export function IndustriesManager({ initialIndustries }: Props) {
    const t = useTranslations('industries')
    const { toast } = useToast()
    const [industries, setIndustries] = useState(initialIndustries)
    const [open, setOpen] = useState(false)
    const [editTarget, setEditTarget] = useState<Industry | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
    const [form, setForm] = useState(defaultForm)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        function handleOpen() { openCreate() }
        window.addEventListener('open-industry-dialog', handleOpen)
        return () => window.removeEventListener('open-industry-dialog', handleOpen)
    }, [])

    function openCreate() {
        setEditTarget(null)
        setForm(defaultForm)
        setOpen(true)
    }

    function openEdit(industry: Industry) {
        setEditTarget(industry)
        setForm({
            code: industry.code,
            title: industry.title,
            description: industry.description ?? '',
            order_index: industry.order_index,
        })
        setOpen(true)
    }

    async function handleSave() {
        setSaving(true)
        try {
            if (editTarget) {
                const res = await updateIndustryAction(editTarget.id, form)
                if (!res.success) throw new Error(res.error)
                setIndustries(prev => prev.map(i =>
                    i.id === editTarget.id ? { ...i, ...form } : i
                ))
                toast({ title: t('success.updated'), description: form.title })
            } else {
                const res = await createIndustryAction(form)
                if (!res.success) throw new Error(res.error)
                if (res.data) setIndustries(prev => [...prev, res.data as Industry])
                toast({ title: t('success.created'), description: form.title })
            }
            setOpen(false)
        } catch (e: any) {
            toast({ title: 'Error', description: e.message, variant: 'destructive' })
        } finally {
            setSaving(false)
        }
    }

    async function handleDelete() {
        if (!deleteTarget) return
        setDeleting(true)
        try {
            const res = await deleteIndustryAction(deleteTarget)
            if (!res.success) throw new Error(res.error)
            setIndustries(prev => prev.filter(i => i.id !== deleteTarget))
            setDeleteTarget(null)
            toast({ title: t('success.deleted') })
        } catch (e: any) {
            toast({ title: 'Error', description: e.message, variant: 'destructive' })
        } finally {
            setDeleting(false)
        }
    }

    async function toggleActive(industry: Industry) {
        const res = await updateIndustryAction(industry.id, { is_active: !industry.is_active })
        if (res.success) {
            setIndustries(prev => prev.map(i => i.id === industry.id ? { ...i, is_active: !i.is_active } : i))
        }
    }

    const filtered = useMemo(() => {
        return industries.filter(i =>
            i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            i.code.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [industries, searchQuery])

    return (
        <div className="flex flex-col">
            <div className="space-y-6 flex-1 overflow-y-auto pr-2">
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={t('searchName')}
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-9 h-10 bg-background/50"
                        />
                    </div>
                </div>

                <DataTable
                    data={filtered}
                    columns={[
                        {
                            id: 'title',
                            header: t('displayName'),
                            cell: (i) => (
                                <div>
                                    <p className="font-medium">{i.title}</p>
                                </div>
                            ),
                        },
                        {
                            id: 'code',
                            header: t('code'),
                            cell: (i) => <code className="text-xs bg-muted/50 px-1.5 py-0.5 rounded font-mono text-primary/80 border border-border/50">{i.code}</code>,
                        },
                        {
                            id: 'description',
                            header: t('description'),
                            className: 'hidden lg:table-cell max-w-xs',
                            headerClassName: 'hidden lg:table-cell',
                            cell: (i) => <p className="text-xs text-muted-foreground line-clamp-1 italic">{i.description ?? '—'}</p>,
                        },
                        {
                            id: 'order',
                            header: t('order'),
                            className: 'hidden md:table-cell text-center',
                            headerClassName: 'hidden md:table-cell text-center',
                            cell: (i) => <span className="text-sm font-semibold text-muted-foreground">{i.order_index}</span>,
                        },
                        {
                            id: 'date',
                            header: t('date'),
                            cell: (i) => <DateCell date={i.created_at} />,
                        },
                        {
                            id: 'actions',
                            header: t('actions'),
                            className: 'text-center',
                            headerClassName: 'text-center',
                            cell: (i) => (
                                <div className="flex justify-center gap-1">
                                    <EditButton onClick={() => openEdit(i)} />
                                    <DeleteButton onClick={() => setDeleteTarget(i.id)} />
                                </div>
                            ),
                        },
                    ]}
                    enableExport={false}
                    keyExtractor={(i) => i.id}
                    emptyState={{
                        title: 'No industries found.',
                        description: 'No matching records were found in the database.'
                    }}
                    defaultPageSize={10}
                />
            </div>

            <FormDialog
                isOpen={open}
                onOpenChange={setOpen}
                title={editTarget ? t('edit') : t('add')}
                description={t('subtitle')}
                footerActions={
                    <div className="flex gap-2 mt-6 justify-end w-full">
                        <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
                            {t('success.cancel')}
                        </Button>
                        <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                            {editTarget ? 'Save Changes' : t('add')}
                        </Button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>{t('code')} <span className="text-red-500">*</span></Label>
                            <Input
                                value={form.code}
                                onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                                placeholder="Healthcare"
                                className="font-mono bg-background/50"
                            />
                            <p className="text-[10px] text-muted-foreground">Unique identifier used internally</p>
                        </div>
                        <div className="space-y-2">
                            <Label>{t('displayName')} <span className="text-red-500">*</span></Label>
                            <Input
                                value={form.title}
                                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                placeholder="Healthcare"
                                className="bg-background/50"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>{t('description')}</Label>
                        <Textarea
                            value={form.description}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            placeholder="A brief description of this industry..."
                            className="resize-none bg-background/50"
                            rows={3}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>{t('order')}</Label>
                        <Input
                            type="number"
                            value={form.order_index}
                            onChange={e => setForm(f => ({ ...f, order_index: parseInt(e.target.value) || 0 }))}
                            placeholder="0"
                            className="bg-background/50"
                        />
                        <p className="text-[10px] text-muted-foreground">Lower numbers appear first in dropdowns</p>
                    </div>
                </div>
            </FormDialog>

            <ConfirmDialog
                open={!!deleteTarget}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
                icon={<Trash2 className="h-6 w-6" />}
                title={t('delete')}
                description={t('confirmDelete')}
                confirmLabel={t('delete')}
                cancelLabel={t('success.cancel')}
                variant="destructive"
                isLoading={deleting}
                onConfirm={handleDelete}
            />
        </div>
    )
}
