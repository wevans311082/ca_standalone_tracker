import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { Package } from 'lucide-react'
import {
  cbColor,
  calendarEventEnd,
  sampleReleaseDate,
  sampleReleaseTitle,
  SAMPLE_RELEASE_COLOR,
  SAMPLE_SUBTASKS,
} from '../utils'

function CalendarLegend() {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-600">
      <span className="font-medium text-slate-500">Key</span>
      <div className="flex items-center gap-2">
        <span className="inline-block h-3 w-6 rounded bg-blue-500" />
        <span>Assessment</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded border border-dashed border-amber-400 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
          <Package size={10} className="shrink-0" />
          Sample Release
        </span>
        <span>3 working days before start</span>
        <span className="text-slate-400">·</span>
        <span className="inline-flex items-center gap-2 text-[10px] text-amber-800">
          {SAMPLE_SUBTASKS.map((task) => (
            <span key={task.field} className="inline-flex items-center gap-0.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm border border-amber-400 bg-white" />
              {task.label}
            </span>
          ))}
        </span>
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
    order: 2,
    extendedProps: { type: 'assessment', assessment: a },
  }))
}

function buildSampleReleaseEvents(assessments) {
  return assessments.map((a) => ({
    id: `sample-${a.id}`,
    title: sampleReleaseTitle(a.customer),
    start: sampleReleaseDate(a.start_date),
    allDay: true,
    backgroundColor: '#fffbeb',
    borderColor: SAMPLE_RELEASE_COLOR,
    order: 1,
    classNames: ['fc-sample-release'],
    extendedProps: { type: 'sample_release', assessment: a },
  }))
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
      <div className="fc-sample-release-header" title={sampleReleaseTitle(assessment.customer)}>
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
          if (arg.event.extendedProps.type === 'sample_release') {
            return (
              <SampleReleaseContent
                assessment={arg.event.extendedProps.assessment}
                onToggleSubtask={onToggleSubtask}
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
        dayMaxEvents={5}
        eventDisplay="block"
        fixedWeekCount={false}
        eventOrder="order"
      />
    </div>
  )
}