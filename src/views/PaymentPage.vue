<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="page">


        <div class="container">

          <!-- Header -->
          <div class="post-header">
            <div class="back-btn" @click="goBack">
              <ion-icon name="arrow-back-outline"></ion-icon>
            </div>
            <h1 class="header-title">Payment</h1>
          </div>

          <!-- Order Summary Card -->
          <div class="glass-card summary-card">
            <p class="card-label">Order Summary</p>

            <div class="summary-vehicle">
              <div class="summary-vehicle-icon">
                <ion-icon name="car-outline"></ion-icon>
              </div>
              <div class="summary-vehicle-info">
                <p class="summary-vehicle-name">{{ vehicleName }}</p>
                <p class="summary-vehicle-meta">{{ ownerName }}</p>
                <div class="negotiated-tag" v-if="isNegotiated">
                  🤝 Negotiated Price
                </div>
              </div>
            </div>

            <div class="summary-divider"></div>

            <div class="summary-row">
              <span class="summary-key">📅 Rental Period</span>
              <span class="summary-val">{{ startDate }} → {{ endDate }}</span>
            </div>
            <div class="summary-row">
              <span class="summary-key">🕐 Duration</span>
              <span class="summary-val">{{ rentalDays }} day(s)</span>
            </div>
            <div class="summary-row">
              <span class="summary-key">💰 Daily Rate</span>
              <span class="summary-val">₱{{ Number(dailyRate).toLocaleString() }}/day</span>
            </div>
            <div class="summary-row" v-if="withDriver">
              <span class="summary-key">🧑‍✈️ Driver</span>
              <span class="summary-val">With Driver</span>
            </div>

            <div class="summary-divider dashed"></div>

            <div class="summary-total-row">
              <span class="summary-total-label">Total Amount</span>
              <span class="summary-total-val">₱{{ totalAmount.toLocaleString() }}</span>
            </div>
          </div>

          <!-- Payment Method Card -->
          <div class="glass-card">
            <p class="card-label">Payment Method</p>

            <div class="payment-methods">
              <div
                :class="['payment-method-card', paymentMethod === 'Cash' ? 'method-active' : '']"
                @click="paymentMethod = 'Cash'"
              >
                <div class="method-icon">💵</div>
                <div class="method-info">
                  <p class="method-name">Cash</p>
                  <p class="method-desc">Pay upon pickup</p>
                </div>
                <div class="method-check" v-if="paymentMethod === 'Cash'">
                  <ion-icon name="checkmark-circle"></ion-icon>
                </div>
              </div>
            </div>

            <div class="cash-info" v-if="paymentMethod === 'Cash'">
              <ion-icon name="information-circle-outline"></ion-icon>
              <span>Please prepare the exact amount. Payment is collected upon vehicle pickup.</span>
            </div>
          </div>

          <!-- Pickup Details Card -->
          <div class="glass-card">
            <p class="card-label">Pickup Details</p>
            <div class="pickup-row">
              <ion-icon name="location-outline" class="pickup-icon"></ion-icon>
              <div>
                <p class="pickup-label">Pickup Location</p>
                <p class="pickup-val">{{ pickupLocation || 'Self Pickup' }}</p>
              </div>
            </div>
            <div class="pickup-row">
              <ion-icon name="time-outline" class="pickup-icon"></ion-icon>
              <div>
                <p class="pickup-label">Pickup Time</p>
                <p class="pickup-val">{{ startTime || '—' }}</p>
              </div>
            </div>
          </div>

          <!-- Terms -->
          <div class="glass-card terms-card">
            <div class="terms-row" @click="agreedToTerms = !agreedToTerms">
              <div :class="['terms-check', agreedToTerms ? 'terms-checked' : '']">
                <ion-icon name="checkmark-outline" v-if="agreedToTerms"></ion-icon>
              </div>
              <p class="terms-text">
                I agree to the rental terms and conditions. I understand that
                cancellations may incur fees.
              </p>
            </div>
          </div>

          <!-- Error -->
          <p class="error-txt" v-if="errorMessage">⚠️ {{ errorMessage }}</p>

          <!-- Submit Button -->
          <button
            class="btn-pay"
            @click="confirmPayment"
            :disabled="isLoading || !agreedToTerms || !paymentMethod"
          >
            <span v-if="isLoading">Processing...</span>
            <span v-else>
              <ion-icon name="lock-closed-outline"></ion-icon>
              Confirm Booking · ₱{{ totalAmount.toLocaleString() }}
            </span>
          </button>

          <p class="secure-note">
            <ion-icon name="shield-checkmark-outline"></ion-icon>
            Your booking is secured and confirmed upon submission
          </p>

        </div>
        <div style="height: 40px"></div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { IonPage, IonContent, IonIcon, useIonRouter } from '@ionic/vue'
