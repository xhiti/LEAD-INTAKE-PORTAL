"use client"

import * as React from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Pagination, usePagination, type PageSize } from "@/components/ui/pagination"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Download, FileSpreadsheet } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export interface Column<T> {
    id: string
    header: React.ReactNode
    cell: (item: T, index: number) => React.ReactNode
    accessorKey?: keyof T | string
    className?: string
    headerClassName?: string
    width?: string
}

export interface DataTableProps<T> {
    data: T[]
    columns: Column<T>[]
    keyExtractor: (item: T) => string
    title?: string
    description?: string
    headerActions?: React.ReactNode
    enablePagination?: boolean
    defaultPageSize?: PageSize
    showPageSizeSelector?: boolean
    showPageInfo?: boolean
    showQuickJumps?: boolean
    serverSide?: boolean
    totalItems?: number
    currentPage?: number
    pageSize?: PageSize
    onPageChange?: (page: number) => void
    onPageSizeChange?: (pageSize: PageSize) => void
    isLoading?: boolean
    emptyState?: {
        icon?: React.ReactNode
        title: string
        description?: string
        action?: React.ReactNode
    }
    className?: string
    tableClassName?: string
    onRowClick?: (item: T) => void
    rowClassName?: (item: T) => string
    enableSelection?: boolean
    onSelectionChange?: (selectedItems: T[]) => void
    enableExport?: boolean
    maxHeight?: string
}

function TableSkeleton({ columns, rows }: { columns: Column<any>[], rows: number }) {
    return (
        <>
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <TableRow key={`skeleton-row-${rowIndex}`}>
                    {columns.map((column) => (
                        <TableCell
                            key={`skeleton-cell-${column.id}`}
                            className={column.className}
                            style={{ width: column.width }}
                        >
                            <Skeleton className="h-6 w-full opacity-60" />
                        </TableCell>
                    ))}
                </TableRow>
            ))}
        </>
    )
}

