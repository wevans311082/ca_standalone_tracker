import { Building2, Calendar, Users } from 'lucide-react'
import { formatDate, groupByCB, cbColor } from '../utils'

function AssessmentCard({ assessment, onSelect }) {
  const color = cbColor(assessment.certification_body)

  return (
    <button
      onClick={() => onSelect(assessment)}
      className="group w-full rounded-lg border border-slate-100 bg-white p-4 text-left shadow-sm transition-all hover:border-slate-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-900 group-hover:text-accent">
            {assessment.name}
          </h3>
          <p className="mt-0.5 text-sm text-slate-500">{assessment.customer}</p>
        </div>
        <span
          className="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium"
          style={{ backgroundColor: `${color}18`, color }}
        >
          {assessment.certification_body}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <Calendar size={14} className="text-slate-400" />
          {formatDate(assessment.assessment_date)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Users size={14} className="text-slate-400" />
          {assessment.company_size}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Building2 size={14} className="text-slate-400" />
          {assessment.customer}
        </span>
      </div>

      {assessment.notes && (
        <p className="mt-2 line-clamp-2 text-xs text-slate-400">
          {assessment.notes}
        </p>
      )}
    </button>
  )
}

function FlatList({ assessments, onSelect }) {
  const sorted = [...assessments].sort(
    (a, b) => new Date(a.assessment_date) - new Date(b.assessment_date),
  )

  return (
    <div className="space-y-3">
      {sorted.map((a) => (
        <AssessmentCard key={a.id} assessment={a} onSelect={onSelect} />
      ))}
    </div>
  )
}

function GroupedList({ assessments, onSelect }) {
  const groups = groupByCB(assessments)

  return (
    <div className="space-y-6">
      {groups.map(({ certification_body, items }) => {
        const color = cbColor(certification_body)
        return (
          <section key={certification_body}>
            <div className="mb-3 flex items-center gap-3">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <h3 className="text-sm font-semibold text-slate-800">
                {certification_body}
              </h3>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                {items.length}
              </span>
            </div>
            <div className="space-y-2 pl-6">
              {items.map((a) => (
                <AssessmentCard key={a.id} assessment={a} onSelect={onSelect} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

export default function ListView({ assessments, groupByCb, onSelect }) {
  if (assessments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-16">
        <Calendar size={40} className="text-slate-300" />
        <p className="mt-4 text-sm font-medium text-slate-500">
          No assessments scheduled
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Click &ldquo;Add Assessment&rdquo; to get started
        </p>
      </div>
    )
  }

  return (
    <div>
      {groupByCb ? (
        <GroupedList assessments={assessments} onSelect={onSelect} />
      ) : (
        <FlatList assessments={assessments} onSelect={onSelect} />
      )}
    </div>
  )
}