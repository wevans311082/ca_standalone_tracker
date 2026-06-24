import { format, parseISO } from 'date-fns'

export const COMPANY_SIZES = [
  'Micro (1–9 employees)',
  'Small (10–49 employees)',
  'Medium (50–249 employees)',
  'Large (250+ employees)',
]

const CB_COLORS = [
  '#3b82f6',
  '#8b5cf6',
  '#06b6d4',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#ec4899',
  '#6366f1',
  '#14b8a6',
  '#f97316',
]

export function cbColor(certificationBody) {
  let hash = 0
  for (let i = 0; i < certificationBody.length; i++) {
    hash = certificationBody.charCodeAt(i) + ((hash << 5) - hash)
  }
  return CB_COLORS[Math.abs(hash) % CB_COLORS.length]
}

export function formatDate(dateStr) {
  return format(parseISO(dateStr), 'd MMM yyyy')
}

export function formatDateShort(dateStr) {
  return format(parseISO(dateStr), 'd MMM')
}

export function groupByCB(assessments) {
  const groups = {}
  for (const a of assessments) {
    if (!groups[a.certification_body]) {
      groups[a.certification_body] = []
    }
    groups[a.certification_body].push(a)
  }
  return Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([cb, items]) => ({
      certification_body: cb,
      items: items.sort(
        (x, y) => new Date(x.assessment_date) - new Date(y.assessment_date),
      ),
    }))
}

export const emptyForm = () => ({
  name: '',
  customer: '',
  certification_body: '',
  company_size: COMPANY_SIZES[1],
  assessment_date: new Date().toISOString().slice(0, 10),
  notes: '',
})