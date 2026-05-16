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
            <h1 class="header-title">Receipt</h1>
          </div>

          <!-- Success Badge -->
          <div class="success-badge">
            <div class="success-icon">✅</div>
            <p class="success-title">Payment Recorded!</p>
            <p class="success-sub">Your transaction has been completed successfully.</p>
          </div>

          <!-- Receipt Card -->
          <div class="glass-card receipt-card">

            <!-- Receipt Header -->
            <div class="receipt-header">
              <img src="@/assets/v-connect.png" alt="logo" class="receipt-logo" />
              <div class="receipt-title-group">
                <p class="receipt-brand">V-Connect</p>
                <p class="receipt-label">Official Receipt</p>
              </div>
              <div class="receipt-id-group">
                <p class="receipt-id-label">Receipt No.</p>
                <p class="receipt-id">{{ receipt.Receipt_ID || '—' }}</p>
              </div>
            </div>

            <div class="receipt-divider dashed"></div>

            <!-- Transaction Info -->
            <div class="receipt-section">
              <p class="rs-label">Transaction Details</p>
              <div class="receipt-row">
                <span class="rr-key">Payment ID</span>
                <span class="rr-val">{{ receipt.Payment_ID || '—' }}</span>
              </div>
              <div class="receipt-row">
                <span class="rr-key">Receipt Date</span>
                <span class="rr-val">{{ formatDate(receipt.Receipt_Date) }}</span>
              </div>
              <div class="receipt-row">
                <span class="rr-key">Recorded By</span>
                <span class="rr-val">{{ receipt.Recorded_By_Name || receipt.Recorded_By || '—' }}</span>
              </div>
            </div>

            <div class="receipt-divider"></div>

            <!-- Vehicle Info -->
            <div class="receipt-section">
              <p class="rs-label">Vehicle & Rental</p>
              <div class="receipt-row">
                <span class="rr-key">Vehicle</span>
                <span class="rr-val">{{ receipt.Vehicle_Model || '—' }}</span>
              </div>
              <div class="receipt-row">
                <span class="rr-key">Rental Period</span>
                <span class="rr-val">{{ receipt.Rental_Duration || '—' }} day(s)</span>
              </div>
              <div class="receipt-row">
                <span class="rr-key">Start Date</span>
                <span class="rr-val">{{ formatDate(receipt.Start_Date) }}</span>
              </div>
              <div class="receipt-row">
                <span class="rr-key">End Date</span>
                <span class="rr-val">{{ formatDate(receipt.End_Date) }}</span>
              </div>
              <div class="receipt-row">
                <span class="rr-key">Pickup Location</span>
                <span class="rr-val">{{ receipt.Pickup_Location || '—' }}</span>
              </div>
            </div>

            <div class="receipt-divider"></div>

            <!-- Payment Info -->
            <div class="receipt-section">
              <p class="rs-label">Payment Details</p>
              <div class="receipt-row">
                <span class="rr-key">Payment Type</span>
                <span class="rr-val">{{ receipt.Payment_Type || 'Full' }}</span>
              </div>
              <div class="receipt-row">
                <span class="rr-key">Payment Method</span>
                <span class="rr-val">Cash</span>
              </div>
              <div class="receipt-row" v-if="receipt.Remarks">
                <span class="rr-key">Remarks</span>
                <span class="rr-val">{{ receipt.Remarks }}</span>
              </div>
            </div>

            <div class="receipt-divider dashed"></div>

            <!-- Total -->
            <div class="receipt-total">
              <span class="total-label">Amount Paid</span>
              <span class="total-amount">₱{{ Number(receipt.Amount_Paid || 0).toLocaleString() }}</span>
            </div>

            <div class="receipt-divider dashed"></div>

            <!-- Footer -->
            <div class="receipt-footer">
              <p class="rf-text">Thank you for using V-Connect!</p>
              <p class="rf-sub">Please keep this receipt for your records.</p>
            </div>

          </div>

          <!-- Action Buttons -->
          <div class="action-buttons">
            <button class="btn-secondary" @click="goToTransactions">
              <ion-icon name="list-outline"></ion-icon>
              My Transactions
            </button>
            <button class="btn-primary" @click="goHome">
              <ion-icon name="home-outline"></ion-icon>
              Go Home
            </button>
          </div>

        </div>
        <div style="height: 40px"></div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { IonPage, IonContent, IonIcon, useIonRouter, onIonViewWillEnter } from '@ionic/vue'
import { addIcons } from 'ionicons'
import {
  arrowBackOutline, listOutline, homeOutline
} from 'ionicons/icons'
import { receiptAPI, paymentAPI } from '@/api'

addIcons({
  'arrow-back-outline': arrowBackOutline,
  'list-outline': listOutline,
  'home-outline': homeOutline,
})

const router = useIonRouter()
const route  = useRoute()

