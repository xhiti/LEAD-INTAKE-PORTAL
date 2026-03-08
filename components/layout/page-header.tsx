import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

interface PageHeaderProps {
    title: string;
    description?: string;
    backHref?: string;
    backText?: string;
    children?: React.ReactNode;
}

export function PageHeader({ title, description, backHref, backText, children }: PageHeaderProps) {
    return (
        <div className="space-y-4 pb-2">
            <div>
                {backHref && (
                    <Link
                        href={backHref}
                        className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors mb-2 w-fit group"
                    >
                        <ChevronLeft className="h-3 w-3 group-hover:-translate-x-0.5 transition-transform" />
                        {backText || "Back"}
                    </Link>
                )}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-xl font-bold tracking-tight">{title}</h1>
                        {description && (
                            <p className="text-muted-foreground text-[13px]">
                                {description}
                            </p>
                        )}
                    </div>
                    {children && (
                        <div className="flex items-center gap-2">
                            {children}
                        </div>
                    )}
                </div>
            </div>
            <Separator className="opacity-50" />
        </div>
    );
}
