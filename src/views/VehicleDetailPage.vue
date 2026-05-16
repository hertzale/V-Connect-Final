<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="detail-toolbar">
        <ion-buttons slot="start">
          <ion-back-button default-href="/businesses" text="" class="back-btn"></ion-back-button>
        </ion-buttons>
        <ion-title class="toolbar-title">Vehicle Details</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear">
            <ion-icon name="heart-outline" class="fav-icon"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="page-content">

      <!-- Image / Emoji -->
      <div class="vehicle-hero">
        <div class="vehicle-emoji">{{ vehicle.emoji }}</div>
        <div class="avail-badge" :class="vehicle.available ? 'avail' : 'unavail'">
          <ion-icon :name="vehicle.available ? 'checkmark-circle' : 'close-circle'"></ion-icon>
          {{ vehicle.available ? 'Available Now' : 'Currently Booked' }}
        </div>
      </div>

      <!-- Main Info -->
      <div class="info-card">
        <div class="info-top">
          <div>
            <h1 class="vehicle-name">{{ vehicle.name }}</h1>
            <div class="vehicle-type-tag">{{ vehicle.type }}</div>
          </div>
          <div class="price-block">
            <div class="price-val">₱{{ vehicle.price }}</div>
            <div class="price-unit">per day</div>
          </div>
        </div>

        <div class="rating-row">
          <ion-icon name="star" class="star-icon"></ion-icon>
          <span class="rating-val">{{ vehicle.rating }}</span>
          <span class="rating-count">({{ vehicle.reviews }} reviews)</span>
          <span class="dot">·</span>
          <span class="rental-count">{{ vehicle.rentals }} rentals</span>
        </div>

        <!-- Specs Grid -->
        <div class="specs-grid">
          <div class="spec-item">
            <ion-icon name="people-outline" class="spec-icon"></ion-icon>
            <div class="spec-label">Seats</div>
            <div class="spec-val">{{ vehicle.seats }}</div>
          </div>
          <div class="spec-item">
            <ion-icon name="settings-outline" class="spec-icon"></ion-icon>
            <div class="spec-label">Transmission</div>
            <div class="spec-val">{{ vehicle.transmission }}</div>
          </div>
          <div class="spec-item">
            <ion-icon name="water-outline" class="spec-icon"></ion-icon>
            <div class="spec-label">Fuel</div>
            <div class="spec-val">{{ vehicle.fuel }}</div>
          </div>
          <div class="spec-item">
            <ion-icon name="speedometer-outline" class="spec-icon"></ion-icon>
            <div class="spec-label">Year</div>
            <div class="spec-val">{{ vehicle.year }}</div>
          </div>
        </div>
      </div>

      <!-- Description -->
      <div class="section">
        <h2 class="section-title">Description</h2>
        <p class="desc-text">{{ vehicle.description }}</p>
      </div>

      <!-- Inclusions -->
      <div class="section">
        <h2 class="section-title">Inclusions</h2>
        <div class="inclusions">
          <div v-for="item in vehicle.inclusions" :key="item" class="inclusion-item">
            <ion-icon name="checkmark-outline" class="check-icon"></ion-icon>
            {{ item }}
          </div>
        </div>
      </div>

      <!-- ← NEW: Driver Option Section -->
      <div class="section">
        <h2 class="section-title">Driver Option</h2>
        <p class="driver-subtitle">Choose how you want to rent this vehicle</p>

        <div class="driver-options">

          <!-- With Driver -->
          <div
            :class="['driver-card', selectedDriver === 'with' ? 'driver-selected' : '']"
            @click="selectDriver('with')"
          >
            <div class="driver-card-top">
              <div class="driver-icon with-driver-icon">
                <ion-icon name="person-outline"></ion-icon>
              </div>
              <div class="driver-check" v-if="selectedDriver === 'with'">
                <ion-icon name="checkmark-circle"></ion-icon>
              </div>
            </div>
            <p class="driver-title">With Driver</p>
            <p class="driver-desc">Owner drives the vehicle. No license required.</p>
            <div class="driver-fee">
              <ion-icon name="add-circle-outline"></ion-icon>
              <span>Service fee applies</span>
            </div>
          </div>

          <!-- Without Driver -->
          <div
            :class="['driver-card', selectedDriver === 'without' ? 'driver-selected' : '']"
            @click="selectDriver('without')"
          >
            <div class="driver-card-top">
              <div class="driver-icon without-driver-icon">
                <ion-icon name="car-outline"></ion-icon>
              </div>
              <div class="driver-check" v-if="selectedDriver === 'without'">
                <ion-icon name="checkmark-circle"></ion-icon>
              </div>
            </div>
            <p class="driver-title">Self Drive</p>
            <p class="driver-desc">You drive the vehicle. Valid license required.</p>
            <div class="driver-fee no-fee">
              <ion-icon name="remove-circle-outline"></ion-icon>
              <span>No service fee</span>
            </div>
          </div>

        </div>

        <!-- Warning if no license for self drive -->
        <div class="license-warning" v-if="selectedDriver === 'without' && !hasLicense">
          <ion-icon name="warning-outline"></ion-icon>
          <span>You need a valid driver's license to self-drive. Update your profile to add one.</span>
        </div>

        <!-- Info if with driver selected -->
        <div class="driver-info-box" v-if="selectedDriver === 'with'">
          <ion-icon name="information-circle-outline"></ion-icon>
          <span>The vehicle owner will be your driver. A service fee will be added to the total.</span>
        </div>

      </div>
      <!-- END Driver Option Section -->

      <!-- Business Info -->
      <div class="section">
        <h2 class="section-title">Offered by</h2>
        <div class="biz-chip" @click="goToBusiness">
          <div class="biz-chip-avatar">🚗</div>
          <div class="biz-chip-info">
            <div class="biz-chip-name">{{ vehicle.businessName }}</div>
            <div class="biz-chip-rating">
              <ion-icon name="star" class="star-icon"></ion-icon>
              {{ vehicle.businessRating }} · {{ vehicle.businessLocation }}
            </div>
          </div>
          <ion-icon name="chevron-forward-outline" class="arrow"></ion-icon>
        </div>
      </div>

      <div style="height: 120px"></div>
    </ion-content>

    <!-- Footer Actions -->
    <ion-footer class="ion-no-border footer-bar">

      <!-- Price Summary -->
      <div class="price-summary" v-if="selectedDriver">
        <div class="price-summary-row">
          <span>Base rate</span>
          <span>₱{{ vehicle.price }}/day</span>
        </div>
        <div class="price-summary-row" v-if="selectedDriver === 'with'">
          <span>Service fee</span>
          <span class="fee-text">+ ₱{{ vehicle.serviceFee }}</span>
        </div>
        <div class="price-summary-total">
          <span>Total per day</span>
          <span class="total-price">₱{{ totalPrice }}</span>
        </div>
      </div>

      <div class="footer-inner">
        <ion-button
          expand="block"
          fill="outline"
          class="btn-negotiate"
          @click="goToNegotiate"
          :disabled="!vehicle.available || !selectedDriver || (selectedDriver === 'without' && !hasLicense)"
        >
          <ion-icon name="chatbubbles-outline" slot="start"></ion-icon>
          Negotiate
        </ion-button>
        <ion-button
          expand="block"
          class="btn-book"
          @click="goToBooking"
          :disabled="!vehicle.available || !selectedDriver || (selectedDriver === 'without' && !hasLicense)"
        >
          Book Now
          <ion-icon name="arrow-forward-outline" slot="end"></ion-icon>
        </ion-button>
      </div>

      <!-- Must select driver option message -->
      <p class="select-driver-msg" v-if="!selectedDriver">
        Please select a driver option to continue
      </p>

    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useIonRouter } from '@ionic/vue'
