<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="page">

        <!-- HEADER -->
        <div class="header">
          <img src="@/assets/giphy.gif" alt="header-bg" class="backgroundHeader">
          <img src="@/assets/v-connect.png" alt="vcunt logo" class="logo" />
          <div class="header-top">
            <div class="greeting">
              <p class="greeting-sub">Good Day!</p>
              <p class="greeting-name">{{ userName }}</p>
            </div>

            <div class="avatar-wrapper">
              <div class="avatar" @click="toggleMenu">{{ userInitials }}</div>
              <div class="dropdown-menu" v-if="showMenu">
                <div class="dropdown-item" @click="goToProfile">
                  <ion-icon name="person-outline"></ion-icon>
                  <span>Profile</span>
                </div>
                <div class="dropdown-item" @click="goToSettings">
                  <ion-icon name="settings-outline"></ion-icon>
                  <span>Settings</span>
                </div>
                <div class="dropdown-divider"></div>
                <div class="dropdown-item logout" @click="logout">
                  <ion-icon name="log-out-outline"></ion-icon>
                  <span>Logout</span>
                </div>
              </div>
            </div>
          </div>

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

        <!-- VEHICLE TYPE PILLS -->
        <div class="categories">
          <span
            v-for="cat in categories"
            :key="cat"
            :class="['pill', selectedCategory === cat ? 'pill-active' : '']"
            @click="selectedCategory = cat"
          >{{ cat }}</span>
        </div>

        <!-- LOCATION FILTER -->
        <div class="location-filter">
          <ion-icon name="location-outline" class="loc-icon"></ion-icon>
          <input
            type="text"
            placeholder="Filter by location..."
            v-model="locationQuery"
            class="location-input"
          />
          <span v-if="locationQuery" class="clear-x" @click="locationQuery = ''">✕</span>
        </div>

        <!-- ADVANCED FILTERS -->
        <div class="filters">
          <div class="filter-group">
            <label>Price Range</label>
            <div class="input-row">
              <input type="number" v-model.number="filters.minPrice" placeholder="Min" class="filter-input">
              <input type="number" v-model.number="filters.maxPrice" placeholder="Max" class="filter-input">
            </div>
          </div>
          <div class="filter-group">
            <label>Time</label>
            <input type="time" v-model="filters.time" class="filter-input">
          </div>
          <div class="filter-group">
            <label>Business</label>
            <input type="text" v-model="filters.business" placeholder="Business name" class="filter-input">
          </div>
          <div class="filter-group">
            <label>Vehicle</label>
            <select v-model="filters.vehicle" class="filter-select">
              <option value="">All Vehicles</option>
              <option value="Cars">Cars</option>
              <option value="Vans">Vans</option>
              <option value="Motorcycles">Motorcycles</option>
              <option value="Trucks">Trucks</option>
            </select>
          </div>
          <button @click="clearFilters" class="clear-btn">Clear Filters</button>
        </div>

        <!-- LOADING -->
        <div v-if="isLoading" class="empty-state">
          <p class="section-title">Loading businesses...</p>
        </div>

        <!-- EMPTY -->
        <div v-else-if="filteredOwners.length === 0" class="empty-state">
          <ion-icon name="storefront-outline" class="empty-icon"></ion-icon>
          <p class="empty-text">No businesses found</p>
        </div>

        <!-- BUSINESS + VEHICLE LISTING -->
        <div class="listings" v-else>
          <p class="section-title">Rental Businesses near you</p>

          <div
            v-for="owner in filteredOwners"
            :key="owner.Account_ID ?? owner.Business_ID"
            class="business-card"
          >
            <!-- Business Header -->
            <div class="business-header">
              <div class="business-avatar">
                {{ getInitials(owner.Business_Name) }}
              </div>
              <div class="business-info">
                <p class="biz-name">{{ owner.Business_Name }}</p>
                <p class="biz-meta">
                  <ion-icon name="location-outline" class="inline-icon"></ion-icon>
                  {{ owner.Business_Address ?? '—' }}
                </p>
                <p class="biz-meta" v-if="owner.Business_ContactNo">
                  <ion-icon name="call-outline" class="inline-icon"></ion-icon>
                  {{ owner.Business_ContactNo }}
                  </p>
              </div>
              <div class="vehicle-count-badge">
                <p class="count-number">{{ owner.vehicles?.length ?? owner.Vehicle_Count ?? '—' }}</p>
                <p class="count-label">vehicles</p>
              </div>
            </div>

            <!-- Vehicle List -->
            <div class="vehicle-list" v-if="owner.vehicles && owner.vehicles.length > 0">
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

            <!-- No Vehicles Fallback -->
            <div class="no-vehicles" v-else>
              <p>No vehicles listed yet</p>
            </div>

            <!-- View Business Button -->
            <div class="card-footer" @click="goToBusiness(owner)">
              <span>View Business</span>
              <ion-icon name="chevron-forward-outline"></ion-icon>
            </div>
          </div>
        </div>

      </div>
    </ion-content>

    <!-- TAB BAR -->
    <div class="tab-bar">
      <div class="tab-item active" @click="goTo('/home')">
        <ion-icon name="grid-outline"></ion-icon>
        <span>Home</span>
      </div>
      <div class="tab-item" @click="goTo('/chat')">
        <ion-icon name="chatbubble-outline"></ion-icon>
        <span>Chat</span>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  IonPage, IonContent, IonIcon,
  useIonRouter, onIonViewWillEnter
} from '@ionic/vue'
import { addIcons } from 'ionicons'
import {
  searchOutline, gridOutline, addCircleOutline, carOutline, addOutline,
  notificationsOutline, listOutline, chatbubbleOutline, personOutline,
  settingsOutline, logOutOutline, businessOutline, locationOutline,
  chevronForwardOutline, storefrontOutline, callOutline
} from 'ionicons/icons'
import { businessAPI } from '@/api'

