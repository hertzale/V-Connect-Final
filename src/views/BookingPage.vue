<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="booking-toolbar">
        <ion-buttons slot="start">
          <ion-back-button :default-href="`/vehicle/${vehicleId}`" text="" class="back-btn"></ion-back-button>
        </ion-buttons>
        <ion-title class="toolbar-title">Book Vehicle</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="page-content">

      <!-- Vehicle Summary -->
      <div class="vehicle-summary">
        <div class="vs-emoji">🚗</div>
        <div class="vs-info">
          <div class="vs-name">{{ vehicleName }}</div>
          <div class="vs-biz">{{ ownerName }}</div>
          <div class="vs-price">
            <span class="price-highlighted">₱{{ agreedPrice }}</span>/day
            <span v-if="isNegotiated" class="negotiated-tag">🤝 Negotiated</span>
          </div>
        </div>
      </div>

      <!-- Rental Dates -->
      <div class="section-card">
        <h2 class="card-title">Rental Dates</h2>

        <div class="date-fields">
          <div class="date-field" @click="focusDate('start')">
            <div class="df-label">📅 Pickup Date</div>
            <input v-model="startDate" type="date" class="df-input" :min="today" @change="calcDays" />
          </div>
          <div class="date-arrow">→</div>
          <div class="date-field" @click="focusDate('end')">
            <div class="df-label">📅 Return Date</div>
            <input v-model="endDate" type="date" class="df-input" :min="startDate || today" @change="calcDays" />
          </div>
        </div>

        <div class="duration-chip" v-if="totalDays > 0">
          🕐 {{ totalDays }} day{{ totalDays > 1 ? 's' : '' }} rental
        </div>
      </div>

      <!-- Pickup Details -->
      <div class="section-card">
        <h2 class="card-title">Pickup Details</h2>

        <div class="form-group">
          <label class="form-label">Pickup Time</label>
          <input v-model="pickupTime" type="time" class="form-input" />
        </div>

        <div class="form-group">
          <label class="form-label">Delivery Option</label>
          <div class="option-cards">
            <div
              class="option-card"
              :class="{ selected: deliveryOption === 'pickup' }"
              @click="deliveryOption = 'pickup'"
            >
              <div class="oc-icon">🏢</div>
              <div class="oc-label">Self Pickup</div>
              <div class="oc-sub">Go to the business location</div>
              <div class="oc-free">Free</div>
            </div>
            <div
              class="option-card"
              :class="{ selected: deliveryOption === 'delivery' }"
              @click="deliveryOption = 'delivery'"
            >
              <div class="oc-icon">🚚</div>
              <div class="oc-label">Delivery</div>
              <div class="oc-sub">Vehicle delivered to you</div>
              <div class="oc-fee">+₱200</div>
            </div>
          </div>
        </div>

        <div class="form-group" v-if="deliveryOption === 'delivery'">
          <label class="form-label">Delivery Address</label>
          <textarea v-model="deliveryAddress" placeholder="Enter your full address..." class="form-textarea"></textarea>
        </div>
      </div>

      <!-- Driver Info -->
      <div class="section-card">
        <h2 class="card-title">Driver Information</h2>

        <div class="form-group">
          <label class="form-label">Full Name</label>
          <input v-model="driverName" type="text" placeholder="Juan Dela Cruz" class="form-input" />
        </div>

        <div class="form-group">
          <label class="form-label">Contact Number</label>
          <input v-model="driverPhone" type="tel" placeholder="+63 912 345 6789" class="form-input" />
        </div>

        <div class="form-group">
          <label class="form-label">Driver's License Number</label>
          <input v-model="licenseNum" type="text" placeholder="N01-23-456789" class="form-input" />
        </div>
      </div>

      <!-- Notes -->
      <div class="section-card">
        <h2 class="card-title">Additional Notes</h2>
        <textarea v-model="notes" placeholder="Any special requests or instructions..." class="form-textarea"></textarea>
      </div>

      <!-- Price Breakdown -->
      <div class="section-card breakdown-card">
        <h2 class="card-title">Price Breakdown</h2>

        <div class="breakdown-row">
          <span>₱{{ agreedPrice }} × {{ totalDays || 0 }} day(s)</span>
          <span>₱{{ (agreedPrice * (totalDays || 0)).toLocaleString() }}</span>
        </div>
        <div class="breakdown-row" v-if="deliveryOption === 'delivery'">
          <span>Delivery Fee</span>
          <span>₱200</span>
        </div>
        <div class="breakdown-divider"></div>
        <div class="breakdown-total">
          <span>Total</span>
          <span class="total-val">₱{{ totalAmount.toLocaleString() }}</span>
        </div>
      </div>
        <div class="section-card" v-if="errorMessage">
          <p style="color: #e05555; font-size: 13px; margin: 0; font-family: 'Gil Sans MT', sans-serif;">
            ⚠️ {{ errorMessage }}
          </p>
        </div>
      <div style="height: 120px"></div>
    </ion-content>

    <!-- Footer -->
    <ion-footer class="ion-no-border footer-bar">
      <div class="footer-inner">
        <div class="footer-total">
          <div class="ft-label">Total</div>
          <div class="ft-val">₱{{ totalAmount.toLocaleString() }}</div>
        </div>
        <ion-button class="btn-confirm" @click="confirmBooking" :disabled="!canSubmit || isLoading">
            {{ isLoading ? 'Submitting...' : 'Confirm Booking' }}
          <ion-icon name="checkmark-circle-outline" slot="end"></ion-icon>
        </ion-button>
      </div>
    </ion-footer>

  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton,
  IonTitle, IonButton, IonContent, IonIcon, IonFooter, useIonRouter
} from '@ionic/vue'
import { transactionAPI } from '@/api'

