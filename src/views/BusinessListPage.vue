<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="page">

        <!-- Header -->
        <div class="header">
          <img src="@/assets/giphy.gif" alt="header-bg" class="backgroundHeader" />
          <img src="@/assets/v-connect.png" alt="logo" class="logo" />

          <div class="header-top">
            <div class="header-text">
              <p class="header-sub">Explore</p>
              <p class="header-title">Vehicle Owners</p>
            </div>
            <div class="avatar" @click="goTo('/profile')">
              {{ userInitials }}
            </div>
          </div>

          <!-- Search Bar -->
          <div class="search-bar">
            <ion-icon name="search-outline" class="search-icon"></ion-icon>
            <input
              type="text"
              placeholder="Search businesses or vehicles..."
              v-model="searchQuery"
              class="search-input"
            />
          </div>
        </div>

        <!-- Filters Row -->
        <div class="filters-row">

          <!-- Vehicle Type Filter -->
          <div class="filter-scroll">
            <span
              v-for="type in vehicleTypes"
              :key="type"
              :class="['type-pill', selectedType === type ? 'pill-active' : '']"
              @click="selectedType = type"
            >
              {{ type }}
            </span>
          </div>

        </div>

        <!-- Location Filter -->
        <div class="location-filter">
          <ion-icon name="location-outline" class="loc-icon"></ion-icon>
          <input
            type="text"
            placeholder="Filter by location..."
            v-model="locationQuery"
            class="location-input"
          />
          <span v-if="locationQuery" class="clear-btn" @click="locationQuery = ''">✕</span>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="empty-state">
          <p class="empty-text">Loading businesses...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredOwners.length === 0" class="empty-state">
          <ion-icon name="storefront-outline" class="empty-icon"></ion-icon>
          <p class="empty-text">No businesses found</p>
        </div>

        <!-- Business List -->
        <div class="business-list" v-else>
          <div
            v-for="owner in filteredOwners"
            :key="owner.Account_ID"
            class="business-card"
          >
            <!-- Business Header -->
            <div class="business-header">
              <div class="business-avatar">
                {{ getInitials(owner.Name) }}
              </div>
              <div class="business-info">
                <p class="business-name">{{ owner.Name }}</p>
                <p class="business-location">
                  <ion-icon name="location-outline"></ion-icon>
                  {{ owner.Address }}
                </p>
                <p class="business-contact">
                  <ion-icon name="call-outline"></ion-icon>
                  {{ owner.Contact_Number }}
                </p>
              </div>
              <div class="vehicle-count-badge">
                <p class="count-number">{{ owner.vehicles.length }}</p>
                <p class="count-label">vehicles</p>
              </div>
            </div>

            <!-- Vehicle List under Business -->
            <div class="vehicle-list" v-if="owner.vehicles.length > 0">
              <div
                v-for="vehicle in owner.vehicles"
                :key="vehicle.Vehicle_ID"
                class="vehicle-item"
                @click="viewVehicle(vehicle.Vehicle_ID)"
              >
                <div class="vehicle-item-icon">
                  <ion-icon name="car-outline"></ion-icon>
                </div>
                <div class="vehicle-item-info">
                  <p class="vehicle-item-name">{{ vehicle.Vehicle_Model }}</p>
                  <p class="vehicle-item-type">
                    {{ vehicle.Vehicle_Type }} ·
                    {{ vehicle.Seat_Capacity }} seats ·
                    {{ vehicle.Fuel_Type || 'N/A' }}
                  </p>
                </div>
                <div class="vehicle-item-right">
                  <p class="vehicle-item-price">
                    ₱{{ vehicle.Daily_Rate }}<span>/day</span>
                  </p>
                  <span :class="['status-dot', getStatusClass(vehicle.Vehicle_Status)]">
                    {{ vehicle.Vehicle_Status }}
                  </span>
                </div>
              </div>
            </div>

            <!-- No Vehicles -->
            <div class="no-vehicles" v-else>
              <p>No vehicles listed yet</p>
            </div>

          </div>
        </div>

      </div>
    </ion-content>

    <!-- Tab Bar -->
    <div class="tab-bar">
      <div class="tab-item" @click="goTo('/home')">
        <ion-icon name="grid-outline"></ion-icon>
        <span>Home</span>
      </div>
      <div class="tab-item active" @click="goTo('/businesses')">
        <ion-icon name="storefront-outline"></ion-icon>
        <span>Businesses</span>
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
      <div class="tab-item" @click="goTo('/notifications')">
        <ion-icon name="notifications-outline"></ion-icon>
        <span>Alerts</span>
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
  searchOutline, locationOutline, callOutline,
  carOutline, storefrontOutline, gridOutline,
  listOutline, addOutline, notificationsOutline
} from 'ionicons/icons'
import axios from 'axios'

