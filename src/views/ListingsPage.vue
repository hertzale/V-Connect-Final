<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="page">

        <!-- Header -->
        <div class="header">
          <div class="back-btn" @click="goBack">
            <ion-icon name="arrow-back-outline"></ion-icon>
          </div>
          <h1 class="header-title">My Listings</h1>
          <div class="add-btn" @click="goToPost">
            <ion-icon name="add-outline"></ion-icon>
          </div>
        </div>

        <!-- Stats Summary -->
        <div class="stats-row">
          <div class="stat-card">
            <p class="stat-number">{{ totalListings }}</p>
            <p class="stat-label">Total</p>
          </div>
          <div class="stat-card">
            <p class="stat-number available">{{ availableCount }}</p>
            <p class="stat-label">Available</p>
          </div>
          <div class="stat-card">
            <p class="stat-number rented">{{ rentedCount }}</p>
            <p class="stat-label">Rented</p>
          </div>
          <div class="stat-card">
            <p class="stat-number maintenance">{{ maintenanceCount }}</p>
            <p class="stat-label">Maintenance</p>
          </div>
        </div>

        <!-- Filter Pills -->
        <div class="filter-row">
          <span
            v-for="filter in filters"
            :key="filter"
            :class="['filter-pill', selectedFilter === filter ? 'filter-active' : '']"
            @click="selectedFilter = filter"
          >
            {{ filter }}
          </span>
        </div>

        <!-- Loading state -->
        <div v-if="isLoading" class="empty-state">
          <p class="empty-text">Loading your vehicles...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredListings.length === 0" class="empty-state">
          <ion-icon name="car-outline" class="empty-icon"></ion-icon>
          <p class="empty-text">No vehicles found</p>
          <button class="btn-post" @click="goToPost">Post a Vehicle</button>
        </div>

        <!-- Vehicle Listings -->
        <div class="listings" v-else>
          <div
            v-for="vehicle in filteredListings"
            :key="vehicle.Vehicle_ID"
            class="vehicle-card"
          >
            <!-- Card Image -->
            <div class="card-image">
              <ion-icon name="car-outline" class="vehicle-icon"></ion-icon>
              <span :class="['status-badge', getStatusClass(vehicle.Vehicle_Status)]">
                {{ vehicle.Vehicle_Status }}
              </span>
            </div>

            <!-- Card Body -->
            <div class="card-body">
              <div class="card-top">
                <div>
                  <p class="vehicle-name">{{ vehicle.Vehicle_Model }}</p>
                  <p class="vehicle-info">
                    {{ vehicle.Vehicle_Type }} · 
                    {{ vehicle.Seat_Capacity }} seats ·
                    {{ vehicle.Plate_Number }} ·
                    {{ vehicle.Owner_Address || 'No location' }}
                  </p>
                </div>
                <div class="price-box">
                  <p class="price">₱{{ vehicle.Daily_Rate }}</p>
                  <p class="price-label">/day</p>
                </div>
              </div>

              <!-- Status Bar -->
              <div class="status-section">
                <p class="status-label-text">Status</p>
                <div class="status-bar">
                  <div
                    :class="['status-option', vehicle.Vehicle_Status === 'Available' ? 'status-available-active' : '']"
                    @click="updateStatus(vehicle.Vehicle_ID, 'Available')"
                  >Available</div>
                  <div
                    :class="['status-option', vehicle.Vehicle_Status === 'Rented' ? 'status-rented-active' : '']"
                    @click="updateStatus(vehicle.Vehicle_ID, 'Rented')"
                  >Rented</div>
                  <div
                    :class="['status-option', vehicle.Vehicle_Status === 'Under Maintenance' ? 'status-maintenance-active' : '']"
                    @click="updateStatus(vehicle.Vehicle_ID, 'Under Maintenance')"
                  >Maintenance</div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="action-row">
                <button class="btn-edit" @click="editVehicle(vehicle.Vehicle_ID)">
                  <ion-icon name="create-outline"></ion-icon>
                  Edit
                </button>
                <button class="btn-delete" @click="deleteVehicle(vehicle.Vehicle_ID)">
                  <ion-icon name="trash-outline"></ion-icon>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </ion-content>

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
  arrowBackOutline, addOutline, carOutline,
  createOutline, trashOutline, gridOutline,
  notificationsOutline
} from 'ionicons/icons'
import { vehicleAPI } from '@/api'

addIcons({
  'arrow-back-outline': arrowBackOutline,
  'add-outline': addOutline,
  'car-outline': carOutline,
  'create-outline': createOutline,
  'trash-outline': trashOutline,
  'grid-outline': gridOutline,
  'notifications-outline': notificationsOutline
})

const router = useIonRouter()
const selectedFilter = ref('All')
const filters = ['All', 'Available', 'Rented', 'Under Maintenance']
const vehicles = ref<any[]>([])
const isLoading = ref(false)

onIonViewWillEnter (async () => {
  await loadMyVehicles()
})

onMounted(async () => {
  await loadMyVehicles()
})

const loadMyVehicles = async () => {
  isLoading.value = true
  try {
    const response = await vehicleAPI.getMy()
    vehicles.value = response.data.data
    console.log('My Vehicles:', vehicles.value)
  } catch (err) {
    console.error('Failed to load listings', err)
  } finally {
    isLoading.value = false
  }
}

