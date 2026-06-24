import { useCallback, useEffect, useState } from 'react'
import { CalendarDays, List, Plus, Shield } from 'lucide-react'
import { api } from './api'
import { emptyForm, partitionAssessments } from './utils'
import AssessmentModal from './components/AssessmentModal'
import Sidebar from './components/Sidebar'
import CalendarView from './components/CalendarView'
import ListView from './components/ListView'

export default function App() {
  const [assessments, setAssessments] = useState([])
  const [certificationBodies, setCertificationBodies] = useState([])
  const [view, setView] = useState('calendar')
  const [groupByCb, setGroupByCb] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const [data, cbs] = await Promise.all([
      api.listAssessments(),
      api.listCertificationBodies(),
    ])
    setAssessments(data)
    setCertificationBodies(cbs)
  }, [])

  useEffect(() => {
    refresh()
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [refresh])

  const openCreate = (date) => {
    setEditing(
      date ? { ...emptyForm(), start_date: date, end_date: date } : null,
    )
    setModalOpen(true)
  }

  const openEdit = (assessment) => {
    setSelectedId(assessment.id)
    setEditing(assessment)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditing(null)
  }

  const handleSave = async (payload, id) => {
    if (id) {
      await api.updateAssessment(id, payload)
    } else {
      await api.createAssessment(payload)
    }
    await refresh()
  }

  const handleDelete = async (id) => {
    await api.deleteAssessment(id)
    setSelectedId(null)
    await refresh()
  }

  const handleComplete = async (id) => {
    await api.updateAssessment(id, {
      completed_at: new Date().toISOString(),
    })
    setSelectedId(null)
    await refresh()
  }

  const handleReopen = async (id) => {
    await api.updateAssessment(id, { completed_at: null })
    await refresh()
  }

  const { active, completed } = partitionAssessments(assessments)

  return (
    <div className="flex h-screen flex-col">
      <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-white">
            <Shield size={20} />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">
              CE+ Assessment Tracker
            </h1>
            <p className="text-xs text-slate-500">Local assessment calendar</p>
          </div>
        </div>

        <button onClick={() => openCreate()} className="btn-primary">
          <Plus size={16} />
          Add Assessment
        </button>
      </header>

      <div className="flex min-h-0 flex-1">
        <Sidebar
          assessments={assessments}
          selectedId={selectedId}
          onSelect={openEdit}
        />

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-3">
            <div className="flex rounded-lg border border-slate-200 p-0.5">
              <button
                onClick={() => setView('calendar')}
                className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  view === 'calendar'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CalendarDays size={16} />
                Calendar
              </button>
              <button
                onClick={() => setView('list')}
                className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  view === 'list'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List size={16} />
                List
              </button>
            </div>

            {view === 'list' && (
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={groupByCb}
                  onChange={(e) => setGroupByCb(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-accent focus:ring-accent"
                />
                Group by Certification Body
              </label>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-slate-400">Loading…</p>
              </div>
            ) : view === 'calendar' ? (
              <CalendarView
                assessments={active}
                onEventClick={openEdit}
                onDateClick={(date) => openCreate(date)}
              />
            ) : (
              <ListView
                active={active}
                completed={completed}
                groupByCb={groupByCb}
                onSelect={openEdit}
              />
            )}
          </div>
        </main>
      </div>

      {modalOpen && (
        <AssessmentModal
          assessment={editing}
          certificationBodies={certificationBodies}
          onSave={handleSave}
          onDelete={handleDelete}
          onComplete={handleComplete}
          onReopen={handleReopen}
          onClose={closeModal}
        />
      )}
    </div>
  )
}