addIcons({
  'search-outline': searchOutline,
  'location-outline': locationOutline,
  'call-outline': callOutline,
  'car-outline': carOutline,
  'storefront-outline': storefrontOutline,
  'grid-outline': gridOutline,
  'list-outline': listOutline,
  'add-outline': addOutline,
  'notifications-outline': notificationsOutline
})

const router = useIonRouter()
const searchQuery = ref('')
const locationQuery = ref('')
const selectedType = ref('All')
const isLoading = ref(false)
const owners = ref<any[]>([])
const userInitials = ref('??')

const vehicleTypes = ['All', 'Tricycle', 'Motorcycle', 'Car', 'Van']

// Load user initials
const loadUser = () => {
  const savedUser = localStorage.getItem('user')
  if (savedUser) {
    const user = JSON.parse(savedUser)
    const names = user.name?.split(' ') || ['?']
    userInitials.value = names
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
}

// Load all owners with their vehicles
const loadBusinesses = async () => {
  isLoading.value = true
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get(
      'http://localhost:3000/api/persons/owners',
      { headers: { Authorization: `Bearer ${token}` } }
    )
    owners.value = response.data.data
  } catch (err) {
    console.error('Failed to load businesses', err)
  } finally {
    isLoading.value = false
  }
}

onIonViewWillEnter(async () => {
  loadUser()
  await loadBusinesses()
})

onMounted(async () => {
  loadUser()
  await loadBusinesses()
})

// Filter owners based on search, location, vehicle type
const filteredOwners = computed(() => {
  return owners.value.filter((owner: any) => {

    // Filter vehicles inside each owner
    const matchedVehicles = owner.vehicles.filter((v: any) => {
      const matchType = selectedType.value === 'All' ||
                        v.Vehicle_Type === selectedType.value
      const matchSearch = searchQuery.value === '' ||
        v.Vehicle_Model?.toLowerCase()
          .includes(searchQuery.value.toLowerCase()) ||
        owner.Name?.toLowerCase()
          .includes(searchQuery.value.toLowerCase())
      return matchType && matchSearch
    })

    // Filter by location
    const matchLocation = locationQuery.value === '' ||
      owner.Address?.toLowerCase()
        .includes(locationQuery.value.toLowerCase())

    // Show owner only if they have matching vehicles OR name matches
    const ownerNameMatch = owner.Name?.toLowerCase()
      .includes(searchQuery.value.toLowerCase())

    return matchLocation &&
      (matchedVehicles.length > 0 || ownerNameMatch)
  }).map((owner: any) => {
    // Return owner with filtered vehicles
    return {
      ...owner,
      vehicles: selectedType.value === 'All' && searchQuery.value === ''
        ? owner.vehicles
        : owner.vehicles.filter((v: any) => {
            const matchType = selectedType.value === 'All' ||
                              v.Vehicle_Type === selectedType.value
            const matchSearch = searchQuery.value === '' ||
              v.Vehicle_Model?.toLowerCase()
                .includes(searchQuery.value.toLowerCase())
            return matchType && matchSearch
          })
    }
  })
})

const getInitials = (name: string) => {
  if (!name) return '??'
  return name.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const getStatusClass = (status: string) => {
  if (status === 'Available') return 'status-available'
  if (status === 'Rented') return 'status-rented'
  return 'status-maintenance'
}

const viewVehicle = (id: string) => {
  router.push(`/vehicle/${id}`)
}

const goTo = (path: string) => router.push(path)
</script>

<style scoped>
.page {
  background: #f4f6f9;
  min-height: 100vh;
  padding-bottom: 100px;
}

/* Header */
.header {
  background: #1a3a5c;
  padding: 130px 16px 15px;
  position: relative;
  overflow: hidden;
}

.backgroundHeader {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
  opacity: 0.7;
}

.logo {
  position: absolute;
  top: 12px;
  left: 16px;
  width: 30px;
  height: 30px;
  object-fit: contain;
  filter: drop-shadow(0 0 15px rgba(3,3,66,0.7));
  z-index: 1;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  position: relative;
  z-index: 1;
}

.header-sub {
  font-family: 'Gil Sans MT', sans-serif;
  color: #a8c4e0;
  font-size: 13px;
  margin: 0;
}

.header-title {
  font-family: 'Gil Sans MT', sans-serif;
  color: #ffffff;
  font-size: 20px;
  font-weight: 700;
  margin: 4px 0 0;
}

.avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #b83a96;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.search-bar {
  border-radius: 10px;
  border: 1.5px solid rgba(255,255,255,0.8);
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: transparent;
  position: relative;
  z-index: 1;
}