addIcons({
  'search-outline': searchOutline,
  'grid-outline': gridOutline,
  'notifications-outline': notificationsOutline,
  'add-circle-outline': addCircleOutline,
  'car-outline': carOutline,
  'add-outline': addOutline,
  'list-outline': listOutline,
  'chatbubble-outline': chatbubbleOutline,
  'person-outline': personOutline,
  'settings-outline': settingsOutline,
  'log-out-outline': logOutOutline,
  'business-outline': businessOutline,
  'location-outline': locationOutline,
  'chevron-forward-outline': chevronForwardOutline,
  'storefront-outline': storefrontOutline,
  'call-outline': callOutline
})

const router = useIonRouter()
const searchQuery = ref('')
const locationQuery = ref('')
const selectedCategory = ref('All')
const userName = ref('Guest')
const userInitials = ref('??')
const showMenu = ref(false)
const owners = ref<any[]>([])
const isLoading = ref(false)

type Filters = {
  minPrice: number | null
  maxPrice: number | null
  time: string
  business: string
  vehicle: string
}

const filters = ref<Filters>({
  minPrice: null,
  maxPrice: null,
  time: '',
  business: '',
  vehicle: ''
})

const clearFilters = () => {
  filters.value = { minPrice: null, maxPrice: null, time: '', business: '', vehicle: '' }
  locationQuery.value = ''
  selectedCategory.value = 'All'
}

const categories = ['All', 'Cars', 'Vans', 'Motorcycles', 'Trucks']

const loadUser = () => {
  const savedUser = localStorage.getItem('user')
  if (savedUser) {
    const user = JSON.parse(savedUser)
    userName.value = user.Person_Name || 'Guest'
    const names = user.Person_Name.split(' ')
    userInitials.value = names.map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  }
}

const toggleMenu = () => { showMenu.value = !showMenu.value }
const goToProfile = () => { showMenu.value = false; router.push('/profile') }
const goToSettings = () => { showMenu.value = false; router.push('/settings') }
const logout = () => {
  showMenu.value = false
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}
const closeMenu = (e: Event) => {
  if (!(e.target as HTMLElement).closest('.avatar-wrapper')) showMenu.value = false
}