import {
  IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton,
  IonTitle, IonButton, IonContent, IonIcon, IonFooter
} from '@ionic/vue'
import { vehicleAPI } from '@/api'
import axios from 'axios'

const route = useRoute()
const router = useIonRouter()
const vehicleId = route.params.id as string

const vehicle = ref<any>({
  name: '',
  price: 0,
  serviceFee: 0,
  type: '',
  available: false,
  seats: 0,
  fuel: 'N/A',
  rating: '—',
  reviews: 0,
  rentals: 0,
  description: '',
  inclusions: [],
  businessName: '',
  businessRating: '—',
  businessLocation: '',
  businessId: '',
  emoji: '🚗',
})

const selectedDriver = ref('')
const isLoading = ref(false)

const hasLicense = computed(() => {
  const savedUser = localStorage.getItem('user')
  if (savedUser) return !!JSON.parse(savedUser).has_license
  return false
})

const totalPrice = computed(() => {
  const base = Number(vehicle.value.price) || 0
  const fee = Number(vehicle.value.serviceFee) || 0
  return selectedDriver.value === 'with' ? base + fee : base
})

const selectDriver = (option: string) => {
  selectedDriver.value = option
}

onMounted(async () => {
  isLoading.value = true
  try {
    const [vRes, fRes] = await Promise.all([
      vehicleAPI.getOne(vehicleId),
      axios.get(`http://localhost:3000/api/feedback/vehicle/${vehicleId}`)
    ])
    const v = vRes.data.data
    const feedbackData = fRes.data

    vehicle.value = {
      id: v.Vehicle_ID,
      name: v.Vehicle_Model,
      price: v.Daily_Rate,
      serviceFee: Math.round(v.Daily_Rate * 0.10),
      type: v.Vehicle_Type,
      available: v.Vehicle_Status === 'Available',
      seats: v.Seat_Capacity,
      fuel: v.Fuel_Type || 'N/A',
      year: v.Registration_Date?.split('-')[0] || '—',
      transmission: 'N/A',
      rating: feedbackData.average_score || '—',
      reviews: feedbackData.data?.length || 0,
      rentals: 0,
      description: `${v.Vehicle_Model} - ${v.Vehicle_Type}. ${v.Seat_Capacity} seats.`,
      inclusions: ['Vehicle as listed', v.Fuel_Type ? `${v.Fuel_Type} fuel type` : ''].filter(Boolean),
      businessName: v.Owner_Name,
      businessRating: '—',
      businessLocation: v.Owner_Contact || '',
      businessId: v.Owner_Account_ID,
      emoji: '🚗',
    }
  } catch (err) {
    console.error('Failed to load vehicle', err)
  } finally {
    isLoading.value = false
  }
})