const totalListings = computed(() => vehicles.value.length)
const availableCount = computed(() =>
  vehicles.value.filter((v: any) => v.Vehicle_Status === 'Available').length)
const rentedCount = computed(() =>
  vehicles.value.filter((v: any) => v.Vehicle_Status === 'Rented').length)
const maintenanceCount = computed(() =>
  vehicles.value.filter((v: any) => v.Vehicle_Status === 'Under Maintenance').length)

const filteredListings = computed(() => {
  if (selectedFilter.value === 'All') return vehicles.value
  return vehicles.value.filter((v: any) => v.Vehicle_Status === selectedFilter.value)
})

const getStatusClass = (status: string) => {
  if (status === 'Available') return 'badge-available'
  if (status === 'Rented') return 'badge-rented'
  return 'badge-maintenance'
}

const updateStatus = async (id: string, status: 'Available' | 'Rented' | 'Under Maintenance') => {
  try {
    await vehicleAPI.updateStatus(id, status)
    const vehicle = vehicles.value.find((v: any) => v.Vehicle_ID === id)
    if (vehicle) (vehicle as any).Vehicle_Status = status
  } catch (err: any) {
    console.error(err.response?.data?.message || 'Failed to update status')
  }
}

const editVehicle = (id: string) => {
  router.push(`/edit-vehicle/${id}`) 
}

const deleteVehicle = async (id: string) => {
  try {
    await vehicleAPI.delete(id)
    vehicles.value = vehicles.value.filter((v: any) => v.Vehicle_ID !== id)
  } catch (err: any) {
    console.error(err.response?.data?.message || 'Cannot delete rented vehicle')
  }
}

const goBack = () => router.push('/owner-dashboard')
const goToPost = () => router.push('/post')
</script>

<style scoped>
.page {
  background: #ffffff;
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

.add-btn {
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

.stats-row {
  display: flex;
  gap: 10px;
  padding: 16px;
  background: #ffffff;
}

.stat-card {
  flex: 1;
  background: #f4f6f9;
  border-radius: 12px;
  padding: 12px 8px;
  text-align: center;
}

.stat-number {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 4px;
}

.stat-number.available { color: #3b6d11; }
.stat-number.rented { color: #1a3a5c; }
.stat-number.maintenance { color: #ba7517; }

.stat-label {
  font-size: 10px;
  color: #888;
  margin: 0;
}

.filter-row {
  display: flex;
  gap: 8px;
  padding: 8px 16px 12px;
  overflow-x: auto;
}

.filter-pill {
  background: #f4f6f9;
  color: #888;
  font-size: 12px;
  padding: 6px 14px;
  border-radius: 20px;
  white-space: nowrap;
  cursor: pointer;
  border: 0.5px solid #e0e0e0;
}

.filter-active {
  background: #1a3a5c;
  color: #ffffff;
  border-color: #1a3a5c;
}

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

.btn-post {
  background: #fc89d0;
  color: #ffffff;
  border: none;
  border-radius: 50px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 8px;
}

.listings {
  padding: 8px 16px;
}

.vehicle-card {
  background: #ffffff;
  border-radius: 16px;
  border: 0.5px solid #e0e0e0;
  margin-bottom: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.card-image {
  background: #f4f6f9;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.vehicle-icon {
  font-size: 52px;
  color: #2d6a9f;
  opacity: 0.4;
}

.status-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 600;
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

.card-body {
  padding: 14px;
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 14px;
}

.vehicle-name {
  font-size: 15px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 4px;
}

.vehicle-info {
  font-size: 12px;
  color: #888;
  margin: 0;
}

.price-box {
  text-align: right;
}

.price {
  font-size: 16px;
  font-weight: 700;
  color: #1a3a5c;
  margin: 0;
}

.price-label {
  font-size: 11px;
  color: #999;
  margin: 0;
}

.status-section {
  margin-bottom: 12px;
}

.status-label-text {
  font-size: 12px;
  font-weight: 600;
  color: #888;
  margin: 0 0 6px;
}

.status-bar {
  display: flex;
  border-radius: 10px;
  overflow: hidden;
  border: 0.5px solid #e0e0e0;
}

.status-option {
  flex: 1;
  padding: 8px 4px;
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  color: #888;
  cursor: pointer;
  background: #f4f6f9;
  border-right: 0.5px solid #e0e0e0;
  transition: all 0.2s;
}

.status-option:last-child {
  border-right: none;
}

.status-available-active {
  background: #eaf3de;
  color: #3b6d11;
}

.status-rented-active {
  background: #e6f1fb;
  color: #185fa5;
}

.status-maintenance-active {
  background: #faeeda;
  color: #ba7517;
}

.action-row {
  display: flex;
  gap: 8px;
}

.btn-edit {
  flex: 1;
  padding: 10px;
  background: #f4f6f9;
  color: #1a3a5c;
  border: 0.5px solid #e0e0e0;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-delete {
  flex: 1;
  padding: 10px;
  background: #fff0f0;
  color: #e24b4a;
  border: 0.5px solid #f0c0c0;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

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
  box-shadow: 0 4px 12px rgba(252, 137, 208, 0.5);
}

.plus-btn ion-icon {
  font-size: 26px;
  color: #ffffff;
}
</style>