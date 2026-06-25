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
} from '../utils'

function CalendarLegend() {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-600">
      <span className="font-medium text-slate-500">Key</span>
      <div className="flex items-center gap-2">
        <span className="inline-block h-3 w-6 rounded bg-blue-500" />
        <span>Assessment</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-flex h-5 w-6 items-center justify-center rounded border border-dashed border-amber-400 bg-amber-50 text-amber-600">
          <Package size={10} />
        </span>
        <span>Sample Release (3 working days before start)</span>
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

function SampleReleaseContent({ event, viewType }) {
  const compact = viewType === 'dayGridMonth'
  return (
    <div className="fc-sample-release-content" title={event.title}>
      <Package size={compact ? 10 : 12} className="shrink-0" />
      {!compact && <span className="truncate">{event.title}</span>}
    </div>
  )
}

export default function CalendarView({ assessments, onEventClick, onDateClick }) {
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
                event={arg.event}
                viewType={arg.view.type}
              />
            )
          }
          return true
        }}
        eventClick={(info) => {
          onEventClick(info.event.extendedProps.assessment)
        }}
        dateClick={(info) => {
          onDateClick(info.dateStr)
        }}
        height="auto"
        dayMaxEvents={4}
        eventDisplay="block"
        fixedWeekCount={false}
        eventOrder="order"
      />
    </div>
  )
}