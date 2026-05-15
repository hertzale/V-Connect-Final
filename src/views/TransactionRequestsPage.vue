<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="page">

        <img src="@/assets/new-bg.png" alt="Vcon Background" class="bg-mobile" />
        <img src="@/assets/v-connect-bg-web.png" class="bg-web" />

        <div class="container">

          <!-- Header -->
          <div class="post-header">
            <div class="back-btn" @click="goBack">
              <ion-icon name="arrow-back-outline"></ion-icon>
            </div>
            <h1 class="header-title">Transaction Requests</h1>
          </div>

          <!-- Tabs -->
          <div class="tab-row">
            <div v-for="tab in tabs" :key="tab.key" :class="['tab', activeTab === tab.key ? 'tab-active' : '']"
              @click="activeTab = tab.key">
              {{ tab.label }}
              <span class="tab-badge" v-if="countFor(tab.key) > 0">{{ countFor(tab.key) }}</span>
            </div>
          </div>

          <!-- Loading -->
          <div class="glass-card center-card" v-if="isLoading">
            <p class="center-txt">Loading requests...</p>
          </div>

          <!-- Empty -->
          <div class="glass-card center-card" v-else-if="filtered.length === 0">
            <div class="empty-icon">{{ emptyFor(activeTab).icon }}</div>
            <p class="empty-title">{{ emptyFor(activeTab).title }}</p>
            <p class="empty-sub">{{ emptyFor(activeTab).sub }}</p>
          </div>

          <!-- Request Cards -->
          <div v-else>
            <div v-for="tx in filtered" :key="tx.Transaction_ID" class="glass-card req-card"
              :class="statusBorderClass(tx.Rental_Status)">
              <!-- Customer Info -->
              <div class="req-top">
                <div class="req-avatar">{{ getInitials(tx.Customer_Name) }}</div>
                <div class="req-info">
                  <p class="req-name">{{ tx.Customer_Name }}</p>
                  <p class="req-contact">{{ tx.Customer_Contact || '' }}</p>
                </div>
                <p class="req-submitted">{{ formatDate(tx.Transaction_Date) }}</p>
              </div>

              <!-- Vehicle Info -->
              <div class="vehicle-row">
                <ion-icon name="car-outline" class="v-icon"></ion-icon>
                <div class="v-info">
                  <p class="v-name">{{ tx.Vehicle_Model }} ({{ tx.Vehicle_Type }})</p>
                  <p class="v-dates">
                    📅 {{ formatDateTime(tx.Start_Date_and_Time) }} →
                    {{ formatDateTime(tx.End_Date_and_Time) }}
                  </p>
                  <p class="v-meta">
                    {{ tx.Rental_Duration }} day(s) ·
                    {{ tx.With_Driver ? '🧑‍✈️ With Driver' : '🚗 Self-Drive' }} ·
                    📍 {{ tx.Pickup_Location }}
                  </p>
                </div>
              </div>

              <!-- Amount -->
              <div class="amount-row">
                <span class="amount-label">Total Amount</span>
                <span class="amount-val">
                  ₱{{ (Number(tx.Daily_Rate) * Number(tx.Rental_Duration)).toLocaleString() }}
                </span>
              </div>

              <!-- Status Badge -->
              <div :class="['status-chip', statusChipClass(tx.Rental_Status)]">
                {{ tx.Rental_Status }}
              </div>

              <!-- Actions (only for Pending) -->
              <div class="req-actions" v-if="tx.Rental_Status === 'Pending'">
                <button class="btn-decline" @click="updateStatus(tx, 'Cancelled')"
                  :disabled="loadingId === tx.Transaction_ID">
                  Decline
                </button>
                <button class="btn-confirm" @click="updateStatus(tx, 'Confirmed')"
                  :disabled="loadingId === tx.Transaction_ID">
                  {{ loadingId === tx.Transaction_ID ? '...' : '✓ Confirm' }}
                </button>
              </div>

              <!-- Ongoing / Complete -->
              <div class="req-actions" v-if="tx.Rental_Status === 'Confirmed'">
                <button class="btn-ongoing" @click="updateStatus(tx, 'Ongoing')"
                  :disabled="loadingId === tx.Transaction_ID">
                  Start Rental 🚗
                </button>
              </div>
              <div class="req-actions" v-if="tx.Rental_Status === 'Ongoing'">
                <button class="btn-complete" @click="updateStatus(tx, 'Completed')"
                  :disabled="loadingId === tx.Transaction_ID">
                  Mark as Completed ✓
                </button>
              </div>

            </div>
          </div>

        </div>
        <div style="height: 80px"></div>
      </div>
    </ion-content>

    <!-- Tab Bar -->
    <div class="tab-bar">
      <div class="tab-item" @click="goTo('/dashboard')">
        <ion-icon name="grid-outline"></ion-icon>
        <span>Dashboard</span>
      </div>
      <div class="tab-item active" @click="goTo('/transaction-requests')">
        <div class="notif-wrap">
          <ion-icon name="receipt-outline"></ion-icon>
          <div class="tab-badge-bar" v-if="countFor('Pending') > 0">{{ countFor('Pending') }}</div>
        </div>
        <span>Requests</span>
      </div>
      <div class="tab-item" @click="goTo('/post')">
        <div class="plus-btn">
          <ion-icon name="add-outline"></ion-icon>
        </div>
        <span>Post</span>
      </div>
      <div class="tab-item" @click="goTo('/listings')">
        <ion-icon name="list-outline"></ion-icon>
        <span>Listings</span>
      </div>
      <div class="tab-item" @click="goTo('/booking-history')">
        <ion-icon name="bar-chart-outline"></ion-icon>
        <span>Reports</span>
      </div>
    </div>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { IonPage, IonContent, IonIcon, useIonRouter, onIonViewWillEnter } from '@ionic/vue'
