import { useState } from 'react'
import { CheckCircle2, ChevronDown, ChevronRight } from 'lucide-react'
import {
  formatDateRange,
  cbColor,
  progressStatusLabel,
  progressStatusColor,
  partitionAssessments,
} from '../utils'

function SidebarItem({ assessment, isSelected, onSelect }) {
  const color = cbColor(assessment.certification_body)
  const statusColor = progressStatusColor(assessment.progress_status)

  return (
    <li>
      <button
        onClick={() => onSelect(assessment)}
        className={`w-full px-4 py-3 text-left transition-colors hover:bg-slate-50 ${
          isSelected ? 'bg-accent-muted/40' : ''
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className="mt-1 h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: color }}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900">
              {assessment.name}
            </p>
            <p className="truncate text-xs text-slate-500">{assessment.customer}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-slate-600">
                {formatDateRange(assessment.start_date, assessment.end_date)}
              </span>
              <span
                className="truncate rounded px-1.5 py-0.5 text-[10px] font-medium"
                style={{
                  backgroundColor: `${color}18`,
                  color,
                }}
              >
                {assessment.certification_body}
              </span>
              <span
                className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                style={{
                  backgroundColor: statusColor.bg,
                  color: statusColor.text,
                }}
              >
                {progressStatusLabel(assessment.progress_status)}
              </span>
            </div>
          </div>
        </div>
      </button>
    </li>
  )
}

function CompletedItem({ assessment, isSelected, onSelect }) {
  const color = cbColor(assessment.certification_body)

  return (
    <li>
      <button
        onClick={() => onSelect(assessment)}
        className={`w-full px-4 py-3 text-left transition-colors hover:bg-slate-50 ${
          isSelected ? 'bg-accent-muted/40' : ''
        }`}
      >
        <div className="flex items-start gap-3">
          <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-500" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-700">
              {assessment.name}
            </p>
            <p className="truncate text-xs text-slate-400">{assessment.customer}</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs text-slate-500">
                {formatDateRange(assessment.start_date, assessment.end_date)}
              </span>
              <span
                className="truncate rounded px-1.5 py-0.5 text-[10px] font-medium"
                style={{
                  backgroundColor: `${color}18`,
                  color,
                }}
              >
                {assessment.certification_body}
              </span>
            </div>
          </div>
        </div>
      </button>
    </li>
  )
}

export default function Sidebar({ assessments, selectedId, onSelect }) {
  const { active, completed } = partitionAssessments(assessments)
  const [completedOpen, setCompletedOpen] = useState(true)

  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-4 py-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Upcoming Assessments
        </h2>
        <p className="mt-0.5 text-sm text-slate-500">
          {active.length} active · {completed.length} completed
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {active.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-slate-400">
            No active assessments
          </p>
        ) : (
          <ul className="divide-y divide-slate-50">
            {active.map((a) => (
              <SidebarItem
                key={a.id}
                assessment={a}
                isSelected={selectedId === a.id}
                onSelect={onSelect}
              />
            ))}
          </ul>
        )}

        {completed.length > 0 && (
          <div className="border-t border-slate-100">
            <button
              onClick={() => setCompletedOpen((open) => !open)}
              className="flex w-full items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-slate-50"
            >
              {completedOpen ? (
                <ChevronDown size={14} className="text-slate-400" />
              ) : (
                <ChevronRight size={14} className="text-slate-400" />
              )}
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Completed
              </span>
              <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                {completed.length}
              </span>
            </button>
            {completedOpen && (
              <ul className="divide-y divide-slate-50 border-t border-slate-50">
                {completed.map((a) => (
                  <CompletedItem
                    key={a.id}
                    assessment={a}
                    isSelected={selectedId === a.id}
                    onSelect={onSelect}
                  />
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </aside>
  )
}