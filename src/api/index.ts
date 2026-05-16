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
  login:    (data: { email: string; password: string }) =>
    api.post('/api/auth/login', data),

  register: (data: {
    person_name: string
    address: string
    email: string
    contact_number: string
    drivers_license?: string
    password: string
    role: string
  }) => api.post('/api/auth/register', data)
}

// ── Vehicles ──────────────────────────────────────────────
export const vehicleAPI = {
  getAll: (type?: string) =>
    api.get('/api/vehicles', { params: { type } }),

  getMy: () =>
    api.get('/api/vehicles/my'),

  getOne: (id: string) =>
    api.get(`/api/vehicles/${id}`),

  post: (data: {
    vehicle_model: string
    vehicle_type: string
    vehicle_color: string
    seat_capacity: number
    plate_number: string
    registration_date: string   // format: "YYYY-MM-DD"
    vehicle_status: 'Available' | 'Rented' | 'Under Maintenance'
    fuel_type: string
    daily_rate: number
    photos?: string
  }) => api.post('/api/vehicles', data),

  update: (id: string, data: {
    vehicle_model?: string
    vehicle_type?: string
    vehicle_color?: string
    seat_capacity?: number
    plate_number?: string
    registration_date?: string
    fuel_type?: string
    daily_rate?: number
    photos?: string
  }) => api.put(`/api/vehicles/${id}`, data),

  updateStatus: (id: string, status: 'Available' | 'Rented' | 'Under Maintenance') =>
    api.patch(`/api/vehicles/${id}/status`, { status }),

  delete: (id: string) =>
    api.delete(`/api/vehicles/${id}`)
}

// ── Transactions ──────────────────────────────────────────
export const transactionAPI = {
  getAll: () =>
    api.get('/api/transactions'),

  getOne: (id: string) =>
    api.get(`/api/transactions/${id}`),

  create: (data: {
    vehicle_id: string
    start_date: string          // format: "YYYY-MM-DD"
    end_date: string            // format: "YYYY-MM-DD"
    start_time: string          // format: "HH:MM:SS"
    end_time: string            // format: "HH:MM:SS"
    pickup_location: string
    drop_off_location: string
    with_driver: 0 | 1          // 0 = self-drive, 1 = with driver
    gas_included?: 0 | 1
    other_details?: string
    driver_name?: string        // required if with_driver = 1
    drivers_license?: string    // required if with_driver = 1
  }) => api.post('/api/transactions', data),

  // Valid statuses per DB CHECK constraint:
  // 'Pending' | 'Reserved' | 'Ongoing' | 'Completed' | 'Cancelled' | 'Overdue'
  updateStatus: (
    id: string,
    status: 'Reserved' | 'Cancelled' | 'Ongoing' | 'Completed' | 'Overdue'
  ) => api.patch(`/api/transactions/${id}/status`, { status }),
}

// ── Persons / Profile ─────────────────────────────────────
export const personAPI = {
  getMe: () =>
    api.get('/api/persons/me'),

  updateMe: (data: {
    person_name: string         // fixed: was 'name', DB column is Person_Name
    address: string
    contact_number: string
    drivers_license?: string
  }) => api.put('/api/persons/me', data),

  getOne: (id: string) =>
    api.get(`/api/persons/${id}`)
}

// ── Business ──────────────────────────────────────────────
export const businessAPI = {
  getAll: () =>
    api.get('/api/businesses'),

  getOne: (id: string) =>
    api.get(`/api/businesses/${id}`),

  getVehicles: (id: string) =>
    api.get(`/api/businesses/${id}/vehicles`),

  create: (data: {
    business_name: string
    business_address: string
    business_email?: string
    business_contact_no?: string
    description?: string
    service_area?: string
  }) => api.post('/api/businesses', data),

  update: (id: string, data: {
    business_name?: string
    business_address?: string
    business_email?: string
    business_contact_no?: string
    description?: string
    service_area?: string
  }) => api.put(`/api/businesses/${id}`, data),
}

// ── Inquiries ─────────────────────────────────────────────
// Previously missing — INQUIRY table exists in DB
export const inquiryAPI = {
  getAll: () =>
    api.get('/api/inquiries'),

  getOne: (id: string) =>
    api.get(`/api/inquiries/${id}`),

  create: (data: {
    vehicle_id: string
    owner_account_id: string
    offered_price: number
    start_date: string          // format: "YYYY-MM-DD"
    end_date: string            // format: "YYYY-MM-DD"
    message?: string
  }) => api.post('/api/inquiries', data),

  // Valid statuses per DB CHECK constraint:
  // 'Pending' | 'Accepted' | 'Rejected' | 'Completed'
  respond: (
    id: string,
    status: 'Accepted' | 'Rejected' | 'Completed',
    agreed_price?: number
  ) => api.patch(`/api/inquiries/${id}/respond`, { status, agreed_price }),
}

// ── Notifications ─────────────────────────────────────────
// Previously missing — NOTIFICATION table exists in DB
export const notificationAPI = {
  getAll: () =>
    api.get('/api/notifications'),

  markRead: (id: string) =>
    api.patch(`/api/notifications/${id}/read`),

  markAllRead: () =>
    api.patch('/api/notifications/read-all'),

  create: (data: {
    Notification_Type: string
    Message: string
    Reference_ID: string
    Reference_Type: string
    Is_Read: boolean
  }) => api.post('/api/notifications', data),
}

// ── Feedback ──────────────────────────────────────────────
export const feedbackAPI = {
  getByVehicle: (vehicleId: string) =>
    api.get(`/api/feedback/vehicle/${vehicleId}`),

  create: (data: {
    vehicle_id: string
    transaction_id: string
    score: number               // e.g. 1–5
    comments?: string
  }) => api.post('/api/feedback', data),
}

export default api