import { addIcons } from 'ionicons'
import {
  arrowBackOutline, carOutline, gridOutline,
  receiptOutline, addOutline, listOutline, barChartOutline
} from 'ionicons/icons'
import { transactionAPI } from '@/api'

addIcons({
  'arrow-back-outline': arrowBackOutline,
  'car-outline': carOutline,
  'grid-outline': gridOutline,
  'receipt-outline': receiptOutline,
  'add-outline': addOutline,
  'list-outline': listOutline,
  'bar-chart-outline': barChartOutline,
})

const router = useIonRouter()
const activeTab = ref('Pending')
const isLoading = ref(false)
const loadingId = ref('')
const transactions = ref<any[]>([])

const tabs = [
  { key: 'Pending', label: 'Pending' },
  { key: 'Confirmed', label: 'Confirmed' },
  { key: 'Ongoing', label: 'Ongoing' },
  { key: 'Completed', label: 'Done' },
  { key: 'Cancelled', label: 'Declined' },
]

const filtered = computed(() =>
  transactions.value.filter(tx => tx.Rental_Status === activeTab.value)
)

const countFor = (status: string) =>
  transactions.value.filter(tx => tx.Rental_Status === status).length

const emptyFor = (status: string) => {
  const map: Record<string, any> = {
    Pending: { icon: '🕐', title: 'No pending requests', sub: 'New booking requests will appear here.' },
    Confirmed: { icon: '✅', title: 'No confirmed bookings', sub: 'Confirmed requests will appear here.' },
    Ongoing: { icon: '🚗', title: 'No ongoing rentals', sub: 'Active rentals will appear here.' },
    Completed: { icon: '✔', title: 'No completed rentals', sub: 'Completed transactions will appear here.' },
    Cancelled: { icon: '❌', title: 'No declined requests', sub: 'Declined requests will appear here.' },
  }
  return map[status] || { icon: '📋', title: 'Nothing here', sub: '' }
}

