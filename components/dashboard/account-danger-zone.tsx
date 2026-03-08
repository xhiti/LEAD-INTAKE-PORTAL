'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Loader2, UserX, Ghost, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { deactivateAccountAction, deleteAccountAction } from '@/lib/actions/auth'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Props {
    userId: string
}

export function AccountDangerZone({ userId }: Props) {
    const t = useTranslations('profile')
    const { toast } = useToast()
    const router = useRouter()
    const params = useParams()
    const locale = params.locale as string
    const supabase = createClient()

    const [isDeleting, setIsDeleting] = useState(false)
    const [isDeactivating, setIsDeactivating] = useState(false)

    // Dialog States
    const [showDeactivateDialog, setShowDeactivateDialog] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [deleteConfirmText, setDeleteConfirmText] = useState('')

    async function handleDeactivate() {
        setIsDeactivating(true)
        try {
            const { error } = await deactivateAccountAction(userId)
            if (error) {
                toast({ title: 'Deactivation failed', description: error, variant: 'destructive' })
                return
            }
            await supabase.auth.signOut()
            router.push(`/${locale}/login`)
        } finally {
            setIsDeactivating(false)
            setShowDeactivateDialog(false)
        }
    }

    async function handleDelete() {
        if (deleteConfirmText !== 'DELETE') return

        setIsDeleting(true)
        try {
            const { error } = await deleteAccountAction(userId)
            if (error) {
                toast({ title: 'Deletion failed', description: error, variant: 'destructive' })
                return
            }
            await supabase.auth.signOut()
            router.push(`/${locale}/login`)
        } finally {
            setIsDeleting(false)
            setShowDeleteDialog(false)
        }
    }

    return (
        <div className="rounded-xl border border-destructive/30 bg-card overflow-hidden divide-y divide-destructive/15">
            {/* Deactivate Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4">
                <div className="flex items-start gap-3 min-w-0">
                    <div className="shrink-0 h-9 w-9 rounded-lg bg-muted flex items-center justify-center mt-0.5">
                        <Ghost className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium">Deactivate Account</p>
                        <p className="text-xs text-muted-foreground">Temporarily pause your account. Your data stays safe and you can reactivate by logging in again.</p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeactivateDialog(true)}
                    disabled={isDeactivating}
                    className="shrink-0 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                    Deactivate temporarily
                </Button>
            </div>

            {/* Delete Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4">
                <div className="flex items-start gap-3 min-w-0">
                    <div className="shrink-0 h-9 w-9 rounded-lg bg-destructive/10 flex items-center justify-center mt-0.5">
                        <UserX className="h-4 w-4 text-destructive" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-destructive">Delete Account</p>
                        <p className="text-xs text-muted-foreground">Permanently erase your account, profile, and all submissions. This cannot be undone.</p>
                    </div>
                </div>
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                        setDeleteConfirmText('')
                        setShowDeleteDialog(true)
                    }}
                    disabled={isDeleting}
                    className="shrink-0"
                >
                    Delete Permanently
                </Button>
            </div>

            {/* Deactivation Confirm Dialog */}
            <ConfirmDialog
                open={showDeactivateDialog}
                onOpenChange={setShowDeactivateDialog}
                title="Deactivate Account?"
                description="Your account will be temporarily disabled. You will be logged out immediately. You can reactivate anytime by logging back in."
                confirmLabel="Yes, deactivate"
                cancelLabel="Cancel"
                variant="destructive"
                isLoading={isDeactivating}
                onConfirm={handleDeactivate}
                icon={<Ghost className="h-6 w-6" />}
            />

            {/* Standardized Delete Dialog with Input Confirmation */}
            <ConfirmDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                title="Permanently delete account?"
                description="This action is irreversible. All your data, including submissions and settings, will be erased forever."
                confirmLabel="Delete Everything"
                cancelLabel="Nevermind"
                variant="destructive"
                isLoading={isDeleting}
                confirmDisabled={deleteConfirmText !== 'DELETE'}
                onConfirm={handleDelete}
                icon={<AlertTriangle className="h-6 w-6" />}
            >
                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="confirm-delete" className="text-xs tracking-wider text-muted-foreground">
                            Type <span className="text-foreground font-bold">'DELETE'</span> to confirm
                        </Label>
                        <Input
                            id="confirm-delete"
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            placeholder="DELETE"
                            className="h-11 border-destructive/20 focus-visible:ring-destructive"
                            autoComplete="off"
                        />
                    </div>
                </div>
            </ConfirmDialog>
        </div>
    )
}
