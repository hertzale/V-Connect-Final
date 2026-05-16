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
    name: string
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
  getAll:       (type?: string) => api.get('/api/vehicles', { params: { type } }),
  getMy:        ()              => api.get('/api/vehicles/my'),
  getOne:       (id: string)    => api.get(`/api/vehicles/${id}`),
  post: (data: {
    vehicle_model:     string
    vehicle_type:      string
    vehicle_color:     string
    seat_capacity:     number
    plate_number:      string
    registration_date: string    // format: "YYYY-MM-DD"
    fuel_type?:        string    // ✅ optional
    daily_rate:        number
  }) => api.post('/api/vehicles', data),

  update: (id: string, data: {
    vehicle_model?:     string
    vehicle_type?:      string
    vehicle_color?:     string
    seat_capacity?:     number
    plate_number?:      string
    registration_date?: string
    fuel_type?:         string
    daily_rate?:        number
    // ❌ removed photos — now handled by vehiclePhotoAPI
  }) => api.put(`/api/vehicles/${id}`, data),

  updateStatus: (id: string, status: 'Available' | 'Rented' | 'Under Maintenance') =>
>>>>>>> bd2fdfa (added owner negotiate page)
    api.patch(`/api/vehicles/${id}/status`, { status }),

  delete: (id: string) =>
    api.delete(`/api/vehicles/${id}`)
}

// ── Transactions ──────────────────────────────────────────
export const transactionAPI = {
  getAll: (params?: { role?: string; from?: string; to?: string; status?: string }) =>
  api.get('/api/transactions', { params }),

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

  // ⚠️ correct endpoint is PATCH /:id/status NOT /:id/respond
  updateStatus: (
    id: string,
<<<<<<< HEAD
    status: 'Confirmed' | 'Cancelled' | 'Ongoing' | 'Completed'
=======
    status: 'Pending' | 'Reserved' | 'Cancelled' | 'Ongoing' | 'Completed' | 'Overdue'
>>>>>>> bd2fdfa (added owner negotiate page)
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
    drivers_license?: string | null
    email?: string | null
  }) => api.put('/api/persons/me', data),

  getOne: (id: string) =>
    api.get(`/api/persons/${id}`)
}

// ── Business ──────────────────────────────────────────────
export const businessAPI = {
  getAll: (params?: { lat?: number; lng?: number; radius_km?: number; type?: string }) =>
    api.get('/api/businesses', { params }),

  getMine: () =>
    api.get('/api/businesses/mine'),

  getOne: (id: string) =>
    api.get(`/api/businesses/${id}`),

  getVehicles: (id: string) =>
    api.get(`/api/businesses/${id}/vehicles`),

  create: (data: {
    business_name: string
    business_address: string
    description?: string
    contact_number?: string
    email?: string
    operating_hours?: string
    service_area?: string
    latitude?: number
    longitude?: number
    owner_type?: 'owner' | 'owner-driver' | 'driver'
  }) => api.post('/api/businesses', data),

  update: (id: string, data: {
    business_name?: string
    business_address?: string
    description?: string
    contact_number?: string
    email?: string
    operating_hours?: string
    latitude?: number
    longitude?: number
  }) => api.put(`/api/businesses/${id}`, data),

  deactivate: (id: string) =>
    api.patch(`/api/businesses/${id}/deactivate`),
}