export function DataTable<T>({
    data,
    columns,
    keyExtractor,
    title,
    description,
    headerActions,
    enablePagination = true,
    defaultPageSize = 10,
    showPageSizeSelector = true,
    showPageInfo = true,
    showQuickJumps = true,
    serverSide = false,
    totalItems: externalTotalItems,
    currentPage: externalPage,
    pageSize: externalPageSize,
    onPageChange: externalOnPageChange,
    onPageSizeChange: externalOnPageSizeChange,
    isLoading = false,
    emptyState,
    className,
    tableClassName,
    onRowClick,
    rowClassName,
    enableSelection = false,
    onSelectionChange,
    enableExport = true,
    maxHeight,
}: DataTableProps<T>) {
    const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
    const clientPagination = usePagination(data.length, defaultPageSize)

    const isServerSide = serverSide && externalTotalItems !== undefined
    const page = isServerSide ? (externalPage ?? 1) : clientPagination.page
    const pageSize = isServerSide ? (externalPageSize ?? defaultPageSize) : clientPagination.pageSize
    const totalItems = isServerSide ? externalTotalItems : data.length
    const onPageChange = isServerSide ? (externalOnPageChange || (() => { })) : clientPagination.onPageChange
    const onPageSizeChange = isServerSide ? externalOnPageSizeChange : clientPagination.onPageSizeChange

    const paginatedData = isServerSide
        ? data
        : data.slice(clientPagination.startIndex, clientPagination.endIndex)

    const showPagination = enablePagination && totalItems > 0

    // Selection logic
    const toggleRow = (id: string, item: T) => {
        const next = new Set(selectedIds)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        setSelectedIds(next)

        if (onSelectionChange) {
            const selectedItems = data.filter(i => next.has(keyExtractor(i)))
            onSelectionChange(selectedItems)
        }
    }

    const toggleAll = () => {
        if (selectedIds.size === paginatedData.length) {
            setSelectedIds(new Set())
            onSelectionChange?.([])
        } else {
            const next = new Set(paginatedData.map(keyExtractor))
            setSelectedIds(next)
            onSelectionChange?.(paginatedData)
        }
    }

    // Export logic (CSV)
    const exportToCSV = () => {
        const headers = columns.map(col => col.id).join(",")
        const rows = data.map(item => {
            return columns.map(col => {
                const val = col.accessorKey ? (item as any)[col.accessorKey] : ""
                return `"${String(val).replace(/"/g, '""')}"`
            }).join(",")
        })
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n")
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", `${title || "export"}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const tableContent = (
        <div className="space-y-4">
            <div
                className={cn(
                    "rounded-xl border border-border/50 overflow-hidden bg-card/30 backdrop-blur-sm",
                    maxHeight && "overflow-y-auto"
                )}
                style={maxHeight ? { maxHeight } : undefined}
            >
                <Table className={cn("w-full border-collapse", tableClassName)}>
                    <TableHeader className="bg-muted/40 border-b border-border/50">
                        <TableRow className="hover:bg-transparent">
                            {enableSelection && (
                                <TableHead className="w-[40px] px-4">
                                    <Checkbox
                                        checked={selectedIds.size === paginatedData.length && paginatedData.length > 0}
                                        onCheckedChange={toggleAll}
                                        aria-label="Select all"
                                    />
                                </TableHead>
                            )}
                            {columns.map((column) => (
                                <TableHead
                                    key={column.id}
                                    className={cn("whitespace-nowrap px-4 py-3 font-semibold text-xs uppercase tracking-wider", column.headerClassName)}
                                    style={{ width: column.width }}
                                >
                                    {column.header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <AnimatePresence mode="popLayout">
                            {isLoading ? (
                                <TableSkeleton columns={enableSelection ? [{ id: 'select', header: null, cell: () => null }, ...columns] : columns} rows={pageSize} />
                            ) : paginatedData.length === 0 ? (
                                <TableRow className="hover:bg-transparent border-0">
                                    <TableCell colSpan={columns.length + (enableSelection ? 1 : 0)} className="h-64 text-center">
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex flex-col items-center justify-center space-y-3"
                                        >
                                            <div className="p-4 rounded-full bg-muted/30">
                                                {emptyState?.icon || <FileSpreadsheet className="h-8 w-8 text-muted-foreground/40" />}
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="text-md font-semibold">{emptyState?.title || "No data available"}</h3>
                                                <p className="text-sm text-muted-foreground max-w-[280px] mx-auto">
                                                    {emptyState?.description || "There are no items to display at this time."}
                                                </p>
                                            </div>
                                            {emptyState?.action}
                                        </motion.div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedData.map((item, index) => {
                                    const id = keyExtractor(item)
                                    const isSelected = selectedIds.has(id)
                                    return (
                                        <motion.tr
                                            layout
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.2, delay: index * 0.03 }}
                                            key={id}
                                            className={cn(
                                                "border-b border-border/40 transition-colors last:border-0",
                                                index % 2 === 1 && "bg-muted/10", // Subtle zebra striping
                                                isSelected ? "bg-primary/[0.04] dark:bg-primary/[0.08]" : "hover:bg-muted/30",
                                                onRowClick && "cursor-pointer",
                                                rowClassName?.(item)
                                            )}
                                            onClick={() => onRowClick?.(item)}
                                        >
                                            {enableSelection && (
                                                <TableCell className="px-4" onClick={(e) => e.stopPropagation()}>
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={() => toggleRow(id, item)}
                                                        aria-label={`Select row ${id}`}
                                                    />
                                                </TableCell>
                                            )}
                                            {columns.map((column) => (
                                                <TableCell
                                                    key={column.id}
                                                    className={cn("px-4 py-3.5 text-sm", column.className)}
                                                    style={{ width: column.width }}
                                                >
                                                    {column.cell(item, index)}
                                                </TableCell>
                                            ))}
                                        </motion.tr>
                                    )
                                })
                            )}
                        </AnimatePresence>
                    </TableBody>
                </Table>
            </div>

            {showPagination && (
                <div className="pt-2">
                    <Pagination
                        page={page}
                        pageSize={pageSize}
                        totalItems={totalItems}
                        onPageChange={onPageChange}
                        onPageSizeChange={onPageSizeChange}
                        showPageSizeSelector={showPageSizeSelector}
                        showPageInfo={showPageInfo}
                        showQuickJumps={showQuickJumps}
                    />
                </div>
            )}
        </div>
    )

    if (title || headerActions || enableExport) {
        return (
            <Card className={cn("overflow-hidden border-none shadow-none bg-transparent", className)}>
                {(title || headerActions || enableExport) && (
                    <CardHeader className="px-0 pt-0 pb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            {title && <CardTitle className="text-xl font-bold tracking-tight">{title}</CardTitle>}
                            {description && <CardDescription className="text-sm mt-1">{description}</CardDescription>}
                        </div>
                        <div className="flex items-center gap-2">
                            {enableExport && data.length > 0 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={exportToCSV}
                                    className="h-9 px-3 gap-2 rounded-xl bg-white dark:bg-slate-900 border-border/60 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
                                >
                                    <Download className="h-4 w-4 text-primary" />
                                    <span className="hidden sm:inline font-medium">Export CSV</span>
                                </Button>
                            )}
                            {headerActions}
                        </div>
                    </CardHeader>
                )}
                <CardContent className="p-0">{tableContent}</CardContent>
            </Card>
        )
    }

    return <div className={className}>{tableContent}</div>
}
