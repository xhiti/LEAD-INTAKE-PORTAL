'use client'

import { useState, useMemo } from 'react'
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
} from '@dnd-kit/core'
import {
    sortableKeyboardCoordinates,
    arrayMove,
} from '@dnd-kit/sortable'
import { KanbanColumn } from './kanban-column'
import { KanbanCard } from './kanban-card'
import { updateSubmissionStatusAction } from '@/lib/actions/submissions'
import { useToast } from '@/components/ui/use-toast'
import { SubmissionDrawer, type SubmissionDetail } from './submission-drawer'

interface Props {
    submissions: SubmissionDetail[]
    locale: string
    isAdmin: boolean
    userId: string
}

const STATUS_KEYS = ['new', 'reviewed', 'in_progress', 'closed', 'archived']

const STATUS_LABELS: Record<string, string> = {
    new: 'New',
    reviewed: 'Reviewed',
    in_progress: 'In Progress',
    closed: 'Closed',
    archived: 'Archived',
}

export function SubmissionsKanban({ submissions: initialSubmissions, locale, isAdmin, userId }: Props) {
    const { toast } = useToast()
    const [submissions, setSubmissions] = useState<SubmissionDetail[]>(initialSubmissions)
    const [activeSubmission, setActiveSubmission] = useState<SubmissionDetail | null>(null)
    const [selectedSubmission, setSelectedSubmission] = useState<SubmissionDetail | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const byStatus = useMemo(() => {
        const map: Record<string, SubmissionDetail[]> = {}
        for (const k of STATUS_KEYS) map[k] = []
        for (const sub of submissions) {
            if (map[sub.status]) map[sub.status].push(sub)
            else map['archived'].push(sub)
        }
        return map
    }, [submissions])

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event
        const sub = submissions.find((s) => s.id === active.id)
        if (sub) setActiveSubmission(sub)
    }

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event
        if (!over) return

        const activeId = active.id as string
        const overId = over.id as string

        const activeSub = submissions.find((s) => s.id === activeId)
        if (!activeSub) return

        const isOverAColumn = STATUS_KEYS.includes(overId)
        const isOverASubmission = submissions.some(s => s.id === overId)

        if (isOverAColumn) {
            if (activeSub.status !== overId) {
                setSubmissions(prev => prev.map(s =>
                    s.id === activeId ? { ...s, status: overId } : s
                ))
            }
            return
        }

        if (isOverASubmission) {
            const overSub = submissions.find(s => s.id === overId)
            if (overSub && activeSub.status !== overSub.status) {
                setSubmissions(prev => prev.map(s =>
                    s.id === activeId ? { ...s, status: overSub.status } : s
                ))
            }
        }
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        setActiveSubmission(null)

        if (!over) return

        const activeId = active.id as string
        const overId = over.id as string

        const activeIndex = submissions.findIndex(s => s.id === activeId)
        const overIndex = submissions.findIndex(s => s.id === overId)

        if (overIndex !== -1 && activeId !== overId) {
            setSubmissions((items) => arrayMove(items, activeIndex, overIndex))
        }

        const activeSub = submissions.find(s => s.id === activeId)
        if (!activeSub) return

        const originalSub = initialSubmissions.find(s => s.id === activeId)

        if (activeSub.status !== originalSub?.status) {
            try {
                const result = await updateSubmissionStatusAction(activeId, { status: activeSub.status }, userId)
                if (result.error) throw new Error(result.error)
            } catch (err: any) {
                setSubmissions(prev => prev.map(s => s.id === activeId ? { ...s, status: originalSub!.status } : s))
                toast({
                    title: "Update Failed",
                    description: err.message || "Failed to sync status.",
                    variant: "destructive"
                })
            }
        }
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-6 overflow-x-auto pb-6 -mx-2 px-2 h-[calc(100vh-200px)] min-h-[500px] scrollbar-hide">
                {STATUS_KEYS.map((key) => (
                    <KanbanColumn
                        key={key}
                        id={key}
                        title={STATUS_LABELS[key]}
                        submissions={byStatus[key]}
                        locale={locale}
                        onCardClick={setSelectedSubmission}
                    />
                ))}
            </div>

            <DragOverlay dropAnimation={{
                duration: 200,
                easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
            }}>
                {activeSubmission ? (
                    <div className="w-[280px] rotate-[2deg] cursor-grabbing shadow-2xl pointer-events-none scale-105 transition-transform duration-200">
                        <KanbanCard
                            submission={activeSubmission}
                            locale={locale}
                            onClick={() => { }}
                        />
                    </div>
                ) : null}
            </DragOverlay>

            <SubmissionDrawer
                submission={selectedSubmission}
                locale={locale}
                onClose={() => setSelectedSubmission(null)}
            />
        </DndContext>
    )
}
