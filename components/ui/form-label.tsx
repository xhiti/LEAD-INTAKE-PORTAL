import * as React from "react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface FormLabelProps extends React.ComponentPropsWithoutRef<typeof Label> {
    required?: boolean
    optional?: boolean
}

const FormLabel = React.forwardRef<
    React.ElementRef<typeof Label>,
    FormLabelProps
>(({ className, required, optional, children, ...props }, ref) => (
    <Label
        ref={ref}
        className={cn("flex items-center gap-1.5", className)}
        {...props}
    >
        {children}
        {required && (
            <span className="text-destructive font-bold leading-none">*</span>
        )}
        {optional && (
            <span className="text-[10px] leading-none font-medium text-muted-foreground/60 uppercase tracking-wider ml-auto">
                Optional
            </span>
        )}
    </Label>
))
FormLabel.displayName = "FormLabel"

export { FormLabel }
