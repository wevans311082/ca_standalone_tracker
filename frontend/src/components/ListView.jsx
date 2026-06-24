import { Building2, Calendar, CheckCircle2, Users } from 'lucide-react'
import {
  formatDateRange,
  groupByCB,
  cbColor,
  progressStatusLabel,
  progressStatusColor,
  isCompleted,
} from '../utils'

function StatusBadge({ status }) {
  const { bg, text } = progressStatusColor(status)
  return (
    <span
      className="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ backgroundColor: bg, color: text }}
    >
      {progressStatusLabel(status)}
    </span>
  )
}

function AssessmentCard({ assessment, onSelect, dimmed = false }) {
  const color = cbColor(assessment.certification_body)
  const completed = isCompleted(assessment)

  return (
    <button
      onClick={() => onSelect(assessment)}
      className={`group w-full rounded-lg border border-slate-100 bg-white p-4 text-left shadow-sm transition-all hover:border-slate-200 hover:shadow-md ${
        dimmed ? 'opacity-75' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-900 group-hover:text-accent">
            {assessment.name}
          </h3>
          <p className="mt-0.5 text-sm text-slate-500">{assessment.customer}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span
            className="rounded-full px-2.5 py-1 text-xs font-medium"
            style={{ backgroundColor: `${color}18`, color }}
          >
            {assessment.certification_body}
          </span>
          {completed ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
              <CheckCircle2 size={12} />
              Complete
            </span>
          ) : (
            <StatusBadge status={assessment.progress_status} />
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <Calendar size={14} className="text-slate-400" />
          {formatDateRange(assessment.start_date, assessment.end_date)}
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

function FlatList({ assessments, onSelect, dimmed = false }) {
  const sorted = [...assessments].sort(
    (a, b) => new Date(a.start_date) - new Date(b.start_date),
  )

  return (
    <div className="space-y-3">
      {sorted.map((a) => (
        <AssessmentCard
          key={a.id}
          assessment={a}
          onSelect={onSelect}
          dimmed={dimmed}
        />
      ))}
    </div>
  )
}

function GroupedList({ assessments, onSelect, dimmed = false }) {
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
                <AssessmentCard
                  key={a.id}
                  assessment={a}
                  onSelect={onSelect}
                  dimmed={dimmed}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function EmptyState({ message, hint }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-16">
      <Calendar size={40} className="text-slate-300" />
      <p className="mt-4 text-sm font-medium text-slate-500">{message}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  )
}

export default function ListView({ active, completed, groupByCb, onSelect }) {
  const hasActive = active.length > 0
  const hasCompleted = completed.length > 0

  if (!hasActive && !hasCompleted) {
    return (
      <EmptyState
        message="No assessments scheduled"
        hint='Click "Add Assessment" to get started'
      />
    )
  }

  const renderList = (items, dimmed = false) =>
    groupByCb ? (
      <GroupedList assessments={items} onSelect={onSelect} dimmed={dimmed} />
    ) : (
      <FlatList assessments={items} onSelect={onSelect} dimmed={dimmed} />
    )

  return (
    <div className="space-y-8">
      {hasActive ? (
        renderList(active)
      ) : (
        <EmptyState
          message="No active assessments"
          hint="Completed assessments appear below"
        />
      )}

      {hasCompleted && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600" />
            <h2 className="text-sm font-semibold text-slate-800">Completed</h2>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
              {completed.length}
            </span>
          </div>
          {renderList(completed, true)}
        </section>
      )}
    </div>
  )
}