const loadBusinesses = async () => {
  isLoading.value = true
  try {
    const response = await businessAPI.getAll()
    owners.value = response.data.data ?? response.data
  } catch (err) {
    console.error('Failed to load businesses', err)
  } finally {
    isLoading.value = false
  }
}

const filteredOwners = computed(() => {
  return owners.value
    .filter((owner: any) => {
      const matchLocation =
        locationQuery.value === '' ||
        owner.Business_Address?.toLowerCase().includes(locationQuery.value.toLowerCase())

      const ownerNameMatch =
      owner.Business_Name
          ?.toLowerCase()
          .includes(searchQuery.value.toLowerCase())

      const matchedVehicles = (owner.vehicles ?? []).filter((v: any) => {
        const matchType =
          selectedCategory.value === 'All' ||
          v.Vehicle_Type === selectedCategory.value

        const matchSearch =
          searchQuery.value === '' ||
          v.Vehicle_Model?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          ownerNameMatch

        const matchVehicleFilter =
          filters.value.vehicle === '' ||
          v.Vehicle_Type === filters.value.vehicle

        const matchPrice =
          (filters.value.minPrice === null || v.Daily_Rate >= filters.value.minPrice) &&
          (filters.value.maxPrice === null || v.Daily_Rate <= filters.value.maxPrice)

        return matchType && matchSearch && matchVehicleFilter && matchPrice
      })

      const matchBusiness =
        filters.value.business === '' ||
        owner.Business_Name
          ?.toLowerCase()
          .includes(filters.value.business.toLowerCase())

      return matchLocation && matchBusiness && (matchedVehicles.length > 0 || ownerNameMatch)
    })
    .map((owner: any) => ({
      ...owner,
      vehicles: (owner.vehicles ?? []).filter((v: any) => {
        const matchType =
          selectedCategory.value === 'All' ||
          v.Vehicle_Type === selectedCategory.value
        const matchSearch =
          searchQuery.value === '' ||
          v.Vehicle_Model?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          owner.Business_Name?.toLowerCase().includes(searchQuery.value.toLowerCase())
        const matchVehicleFilter =
          filters.value.vehicle === '' ||
          v.Vehicle_Type === filters.value.vehicle
        const matchPrice =
          (filters.value.minPrice === null || v.Daily_Rate >= filters.value.minPrice) &&
          (filters.value.maxPrice === null || v.Daily_Rate <= filters.value.maxPrice)
        return matchType && matchSearch && matchVehicleFilter && matchPrice
      })
    }))
})

const getInitials = (name: string) => {
  if (!name) return '??'
  return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
}

const getStatusClass = (status: string) => {
  if (status === 'Available') return 'status-available'
  if (status === 'Rented') return 'status-rented'
  return 'status-maintenance'
}

const goToBusiness = (owner: any) => {
  const id = owner.Business_ID ?? owner.Account_ID
  router.push(`/business/${id}`)
}

const viewVehicle = (id: string) => {
  router.push(`/vehicle/${id}`)
}

const goTo = (path: string) => router.push(path)

onIonViewWillEnter(async () => {
  loadUser()
  await loadBusinesses()
})

