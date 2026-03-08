'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import {
    Dialog,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
    DialogPortal,
} from '@/components/ui/dialog'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { cn } from '@/lib/utils'

interface FormDialogProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description?: string
    children: React.ReactNode
    footerActions?: React.ReactNode
    className?: string
}

export function FormDialog({
    isOpen,
    onOpenChange,
    title,
    description,
    children,
    footerActions,
    className,
}: FormDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogPortal>
                <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

                <DialogPrimitive.Content
                    className={cn(
                        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-[625px] translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-2xl",
                        className
                    )}
                >
                    <DialogPrimitive.Close className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-muted hover:rotate-90 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:pointer-events-none group">
                        <X className="h-4 w-4 transition-transform duration-200" />
                        <span className="sr-only">Close</span>
                    </DialogPrimitive.Close>

                    <DialogHeader className="space-y-0">
                        <DialogTitle className="text-md font-medium text-foreground pr-8">
                            {title}
                        </DialogTitle>
                        {description && (
                            <DialogDescription className="text-xs text-muted-foreground">
                                {description}
                            </DialogDescription>
                        )}
                    </DialogHeader>

                    <div className="py-4">
                        {children}
                    </div>

                    {footerActions && (
                        <DialogFooter className="flex sm:justify-center gap-3 border-t border-border">
                            {footerActions}
                        </DialogFooter>
                    )}
                </DialogPrimitive.Content>
            </DialogPortal>
        </Dialog>
    )
}
