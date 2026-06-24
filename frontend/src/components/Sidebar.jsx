import { formatDateShort, cbColor } from '../utils'

export default function Sidebar({ assessments, selectedId, onSelect }) {
  const sorted = [...assessments].sort(
    (a, b) => new Date(a.assessment_date) - new Date(b.assessment_date),
  )

  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-4 py-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Upcoming Assessments
        </h2>
        <p className="mt-0.5 text-sm text-slate-500">
          {assessments.length} total
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {sorted.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-slate-400">
            No assessments yet
          </p>
        ) : (
          <ul className="divide-y divide-slate-50">
            {sorted.map((a) => {
              const color = cbColor(a.certification_body)
              const isSelected = selectedId === a.id
              return (
                <li key={a.id}>
                  <button
                    onClick={() => onSelect(a)}
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
                          {a.name}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {a.customer}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-xs font-medium text-slate-600">
                            {formatDateShort(a.assessment_date)}
                          </span>
                          <span
                            className="truncate rounded px-1.5 py-0.5 text-[10px] font-medium"
                            style={{
                              backgroundColor: `${color}18`,
                              color,
                            }}
                          >
                            {a.certification_body}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </aside>
  )
}