'use client'

import * as React from 'react'
import { Trash2, Pencil, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ActionButtonProps {
    onClick?: () => void
    className?: string
    disabled?: boolean
    title?: string
}

export function DeleteButton({ onClick, className, disabled, title }: ActionButtonProps) {
    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={cn(
                "h-8 w-8 transition-all duration-200",
                "bg-red-500/10 text-red-500",
                "hover:bg-red-500/20 hover:text-red-500 active:scale-95",
                "disabled:opacity-50 disabled:pointer-events-none",
                className
            )}
        >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete item</span>
        </Button>
    )
}

export function EditButton({ onClick, className, disabled, title }: ActionButtonProps) {
    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={cn(
                "h-8 w-8 transition-all duration-200",
                "bg-blue-500/10 text-blue-500",
                "hover:bg-blue-500/20 hover:text-blue-500 active:scale-95",
                "disabled:opacity-50 disabled:pointer-events-none",
                className
            )}
        >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit item</span>
        </Button>
    )
}

export function ViewButton({ onClick, className, disabled, title }: ActionButtonProps) {
    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={cn(
                "h-8 w-8 transition-all duration-200",
                "bg-teal-500/15 border border-teal-500/15",
                "text-teal-600 dark:text-teal-400",
                "hover:bg-teal-500/25 hover:border-teal-500/25 hover:text-teal-700",
                "active:scale-95",
                "disabled:opacity-50 disabled:pointer-events-none",
                className
            )}
        >
            <Eye className="h-4 w-4" />
            <span className="sr-only">View item</span>
        </Button>
    )
}