const statusBorderClass = (status: string) => {
  const map: Record<string, string> = {
    Pending: 'border-pending', Confirmed: 'border-confirmed',
    Ongoing: 'border-ongoing', Completed: 'border-done', Cancelled: 'border-cancelled'
  }
  return map[status] || ''
}

const statusChipClass = (status: string) => {
  const map: Record<string, string> = {
    Pending: 'chip-pending', Confirmed: 'chip-confirmed',
    Ongoing: 'chip-ongoing', Completed: 'chip-done', Cancelled: 'chip-cancelled'
  }
  return map[status] || ''
}

const getInitials = (name: string) =>
  name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'

const formatDate = (dt: string) => {
  if (!dt) return '—'
  return new Date(dt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatDateTime = (dt: string) => {
  if (!dt) return '—'
  return new Date(dt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
}

const loadTransactions = async () => {
  isLoading.value = true
  try {
    const res = await transactionAPI.getAll()
    // Filter to only show transactions where logged in user is the OWNER
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const all = res.data.data ?? res.data
    transactions.value = all.filter((tx: any) => tx.Owner_Account_ID === user.account_id)
  } catch (err) {
    console.error('Failed to load requests', err)
  } finally {
    isLoading.value = false
  }
}

const updateStatus = async (tx: any, status: 'Confirmed' | 'Ongoing' | 'Completed' | 'Cancelled') => {
  loadingId.value = tx.Transaction_ID
  try {
    await transactionAPI.updateStatus(tx.Transaction_ID, status)
    tx.Rental_Status = status
    activeTab.value = status === 'Cancelled' ? 'Cancelled' : status
  } catch (err: any) {
    console.error(err.response?.data?.message || 'Failed')
  } finally {
    loadingId.value = ''
  }
}

const goBack = () => router.push('/dashboard')
const goTo = (path: string) => router.push(path)

onIonViewWillEnter(loadTransactions)
onMounted(loadTransactions)
</script>

<style scoped>
.page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  padding-bottom: 80px;
}

.bg-mobile {
  display: block;
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
  opacity: 0.9;
}

.bg-web {
  display: none;
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
  opacity: 0.9;
}

@media (min-width: 768px) {
  .bg-mobile {
    display: none;
  }

  .bg-web {
    display: block;
  }
}

.container {
  position: relative;
  z-index: 1;
  padding: 48px 16px 20px;
}

.post-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.back-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #ffffff;
  font-size: 20px;
  flex-shrink: 0;
}

.header-title {
  font-family: 'Gil Sans MT', sans-serif;
  color: #ffffff;
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}

/* Tabs */
.tab-row {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  margin-bottom: 16px;
  scrollbar-width: none;
  padding-bottom: 4px;
}

.tab-row::-webkit-scrollbar {
  display: none;
}

.tab {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 7px 14px;
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  white-space: nowrap;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-family: 'Gil Sans MT', sans-serif;
  transition: all 0.2s;
  flex-shrink: 0;
}

.tab-active {
  background: #b70b67;
  border-color: #b70b67;
  color: #ffffff;
}

.tab-badge {
  background: rgba(255, 255, 255, 0.3);
  color: #ffffff;
  font-size: 10px;
  font-weight: 800;
  border-radius: 10px;
  padding: 1px 6px;
}

/* Glass Card */
.glass-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 18px;
  padding: 14px;
  margin-bottom: 12px;
}

.center-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  gap: 8px;
  text-align: center;
}

.center-txt {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  font-family: 'Gil Sans MT', sans-serif;
}

.empty-icon {
  font-size: 48px;
}

.empty-title {
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  font-family: 'Gil Sans MT', sans-serif;
}

.empty-sub {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
  font-family: 'Gil Sans MT', sans-serif;
}

/* Border variants */
.req-card {
  border-left: 4px solid rgba(255, 255, 255, 0.2);
}

.border-pending {
  border-left-color: #f0c87c;
}

