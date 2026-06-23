export const exportToCSV = (data, filename, columns) => {
  const headers = columns.map(c => c.label).join(',')
  const rows = data.map(row =>
    columns.map(c => {
      const val = row[c.key] ?? ''
      const escaped = String(val).replace(/"/g, '""')
      return `"${escaped}"`
    }).join(',')
  )
  const csv = [headers, ...rows].join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