// Receipt data — passed via query or loaded from API
const receipt = ref<any>({
  Receipt_ID:       route.query.receiptId    || '',
  Payment_ID:       route.query.paymentId    || '',
  Amount_Paid:      route.query.amount       || 0,
  Payment_Type:     route.query.paymentType  || 'Full',
  Remarks:          route.query.remarks      || '',
  Receipt_Date:     route.query.date         || new Date().toISOString().split('T')[0],
  Recorded_By:      route.query.recordedBy   || '',
  Recorded_By_Name: route.query.recordedByName || '',
  Vehicle_Model:    route.query.vehicleName  || '',
  Rental_Duration:  route.query.days         || '',
  Start_Date:       route.query.startDate    || '',
  End_Date:         route.query.endDate      || '',
  Pickup_Location:  route.query.pickupLocation || '',
})


const formatDate = (dt: string) => {
  if (!dt) return '—'
  return new Date(dt).toLocaleDateString('en-PH', {
    month: 'long', day: 'numeric', year: 'numeric'
  })
}

const goBack           = () => router.back()
const goToTransactions = () => router.push('/transactions')

const goHome = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  if (user.Role === 'Business_Owner') {
    router.push('/owner-dashboard')
  } else {
    router.push('/home')
  }
}

onIonViewWillEnter(async () => {
  const receiptId     = route.query.receiptId as string
  const transactionId = route.query.transactionId as string

  if (receiptId) {
    // Load by receipt ID directly
    const res = await receiptAPI.getOne(receiptId)
    receipt.value = res.data.data ?? res.data
  } else if (transactionId) {
    // Load by transaction ID via payment
    const payRes = await paymentAPI.getByTransaction(transactionId)
    const payment = payRes.data.data?.[0] ?? payRes.data?.[0]
    if (payment?.Payment_ID) {
      const recRes = await receiptAPI.getByPayment(payment.Payment_ID)
      receipt.value = recRes.data.data?.[0] ?? recRes.data?.[0]
    }
  }
})

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
  gap: 12px; margin-bottom: 16px;
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

/* Success Badge */
.success-badge {
  text-align: center;
  margin-bottom: 20px;
}
.success-icon { font-size: 52px; margin-bottom: 8px; }
.success-title {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 20px; font-weight: 800;
  color: #ffffff; margin: 0 0 4px;
}
.success-sub {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 13px; color: rgba(255,255,255,0.6); margin: 0;
}

/* Receipt Card */
.glass-card {
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 16px;
}

.receipt-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.receipt-logo {
  width: 40px; height: 40px;
  object-fit: contain;
  border-radius: 10px;
  flex-shrink: 0;
}
.receipt-title-group { flex: 1; }
.receipt-brand {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 16px; font-weight: 800;
  color: #ffffff; margin: 0 0 2px;
}
.receipt-label {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 11px; color: rgba(255,255,255,0.5); margin: 0;
}
.receipt-id-group { text-align: right; }
.receipt-id-label {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 10px; color: rgba(255,255,255,0.4); margin: 0 0 2px;
}
.receipt-id {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 13px; font-weight: 700;
  color: #fc89d0; margin: 0;
}

/* Dividers */
.receipt-divider {
  height: 1px;
  background: rgba(255,255,255,0.15);
  margin: 14px 0;
}
.receipt-divider.dashed {
  background: none;
  border-top: 1.5px dashed rgba(255,255,255,0.25);
}

/* Sections */
.receipt-section { margin-bottom: 4px; }
.rs-label {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 10px; font-weight: 700;
  color: rgba(255,255,255,0.4);
  text-transform: uppercase; letter-spacing: 0.5px;
  margin: 0 0 10px;
}
.receipt-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 7px;
}
.rr-key {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 12px; color: rgba(255,255,255,0.5);
  flex-shrink: 0;
}
.rr-val {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 12px; font-weight: 600;
  color: #ffffff; text-align: right;
}

/* Total */
.receipt-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.total-label {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 14px; font-weight: 700;
  color: rgba(255,255,255,0.8);
}
.total-amount {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 26px; font-weight: 800;
  color: #fc89d0;
}

/* Receipt Footer */
.receipt-footer { text-align: center; }
.rf-text {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 13px; font-weight: 700;
  color: rgba(255,255,255,0.8); margin: 0 0 3px;
}
.rf-sub {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 11px; color: rgba(255,255,255,0.4); margin: 0;
}

/* Action Buttons */
.action-buttons {
  display: flex; gap: 10px;
}
.btn-secondary {
  flex: 1; padding: 13px;
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 50px;
  color: #ffffff;
  font-size: 13px; font-weight: 700;
  cursor: pointer;
  display: flex; align-items: center;
  justify-content: center; gap: 6px;
  font-family: 'Gil Sans MT', sans-serif;
  transition: all 0.2s;
}
.btn-primary {
  flex: 1; padding: 13px;
  background: #b70b67;
  border: none;
  border-radius: 50px;
  color: #ffffff;
  font-size: 13px; font-weight: 700;
  cursor: pointer;
  display: flex; align-items: center;
  justify-content: center; gap: 6px;
  font-family: 'Gil Sans MT', sans-serif;
  letter-spacing: 1px;
  transition: all 0.2s;
}
.btn-primary:hover   { background: #fc89d0; }
.btn-secondary:hover { background: rgba(255,255,255,0.25); }
</style>