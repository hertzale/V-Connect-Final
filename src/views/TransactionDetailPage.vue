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
            <h1 class="header-title">Transaction Details</h1>
          </div>

          <!-- Loading -->
          <div class="empty-state" v-if="isLoading">
            <div class="empty-icon">⏳</div>
            <p class="empty-title">Loading...</p>
          </div>

          <!-- Error -->
          <div class="empty-state" v-else-if="!tx">
            <div class="empty-icon">❌</div>
            <p class="empty-title">Transaction not found.</p>
          </div>

          <template v-else>

            <!-- Status Banner -->
            <div class="status-banner" :class="tx.Rental_Status">
              <span class="status-icon">{{ statusIcon(tx.Rental_Status) }}</span>
              <div>
                <p class="status-label">{{ statusLabel(tx.Rental_Status) }}</p>
                <p class="status-sub">{{ statusSub(tx.Rental_Status) }}</p>
              </div>
            </div>

            <!-- Vehicle Card -->
            <div class="glass-card">
              <p class="card-label">Vehicle</p>
              <div class="vehicle-row">
                <div class="vehicle-emoji">🚗</div>
                <div class="vehicle-info">
                  <p class="vehicle-name">{{ tx.Vehicle_Model || '—' }}</p>
                  <p class="vehicle-biz">{{ tx.Business_Name || '—' }}</p>
                </div>
                <div class="tx-id-badge">{{ tx.Transaction_ID }}</div>
              </div>
            </div>

            <!-- Rental Details Card -->
            <div class="glass-card">
              <p class="card-label">Rental Details</p>
              <div class="detail-row">
                <ion-icon name="calendar-outline" class="d-icon"></ion-icon>
                <span class="d-key">Rental Period</span>
                <span class="d-val">{{ formatDate(tx.Start_Date) }} → {{ formatDate(tx.End_Date) }}</span>
              </div>
              <div class="detail-row">
                <ion-icon name="time-outline" class="d-icon"></ion-icon>
                <span class="d-key">Duration</span>
                <span class="d-val">{{ tx.Rental_Duration }} day(s)</span>
              </div>
              <div class="detail-row">
                <ion-icon name="time-outline" class="d-icon"></ion-icon>
                <span class="d-key">Pickup Time</span>
                <span class="d-val">{{ tx.Start_Time || '—' }}</span>
              </div>
              <div class="detail-row">
                <ion-icon name="location-outline" class="d-icon"></ion-icon>
                <span class="d-key">Pickup Location</span>
                <span class="d-val">{{ tx.Pickup_Location || '—' }}</span>
              </div>
              <div class="detail-row" v-if="tx.Drop_off_Location && tx.Drop_off_Location !== tx.Pickup_Location">
                <ion-icon name="location-outline" class="d-icon"></ion-icon>
                <span class="d-key">Drop-off</span>
                <span class="d-val">{{ tx.Drop_off_Location }}</span>
              </div>
              <div class="detail-row">
                <ion-icon name="person-outline" class="d-icon"></ion-icon>
                <span class="d-key">Driver</span>
                <span class="d-val">{{ tx.With_Driver ? 'With Driver' : 'Self Drive' }}</span>
              </div>
              <div class="detail-row" v-if="tx.Other_Details">
                <ion-icon name="document-text-outline" class="d-icon"></ion-icon>
                <span class="d-key">Notes</span>
                <span class="d-val">{{ tx.Other_Details }}</span>
              </div>
            </div>

            <!-- Payment Card -->
            <div class="glass-card">
              <p class="card-label">Payment</p>
              <div v-if="payment">
                <div class="detail-row">
                  <ion-icon name="cash-outline" class="d-icon"></ion-icon>
                  <span class="d-key">Method</span>
                  <span class="d-val">{{ payment.Payment_Method || '—' }}</span>
                </div>
                <div class="detail-row">
                  <ion-icon name="checkmark-circle-outline" class="d-icon"></ion-icon>
                  <span class="d-key">Status</span>
                  <span class="d-val payment-status" :class="payment.Payment_Status">
                    {{ payment.Payment_Status || '—' }}
                  </span>
                </div>
                <div class="receipt-divider dashed"></div>
                <div class="total-row">
                  <span class="total-label">Total Amount</span>
                  <span class="total-val">₱{{ Number(payment.Total_Amount ?? 0).toLocaleString() }}</span>
                </div>
              </div>
              <div v-else class="no-payment">
                <p>No payment record yet.</p>
              </div>
            </div>

            <!-- Receipts Card -->
            <div class="glass-card" v-if="receipts.length > 0">
              <p class="card-label">Receipts</p>
              <div
                v-for="r in receipts"
                :key="r.Receipt_ID"
                class="receipt-item"
              >
                <div class="ri-left">
                  <p class="ri-id">{{ r.Receipt_ID }}</p>
                  <p class="ri-date">{{ formatDate(r.Receipt_Date) }}</p>
                  <p class="ri-type">{{ r.Payment_Type }}</p>
                </div>
                <p class="ri-amount">₱{{ Number(r.Amount_Paid).toLocaleString() }}</p>
              </div>
            </div>

            <!-- Actions -->
            <div class="action-buttons">
              <button
                class="btn-cancel"
                v-if="tx.Rental_Status === 'Pending'"
                @click="cancelTransaction"
                :disabled="isCancelling"
              >
                <ion-icon name="close-circle-outline"></ion-icon>
                {{ isCancelling ? 'Cancelling...' : 'Cancel Booking' }}
              </button>
            </div>

          </template>
        </div>
        <div style="height: 40px"></div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { IonPage, IonContent, IonIcon, useIonRouter, onIonViewWillEnter } from '@ionic/vue'
