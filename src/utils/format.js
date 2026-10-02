const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatCurrency(value) {
  const n = Number(value)
  return inr.format(Number.isFinite(n) ? n : 0)
}

export function formatQty(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '0'
  // Show up to 2 decimals but drop trailing zeros (3, 1.5, 0.25).
  return String(Number(n.toFixed(2)))
}

export function formatDate(value) {
  if (!value) return ''
  const d = new Date(String(value).replace(' ', 'T'))
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
}
