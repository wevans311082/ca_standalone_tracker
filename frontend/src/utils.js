import { addDays, format, getDay, parseISO, subDays } from 'date-fns'

export const COMPANY_SIZES = [
  'Micro (1–9 employees)',
  'Small (10–49 employees)',
  'Medium (50–249 employees)',
  'Large (250+ employees)',
]

export const ASSESSMENT_TYPES = [
  { value: 'willow', label: 'Willow' },
  { value: 'danzel', label: 'Danzel' },
]

const ASSESSMENT_TYPE_STYLES = {
  willow: { bg: '#d1fae5', text: '#047857', accent: '#10b981' },
  danzel: { bg: '#ede9fe', text: '#6d28d9', accent: '#8b5cf6' },
}

export function assessmentTypeLabel(type) {
  return ASSESSMENT_TYPES.find((t) => t.value === type)?.label ?? type
}

export function assessmentTypeStyle(type) {
  return ASSESSMENT_TYPE_STYLES[type] ?? ASSESSMENT_TYPE_STYLES.willow
}

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

export const SAMPLE_RELEASE_COLOR = '#f59e0b'
export const CE_WINDOWS_COLOR = '#6366f1'
export const REMEDIATION_COLOR = '#f43f5e'

export const CALENDAR_PILL_TOGGLES = [
  {
    field: 'show_sample_release',
    label: 'Sample Release',
    hint: '3 working days before start',
  },
  {
    field: 'show_ce_windows',
    label: 'CE+ Windows',
    hint: '90 days before VSA date',
  },
  {
    field: 'show_remediation_window',
    label: 'Remediation Window',
    hint: '30 days after start',
  },
]

export function pillEnabled(assessment, field) {
  return assessment[field] !== false
}

function isWeekend(date) {
  const day = getDay(date)
  return day === 0 || day === 6
}

export function subtractWorkingDays(dateStr, workingDays) {
  let date = parseISO(dateStr)
  let remaining = workingDays
  while (remaining > 0) {
    date = subDays(date, 1)
    if (!isWeekend(date)) remaining -= 1
  }
  return format(date, 'yyyy-MM-dd')
}

export function sampleReleaseDate(startDate) {
  return subtractWorkingDays(startDate, 3)
}

export function sampleReleaseTitle(customer) {
  return `${customer} Sample Release`
}

export function addCalendarDays(dateStr, days) {
  return format(addDays(parseISO(dateStr), days), 'yyyy-MM-dd')
}

export function subtractCalendarDays(dateStr, days) {
  return format(subDays(parseISO(dateStr), days), 'yyyy-MM-dd')
}

export function ceWindowsDate(vsaDate) {
  return subtractCalendarDays(vsaDate, 90)
}

export function remediationWindowDate(startDate) {
  return addCalendarDays(startDate, 30)
}

export function ceWindowsTitle(customer) {
  return `${customer} CE+ Windows`
}

export function remediationWindowTitle(customer) {
  return `${customer} Remediation Window`
}

export const SAMPLE_SUBTASKS = [
  { field: 'sample_sampled', label: 'Sampled' },
  { field: 'sample_agents', label: 'Agents' },
  { field: 'sample_invites', label: 'Invites' },
]

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
    assessment_type: 'willow',
    start_date: today,
    end_date: today,
    progress_status: 'not_started',
    sample_sampled: false,
    sample_agents: false,
    sample_invites: false,
    vsa_date: '',
    show_sample_release: true,
    show_ce_windows: true,
    show_remediation_window: true,
    notes: '',
  }
}