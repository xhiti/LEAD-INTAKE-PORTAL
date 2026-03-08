"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function DynamicBreadcrumbs() {
    const pathname = usePathname()
    const [contextName, setContextName] = useState<string | null>(null)
    const pathSegments = pathname.split("/").filter((s) => s !== "" && s !== "en" && s !== "fr" && s !== "es" && s !== "sq")

    useEffect(() => {
        const fetchContext = async () => {
            const uuidRegex = /([a-f0-9-]{36})/
            const match = pathname.match(uuidRegex)

            if (!match) {
                setContextName(null)
                return
            }

            const id = match[1]

            try {
                let endpoint = ""
                if (pathname.includes("/submissions")) endpoint = `/api/submissions/${id}`
                else if (pathname.includes("/profile")) endpoint = `/api/profiles/${id}`

                if (endpoint) {
                    const res = await fetch(endpoint)
                    if (res.ok) {
                        const data = await res.json()
                        setContextName(data.full_name || data.name || data.title || null)
                    }
                }
            } catch {
                setContextName(null)
            }
        }

        fetchContext()
    }, [pathname])

    return (
        <nav className="hidden sm:flex items-center space-x-1 text-sm font-medium">
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground p-1 transition-colors">
                <Home className="h-4 w-4" />
            </Link>

            {pathSegments.map((segment, index) => {
                const isUUID = /^[a-f0-9-]{36}$/.test(segment)
                const href = `/${pathSegments.slice(0, index + 1).join("/")}`
                const isLast = index === pathSegments.length - 1

                const displayName = isUUID && contextName
                    ? contextName
                    : segment.replace(/-/g, " ")

                return (
                    <React.Fragment key={index}>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/30 shrink-0" />
                        {isLast ? (
                            <span className="truncate max-w-[200px] capitalize tracking-wide text-foreground font-semibold">
                                {displayName}
                            </span>
                        ) : (
                            <Link
                                href={href}
                                className={cn(
                                    "truncate capitalize transition-colors",
                                    isUUID ? "max-w-[150px] text-foreground/80" : "max-w-[100px] text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {displayName}
                            </Link>
                        )}
                    </React.Fragment>
                )
            })}
        </nav>
    )
}
