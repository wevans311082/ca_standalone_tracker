import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { Monitor, Package, Wrench } from 'lucide-react'
import {
  cbColor,
  calendarEventEnd,
  ceWindowsDate,
  ceWindowsTitle,
  remediationWindowDate,
  remediationWindowTitle,
  sampleReleaseDate,
  sampleReleaseTitle,
  pillEnabled,
  SAMPLE_RELEASE_COLOR,
  CE_WINDOWS_COLOR,
  REMEDIATION_COLOR,
  SAMPLE_SUBTASKS,
} from '../utils'

const PILL_LEGEND = [
  {
    icon: Package,
    label: 'Sample Release',
    hint: '3 working days before start',
    className: 'border-amber-400 bg-amber-50 text-amber-700',
  },
  {
    icon: Monitor,
    label: 'CE+ Windows',
    hint: '90 days before VSA date',
    className: 'border-indigo-400 bg-indigo-50 text-indigo-700',
  },
  {
    icon: Wrench,
    label: 'Remediation Window',
    hint: '30 days after start',
    className: 'border-rose-400 bg-rose-50 text-rose-700',
  },
]

function CalendarLegend() {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-600">
      <span className="font-medium text-slate-500">Key</span>
      <div className="flex items-center gap-2">
        <span className="inline-block h-3 w-6 rounded bg-blue-500" />
        <span>Assessment</span>
      </div>
      {PILL_LEGEND.map((pill) => {
        const Icon = pill.icon
        return (
          <div key={pill.label} className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded border border-dashed px-2 py-0.5 text-[10px] font-semibold ${pill.className}`}
            >
              <Icon size={10} className="shrink-0" />
              {pill.label}
            </span>
            <span>{pill.hint}</span>
          </div>
        )
      })}
      <div className="flex flex-wrap items-center gap-2 text-[10px] text-amber-800">
        <span className="text-slate-400">Sample tasks:</span>
        {SAMPLE_SUBTASKS.map((task) => (
          <span key={task.field} className="inline-flex items-center gap-0.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm border border-amber-400 bg-white" />
            {task.label}
          </span>
        ))}
      </div>
    </div>
  )
}

function buildAssessmentEvents(assessments) {
  return assessments.map((a) => ({
    id: String(a.id),
    title: `${a.customer} — ${a.name}`,
    start: a.start_date,
    end: calendarEventEnd(a.end_date),
    allDay: true,
    backgroundColor: cbColor(a.certification_body),
    borderColor: cbColor(a.certification_body),
    order: 3,
    extendedProps: { type: 'assessment', assessment: a },
  }))
}

function buildSampleReleaseEvents(assessments) {
  return assessments
    .filter((a) => pillEnabled(a, 'show_sample_release'))
    .map((a) => ({
      id: `sample-${a.id}`,
      title: sampleReleaseTitle(a.customer),
      start: sampleReleaseDate(a.start_date),
      allDay: true,
      backgroundColor: '#fffbeb',
      borderColor: SAMPLE_RELEASE_COLOR,
      textColor: '#92400e',
      order: 1,
      classNames: ['fc-sample-release'],
      extendedProps: { type: 'sample_release', assessment: a },
    }))
}

function buildCeWindowsEvents(assessments) {
  return assessments
    .filter((a) => a.vsa_date && pillEnabled(a, 'show_ce_windows'))
    .map((a) => ({
      id: `ce-windows-${a.id}`,
      title: ceWindowsTitle(a.customer),
      start: ceWindowsDate(a.vsa_date),
      allDay: true,
      backgroundColor: '#eef2ff',
      borderColor: CE_WINDOWS_COLOR,
      textColor: '#3730a3',
      order: 1,
      classNames: ['fc-ce-windows'],
      extendedProps: { type: 'ce_windows', assessment: a },
    }))
}

function buildRemediationEvents(assessments) {
  return assessments
    .filter((a) => pillEnabled(a, 'show_remediation_window'))
    .map((a) => ({
      id: `remediation-${a.id}`,
      title: remediationWindowTitle(a.customer),
      start: remediationWindowDate(a.start_date),
      allDay: true,
      backgroundColor: '#fff1f2',
      borderColor: REMEDIATION_COLOR,
      textColor: '#9f1239',
      order: 2,
      classNames: ['fc-remediation-window'],
      extendedProps: { type: 'remediation_window', assessment: a },
    }))
}

function ReminderPillContent({ icon: Icon, title }) {
  return (
    <div className="fc-reminder-pill-content" title={title}>
      <Icon size={11} className="shrink-0" />
      <span className="fc-reminder-pill-label">{title}</span>
    </div>
  )
}

function SampleSubtask({ field, label, checked, onToggle }) {
  const stop = (e) => e.stopPropagation()

  return (
    <label
      className={`fc-sample-subtask ${checked ? 'fc-sample-subtask-checked' : ''}`}
      onClick={stop}
      onMouseDown={stop}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => {
          stop(e)
          onToggle(field, e.target.checked)
        }}
        onClick={stop}
      />
      <span>{label}</span>
    </label>
  )
}

function SampleReleaseContent({ assessment, onToggleSubtask }) {
  return (
    <div className="fc-sample-release-content">
      <div
        className="fc-sample-release-header"
        title={sampleReleaseTitle(assessment.customer)}
      >
        <Package size={11} className="shrink-0" />
        <span className="fc-sample-release-label">
          {sampleReleaseTitle(assessment.customer)}
        </span>
      </div>
      <div className="fc-sample-subtasks">
        {SAMPLE_SUBTASKS.map((task) => (
          <SampleSubtask
            key={task.field}
            field={task.field}
            label={task.label}
            checked={Boolean(assessment[task.field])}
            onToggle={(field, value) => onToggleSubtask(assessment.id, field, value)}
          />
        ))}
      </div>
    </div>
  )
}

export default function CalendarView({
  assessments,
  onEventClick,
  onDateClick,
  onToggleSubtask,
}) {
  const events = [
    ...buildSampleReleaseEvents(assessments),
    ...buildCeWindowsEvents(assessments),
    ...buildRemediationEvents(assessments),
    ...buildAssessmentEvents(assessments),
  ]

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <CalendarLegend />
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek',
        }}
        events={events}
        eventContent={(arg) => {
          const { type, assessment } = arg.event.extendedProps
          if (type === 'sample_release') {
            return (
              <SampleReleaseContent
                assessment={assessment}
                onToggleSubtask={onToggleSubtask}
              />
            )
          }
          if (type === 'ce_windows') {
            return (
              <ReminderPillContent
                icon={Monitor}
                title={ceWindowsTitle(assessment.customer)}
              />
            )
          }
          if (type === 'remediation_window') {
            return (
              <ReminderPillContent
                icon={Wrench}
                title={remediationWindowTitle(assessment.customer)}
              />
            )
          }
          return true
        }}
        eventClick={(info) => {
          if (info.jsEvent.target.closest('.fc-sample-subtask')) return
          onEventClick(info.event.extendedProps.assessment)
        }}
        dateClick={(info) => {
          onDateClick(info.dateStr)
        }}
        height="auto"
        dayMaxEvents={6}
        eventDisplay="block"
        fixedWeekCount={false}
        eventOrder="order"
      />
    </div>
  )
}