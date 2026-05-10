<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="page">

        <!-- Header -->
        <div class="header">
          <div class="back-btn" @click="goBack">
            <ion-icon name="arrow-back-outline"></ion-icon>
          </div>
          <h1 class="header-title">My Profile</h1>
          <div class="edit-btn" @click="toggleEdit">
            <ion-icon :name="isEditing ? 'close-outline' : 'create-outline'"></ion-icon>
          </div>
        </div>

        <!-- Profile Card -->
        <div class="profile-card">
          <div class="avatar-large">{{ userInitials }}</div>
          <p class="profile-name">{{ form.name }}</p>
          <p class="profile-email">{{ form.email }}</p>
          <span class="profile-type">
            {{ hasLicense ? '🚗 Vehicle Owner' : '👤 Customer' }}
          </span>
        </div>

        <!-- Edit Form -->
        <div class="section" v-if="isEditing">
          <p class="section-title">Edit Information</p>

          <p class="error-txt" v-if="errorMessage">{{ errorMessage }}</p>
          <p class="success-txt" v-if="successMessage">{{ successMessage }}</p>

          <div class="form-group">
            <label>Full Name</label>
            <input
              type="text"
              v-model="form.name"
              class="input-field"
              placeholder="Enter full name"
            />
          </div>

          <div class="form-group">
            <label>Email</label>
            <input
              type="text"
              v-model="form.email"
              class="input-field"
              placeholder="Enter email"
            />
          </div>

          <div class="form-group">
            <label>Contact Number</label>
            <input
              type="text"
              v-model="form.contact_number"
              class="input-field"
              placeholder="Enter contact number"
            />
          </div>

          <div class="form-group">
            <label>Address</label>
            <input
              type="text"
              v-model="form.address"
              class="input-field"
              placeholder="Enter address"
            />
          </div>

          <div class="form-group">
            <label>Driver's License</label>
            <input
              type="text"
              v-model="form.drivers_license"
              class="input-field"
              placeholder="Optional"
            />
          </div>

          <button class="btn-save" @click="saveProfile" :disabled="isLoading">
            {{ isLoading ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>

        <!-- Profile Info (View Mode) -->
        <div class="section" v-else>
          <p class="section-title">Personal Information</p>

          <div class="info-card">
            <div class="info-row">
              <div class="info-item">
                <p class="info-label">Full Name</p>
                <p class="info-value">{{ form.name || '—' }}</p>
              </div>
            </div>
            <div class="info-row">
              <div class="info-item">
                <p class="info-label">Email</p>
                <p class="info-value">{{ form.email || '—' }}</p>
              </div>
            </div>
            <div class="info-row">
              <div class="info-item">
                <p class="info-label">Contact Number</p>
                <p class="info-value">{{ form.contact_number || '—' }}</p>
              </div>
            </div>
            <div class="info-row">
              <div class="info-item">
                <p class="info-label">Address</p>
                <p class="info-value">{{ form.address || '—' }}</p>
              </div>
            </div>
            <div class="info-row">
              <div class="info-item">
                <p class="info-label">Driver's License</p>
                <p class="info-value">{{ form.drivers_license || 'Not provided' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Posted Vehicles Section -->
        <div class="section">
          <div class="section-header">
            <p class="section-title">My Posted Vehicles</p>
            <span class="see-all" @click="goTo('/listings')">See all</span>
          </div>

          <div v-if="isLoadingVehicles" class="empty-state">
            <p class="empty-text">Loading...</p>
          </div>

          <div v-else-if="myVehicles.length === 0" class="empty-state">
            <ion-icon name="car-outline" class="empty-icon"></ion-icon>
            <p class="empty-text">No vehicles posted yet</p>
            <button class="btn-post" @click="goTo('/post')">Post a Vehicle</button>
          </div>

          <div v-else class="vehicle-mini-list">
            <div
              v-for="vehicle in myVehicles.slice(0, 3)"
              :key="vehicle.Vehicle_ID"
              class="vehicle-mini-card"
            >
              <div class="vehicle-mini-icon">
                <ion-icon name="car-outline"></ion-icon>
              </div>
              <div class="vehicle-mini-info">
                <p class="vehicle-mini-name">{{ vehicle.Vehicle_Model }}</p>
                <p class="vehicle-mini-type">{{ vehicle.Vehicle_Type }} · {{ vehicle.Seat_Capacity }} seats</p>
              </div>
              <span :class="['mini-badge', getStatusClass(vehicle.Vehicle_Status)]">
                {{ vehicle.Vehicle_Status }}
              </span>
            </div>
          </div>
        </div>

        <!-- Logout Button -->
        <div class="section">
          <button class="btn-logout" @click="logout">
            <ion-icon name="log-out-outline"></ion-icon>
            Logout
          </button>
        </div>

      </div>
    </ion-content>

    <!-- Bottom Tab Bar -->
    <div class="tab-bar">
      <div class="tab-item" @click="goTo('/home')">
        <ion-icon name="grid-outline"></ion-icon>
        <span>Home</span>
      </div>
      <div class="tab-item" @click="goTo('/post')">
        <div class="plus-btn">
          <ion-icon name="add-outline"></ion-icon>
        </div>
        <span>Post</span>
      </div>
      <div class="tab-item" @click="goTo('/listings')">
        <ion-icon name="list-outline"></ion-icon>
        <span>Listing</span>
      </div>
    </div>

  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  IonPage, IonContent, IonIcon,
  useIonRouter, onIonViewWillEnter
} from '@ionic/vue'
import { addIcons } from 'ionicons'
import {
  arrowBackOutline, createOutline, closeOutline,
  carOutline, logOutOutline, gridOutline,
  listOutline, addOutline
} from 'ionicons/icons'
import { vehicleAPI } from '@/api'
import axios from 'axios'

addIcons({
  'arrow-back-outline': arrowBackOutline,
  'create-outline': createOutline,
  'close-outline': closeOutline,
  'car-outline': carOutline,
  'log-out-outline': logOutOutline,
  'grid-outline': gridOutline,
  'list-outline': listOutline,
  'add-outline': addOutline
})

const router = useIonRouter()
const isEditing = ref(false)
const isLoading = ref(false)
const isLoadingVehicles = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const myVehicles = ref<any[]>([])

const form = ref({
  name: '',
  email: '',
  contact_number: '',
  address: '',
  drivers_license: ''
})

const hasLicense = computed(() => !!form.value.drivers_license)

const userInitials = computed(() => {
  if (!form.value.name) return '??'
  const names = form.value.name.split(' ')
  return names.map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
})

// Load user from localStorage
const loadUser = () => {
  const savedUser = localStorage.getItem('user')
  if (savedUser) {
    const user = JSON.parse(savedUser)
    form.value.name = user.name || ''
    form.value.email = user.email || ''
    form.value.contact_number = user.contact_number || ''
    form.value.address = user.address || ''
    form.value.drivers_license = user.drivers_license || ''
  }
}

// Load my vehicles
const loadMyVehicles = async () => {
  isLoadingVehicles.value = true
  try {
    const response = await vehicleAPI.getMy()
    myVehicles.value = response.data.data
  } catch (err) {
    console.error('Failed to load vehicles', err)
  } finally {
    isLoadingVehicles.value = false
  }
}

onIonViewWillEnter(async () => {
  loadUser()
  await loadMyVehicles()
})

onMounted(async () => {
  loadUser()
  await loadMyVehicles()
})

const toggleEdit = () => {
  isEditing.value = !isEditing.value
  errorMessage.value = ''
  successMessage.value = ''
}

const saveProfile = async () => {
  if (!form.value.name || !form.value.email || !form.value.contact_number || !form.value.address) {
    errorMessage.value = 'Please fill in all required fields'
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const token = localStorage.getItem('token')
    await axios.put('http://localhost:3000/api/persons/me', {
      name: form.value.name,
      email: form.value.email,
      contact_number: form.value.contact_number,
      address: form.value.address,
      drivers_license: form.value.drivers_license || null
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })

    // Update localStorage
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      const user = JSON.parse(savedUser)
      const updatedUser = { ...user, ...form.value }
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }

    successMessage.value = 'Profile updated successfully!'
    isEditing.value = false

  } catch (err: any) {
    errorMessage.value = err.response?.data?.message || 'Failed to update profile'
  } finally {
    isLoading.value = false
  }
}

const getStatusClass = (status: string) => {
  if (status === 'Available') return 'badge-available'
  if (status === 'Rented') return 'badge-rented'
  return 'badge-maintenance'
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}

const goBack = () => router.push('/home')
const goTo = (path: string) => router.push(path)
</script>

<style scoped>
.page {
  background: #f4f6f9;
  min-height: 100vh;
  padding-bottom: 100px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 48px 16px 16px;
  background: #ffffff;
  border-bottom: 0.5px solid #f0f0f0;
}

.back-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f4f6f9;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 20px;
  color: #1a3a5c;
}

.header-title {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
}

.edit-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #fc89d0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 20px;
  color: #ffffff;
}