const router   = useIonRouter()
const route    = useRoute()

// From NegotiatePage query params
const vehicleId      = ref(route.query.vehicleId    as string || '')
const vehicleName    = ref(route.query.vehicleName  as string || 'Vehicle')
const ownerName      = ref(route.query.ownerName    as string || 'Owner')
const agreedPrice    = ref(Number(route.query.dailyRate) || 0)
const isNegotiated   = ref(route.query.negotiated === 'true')
const withDriverOpt  = ref(Number(route.query.withDriver) || 0)
const isLoading      = ref(false)
const errorMessage   = ref('')

const today = new Date().toISOString().split('T')[0]
const startDate = ref('')
const endDate = ref('')
const totalDays = ref(0)
const pickupTime = ref('')
const deliveryOption = ref('pickup')
const deliveryAddress = ref('')
const driverName = ref('')
const driverPhone = ref('')
const licenseNum = ref('')
const notes = ref('')

function calcDays() {
  if (startDate.value && endDate.value) {
    const diff = new Date(endDate.value).getTime() - new Date(startDate.value).getTime()
    totalDays.value = Math.max(0, Math.ceil(diff / 86400000))
  }
}

function focusDate(_which?: string) {
  // native date input handles this; reference param to satisfy linter
  void _which
}

const totalAmount = computed(() => {
  const base = (agreedPrice.value || 850) * (totalDays.value || 0)
  return base + (deliveryOption.value === 'delivery' ? 200 : 0)
})

const canSubmit = computed(() =>
  vehicleId.value &&
  startDate.value && endDate.value &&
  totalDays.value > 0 &&
  pickupTime.value
)

