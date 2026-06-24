import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { cbColor } from '../utils'

export default function CalendarView({ assessments, onEventClick, onDateClick }) {
  const events = assessments.map((a) => ({
    id: String(a.id),
    title: `${a.customer} — ${a.name}`,
    date: a.assessment_date,
    backgroundColor: cbColor(a.certification_body),
    borderColor: cbColor(a.certification_body),
    extendedProps: { assessment: a },
  }))

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek',
        }}
        events={events}
        eventClick={(info) => {
          onEventClick(info.event.extendedProps.assessment)
        }}
        dateClick={(info) => {
          onDateClick(info.dateStr)
        }}
        height="auto"
        dayMaxEvents={3}
        eventDisplay="block"
        fixedWeekCount={false}
      />
    </div>
  )
}