.search-icon {
  color: #ffffff;
  font-size: 18px;
}

.search-input {
  border: none;
  outline: none;
  width: 100%;
  font-size: 14px;
  color: #ffffff;
  background: transparent;
}

.search-input::placeholder {
  color: rgba(255,255,255,0.6);
}

/* Filters */
.filters-row {
  background: #ffffff;
  padding: 12px 0;
  border-bottom: 0.5px solid #f0f0f0;
}

.filter-scroll {
  display: flex;
  gap: 8px;
  padding: 0 16px;
  overflow-x: auto;
}

.type-pill {
  background: #f4f6f9;
  color: #888;
  font-size: 12px;
  padding: 6px 16px;
  border-radius: 20px;
  white-space: nowrap;
  cursor: pointer;
  border: 0.5px solid #e0e0e0;
}

.pill-active {
  background: #1a3a5c;
  color: #ffffff;
  border-color: #1a3a5c;
}

/* Location Filter */
.location-filter {
  background: #ffffff;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 0.5px solid #f0f0f0;
}

.loc-icon {
  font-size: 18px;
  color: #fc89d0;
  flex-shrink: 0;
}

.location-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 13px;
  color: #1a1a2e;
  background: transparent;
}

.location-input::placeholder {
  color: #aaa;
}

.clear-btn {
  font-size: 14px;
  color: #888;
  cursor: pointer;
  flex-shrink: 0;
}

/* Business List */
.business-list {
  padding: 12px 16px;
}

.business-card {
  background: #ffffff;
  border-radius: 16px;
  border: 0.5px solid #e0e0e0;
  margin-bottom: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

/* Business Header */
.business-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border-bottom: 0.5px solid #f0f0f0;
}

.business-avatar {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #b70b67, #fc89d0);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  flex-shrink: 0;
}

.business-info {
  flex: 1;
}

.business-name {
  font-size: 15px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 3px;
}

.business-location {
  font-size: 11px;
  color: #888;
  margin: 0 0 2px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.business-contact {
  font-size: 11px;
  color: #888;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.vehicle-count-badge {
  text-align: center;
  background: #f4f6f9;
  border-radius: 10px;
  padding: 8px 10px;
  flex-shrink: 0;
}

.count-number {
  font-size: 18px;
  font-weight: 700;
  color: #1a3a5c;
  margin: 0;
}

.count-label {
  font-size: 9px;
  color: #888;
  margin: 0;
}

/* Vehicle Items */
.vehicle-list {
  padding: 8px 0;
}

.vehicle-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-bottom: 0.5px solid #f9f9f9;
  cursor: pointer;
  transition: background 0.2s;
}

.vehicle-item:last-child {
  border-bottom: none;
}

.vehicle-item:hover {
  background: #fafafa;
}

.vehicle-item-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: #e8f0f8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #2d6a9f;
  flex-shrink: 0;
}

.vehicle-item-info {
  flex: 1;
}

.vehicle-item-name {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0 0 2px;
}

.vehicle-item-type {
  font-size: 11px;
  color: #888;
  margin: 0;
}

.vehicle-item-right {
  text-align: right;
  flex-shrink: 0;
}

.vehicle-item-price {
  font-size: 14px;
  font-weight: 700;
  color: #1a3a5c;
  margin: 0 0 4px;
}

.vehicle-item-price span {
  font-size: 10px;
  font-weight: 400;
  color: #888;
}

.status-dot {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 20px;
  font-weight: 600;
}

.status-available {
  background: #eaf3de;
  color: #3b6d11;
}

.status-rented {
  background: #e6f1fb;
  color: #185fa5;
}

.status-maintenance {
  background: #faeeda;
  color: #ba7517;
}

/* No Vehicles */
.no-vehicles {
  padding: 16px;
  text-align: center;
  font-size: 13px;
  color: #aaa;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 12px;
}

.empty-icon {
  font-size: 64px;
  color: #ddd;
}

.empty-text {
  font-size: 16px;
  color: #888;
  margin: 0;
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

.tab-item.active {
  color: #fc89d0;
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
  box-shadow: 0 4px 12px rgba(252,137,208,0.5);
}

.plus-btn ion-icon {
  font-size: 26px;
  color: #ffffff;
}

/* Web Responsive */
@media (min-width: 768px) {
  .business-list {
    max-width: 800px;
    margin: 0 auto;
    padding: 12px 24px;
  }

  .filter-scroll {
    max-width: 800px;
    margin: 0 auto;
  }

  .location-filter {
    max-width: 800px;
    margin: 0 auto;
  }
}
</style>