import { addIcons } from 'ionicons'
import {
  arrowBackOutline, calendarOutline, timeOutline,
  locationOutline, personOutline, documentTextOutline,
  cashOutline, checkmarkCircleOutline, closeCircleOutline,
} from 'ionicons/icons'
import { transactionAPI, paymentAPI, receiptAPI } from '@/api'

addIcons({
  'arrow-back-outline':         arrowBackOutline,
  'calendar-outline':           calendarOutline,
  'time-outline':               timeOutline,
  'location-outline':           locationOutline,
  'person-outline':             personOutline,
  'document-text-outline':      documentTextOutline,
  'cash-outline':               cashOutline,
  'checkmark-circle-outline':   checkmarkCircleOutline,
  'close-circle-outline':       closeCircleOutline,
})

const router = useIonRouter()
const route  = useRoute()

const tx         = ref<any>(null)
const payment    = ref<any>(null)
const receipts   = ref<any[]>([])
const isLoading  = ref(false)
const isCancelling = ref(false)

const txId = route.params.id as string

function formatDate(dt: string) {
  if (!dt) return '—'
  return new Date(dt).toLocaleDateString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
}

function statusLabel(s: string) {
  const map: Record<string, string> = {
    Pending:   'Awaiting Confirmation',
    Reserved:  'Booking Reserved',
    Ongoing:   'Rental Active',
    Completed: 'Rental Completed',
    Cancelled: 'Booking Cancelled',
    Overdue:   'Rental Overdue',
  }
  return map[s] || s
}

function statusSub(s: string) {
  const map: Record<string, string> = {
    Pending:   'Waiting for the owner to confirm your booking.',
    Reserved:  'Your booking has been confirmed by the owner.',
    Ongoing:   'Your rental is currently active.',
    Completed: 'This rental has been completed.',
    Cancelled: 'This booking was cancelled.',
    Overdue:   'This rental is past its end date.',
  }
  return map[s] || ''
}

function statusIcon(s: string) {
  const map: Record<string, string> = {
    Pending:   '🕐',
    Reserved:  '📋',
    Ongoing:   '🚗',
    Completed: '✅',
    Cancelled: '❌',
    Overdue:   '⚠️',
  }
  return map[s] || '📋'
}

async function loadData() {
  isLoading.value = true
  try {
    const txRes = await transactionAPI.getOne(txId)
    tx.value = txRes.data.data ?? txRes.data

    try {
      const payRes = await paymentAPI.getByTransaction(txId)
      payment.value = payRes.data.data ?? payRes.data
    } catch { payment.value = null }

    if (payment.value?.Payment_ID) {
      try {
        const recRes = await receiptAPI.getByPayment(payment.value.Payment_ID)
        receipts.value = recRes.data.data ?? recRes.data ?? []
      } catch { receipts.value = [] }
    }
  } catch (err) {
    console.error(err)
    tx.value = null
  } finally {
    isLoading.value = false
  }
}

async function cancelTransaction() {
  if (!tx.value) return
  isCancelling.value = true
  try {
    await transactionAPI.updateStatus(tx.value.Transaction_ID, 'Cancelled')
    tx.value.Rental_Status = 'Cancelled'
  } catch (err) {
    console.error(err)
  } finally {
    isCancelling.value = false
  }
}

const goBack = () => router.back()

onIonViewWillEnter(loadData)
</script>

<style scoped>
.page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  padding-bottom: 40px;
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
  color: #ffffff; font-size: 20px; font-weight: 700; margin: 0;
}

/* Empty/Loading */
.empty-state {
  text-align: center; padding: 60px 20px;
}
.empty-icon { font-size: 48px; margin-bottom: 12px; }
.empty-title {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 16px; color: rgba(255,255,255,0.7); margin: 0;
}