import { addIcons } from 'ionicons'
import {
  arrowBackOutline, carOutline, checkmarkCircle,
  checkmarkOutline, informationCircleOutline,
  locationOutline, timeOutline, lockClosedOutline,
  shieldCheckmarkOutline
} from 'ionicons/icons'
import { transactionAPI, paymentAPI } from '@/api'

addIcons({
  'arrow-back-outline':        arrowBackOutline,
  'car-outline':               carOutline,
  'checkmark-circle':          checkmarkCircle,
  'checkmark-outline':         checkmarkOutline,
  'information-circle-outline': informationCircleOutline,
  'location-outline':          locationOutline,
  'time-outline':              timeOutline,
  'lock-closed-outline':       lockClosedOutline,
  'shield-checkmark-outline':  shieldCheckmarkOutline,
})

const router = useIonRouter()
const route  = useRoute()

// ─── Route Params ─────────────────────────────────────────
// Passed from BookingPage or NegotiatePage
const vehicleId      = ref(route.query.vehicleId      as string || '')
const vehicleName    = ref(route.query.vehicleName    as string || 'Vehicle')
const ownerName      = ref(route.query.ownerName      as string || 'Owner')
const dailyRate      = ref(Number(route.query.dailyRate)  || 0)
const startDate      = ref(route.query.startDate      as string || '')
const endDate        = ref(route.query.endDate        as string || '')
const startTime      = ref(route.query.startTime      as string || '')
const endTime        = ref(route.query.endTime        as string || '')
const pickupLocation = ref(route.query.pickupLocation as string || '')
const dropoffLocation= ref(route.query.dropoffLocation as string || '')
const withDriver     = ref(route.query.withDriver === '1')
const isNegotiated   = ref(route.query.negotiated === 'true')
const otherDetails   = ref(route.query.otherDetails   as string || '')
const driverName     = ref(route.query.driverName     as string || '')
const driversLicense = ref(route.query.driversLicense as string || '')

// ─── State ────────────────────────────────────────────────
const paymentMethod  = ref('Cash')
const agreedToTerms  = ref(false)
const isLoading      = ref(false)
const errorMessage   = ref('')

// ─── Computed ─────────────────────────────────────────────
const rentalDays = computed(() => {
  if (!startDate.value || !endDate.value) return 0
  return Math.ceil(
    (new Date(endDate.value).getTime() - new Date(startDate.value).getTime()) / 86400000
  )
})

const totalAmount = computed(() => dailyRate.value * rentalDays.value)