.border-confirmed {
  border-left-color: #fc89d0;
}

.border-ongoing {
  border-left-color: #a8e07c;
}

.border-done {
  border-left-color: rgba(255, 255, 255, 0.3);
}

.border-cancelled {
  border-left-color: #ff9090;
}

/* Request Top */
.req-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.req-avatar {
  width: 38px;
  height: 38px;
  background: rgba(183, 11, 103, 0.4);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 800;
  color: #ffffff;
  flex-shrink: 0;
  font-family: 'Gil Sans MT', sans-serif;
}

.req-info {
  flex: 1;
}

.req-name {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 2px;
}

.req-contact {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

.req-submitted {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
}

/* Vehicle Row */
.vehicle-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 10px 12px;
  margin-bottom: 10px;
}

.v-icon {
  font-size: 22px;
  color: rgba(255, 255, 255, 0.5);
  flex-shrink: 0;
  margin-top: 2px;
}

.v-name {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 4px;
}

.v-dates,
.v-meta {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 3px;
}

/* Amount */
.amount-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 10px;
}

.amount-label {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.amount-val {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 18px;
  font-weight: 800;
  color: #fc89d0;
}

/* Status Chip */
.status-chip {
  display: inline-block;
  border-radius: 10px;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 700;
  font-family: 'Gil Sans MT', sans-serif;
  margin-bottom: 10px;
}

.chip-pending {
  background: rgba(240, 200, 124, 0.2);
  color: #f0c87c;
}

.chip-confirmed {
  background: rgba(252, 137, 208, 0.2);
  color: #fc89d0;
}

.chip-ongoing {
  background: rgba(168, 224, 124, 0.2);
  color: #a8e07c;
}

.chip-done {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
}

.chip-cancelled {
  background: rgba(255, 144, 144, 0.2);
  color: #ff9090;
}

/* Actions */
.req-actions {
  display: flex;
  gap: 8px;
}

.btn-decline {
  flex: 1;
  padding: 10px;
  background: transparent;
  border: 1px solid #ff9090;
  border-radius: 10px;
  color: #ff9090;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  font-family: 'Gil Sans MT', sans-serif;
}

.btn-confirm {
  flex: 2;
  padding: 10px;
  background: #b70b67;
  border: none;
  border-radius: 10px;
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  font-family: 'Gil Sans MT', sans-serif;
}

.btn-ongoing {
  flex: 1;
  padding: 10px;
  background: rgba(168, 224, 124, 0.2);
  border: 1px solid #a8e07c;
  border-radius: 10px;
  color: #a8e07c;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  font-family: 'Gil Sans MT', sans-serif;
}

.btn-complete {
  flex: 1;
  padding: 10px;
  background: rgba(168, 224, 124, 0.2);
  border: 1px solid #a8e07c;
  border-radius: 10px;
  color: #a8e07c;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  font-family: 'Gil Sans MT', sans-serif;
}

.btn-decline:disabled,
.btn-confirm:disabled,
.btn-ongoing:disabled,
.btn-complete:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Tab Bar */
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: rgba(20, 10, 30, 0.92);
  backdrop-filter: blur(16px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
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
  color: rgba(255, 255, 255, 0.4);
  font-size: 10px;
  font-family: 'Gil Sans MT', sans-serif;
}

.tab-item ion-icon {
  font-size: 22px;
}

.tab-item.active {
  color: #fc89d0;
}

.notif-wrap {
  position: relative;
}

.tab-badge-bar {
  position: absolute;
  top: -4px;
  right: -6px;
  background: #fc89d0;
  color: #fff;
  font-size: 9px;
  font-weight: 800;
  border-radius: 10px;
  padding: 1px 5px;
}

.plus-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #b70b67;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -24px;
  box-shadow: 0 4px 12px rgba(183, 11, 103, 0.5);
}

.plus-btn ion-icon {
  font-size: 26px;
  color: #ffffff;
}
</style>