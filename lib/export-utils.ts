export interface ExportOptions {
    filename?: string
    headers: string[]
    data: (string | number | boolean | null | undefined)[][]
}

export function exportToCSV({ filename = 'export', headers, data }: ExportOptions) {
    const BOM = '\ufeff'

    const csvRows = [
        headers.join(','),
        ...data.map(row =>
            row.map(cell => {
                const value = cell === null || cell === undefined ? '' : String(cell)
                return `"${value.replace(/"/g, '""')}"`
            }).join(',')
        )
    ].join('\n')

    const blob = new Blob([BOM + csvRows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    if (link.download !== undefined) {
        link.setAttribute('href', url)
        link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    URL.revokeObjectURL(url)
}