// ─── Confirm Payment → Create Transaction ─────────────────
async function confirmPayment() {
  if (!agreedToTerms.value) {
    errorMessage.value = 'Please agree to the terms and conditions.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    // 1. Create the rental transaction
    const txRes = await transactionAPI.create({
      vehicle_id:        vehicleId.value,
      start_date:        startDate.value,
      end_date:          endDate.value,
      start_time:        startTime.value || '08:00:00',
      end_time:          endTime.value   || '08:00:00',
      pickup_location:   pickupLocation.value  || 'Self Pickup',
      drop_off_location: dropoffLocation.value || 'Self Pickup',
      with_driver:       withDriver.value ? 1 : 0,
      other_details:     otherDetails.value   || undefined,
      driver_name:       driverName.value     || undefined,
      drivers_license:   driversLicense.value || undefined,
    })

    console.log('txRes.data:', txRes.data)
    
    const newTransactionId = txRes.data.data?.transaction_id || txRes.data?.transaction_id

    // 2. Create the payment record
    const payRes = await paymentAPI.create({
      transaction_id:  newTransactionId,
      total_amount:    totalAmount.value,
      payment_method:  paymentMethod.value as 'Cash',
      payment_date:    new Date().toISOString().split('T')[0],
      payment_status:  'Pending',
    })


    const newPaymentId = payRes.data.data?.Payment_ID || payRes.data?.Payment_ID

    // 3. Navigate to receipt page with all needed data
    router.push({
      path: '/receipt',
      query: {
        transactionId:   newTransactionId,
        paymentId:       newPaymentId,
        vehicleName:     vehicleName.value,
        amount:          String(totalAmount.value),
        paymentType:     'Full',
        date:            new Date().toISOString().split('T')[0],
        startDate:       startDate.value,
        endDate:         endDate.value,
        pickupLocation:  pickupLocation.value,
        days:            String(rentalDays.value),
      }
    })

  } catch (err: any) {
    errorMessage.value = err.response?.data?.message || 'Failed to confirm booking. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const goBack = () => router.back()
</script>

<style scoped>
.page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  padding-bottom: 40px;
}
.bg-mobile {
  display: block; position: absolute;
  inset: 0; width: 100%; height: 100%;
  object-fit: cover; z-index: 0; opacity: 0.9;
}
.bg-web {
  display: none; position: absolute;
  inset: 0; width: 100%; height: 100%;
  object-fit: cover; z-index: 0; opacity: 0.9;
}
@media (min-width: 768px) {
  .bg-mobile { display: none; }
  .bg-web    { display: block; }
}

.container {
  position: relative;
  z-index: 1;
  padding: 48px 16px 20px;
}

/* Header */
.post-header {
  display: flex; align-items: center;
  gap: 12px; margin-bottom: 20px;
}
.back-btn {
  width: 36px; height: 36px; border-radius: 50%;
  background: rgba(255,255,255,0.2);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #ffffff; font-size: 20px; flex-shrink: 0;
}
.header-title {
  font-family: 'Gil Sans MT', sans-serif;
  color: #ffffff; font-size: 22px; font-weight: 800; margin: 0;
}

/* Glass Card */
.glass-card {
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 20px;
  padding: 16px;
  margin-bottom: 14px;
}

.card-label {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 11px; font-weight: 700;
  color: rgba(255,255,255,0.5);
  text-transform: uppercase; letter-spacing: 0.5px;
  margin: 0 0 14px;
}


.summary-vehicle {
  display: flex; align-items: center;
  gap: 12px; margin-bottom: 14px;
}
.summary-vehicle-icon {
  width: 48px; height: 48px;
  background: rgba(255,255,255,0.1);
  border-radius: 14px;
  display: flex; align-items: center;
  justify-content: center;
  font-size: 24px;
  color: rgba(255,255,255,0.7);
  flex-shrink: 0;
}
.summary-vehicle-name {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 16px; font-weight: 800;
  color: #ffffff; margin: 0 0 3px;
}
.summary-vehicle-meta {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 12px; color: rgba(255,255,255,0.5); margin: 0 0 6px;
}
.negotiated-tag {
  display: inline-block;
  background: rgba(183,11,103,0.3);
  border: 1px solid #fc89d0;
  border-radius: 8px;
  padding: 2px 8px;
  font-size: 11px; font-weight: 700;
  color: #fc89d0;
  font-family: 'Gil Sans MT', sans-serif;
}

.summary-divider {
  height: 1px;
  background: rgba(255,255,255,0.15);
  margin: 12px 0;
}
.summary-divider.dashed {
  background: none;
  border-top: 1.5px dashed rgba(255,255,255,0.25);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.summary-key {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 13px; color: rgba(255,255,255,0.5);
}
.summary-val {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 13px; font-weight: 600; color: #ffffff;
}
.summary-total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.summary-total-label {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 15px; font-weight: 700;
  color: rgba(255,255,255,0.8);
}
.summary-total-val {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 24px; font-weight: 800;
  color: #fc89d0;
}

/* Payment Methods */
.payment-methods { display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px; }
.payment-method-card {
  display: flex; align-items: center;
  gap: 12px;
  background: rgba(255,255,255,0.08);
  border: 2px solid rgba(255,255,255,0.15);
  border-radius: 14px;
  padding: 14px;
  cursor: pointer;
  transition: all 0.2s;
}
.payment-method-card:active { transform: scale(0.98); }
.method-active {
  border-color: #fc89d0;
  background: rgba(183,11,103,0.15);
}
.method-icon { font-size: 28px; flex-shrink: 0; }
.method-info { flex: 1; }
.method-name {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 15px; font-weight: 700;
  color: #ffffff; margin: 0 0 2px;
}
.method-desc {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 12px; color: rgba(255,255,255,0.5); margin: 0;
}
.method-check { font-size: 22px; color: #fc89d0; }

.cash-info {
  display: flex; align-items: flex-start;
  gap: 8px;
  background: rgba(255,255,255,0.08);
  border-radius: 12px;
  padding: 12px;
  font-size: 12px;
  color: rgba(255,255,255,0.6);
  font-family: 'Gil Sans MT', sans-serif;
}
.cash-info ion-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }

/* Pickup */
.pickup-row {
  display: flex; align-items: flex-start;
  gap: 12px; margin-bottom: 12px;
}
.pickup-row:last-child { margin-bottom: 0; }
.pickup-icon { font-size: 20px; color: #fc89d0; flex-shrink: 0; margin-top: 2px; }
.pickup-label {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 11px; color: rgba(255,255,255,0.4); margin: 0 0 3px;
}
.pickup-val {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 14px; font-weight: 600; color: #ffffff; margin: 0;
}

/* Terms */
.terms-row {
  display: flex; align-items: flex-start;
  gap: 12px; cursor: pointer;
}
.terms-check {
  width: 22px; height: 22px;
  border-radius: 6px;
  border: 2px solid rgba(255,255,255,0.3);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}
.terms-checked {
  background: #fc89d0;
  border-color: #fc89d0;
}
.terms-check ion-icon { font-size: 14px; color: #ffffff; }
.terms-text {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 12px; color: rgba(255,255,255,0.6);
  line-height: 1.5; margin: 0;
}

/* Error */
.error-txt {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 13px; color: #ff9090;
  text-align: center; margin: 0 0 12px;
}

/* Pay Button */
.btn-pay {
  width: 100%; padding: 16px;
  background: #b70b67;
  border: none; border-radius: 50px;
  color: #ffffff;
  font-size: 16px; font-weight: 700;
  letter-spacing: 1px; cursor: pointer;
  display: flex; align-items: center;
  justify-content: center; gap: 8px;
  font-family: 'Gil Sans MT', sans-serif;
  transition: background 0.2s;
  margin-bottom: 12px;
}
.btn-pay:hover    { background: #fc89d0; }
.btn-pay:disabled { opacity: 0.5; cursor: not-allowed; }

.secure-note {
  display: flex; align-items: center;
  justify-content: center; gap: 6px;
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 11px; color: rgba(255,255,255,0.4);
  margin: 0;
}
.secure-note ion-icon { font-size: 13px; }
</style>