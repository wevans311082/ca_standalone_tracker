import { useEffect, useState } from 'react'
import { X, Trash2, CheckCircle2, RotateCcw } from 'lucide-react'
import {
  ASSESSMENT_TYPES,
  COMPANY_SIZES,
  PROGRESS_STATUSES,
  SAMPLE_SUBTASKS,
  assessmentTypeStyle,
  emptyForm,
  isCompleted,
  sampleReleaseDate,
} from '../utils'

export default function AssessmentModal({
  assessment,
  certificationBodies,
  onSave,
  onDelete,
  onComplete,
  onReopen,
  onClose,
}) {
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const isEdit = Boolean(assessment?.id)
  const completed = isEdit && isCompleted(assessment)

  useEffect(() => {
    if (assessment?.id) {
      setForm({
        name: assessment.name,
        customer: assessment.customer,
        certification_body: assessment.certification_body,
        company_size: assessment.company_size,
        assessment_type: assessment.assessment_type,
        start_date: assessment.start_date,
        end_date: assessment.end_date,
        progress_status: assessment.progress_status,
        sample_sampled: Boolean(assessment.sample_sampled),
        sample_agents: Boolean(assessment.sample_agents),
        sample_invites: Boolean(assessment.sample_invites),
        notes: assessment.notes || '',
      })
    } else if (assessment) {
      setForm({ ...emptyForm(), ...assessment })
    } else {
      setForm(emptyForm())
    }
    setError(null)
  }, [assessment])

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const toggleSubtask = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.checked }))

  const handleStartDateChange = (e) => {
    const startDate = e.target.value
    setForm((f) => ({
      ...f,
      start_date: startDate,
      end_date: f.end_date < startDate ? startDate : f.end_date,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.end_date < form.start_date) {
      setError('End date must be on or after the start date.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const payload = {
        ...form,
        notes: form.notes.trim() || null,
      }
      await onSave(payload, assessment?.id)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this assessment? This cannot be undone.')) return
    setSaving(true)
    try {
      await onDelete(assessment.id)
      onClose()
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  const handleComplete = async () => {
    if (
      !window.confirm(
        'Mark this assessment as complete? It will move to the Completed section.',
      )
    ) {
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onComplete(assessment.id)
      onClose()
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  const handleReopen = async () => {
    if (
      !window.confirm(
        'Reopen this assessment? It will return to the active schedule.',
      )
    ) {
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onReopen(assessment.id)
      onClose()
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {isEdit
                ? completed
                  ? 'Completed Assessment'
                  : 'Edit Assessment'
                : 'New Assessment'}
            </h2>
            {completed && (
              <p className="mt-0.5 text-xs text-emerald-600">Completed</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="label">Assessment Name</label>
            <input
              className="input-field"
              value={form.name}
              onChange={set('name')}
              placeholder="e.g. Annual CE+ Review"
              required
            />
          </div>

          <div>
            <label className="label">Customer</label>
            <input
              className="input-field"
              value={form.customer}
              onChange={set('customer')}
              placeholder="Company or organisation name"
              required
            />
          </div>

          <div>
            <label className="label">Assessment Type</label>
            <div className="grid grid-cols-2 gap-3">
              {ASSESSMENT_TYPES.map((type) => {
                const style = assessmentTypeStyle(type.value)
                const selected = form.assessment_type === type.value
                return (
                  <label
                    key={type.value}
                    className={`flex cursor-pointer items-center justify-center rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-all ${
                      selected ? 'shadow-sm' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                    }`}
                    style={
                      selected
                        ? {
                            borderColor: style.accent,
                            backgroundColor: style.bg,
                            color: style.text,
                          }
                        : undefined
                    }
                  >
                    <input
                      type="radio"
                      name="assessment_type"
                      value={type.value}
                      checked={selected}
                      onChange={set('assessment_type')}
                      className="sr-only"
                    />
                    {type.label}
                  </label>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Certification Body</label>
              <input
                className="input-field"
                value={form.certification_body}
                onChange={set('certification_body')}
                placeholder="e.g. IASME, CREST"
                list="cb-suggestions"
                required
              />
              <datalist id="cb-suggestions">
                {certificationBodies.map((cb) => (
                  <option key={cb} value={cb} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="label">Company Size</label>
              <select
                className="input-field"
                value={form.company_size}
                onChange={set('company_size')}
                required
              >
                {COMPANY_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Start Date</label>
              <input
                type="date"
                className="input-field"
                value={form.start_date}
                onChange={handleStartDateChange}
                required
              />
            </div>
            <div>
              <label className="label">End Date</label>
              <input
                type="date"
                className="input-field"
                value={form.end_date}
                onChange={set('end_date')}
                min={form.start_date}
                required
              />
            </div>
          </div>

          {isEdit && !completed && (
            <div>
              <label className="label">Sample Release Tasks</label>
              <p className="mb-2 text-xs text-slate-400">
                Due {sampleReleaseDate(form.start_date)} (3 working days before start)
              </p>
              <div className="flex flex-wrap gap-3">
                {SAMPLE_SUBTASKS.map((task) => (
                  <label
                    key={task.field}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(form[task.field])}
                      onChange={toggleSubtask(task.field)}
                      className="h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                    />
                    {task.label}
                  </label>
                ))}
              </div>
            </div>
          )}

          {!completed && (
            <div>
              <label className="label">Progress Status</label>
              <select
                className="input-field"
                value={form.progress_status}
                onChange={set('progress_status')}
                required
              >
                {PROGRESS_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="label">Notes (optional)</label>
            <textarea
              className="input-field resize-none"
              rows={3}
              value={form.notes}
              onChange={set('notes')}
              placeholder="Additional details..."
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex gap-2">
              {isEdit && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={saving}
                  className="btn-danger"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              )}
              {isEdit && !completed && (
                <button
                  type="button"
                  onClick={handleComplete}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-50"
                >
                  <CheckCircle2 size={16} />
                  Mark Complete
                </button>
              )}
              {isEdit && completed && (
                <button
                  type="button"
                  onClick={handleReopen}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
                >
                  <RotateCcw size={16} />
                  Reopen
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Assessment'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}