/* Profile Card */
.profile-card {
  background: #ffffff;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  border-bottom: 0.5px solid #f0f0f0;
}

.avatar-large {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #b83a96;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
}

.profile-name {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
}

.profile-email {
  font-size: 13px;
  color: #888;
  margin: 0;
}

.profile-type {
  background: #f4f6f9;
  border: 0.5px solid #e0e0e0;
  border-radius: 20px;
  padding: 4px 12px;
  font-size: 12px;
  color: #1a3a5c;
  font-weight: 600;
  margin-top: 4px;
}

/* Sections */
.section {
  background: #ffffff;
  margin: 12px 16px;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 14px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 12px;
}

.see-all {
  font-size: 12px;
  color: #fc89d0;
  font-weight: 600;
  cursor: pointer;
}

/* Info Card */
.info-card {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.info-row {
  padding: 12px 0;
  border-bottom: 0.5px solid #f0f0f0;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 11px;
  color: #888;
  margin: 0 0 4px;
}

.info-value {
  font-size: 14px;
  color: #1a1a2e;
  font-weight: 500;
  margin: 0;
}

/* Edit Form */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.form-group label {
  font-size: 12px;
  font-weight: 700;
  color: #888;
}

.input-field {
  background: #f4f6f9;
  border: 0.5px solid #e0e0e0;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 14px;
  color: #1a1a2e;
  outline: none;
  width: 100%;
}

.error-txt {
  color: #e24b4a;
  font-size: 13px;
  text-align: center;
  margin: 0 0 12px;
}

.success-txt {
  color: #3b6d11;
  font-size: 13px;
  text-align: center;
  margin: 0 0 12px;
  background: #eaf3de;
  padding: 8px;
  border-radius: 8px;
}

.btn-save {
  width: 100%;
  padding: 14px;
  background: #b70b67;
  color: #ffffff;
  border: none;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 8px;
  transition: background 0.2s;
}

.btn-save:hover {
  background: #fc89d0;
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Vehicle Mini List */
.vehicle-mini-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.vehicle-mini-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: #f4f6f9;
  border-radius: 12px;
}

.vehicle-mini-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #e8f0f8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #2d6a9f;
  flex-shrink: 0;
}

