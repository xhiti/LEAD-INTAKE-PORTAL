"use client"

import * as React from "react"
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    MoreHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const
export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number]

export interface PaginationState {
    page: number
    pageSize: PageSize
    totalItems: number
}

export interface PaginationProps {
    page: number
    pageSize: PageSize
    totalItems: number
    onPageChange: (page: number) => void
    onPageSizeChange?: (pageSize: PageSize) => void
    className?: string
    showPageSizeSelector?: boolean
    showPageInfo?: boolean
    showQuickJumps?: boolean
    siblingCount?: number
}

function generatePagination(
    currentPage: number,
    totalPages: number,
    siblingCount: number = 1
): (number | "ellipsis")[] {
    const totalPageNumbers = siblingCount * 2 + 5

    if (totalPages <= totalPageNumbers) {
        return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1)
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages)

    const shouldShowLeftEllipsis = leftSiblingIndex > 2
    const shouldShowRightEllipsis = rightSiblingIndex < totalPages - 1

    if (!shouldShowLeftEllipsis && shouldShowRightEllipsis) {
        const leftItemCount = 3 + 2 * siblingCount
        const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1)
        return [...leftRange, "ellipsis", totalPages]
    }

    if (shouldShowLeftEllipsis && !shouldShowRightEllipsis) {
        const rightItemCount = 3 + 2 * siblingCount
        const rightRange = Array.from(
            { length: rightItemCount },
            (_, i) => totalPages - rightItemCount + i + 1
        )
        return [1, "ellipsis", ...rightRange]
    }

    const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
    )
    return [1, "ellipsis", ...middleRange, "ellipsis", totalPages]
}

export function Pagination({
    page,
    pageSize,
    totalItems,
    onPageChange,
    onPageSizeChange,
    className,
    showPageSizeSelector = true,
    showPageInfo = true,
    showQuickJumps = true,
    siblingCount = 1,
}: PaginationProps) {
    const totalPages = Math.ceil(totalItems / pageSize)
    const startItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1
    const endItem = Math.min(page * pageSize, totalItems)

    const pages = generatePagination(page, totalPages, siblingCount)

    const canGoPrevious = page > 1
    const canGoNext = page < totalPages

    return (
        <div
            className={cn(
                "flex items-center justify-between w-full",
                className
            )}
        >
            <div className="flex items-center gap-4">
                {showPageInfo && (
                    <p className="hidden md:block text-sm text-muted-foreground whitespace-nowrap">
                        Showing{" "}
                        <span className="font-bold text-foreground">{startItem}</span>
                        {" - "}
                        <span className="font-bold text-foreground">{endItem}</span>
                        {" of "}
                        <span className="font-bold text-foreground">{totalItems}</span>
                    </p>
                )}

                {showPageSizeSelector && onPageSizeChange && (
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground hidden xs:inline-block">Rows:</span>
                        <Select
                            value={String(pageSize)}
                            onValueChange={(value) => {
                                if (onPageSizeChange) {
                                    onPageSizeChange(Number(value) as PageSize)
                                }
                            }}
                        >
                            <SelectTrigger className="h-8 w-[65px] text-xs font-bold border-none bg-muted/50 shadow-none">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {PAGE_SIZE_OPTIONS.map((size) => (
                                    <SelectItem key={size} value={String(size)} className="text-xs">
                                        {size}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-1.5">
                {showQuickJumps && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="hidden sm:flex h-8 w-8"
                        onClick={() => onPageChange(1)}
                        disabled={!canGoPrevious}
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                )}

                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-none bg-muted/50 hover:bg-muted"
                    onClick={() => onPageChange(page - 1)}
                    disabled={!canGoPrevious}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="hidden md:flex items-center gap-1">
                    {pages.map((pageNum, idx) =>
                        pageNum === "ellipsis" ? (
                            <div
                                key={`ellipsis-${idx}`}
                                className="flex h-8 w-8 items-center justify-center"
                            >
                                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                            </div>
                        ) : (
                            <Button
                                key={pageNum}
                                variant={page === pageNum ? "default" : "ghost"}
                                size="icon"
                                className="h-8 w-8 text-xs font-bold"
                                onClick={() => onPageChange(pageNum)}
                            >
                                {pageNum}
                            </Button>
                        )
                    )}
                </div>

                <div className="flex items-center justify-center px-2 min-w-[60px] md:hidden">
                    <span className="text-[11px] font-black tabular-nums">
                        {page} <span className="text-muted-foreground font-medium mx-0.5">/</span> {totalPages}
                    </span>
                </div>

                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-none bg-muted/50 hover:bg-muted"
                    onClick={() => onPageChange(page + 1)}
                    disabled={!canGoNext}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>

                {showQuickJumps && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="hidden sm:flex h-8 w-8"
                        onClick={() => onPageChange(totalPages)}
                        disabled={!canGoNext}
                    >
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    )
}

export function usePagination(
    totalItems: number,
    defaultPageSize: PageSize = 10
) {
    const [page, setPage] = React.useState(1)
    const [pageSize, setPageSize] = React.useState<PageSize>(defaultPageSize)

    const totalPages = Math.ceil(totalItems / pageSize)

    React.useEffect(() => {
        if (page > totalPages && totalPages > 0) {
            setPage(totalPages)
        }
    }, [page, totalPages])

    const handlePageChange = React.useCallback((newPage: number) => {
        setPage(Math.max(1, Math.min(newPage, totalPages)))
    }, [totalPages])

    const handlePageSizeChange = React.useCallback((newPageSize: PageSize) => {
        setPageSize(newPageSize)
        setPage(1)
    }, [])

    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize

    return {
        page,
        pageSize,
        totalPages,
        startIndex,
        endIndex,
        onPageChange: handlePageChange,
        onPageSizeChange: handlePageSizeChange,
        paginationProps: {
            page,
            pageSize,
            totalItems,
            onPageChange: handlePageChange,
            onPageSizeChange: handlePageSizeChange,
        },
    }
}

export function useUrlPagination(searchParams: URLSearchParams) {
    const page = Number(searchParams.get("page")) || 1
    const pageSize = (Number(searchParams.get("pageSize")) || 10) as PageSize

    return { page, pageSize }
}