/* Status Banner */
.status-banner {
  display: flex; align-items: center;
  gap: 14px;
  border-radius: 16px;
  padding: 14px 16px;
  margin-bottom: 14px;
  border: 1px solid rgba(255,255,255,0.2);
}
.status-banner.Pending   { background: rgba(251,191,36,0.15); border-color: #fbbf24; }
.status-banner.Reserved  { background: rgba(183,11,103,0.15); border-color: #fc89d0; }
.status-banner.Ongoing   { background: rgba(0,200,150,0.15);  border-color: #00c896; }
.status-banner.Completed { background: rgba(107,114,128,0.15); border-color: #6b7280; }
.status-banner.Cancelled { background: rgba(224,85,85,0.15);  border-color: #e05555; }
.status-banner.Overdue   { background: rgba(255,107,53,0.15); border-color: #ff6b35; }
.status-icon { font-size: 28px; flex-shrink: 0; }
.status-label {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 14px; font-weight: 800; color: #ffffff; margin: 0 0 3px;
}
.status-sub {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 11px; color: rgba(255,255,255,0.5); margin: 0;
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
  font-size: 10px; font-weight: 700;
  color: rgba(255,255,255,0.4);
  text-transform: uppercase; letter-spacing: 0.5px;
  margin: 0 0 14px;
}

/* Vehicle Row */
.vehicle-row {
  display: flex; align-items: center; gap: 12px;
}
.vehicle-emoji {
  width: 48px; height: 48px;
  background: rgba(255,255,255,0.1);
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  font-size: 24px; flex-shrink: 0;
}
.vehicle-info { flex: 1; }
.vehicle-name {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 15px; font-weight: 800; color: #ffffff; margin: 0 0 3px;
}
.vehicle-biz {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 12px; color: rgba(255,255,255,0.5); margin: 0;
}
.tx-id-badge {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 10px; font-weight: 700;
  color: #fc89d0;
  background: rgba(183,11,103,0.2);
  border: 1px solid rgba(252,137,208,0.3);
  border-radius: 8px;
  padding: 4px 8px;
  white-space: nowrap;
}

/* Detail Rows */
.detail-row {
  display: flex; align-items: flex-start;
  gap: 10px; margin-bottom: 10px;
}
.detail-row:last-child { margin-bottom: 0; }
.d-icon { font-size: 15px; color: #fc89d0; flex-shrink: 0; margin-top: 1px; }
.d-key {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 12px; color: rgba(255,255,255,0.5);
  min-width: 110px; flex-shrink: 0;
}
.d-val {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 12px; font-weight: 600; color: #ffffff;
  text-align: right; flex: 1;
}

/* Payment */
.payment-status { font-weight: 800 !important; }
.payment-status.Pending  { color: #fbbf24 !important; }
.payment-status.Paid     { color: #00c896 !important; }
.payment-status.Refunded { color: #fc89d0 !important; }

.receipt-divider {
  height: 1px; background: rgba(255,255,255,0.15); margin: 12px 0;
}
.receipt-divider.dashed {
  background: none;
  border-top: 1.5px dashed rgba(255,255,255,0.25);
}
.total-row {
  display: flex; justify-content: space-between; align-items: center;
}
.total-label {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 14px; font-weight: 700; color: rgba(255,255,255,0.8);
}
.total-val {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 24px; font-weight: 800; color: #fc89d0;
}
.no-payment {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 13px; color: rgba(255,255,255,0.4);
  text-align: center; padding: 8px 0;
}

/* Receipt Items */
.receipt-item {
  display: flex; justify-content: space-between; align-items: center;
  background: rgba(255,255,255,0.08);
  border-radius: 12px; padding: 12px 14px;
  margin-bottom: 8px;
}
.receipt-item:last-child { margin-bottom: 0; }
.ri-id {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 12px; font-weight: 700; color: #fc89d0; margin: 0 0 2px;
}
.ri-date {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 11px; color: rgba(255,255,255,0.5); margin: 0 0 2px;
}
.ri-type {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 11px; color: rgba(255,255,255,0.4); margin: 0;
}
.ri-amount {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 16px; font-weight: 800; color: #ffffff; margin: 0;
}

/* Actions */
.action-buttons { margin-top: 4px; }
.btn-cancel {
  width: 100%; padding: 14px;
  background: rgba(224,85,85,0.2);
  border: 1.5px solid #e05555;
  border-radius: 50px;
  color: #ff9090;
  font-size: 14px; font-weight: 700;
  cursor: pointer;
  display: flex; align-items: center;
  justify-content: center; gap: 8px;
  font-family: 'Gil Sans MT', sans-serif;
  transition: all 0.2s;
}
.btn-cancel:hover { background: rgba(224,85,85,0.35); }
.btn-cancel:disabled { opacity: 0.5; cursor: not-allowed; }
</style>