'use client'

import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface AddIndustryButtonProps {
    label: string
}

export function AddIndustryButton({ label }: AddIndustryButtonProps) {
    const handleClick = () => {
        window.dispatchEvent(new CustomEvent('open-industry-dialog'))
    }

    return (
        <Button
            onClick={handleClick}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm rounded-xl px-6"
        >
            <Plus className="h-4 w-4" />
            {label}
        </Button>
    )
}
