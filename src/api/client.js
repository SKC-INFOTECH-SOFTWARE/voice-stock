const BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '')

/** Error carrying the server's HTTP status and any extra payload (e.g. candidates). */
export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data || {}
  }
}

const TOKEN_KEY = 'admin_token'

export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY) || '' } catch { return '' }
}
export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch { /* ignore */ }
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  if (options.auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
    delete options.auth
  }

  let res
  try {
    res = await fetch(`${BASE}${path}`, {
      ...options,
      headers,
    })
  } catch {
    throw new ApiError('Cannot reach the server. Is the API running?', 0, {})
  }

  let data = {}
  const text = await res.text()
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      throw new ApiError('Server returned an invalid response', res.status, {})
    }
  }

  if (!res.ok || data.status === 'error') {
    // Auto-clear a dead admin token so the UI can bounce to login.
    if (res.status === 401) setToken('')
    throw new ApiError(data.message || `Request failed (${res.status})`, res.status, data)
  }
  return data
}

export function parseVoice(rawText) {
  return request('/parse-voice.php', {
    method: 'POST',
    auth: true,
    body: JSON.stringify({ raw_text: rawText }),
  })
}

export function saveInvoice(payload) {
  return request('/save-invoice.php', {
    method: 'POST',
    auth: true,
    body: JSON.stringify(payload),
  })
}

export function getCompanyProfile() {
  return request('/get-company-profile.php', { auth: true })
}

export function getInvoice(id) {
  return request(`/get-invoice.php?id=${encodeURIComponent(id)}`, { auth: true })
}

/* ---------- Admin API (token-protected) ---------- */

export function adminLogin(username, password) {
  return request('/admin/login.php', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export function adminLogout() {
  return request('/admin/logout.php', { method: 'POST', auth: true })
}

export function adminMe() {
  return request('/admin/me.php', { auth: true })
}

export function adminDashboard() {
  return request('/admin/dashboard.php', { auth: true })
}

export function adminListItems() {
  return request('/admin/items.php', { auth: true })
}

export function adminCreateItem(item) {
  return request('/admin/items.php', { method: 'POST', auth: true, body: JSON.stringify(item) })
}

export function adminUpdateItem(item) {
  return request('/admin/items.php', { method: 'PUT', auth: true, body: JSON.stringify(item) })
}

export function adminDeleteItem(id) {
  return request(`/admin/items.php?id=${encodeURIComponent(id)}`, { method: 'DELETE', auth: true })
}

export function adminGetCompany() {
  return request('/admin/company.php', { auth: true })
}

export function adminSaveCompany(profile) {
  return request('/admin/company.php', { method: 'PUT', auth: true, body: JSON.stringify(profile) })
}

export function adminListInvoices({ search = '', page = 1, perPage = 20 } = {}) {
  const qs = new URLSearchParams({ search, page: String(page), per_page: String(perPage) })
  return request(`/admin/invoices.php?${qs}`, { auth: true })
}