.vehicle-mini-info {
  flex: 1;
}

.vehicle-mini-name {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0 0 2px;
}

.vehicle-mini-type {
  font-size: 11px;
  color: #888;
  margin: 0;
}

.mini-badge {
  font-size: 10px;
  padding: 3px 8px;
  border-radius: 20px;
  font-weight: 600;
  flex-shrink: 0;
}

.badge-available {
  background: #eaf3de;
  color: #3b6d11;
}

.badge-rented {
  background: #e6f1fb;
  color: #185fa5;
}

.badge-maintenance {
  background: #faeeda;
  color: #ba7517;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  gap: 8px;
}

.empty-icon {
  font-size: 40px;
  color: #ddd;
}

.empty-text {
  font-size: 14px;
  color: #888;
  margin: 0;
}

.btn-post {
  background: #fc89d0;
  color: #ffffff;
  border: none;
  border-radius: 50px;
  padding: 10px 20px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 4px;
}

/* Logout Button */
.btn-logout {
  width: 100%;
  padding: 14px;
  background: #fff0f0;
  color: #e24b4a;
  border: 0.5px solid #f0c0c0;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.2s;
}

.btn-logout:hover {
  background: #ffe0e0;
}

/* Tab Bar */
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: #ffffff;
  border-top: 0.5px solid #e0e0e0;
  display: flex;
  justify-content: space-around;
  padding: 10px 0;
  z-index: 100;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  color: #888;
  font-size: 10px;
}

.tab-item ion-icon {
  font-size: 22px;
}

.plus-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #fc89d0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -24px;
  box-shadow: 0 4px 12px rgba(252, 137, 208, 0.5);
}

.plus-btn ion-icon {
  font-size: 26px;
  color: #ffffff;
}

/* Web Responsive */
@media (min-width: 768px) {
  .section {
    max-width: 600px;
    margin: 12px auto;
  }

  .profile-card {
    padding: 32px 16px;
  }

  .avatar-large {
    width: 100px;
    height: 100px;
    font-size: 36px;
  }
}
</style>