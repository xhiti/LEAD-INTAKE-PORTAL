"use client"

import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import type { ReactNode } from "react"
import { useTranslations } from "next-intl"

interface ConfirmDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    icon?: ReactNode
    title: string
    description: string
    confirmLabel?: string
    cancelLabel?: string
    variant?: "default" | "destructive" | "warning"
    isLoading?: boolean
    confirmDisabled?: boolean
    onConfirm: () => void | Promise<void>
    children?: ReactNode
}

export function ConfirmDialog({
    open,
    onOpenChange,
    icon,
    title,
    description,
    confirmLabel,
    cancelLabel,
    variant = "default",
    isLoading = false,
    confirmDisabled = false,
    onConfirm,
    children,
}: ConfirmDialogProps) {
    const t = useTranslations('common')

    const handleConfirm = async () => {
        await onConfirm()
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="sm:max-w-md">
                <AlertDialogHeader className="flex flex-col items-center text-center gap-4">
                    {icon && (
                        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${variant === "destructive" ? "bg-destructive/10 text-destructive" :
                                variant === "warning" ? "bg-orange-500/10 text-orange-500" :
                                    "bg-primary/10 text-primary"
                            }`}>
                            {icon}
                        </div>
                    )}
                    <AlertDialogTitle className="text-center">{title}</AlertDialogTitle>
                    <AlertDialogDescription className="text-center">
                        {description}
                    </AlertDialogDescription>
                    {children && <div className="w-full mt-4 text-left">{children}</div>}
                </AlertDialogHeader>
                <AlertDialogFooter className="flex row sm:flex-row justify-center gap-3 mt-2">
                    <AlertDialogCancel asChild disabled={isLoading}>
                        <Button variant="outline" disabled={isLoading} className="flex-1">
                            {cancelLabel || t('cancel')}
                        </Button>
                    </AlertDialogCancel>
                    <Button
                        variant={variant}
                        onClick={handleConfirm}
                        disabled={isLoading || confirmDisabled}
                        className="flex-1"
                    >
                        {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        {confirmLabel || t('confirm')}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
