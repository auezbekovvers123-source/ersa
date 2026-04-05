const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export function getApiUrl(path = '') {
  const p = path.startsWith('/') ? path : `/${path}`
  return `${API_URL}${p}`
}

/** @param {string} path @param {RequestInit} [init] */
export async function apiJson(path, init = {}) {
  const res = await fetch(getApiUrl(path), {
    headers: { 'Content-Type': 'application/json', ...init.headers },
    ...init,
  })
  const text = await res.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { error: text.slice(0, 200) }
    }
  }
  if (!res.ok) {
    const err = new Error(data?.error || res.statusText || 'Request failed')
    err.status = res.status
    err.body = data
    throw err
  }
  return data
}

export { API_URL }
