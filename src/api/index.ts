import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000'
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Auth ──────────────────────────────────────────────────
export const authAPI = {
  login:    (data: any) => api.post('/api/auth/login', data),
  register: (data: any) => api.post('/api/auth/register', data)
}

// ── Vehicles ──────────────────────────────────────────────
export const vehicleAPI = {
  getAll:       (type?: string) => api.get('/api/vehicles', { params: { type } }),
  getMy:        ()              => api.get('/api/vehicles/my'),
  getOne:       (id: string)    => api.get(`/api/vehicles/${id}`),
  post:         (data: any)     => api.post('/api/vehicles', data),
  update:       (id: string, data: any) => api.put(`/api/vehicles/${id}`, data),
  updateStatus: (id: string, status: string) =>
    api.patch(`/api/vehicles/${id}/status`, { status }),
  delete: (id: string) => api.delete(`/api/vehicles/${id}`)
}

// ── Transactions ──────────────────────────────────────────
// Based on confirmed routes in transactions.js:
// GET    /api/transactions         → getAll (both customer + owner)
// GET    /api/transactions/:id     → getOne
// POST   /api/transactions         → create booking
// PATCH  /api/transactions/:id/status → updateStatus (Confirmed/Cancelled/Ongoing/Completed)
export const transactionAPI = {
  getAll: (params?: { role?: string; from?: string; to?: string; status?: string }) =>
  api.get('/api/transactions', { params }),

  getOne: (id: string) => api.get(`/api/transactions/${id}`),

  create: (data: {
    vehicle_id: string
    start_date_and_time: string   // format: "2025-06-10 08:00:00"
    end_date_and_time: string     // format: "2025-06-13 08:00:00"
    pickup_location: string
    drop_off_location: string
    with_driver: number           // 0 = self-drive, 1 = with driver
  }) => api.post('/api/transactions', data),

  // ⚠️ correct endpoint is PATCH /:id/status NOT /:id/respond
  updateStatus: (id: string, status: 'Confirmed' | 'Cancelled' | 'Ongoing' | 'Completed') =>
    api.patch(`/api/transactions/${id}/status`, { status }),
}

// ── Persons / Profile ─────────────────────────────────────
// Based on confirmed routes in persons.js:
// GET /api/persons/me      → get own profile
// PUT /api/persons/me      → update own profile
// GET /api/persons/:id     → get other user's basic info
export const personAPI = {
  getMe: () => api.get('/api/persons/me'),

  updateMe: (data: {
    name: string
    address: string
    contact_number: string
    drivers_license?: string
  }) => api.put('/api/persons/me', data),

  getOne: (id: string) => api.get(`/api/persons/${id}`)
}

// ── Business ──────────────────────────────────────────────
// ⚠️ No businesses.js route file found in backend yet
// Using mock fallback so app doesn't crash
// Remove mock and uncomment real calls once backend adds the route
export const businessAPI = {
  getAll:      () => api.get('/api/businesses'),
  getOne:      (id: string) => api.get(`/api/businesses/${id}`),
  getVehicles: (id: string) => api.get(`/api/businesses/${id}/vehicles`),
}

export default api