onMounted(async () => {
  loadUser()
  await loadBusinesses()
  document.addEventListener('click', closeMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', closeMenu)
})
</script>

<style scoped>
.page {
  background: #f4f6f9;
  min-height: 100vh;
}

/* Header */
.header {
  background: #1a3a5c;
  padding: 130px 16px 15px;
  position: relative;
  overflow: visible;
}
.backgroundHeader {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  z-index: 0;
  opacity: 0.7;
}
.logo {
  position: absolute;
  top: 12px; left: 16px;
  width: 30px; height: 30px;
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
.greeting-sub {
  font-family: 'Gil Sans MT', sans-serif;
  color: #ffffff; font-size: 15px; margin: 0;
}
.greeting-name {
  font-family: 'Gil Sans MT', sans-serif;
  color: #ffffff; font-size: 18px; font-weight: 600; margin: 4px 0 0;
}

/* Avatar & Dropdown */
.avatar-wrapper { position: relative; z-index: 999; }
.avatar {
  width: 42px; height: 42px; border-radius: 50%;
  background: #b83a96; color: #e8f4ff;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 600; cursor: pointer;
}
.dropdown-menu {
  position: absolute; top: 50px; right: 0;
  background: #ffffff; border-radius: 14px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  min-width: 180px; overflow: hidden; z-index: 200;
}
.dropdown-item {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 16px; cursor: pointer;
  font-size: 14px; color: #1a1a2e; transition: background 0.2s;
}
.dropdown-item:hover { background: #f4f6f9; }
.dropdown-item ion-icon { font-size: 18px; color: #1a3a5c; }
.dropdown-divider { height: 0.5px; background: #e0e0e0; margin: 4px 0; }
.dropdown-item.logout { color: #a83434; }
.dropdown-item.logout ion-icon { color: #a83434; }

/* Search Bar */
.search-bar {
  border-radius: 10px;
  border: 1.5px solid rgba(255,255,255,0.8);
  padding: 10px 14px;
  display: flex; align-items: center; gap: 10px;
  background: transparent; z-index: 10; position: relative;
}
.search-icon { color: #ffffff; font-size: 18px; }
.search-input {
  border: none; outline: none; width: 100%;
  font-size: 14px; color: #ffffff; background: transparent;
}
.search-input::placeholder { color: rgba(255,255,255,0.7); }

/* Category Pills */
.categories {
  display: flex; gap: 8px;
  padding: 12px 16px; overflow-x: auto;
  background: #ffffff;
  border-bottom: 0.5px solid #f0f0f0;
}
.pill {
  background: #f4f6f9; color: #888; font-size: 12px;
  padding: 6px 16px; border-radius: 20px;
  white-space: nowrap; border: 0.5px solid #ddd; cursor: pointer;
}
.pill-active {
  background: #fc89d0; color: #ffffff;
  border-color: #fc89d0;
  filter: drop-shadow(0 0 1px rgba(3,3,66,0.7));
}

/* Location Filter */
.location-filter {
  background: #ffffff;
  padding: 10px 16px;
  display: flex; align-items: center; gap: 10px;
  border-bottom: 0.5px solid #f0f0f0;
}
.loc-icon { font-size: 18px; color: #fc89d0; flex-shrink: 0; }
.location-input {
  flex: 1; border: none; outline: none;
  font-size: 13px; color: #1a1a2e; background: transparent;
}
.location-input::placeholder { color: #aaa; }
.clear-x { font-size: 14px; color: #888; cursor: pointer; flex-shrink: 0; }

/* Advanced Filters */
.filters {
  background: #ffffff;
  padding: 12px 16px;
  display: flex; gap: 10px; flex-wrap: wrap; align-items: flex-end;
  border-bottom: 0.5px solid #f0f0f0;
}
.filter-group { display: flex; flex-direction: column; gap: 4px; }
.filter-group label { font-size: 11px; color: #888; font-weight: 600; }
.input-row { display: flex; gap: 6px; }
.filter-input {
  border: 0.5px solid #ddd; border-radius: 8px;
  padding: 6px 10px; font-size: 12px; color: #1a1a2e;
  background: #f9f9f9; outline: none; width: 80px;
}
.filter-select {
  border: 0.5px solid #ddd; border-radius: 8px;
  padding: 6px 10px; font-size: 12px; color: #1a1a2e;
  background: #f9f9f9; outline: none;
}
.clear-btn {
  background: #f4f6f9; color: #888;
  border: 0.5px solid #ddd; border-radius: 8px;
  padding: 6px 14px; font-size: 12px; cursor: pointer;
  align-self: flex-end;
}
.clear-btn:active { background: #e0e0e0; }

/* Listings */
.listings { padding: 12px 16px 100px; }
.section-title {
  font-size: 13px; font-weight: 600; color: #888; margin: 0 0 12px;
}

/* Empty / Loading */
.empty-state {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 60px 20px; gap: 12px;
}
.empty-icon { font-size: 64px; color: #ddd; }
.empty-text { font-size: 16px; color: #888; margin: 0; }

/* Business Card */
.business-card {
  background: #ffffff;
  border-radius: 16px;
  border: 0.5px solid #e0e0e0;
  margin-bottom: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

/* Business Header Row */
.business-header {
  display: flex; align-items: center; gap: 12px;
  padding: 14px;
  border-bottom: 0.5px solid #f0f0f0;
}
.business-avatar {
  width: 48px; height: 48px; border-radius: 12px;
  background: linear-gradient(135deg, #b70b67, #fc89d0);
  color: #ffffff;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; font-weight: 700; flex-shrink: 0;
}
.business-info { flex: 1; }
.biz-name {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 15px; font-weight: 700; color: #1a1a2e; margin: 0 0 3px;
}
.biz-meta {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 11px; color: #888; margin: 0 0 2px;
  display: flex; align-items: center; gap: 4px;
}
.inline-icon { font-size: 12px; }
.vehicle-count-badge {
  text-align: center; background: #f4f6f9;
  border-radius: 10px; padding: 8px 10px; flex-shrink: 0;
}
.count-number { font-size: 18px; font-weight: 700; color: #1a3a5c; margin: 0; }
.count-label { font-size: 9px; color: #888; margin: 0; }

/* Vehicle Items */
.vehicle-list { padding: 8px 0; }
.vehicle-item {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 14px;
  border-bottom: 0.5px solid #f9f9f9;
  cursor: pointer; transition: background 0.2s;
}
.vehicle-item:last-child { border-bottom: none; }
.vehicle-item:active { background: #fafafa; }
.vehicle-item-icon {
  width: 38px; height: 38px; border-radius: 10px;
  background: #e8f0f8;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; color: #2d6a9f; flex-shrink: 0;
}
.vehicle-item-info { flex: 1; }
.vehicle-item-name {
  font-size: 13px; font-weight: 600; color: #1a1a2e; margin: 0 0 2px;
}
.vehicle-item-type { font-size: 11px; color: #888; margin: 0; }
.vehicle-item-right { text-align: right; flex-shrink: 0; }
.vehicle-item-price {
  font-size: 14px; font-weight: 700; color: #1a3a5c; margin: 0 0 4px;
}
.vehicle-item-price span { font-size: 10px; font-weight: 400; color: #888; }
.status-dot {
  font-size: 10px; padding: 2px 8px;
  border-radius: 20px; font-weight: 600;
}
.status-available { background: #eaf3de; color: #3b6d11; }
.status-rented { background: #e6f1fb; color: #185fa5; }
.status-maintenance { background: #faeeda; color: #ba7517; }

.no-vehicles {
  padding: 16px; text-align: center;
  font-size: 13px; color: #aaa;
}

/* Card Footer */
.card-footer {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  padding: 12px;
  border-top: 0.5px solid #f0f0f0;
  font-size: 13px; font-weight: 600; color: #1a3a5c;
  cursor: pointer; background: #fafcff;
  transition: background 0.2s;
}
.card-footer:active { background: #e8f0f8; }

/* Tab Bar */
.tab-bar {
  position: fixed; bottom: 0; left: 0; width: 100%;
  background: #ffffff; border-top: 0.5px solid #e0e0e0;
  display: flex; justify-content: space-around;
  padding: 10px 0; z-index: 100;
}
.tab-item {
  display: flex; flex-direction: column;
  align-items: center; gap: 4px;
  cursor: pointer; color: #888; font-size: 10px;
}
.tab-item ion-icon { font-size: 22px; }
.tab-item.active { color: #fc89d0; }
.plus-btn {
  width: 48px; height: 48px; border-radius: 50%;
  background: #ef70be;
  display: flex; align-items: center; justify-content: center;
  margin-top: -24px;
  box-shadow: 0 4px 12px rgba(255,137,208,0.5);
}
.plus-btn ion-icon { font-size: 26px; color: #ffffff; }

@media (min-width: 768px) {
  .listings { max-width: 800px; margin: 0 auto; }
  .categories { max-width: 800px; margin: 0 auto; }
  .location-filter { max-width: 800px; margin: 0 auto; }
  .filters { max-width: 800px; margin: 0 auto; }
}
</style>