export const inquiryAPI = {
  getAll: () =>
    api.get('/api/inquiries'),

  getOne: (id: string) =>
    api.get(`/api/inquiries/${id}`),

  // Customer sends inquiry — POST /api/inquiries
  create: (data: {
    vehicle_id: string
    trip_id?: string
    rental_duration: number
    distance_km?: number
    pickup_location: string
    drop_off_location: string
    start_date?: string
    end_date?: string
    with_driver?: 0 | 1
    customer_message?: string
  }) => api.post('/api/inquiries', data),

  // Owner quotes — PATCH /api/inquiries/:id/quote
  quote: (id: string, data: {
    response_type: 'range' | 'fixed'
    price_min?: number
    price_max?: number
    set_price?: number
    owner_message?: string
  }) => api.patch(`/api/inquiries/${id}/quote`, data),

  // Customer responds to owner quote — PATCH /api/inquiries/:id/respond
  respond: (id: string, data: {
    decision?: 'accept' | 'decline' | 'negotiate'
    counter_price?: number
    customer_counter_message?: string
  }) => api.patch(`/api/inquiries/${id}/respond`, data),

  // Owner finalizes negotiation — PATCH /api/inquiries/:id/finalize
  finalize: (id: string, decision: 'accept' | 'decline') =>
    api.patch(`/api/inquiries/${id}/finalize`, { decision }),

  // Customer books from confirmed inquiry — POST /api/inquiries/:id/book
  book: (id: string) =>
    api.post(`/api/inquiries/${id}/book`),

  // Cancel inquiry — PATCH /api/inquiries/:id/cancel
  cancel: (id: string) =>
    api.patch(`/api/inquiries/${id}/cancel`),
}
<<<<<<< HEAD
=======
// ── Vehicle Photos ───────────────────────────────────────
export const vehiclePhotoAPI = {
  // Get all photos for a vehicle
  getByVehicle: (vehicleId: string) =>
    api.get(`/api/vehicles/${vehicleId}/photos`),

  // Upload a new photo
  upload: (data: {
    vehicle_id: string
    photo_url:  string
    is_primary?: number    // 1 = primary, 0 = not primary
  }) => api.post('/api/vehicle-photos', data),

  // Set a photo as primary
  setPrimary: (photoId: string) =>
    api.patch(`/api/vehicle-photos/${photoId}/primary`),

  // Delete a photo
  delete: (photoId: string) =>
    api.delete(`/api/vehicle-photos/${photoId}`),
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
    notification_type: string
    message: string
    reference_id: string
    reference_type: string
    is_read: boolean
  }) => api.post('/api/notifications', data),
}

// ── Feedback ──────────────────────────────────────────────
export const feedbackAPI = {
  // Get all feedback for a vehicle
  getByVehicle: (vehicleId: string) =>
    api.get(`/api/feedback/vehicle/${vehicleId}`),

  // Get all feedback for a transaction
  getByTransaction: (transactionId: string) =>
    api.get(`/api/feedback/transaction/${transactionId}`),

  // Create feedback — only allowed if transaction is Completed
  create: (data: {
    vehicle_id:      string     // FEEDBACK.Vehicle_ID
    transaction_id:  string     // FEEDBACK.Transaction_ID
    score:           number     // FEEDBACK.Score (e.g. 1–5)
    comments?:       string     // FEEDBACK.Comments (VARCHAR 150)
  }) => api.post('/api/feedback', data),
}

// ── Payment ───────────────────────────────────────────────
export const paymentAPI = {
  getAll: () =>
    api.get('/api/payments'),

  getOne: (id: string) =>
    api.get(`/api/payments/${id}`),

  getByTransaction: (transactionId: string) =>
    api.get(`/api/payments/transaction/${transactionId}`),

  create: (data: {
    transaction_id:  string     // PAYMENT.Transaction_ID
    total_amount:    number     // PAYMENT.Total_Amount (NOT NULL)
    payment_method:  'Cash'     // PAYMENT.Payment_Method — only Cash allowed
    payment_date:    string     // PAYMENT.Payment_Date format: "YYYY-MM-DD"
    payment_status:  'Paid' | 'Pending' | 'Refunded'  // PAYMENT.Payment_Status
  }) => api.post('/api/payments', data),

  updateStatus: (id: string, status: 'Paid' | 'Pending' | 'Refunded') =>
    api.patch(`/api/payments/${id}/status`, { status }),
}

// ── Receipt ───────────────────────────────────────────────
export const receiptAPI = {
  getAll: () =>
    api.get('/api/receipts'),

  getOne: (id: string) =>
    api.get(`/api/receipts/${id}`),

  getByPayment: (paymentId: string) =>
    api.get(`/api/receipts/payment/${paymentId}`),

  getByTransaction: (transactionId: string) =>
    api.get(`/api/receipts/transaction/${transactionId}`),

  create: (data: {
    payment_id:    string       // RECEIPT.Payment_ID (NOT NULL)
    amount_paid:   number       // RECEIPT.Amount_Paid (NOT NULL)
    receipt_date:  string       // RECEIPT.Receipt_Date format: "YYYY-MM-DD"
    payment_type?: string       // RECEIPT.Payment_Type DEFAULT 'Full'
    remarks?:      string       // RECEIPT.Remarks (VARCHAR 200)
    // recorded_by handled by backend from auth token
  }) => api.post('/api/receipts', data),
}

>>>>>>> bd2fdfa (added owner negotiate page)
export default api