'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import type { Period } from '@/app/[locale]/(dashboard)/dashboard/page'

const PERIODS: { value: Period; label: string }[] = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '3m', label: '3 Months' },
    { value: '6m', label: '6 Months' },
    { value: '1y', label: '1 Year' },
]

export function PeriodSelector({ current }: { current: Period }) {
    const router = useRouter()
    const searchParams = useSearchParams()

    function switchPeriod(p: Period) {
        const params = new URLSearchParams(searchParams.toString())
        params.set('period', p)
        router.replace(`?${params.toString()}`, { scroll: false })
    }

    return (
        <div className="flex flex-wrap gap-1.5 items-center bg-muted/50 p-1 rounded-xl border border-border/50">
            {PERIODS.map(p => (
                <Button
                    key={p.value}
                    size="sm"
                    variant={current === p.value ? 'default' : 'ghost'}
                    className={`h-7 px-3 text-[11px] font-bold rounded-lg transition-all ${current === p.value
                            ? 'bg-primary shadow-sm text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                        }`}
                    onClick={() => switchPeriod(p.value)}
                >
                    {p.label}
                </Button>
            ))}
        </div>
    )
}
