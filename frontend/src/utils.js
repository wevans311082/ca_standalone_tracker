import { addDays, format, parseISO } from 'date-fns'

export const COMPANY_SIZES = [
  'Micro (1–9 employees)',
  'Small (10–49 employees)',
  'Medium (50–249 employees)',
  'Large (250+ employees)',
]

export const PROGRESS_STATUSES = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'awaiting_client', label: 'Awaiting Client' },
  { value: 'on_hold', label: 'On Hold' },
]

const PROGRESS_STATUS_COLORS = {
  not_started: { bg: '#f1f5f9', text: '#64748b' },
  in_progress: { bg: '#dbeafe', text: '#2563eb' },
  awaiting_client: { bg: '#fef3c7', text: '#d97706' },
  on_hold: { bg: '#fee2e2', text: '#dc2626' },
}

export function progressStatusLabel(status) {
  return PROGRESS_STATUSES.find((s) => s.value === status)?.label ?? status
}

export function progressStatusColor(status) {
  return PROGRESS_STATUS_COLORS[status] ?? PROGRESS_STATUS_COLORS.not_started
}

export function isCompleted(assessment) {
  return Boolean(assessment.completed_at)
}

export function partitionAssessments(assessments) {
  const active = []
  const completed = []
  for (const a of assessments) {
    if (isCompleted(a)) completed.push(a)
    else active.push(a)
  }
  const byStart = (x, y) => new Date(x.start_date) - new Date(y.start_date)
  active.sort(byStart)
  completed.sort(
    (x, y) => new Date(y.completed_at) - new Date(x.completed_at),
  )
  return { active, completed }
}

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

export function formatDateRange(startDate, endDate) {
  if (startDate === endDate) return formatDate(startDate)
  return `${formatDateShort(startDate)} – ${formatDate(endDate)}`
}

export function calendarEventEnd(endDate) {
  return format(addDays(parseISO(endDate), 1), 'yyyy-MM-dd')
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
        (x, y) => new Date(x.start_date) - new Date(y.start_date),
      ),
    }))
}

export const emptyForm = () => {
  const today = new Date().toISOString().slice(0, 10)
  return {
    name: '',
    customer: '',
    certification_body: '',
    company_size: COMPANY_SIZES[1],
    start_date: today,
    end_date: today,
    progress_status: 'not_started',
    notes: '',
  }
}