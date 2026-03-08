'use client'

import { useState, useMemo, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Search, Filter, Trash2, Download } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { FormDialog } from '@/components/ui/form-dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { DatePicker } from '@/components/ui/date-picker'
import { DataTable } from '@/components/ui/data-table'
import { formatDate, getStatusColor, getPriorityColor, cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import type { Database } from '@/lib/supabase/database.types'
import { DateCell } from '../ui/date-cell'
import { ViewButton, EditButton, DeleteButton } from '@/components/ui/actions'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { deleteSubmissionAction, updateSubmissionAction, getSubmissionsForExportAction } from '@/lib/actions/submissions'
import { Sparkles, Loader2 as LoaderIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { exportToCSV } from '@/lib/export-utils'
import { AI_CATEGORIES } from '@/lib/ai/service'

type Submission = Database['public']['Tables']['submissions']['Row']

interface Props {
  submissions: Submission[]
  isAdmin: boolean
  locale: string
  userId: string
  isMySubmissions?: boolean
  industries: string[]
}

const STATUSES = ['new', 'reviewed', 'in_progress', 'closed', 'archived'] as const
const PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const
const CATEGORIES = AI_CATEGORIES

export function SubmissionsTable({ submissions: initial, isAdmin, locale, userId, isMySubmissions, industries }: Props) {
  const t = useTranslations('submissions')
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const [submissions, setSubmissions] = useState(initial)
  const [searchName, setSearchName] = useState('')
  const [searchSurname, setSearchSurname] = useState('')
  const [searchCompany, setSearchCompany] = useState('')
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined)
  const [toDate, setToDate] = useState<Date | undefined>(undefined)
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [industryFilter, setIndustryFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const filtered = useMemo(() => {
    return submissions.filter(s => {
      const name = s.name.toLowerCase()
      const business = s.business_name.toLowerCase()

      const matchName = !searchName || name.includes(searchName.toLowerCase())
      const matchSurname = !searchSurname || name.includes(searchSurname.toLowerCase())
      const matchCompany = !searchCompany || business.includes(searchCompany.toLowerCase())

      const subDate = new Date(s.created_at)
      const matchFrom = !fromDate || subDate >= fromDate

      const toDateEnd = toDate ? new Date(toDate) : null
      if (toDateEnd) toDateEnd.setHours(23, 59, 59, 999)
      const matchTo = !toDateEnd || subDate <= toDateEnd

      const matchStatus = statusFilter === 'all' || s.status === statusFilter
      const matchCategory = categoryFilter === 'all' || s.ai_category === categoryFilter
      const matchIndustry = industryFilter === 'all' || s.industry === industryFilter
      const matchPriority = priorityFilter === 'all' || s.priority === priorityFilter

      return matchName && matchSurname && matchCompany && matchFrom && matchTo && matchStatus && matchCategory && matchIndustry && matchPriority
    })
  }, [submissions, searchName, searchSurname, searchCompany, fromDate, toDate, statusFilter, categoryFilter, industryFilter, priorityFilter])

  function openDetail(submission: Submission) {
    router.push(`/${locale}/submissions/${submission.id}`)
  }

  async function handleDelete() {
    if (!deletingId) return
    setIsDeleting(true)
    try {
      const res = await deleteSubmissionAction(deletingId)
      if (res.success) {
        setSubmissions(prev => prev.filter(s => s.id !== deletingId))
        toast({ title: t('success.deleted') || 'Deleted', description: 'Submission removed successfully.' })
        setDeletingId(null)
      } else {
        throw new Error(res.error)
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to delete', variant: 'destructive' })
    } finally {
      setIsDeleting(false)
    }
  }

  const exportToExcel = async () => {
    setIsExporting(true)
    try {
      const filters = {
        searchName,
        searchSurname,
        searchCompany,
        status: statusFilter,
        category: categoryFilter,
        industry: industryFilter,
        fromDate: fromDate?.toISOString(),
        toDate: toDate?.toISOString(),
      }

      const result = await getSubmissionsForExportAction(filters, isAdmin, userId)

      if (result.error || !result.data) {
        throw new Error(result.error || 'No data found')
      }

      const headers = [
        '#',
        t('columns.name'),
        t('new.form.email'),
        t('columns.business'),
        t('columns.industry'),
        t('columns.status'),
        t('columns.category'),
        t('columns.summary'),
        t('columns.date')
      ]

      const data = result.data.map((s: Submission, index: number) => [
        index + 1,
        s.name,
        s.email,
        s.business_name,
        s.industry,
        t(`status.${s.status}`),
        s.ai_category ? t(`categories.${s.ai_category}`) : '—',
        s.ai_summary || '—',
        formatDate(s.created_at, locale)
      ])

      exportToCSV({
        filename: 'submissions',
        headers,
        data
      })

      toast({
        title: 'Export Complete',
        description: `${result.data.length} records exported successfully.`
      })
    } catch (e: any) {
      toast({
        title: 'Export Failed',
        description: e.message || 'Failed to generate export file.',
        variant: 'destructive'
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <>
      <Card className="mb-6 border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-6">
            {!isMySubmissions ? (
              <>
                <div className="space-y-2">
                  <Input
                    placeholder={t('searchName')}
                    value={searchName}
                    onChange={e => setSearchName(e.target.value)}
                    className="h-10 bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    placeholder={t('searchSurname')}
                    value={searchSurname}
                    onChange={e => setSearchSurname(e.target.value)}
                    className="h-10 bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    placeholder={t('searchCompany')}
                    value={searchCompany}
                    onChange={e => setSearchCompany(e.target.value)}
                    className="h-10 bg-background/50"
                  />
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Input
                  placeholder={t('searchCompany')}
                  value={searchCompany}
                  onChange={e => setSearchCompany(e.target.value)}
                  className="h-10 bg-background/50"
                />
              </div>
            )}

            <div className="space-y-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-10 bg-background/50">
                  <SelectValue placeholder={t('filterStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allStatuses')}</SelectItem>
                  {STATUSES.map(s => <SelectItem key={s} value={s}>{t(`status.${s}`)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger className="h-10 bg-background/50">
                  <SelectValue placeholder={t('filterIndustry')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allIndustries')}</SelectItem>
                  {industries.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-10 bg-background/50">
                  <SelectValue placeholder={t('filterCategory')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allCategories')}</SelectItem>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{t(`categories.${c}`)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {!isMySubmissions && (
              <>
                <div className="space-y-2">
                  <DatePicker
                    date={fromDate}
                    setDate={setFromDate}
                    placeholder={t('select.fromDate')}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <DatePicker
                    date={toDate}
                    setDate={setToDate}
                    placeholder={t('select.toDate')}
                    className="w-full"
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center mb-4">
        <p className="text-sm font-medium text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-lg border border-border/40">
          {t('results', { count: filtered.length })}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={exportToExcel}
          disabled={isExporting}
          className="h-10 px-6 gap-2 border-primary/20 hover:bg-primary/5 hover:border-primary/30 transition-all active:scale-95 rounded-xl shadow-sm"
        >
          {isExporting ? (
            <LoaderIcon className="h-4 w-4 animate-spin text-primary" />
          ) : (
            <Download className="h-4 w-4 text-primary" />
          )}
          <span className="font-semibold">{isExporting ? t('common.loading') : t('exportExcel')}</span>
        </Button>
      </div>

      <DataTable
        data={filtered}
        columns={[
          {
            id: 'name',
            header: t('columns.name'),
            cell: (sub) => (
              <div>
                <p className="font-medium">{sub.name}</p>
                <p className="text-xs text-muted-foreground">{sub.business_name}</p>
              </div>
            )
          },
          ...(!isMySubmissions ? [
            {
              id: 'industry',
              header: t('columns.industry'),
              className: 'hidden md:table-cell',
              headerClassName: 'hidden md:table-cell',
              cell: (sub: Submission) => <Badge variant="outline" className="text-xs">{sub.industry}</Badge>
            },
            {
              id: 'category',
              header: t('columns.category'),
              className: 'hidden lg:table-cell',
              headerClassName: 'hidden lg:table-cell',
              cell: (sub: Submission) => sub.ai_category ? (
                <Badge variant="secondary" className="text-xs">{t(`categories.${sub.ai_category}`)}</Badge>
              ) : <span className="text-muted-foreground text-xs">—</span>
            },
            {
              id: 'summary',
              header: t('columns.summary'),
              className: 'hidden xl:table-cell max-w-xs',
              headerClassName: 'hidden xl:table-cell',
              cell: (sub: Submission) => <p className="text-xs text-muted-foreground line-clamp-1">{sub.ai_summary ?? '—'}</p>
            }
          ] : [
            {
              id: 'industry',
              header: t('columns.industry'),
              className: 'hidden md:table-cell',
              headerClassName: 'hidden md:table-cell',
              cell: (sub: Submission) => <Badge variant="outline" className="text-xs">{sub.industry}</Badge>
            }
          ]),
          {
            id: 'status',
            header: t('columns.status'),
            cell: (sub) => (
              <Badge variant="outline" className={cn("font-semibold border", getStatusColor(sub.status))}>
                {t(`status.${sub.status}`)}
              </Badge>
            )
          },
          {
            id: 'date',
            header: t('columns.date'),
            className: 'hidden lg:table-cell',
            headerClassName: 'hidden lg:table-cell',
            cell: (sub) => <DateCell date={sub.created_at} />
          },
          {
            id: 'actions',
            header: t('columns.actions') || 'Actions',
            className: 'text-center',
            headerClassName: 'text-center',
            cell: (sub) => (
              <div className="flex justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                <ViewButton onClick={() => openDetail(sub)} />
                {isMySubmissions && (
                  <>
                    <EditButton
                      onClick={() => router.push(`/${locale}/submissions/${sub.id}/edit`)}
                      disabled={sub.status !== 'new'}
                    />
                    <DeleteButton
                      onClick={() => setDeletingId(sub.id)}
                      disabled={sub.status !== 'new'}
                    />
                  </>
                )}
              </div>
            )
          }
        ]}
        keyExtractor={(item) => item.id}
        onRowClick={openDetail}
        enableSelection={false}
        enableExport={false}
        emptyState={{
          title: t('noResults'),
        }}
        defaultPageSize={10}
        showPageInfo={true}
      />


      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        icon={<Trash2 className="h-6 w-6" />}
        title="Delete Submission"
        description="Are you sure you want to delete this submission? This action will remove it from the active list."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDelete}
      />
    </>
  )
}