async function confirmBooking() {
  if (!canSubmit.value) return
  isLoading.value = true
  errorMessage.value = ''

  const pickupLocation  = deliveryOption.value === 'pickup'
    ? 'Self Pickup'
    : deliveryAddress.value

  const startDateTime = `${startDate.value} ${pickupTime.value}:00`
  const endDateTime   = `${endDate.value} ${pickupTime.value}:00`

  try {
    await transactionAPI.create({
      vehicle_id:            vehicleId.value,
      start_date_and_time:   startDateTime,
      end_date_and_time:     endDateTime,
      pickup_location:       pickupLocation,
      drop_off_location:     pickupLocation,
      with_driver:           withDriverOpt.value === 1 ? 1 : 0,
    })
    router.push('/transactions')
  } catch (err: any) {
    errorMessage.value = err.response?.data?.message || 'Booking failed. Try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.page-content { --background: #f5f5f7; }

.booking-toolbar {
  --background: #fff;
  box-shadow: 0 1px 0 #eee;
}
.toolbar-title { font-size: 17px; font-weight: 800;   font-family: 'Gil Sans MT', sans-serif; }
.back-btn { --color: #0f0f1a; }

/* Vehicle Summary */
.vehicle-summary {
  background: #fff;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  margin-bottom: 8px;
}
.vs-emoji {
  width: 56px; height: 56px;
  background: #f0f0f7;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  flex-shrink: 0;
}
.vs-name { 
  font-size: 16px; 
  font-weight: 800; 
  color: #0f0f1a; 
  margin-bottom: 2px;
  font-family: 'Gil Sans MT', sans-serif;
}
.vs-biz  { 
  font-size: 12px; 
  color: #999; 
  margin-bottom: 4px; 
  font-family: 'Gil Sans MT', sans-serif;
}

.vs-price { 
  display: flex; 
  align-items: center; 
  gap: 8px;
  font-family: 'Gil Sans MT', sans-serif;
}
.price-highlighted { 
  font-size: 20px; 
  font-weight: 800; 
  color: #b70b67; 
}
.negotiated-tag {
  background: #ffedf6;
  color: #b70b67;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 8px;
  font-family: 'Gil Sans MT', sans-serif;
}

/* Section Cards */
.section-card {
  background: #fff;
  padding: 18px 20px;
  margin-bottom: 8px;
}
.card-title { 
  font-size: 16px; 
  font-weight: 800; 
  color: #0f0f1a; 
  margin: 0 0 14px; 
  font-family: 'Gil Sans MT', sans-serif;
}

/* Date Fields */
.date-fields {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.date-field {
  flex: 1;
  background: #f4f4f8;
  border-radius: 14px;
  padding: 12px 14px;
  border: 2px solid transparent;
  transition: border 0.2s;
}
.date-field:focus-within { 
  border-color: #00c896; 
}
.df-label { 
  font-size: 11px; 
  color: #999; 
  margin-bottom: 4px; 
  font-weight: 600;
  font-family: 'Gil Sans MT', sans-serif;
}
.df-input {
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 700;
  color: #0f0f1a;
  outline: none;
  width: 100%;
}
.date-arrow { 
  font-size: 18px; 
  color: #ccc; 
  flex-shrink: 0;
}

.duration-chip {
  background: #e8fdf6;
  color: #00a87e;
  border-radius: 10px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 700;
  display: inline-block;
}

/* Form */
.form-group { 
  margin-bottom: 16px; 
}
.form-group:last-child { 
  margin-bottom: 0; 
}
.form-label { 
  display: block; 
  font-size: 13px; 
  font-weight: 700; 
  color: #333; 
  margin-bottom: 6px; 
  font-family: 'Gil Sans MT', sans-serif;
}
.form-input {
  width: 100%;
  background: #f4f4f8;
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 15px;
  color: #0f0f1a;
  outline: none;
  box-sizing: border-box;
  transition: border 0.2s;
}
.form-input:focus { 
  border-color: #00c896; 
}

.form-textarea {
  width: 100%;
  background: #f4f4f8;
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 14px;
  color: #0f0f1a;
  outline: none;
  resize: none;
  height: 80px;
  box-sizing: border-box;
  font-family: inherit;
  transition: border 0.2s;
}
.form-textarea:focus { border-color: #00c896; }

/* Option Cards */
.option-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.option-card {
  background: #f4f4f8;
  border-radius: 14px;
  padding: 14px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}
.option-card.selected {
  background: #ffdff0;
  border-color: #b70b67;
}
.oc-icon { 
  font-size: 26px; 
  margin-bottom: 6px; 
}
.oc-label { 
  font-size: 14px; 
  font-weight: 700; 
  color: #0f0f1a; 
  margin-bottom: 3px; 
  font-family: 'Gil Sans MT', sans-serif;
}
.oc-sub { 
  font-size: 11px; 
  color: #999; 
  margin-bottom: 6px;
  font-family: 'Gil Sans MT', sans-serif;
}

.oc-free { 
  font-size: 13px; 
  font-weight: 800; 
  color: #b70b67; 
  font-family: 'Gil Sans MT', sans-serif;
}
.oc-fee  { 
  font-size: 13px; 
  font-weight: 800; 
  color: #e05555; 
  font-family: 'Gil Sans MT', sans-serif;
}

/* Breakdown */
.breakdown-card { border-top: 1px solid #f0f0f5; }
.breakdown-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #555;
  margin-bottom: 10px;
}
.breakdown-divider { height: 1px; background: #eee; margin: 10px 0; }
.breakdown-total {
  display: flex;
  justify-content: space-between;
  font-size: 16px;
  font-weight: 800;
  color: #0f0f1a;
  font-family: 'Gil Sans MT', sans-serif;
}
.total-val { color: #b70b67; }

/* Footer */
.footer-bar {
  background: #fff;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
}
.footer-inner {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 20px 28px;
}
.footer-total { flex: 1; }
.ft-label { font-size: 12px; color: #999; }
.ft-val { font-size: 22px; font-weight: 800; color: #0f0f1a; }
.btn-confirm {
  flex: 1.5;
  --background: #b70b67;
  --color: #fff;
  --border-radius: 14px;
  --box-shadow: 0 4px 14px rgba(0,200,150,0.35);
  font-weight: 700;
  height: 52px;
  font-size: 15px;
}
</style>