const goToBusiness = () => {
  router.push(`/business/${vehicle.value.businessId}`)
}

const goToBooking = () => {
  if (!selectedDriver.value) return
  router.push({
    path: '/booking',
    query: {
      vehicleId: vehicle.value.id,
      vehicleName: vehicle.value.name,
      ownerName: vehicle.value.businessName,
      dailyRate: vehicle.value.price,
      serviceFee: vehicle.value.serviceFee,
      withDriver: selectedDriver.value === 'with' ? 1 : 0
    }
  })
}

const goToNegotiate = () => {
  if (!selectedDriver.value) return
  router.push({
    path: `/negotiate/${vehicle.value.id}`,
    query: {
      vehicleId: vehicle.value.id,
      vehicleName: vehicle.value.name,
      ownerName: vehicle.value.businessName,
      dailyRate: vehicle.value.price,
      withDriver: selectedDriver.value === 'with' ? 1 : 0
    }
  })
}
</script>

<style scoped>
.page-content { --background: #f5f5f7; }

.detail-toolbar {
  --background: #fff;
  --border-width: 0;
  box-shadow: 0 1px 0 #eee;
}
.toolbar-title { font-size: 16px; font-weight: 700; }
.back-btn { --color: #0f0f1a; }
.fav-icon { font-size: 22px; color: #555; }

/* Hero */
.vehicle-hero {
  background: linear-gradient(135deg, #f0f0f7, #e8e8f0);
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 12px;
  position: relative;
}
.vehicle-emoji { font-size: 80px; }
.avail-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  border-radius: 20px;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 700;
}
.avail-badge.avail { background: #e8fdf6; color: #00a87e; }
.avail-badge.unavail { background: #fde8e8; color: #e05555; }

/* Info Card */
.info-card {
  background: #fff;
  padding: 20px 20px 16px;
  margin-bottom: 2px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.04);
}
.info-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}
.vehicle-name {
  font-size: 22px;
  font-weight: 800;
  color: #0f0f1a;
  margin: 0 0 6px;
}
.vehicle-type-tag {
  display: inline-block;
  background: #f0f0f7;
  border-radius: 8px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  color: #555;
}
.price-block { text-align: right; }
.price-val { font-size: 24px; font-weight: 800; color: #00c896; }
.price-unit { font-size: 12px; color: #999; }

.rating-row {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: #555;
  margin-bottom: 18px;
}
.star-icon { color: #f5a623; font-size: 13px; }
.rating-val { font-weight: 700; }
.rating-count { color: #999; }
.rental-count { color: #999; }
.dot { color: #ddd; }

/* Specs */
.specs-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  background: #f8f8fb;
  border-radius: 16px;
  padding: 14px 8px;
}
.spec-item { text-align: center; }
.spec-icon { font-size: 20px; color: #00c896; margin-bottom: 4px; }
.spec-label { font-size: 10px; color: #999; margin-bottom: 2px; }
.spec-val { font-size: 12px; font-weight: 700; color: #0f0f1a; }

/* Sections */
.section {
  background: #fff;
  padding: 18px 20px;
  margin-top: 8px;
}
.section-title {
  font-size: 16px;
  font-weight: 800;
  color: #0f0f1a;
  margin: 0 0 10px;
}
.desc-text { font-size: 14px; color: #555; line-height: 1.6; margin: 0; }

.inclusions { display: flex; flex-direction: column; gap: 8px; }
.inclusion-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #333;
}
.check-icon { color: #00c896; font-size: 16px; flex-shrink: 0; }

/* ← NEW: Driver Option Styles */
.driver-subtitle {
  font-size: 13px;
  color: #888;
  margin: 0 0 14px;
}

.driver-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}

.driver-card {
  border: 2px solid #e0e0e0;
  border-radius: 16px;
  padding: 14px;
  cursor: pointer;
  transition: all 0.2s;
  background: #f8f8fb;
}

.driver-card:hover {
  border-color: #00c896;
  background: #f0fdf9;
}

.driver-selected {
  border-color: #00c896 !important;
  background: #f0fdf9 !important;
}

.driver-card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.driver-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.with-driver-icon {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #ffffff;
}

.without-driver-icon {
  background: linear-gradient(135deg, #00c896, #00a87e);
  color: #ffffff;
}

.driver-check {
  font-size: 20px;
  color: #00c896;
}

.driver-title {
  font-size: 14px;
  font-weight: 700;
  color: #0f0f1a;
  margin: 0 0 4px;
}

.driver-desc {
  font-size: 11px;
  color: #777;
  margin: 0 0 8px;
  line-height: 1.4;
}

.driver-fee {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #e05555;
  font-weight: 600;
}

.driver-fee.no-fee {
  color: #00a87e;
}

.license-warning {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: #fff8e1;
  border: 1px solid #ffc107;
  border-radius: 12px;
  padding: 12px;
  font-size: 12px;
  color: #856404;
  margin-top: 8px;
}

.license-warning ion-icon {
  font-size: 18px;
  color: #ffc107;
  flex-shrink: 0;
  margin-top: 1px;
}

.driver-info-box {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: #e8f4fd;
  border: 1px solid #90caf9;
  border-radius: 12px;
  padding: 12px;
  font-size: 12px;
  color: #1565c0;
  margin-top: 8px;
}

.driver-info-box ion-icon {
  font-size: 18px;
  color: #1976d2;
  flex-shrink: 0;
  margin-top: 1px;
}
/* END Driver Option Styles */

/* Business chip */
.biz-chip {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #f8f8fb;
  border-radius: 16px;
  padding: 14px 16px;
  cursor: pointer;
}
.biz-chip-avatar {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg,#667eea,#764ba2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}
.biz-chip-info { flex: 1; }
.biz-chip-name { font-size: 15px; font-weight: 700; color: #0f0f1a; margin-bottom: 3px; }
.biz-chip-rating {
  font-size: 12px;
  color: #777;
  display: flex;
  align-items: center;
  gap: 4px;
}
.arrow { color: #ccc; }

/* Price Summary */
.price-summary {
  padding: 12px 16px 0;
  border-top: 0.5px solid #f0f0f0;
}

.price-summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #888;
  margin-bottom: 4px;
}

.fee-text {
  color: #e05555;
  font-weight: 600;
}

.price-summary-total {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 700;
  color: #0f0f1a;
  padding-top: 8px;
  border-top: 0.5px solid #f0f0f0;
  margin-top: 4px;
}

.total-price {
  color: #00c896;
  font-size: 18px;
}

/* Footer */
.footer-bar {
  background: #fff;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
}
.footer-inner {
  display: flex;
  gap: 10px;
  padding: 12px 16px 8px;
}
.btn-negotiate {
  flex: 1;
  --color: #00c896;
  --border-color: #00c896;
  --border-radius: 14px;
  font-weight: 700;
  height: 50px;
}
.btn-book {
  flex: 1.4;
  --background: #00c896;
  --color: #fff;
  --border-radius: 14px;
  --box-shadow: 0 4px 14px rgba(0,200,150,0.35);
  font-weight: 700;
  height: 50px;
}

.select-driver-msg {
  text-align: center;
  font-size: 12px;
  color: #e05555;
  padding: 0 16px 12px;
  margin: 0;
}
</style>