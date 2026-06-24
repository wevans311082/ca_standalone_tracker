import { useEffect, useState } from 'react'
import { X, Trash2 } from 'lucide-react'
import { COMPANY_SIZES, emptyForm } from '../utils'

export default function AssessmentModal({
  assessment,
  certificationBodies,
  onSave,
  onDelete,
  onClose,
}) {
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const isEdit = Boolean(assessment?.id)

  useEffect(() => {
    if (assessment?.id) {
      setForm({
        name: assessment.name,
        customer: assessment.customer,
        certification_body: assessment.certification_body,
        company_size: assessment.company_size,
        assessment_date: assessment.assessment_date,
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

  const handleSubmit = async (e) => {
    e.preventDefault()
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {isEdit ? 'Edit Assessment' : 'New Assessment'}
          </h2>
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

          <div>
            <label className="label">Assessment Date</label>
            <input
              type="date"
              className="input-field"
              value={form.assessment_date}
              onChange={set('assessment_date')}
              required
            />
          </div>

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
            {isEdit ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="btn-danger"
              >
                <Trash2 size={16} />
                Delete
              </button>
            ) : (
              <div />
            )}
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