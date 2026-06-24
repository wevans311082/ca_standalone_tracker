const API_BASE = '/api'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })

  if (response.status === 204) return null

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail || `Request failed (${response.status})`)
  }

  return response.json()
}

export const api = {
  listAssessments: (certificationBody) => {
    const params = certificationBody
      ? `?certification_body=${encodeURIComponent(certificationBody)}`
      : ''
    return request(`/assessments${params}`)
  },

  getAssessment: (id) => request(`/assessments/${id}`),

  createAssessment: (data) =>
    request('/assessments', { method: 'POST', body: JSON.stringify(data) }),

  updateAssessment: (id, data) =>
    request(`/assessments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteAssessment: (id) =>
    request(`/assessments/${id}`, { method: 'DELETE' }),

  listCertificationBodies: () => request('/certification-bodies'),
}