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
            <h1 class="header-title">Search & Reports</h1>
          </div>

          <!-- Search & Filter Card -->
          <div class="glass-card filter-card">
            <p class="card-label">Search Transactions</p>

            <!-- Keyword search -->
            <div class="search-row">
              <ion-icon name="search-outline" class="search-icon"></ion-icon>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search by vehicle, customer..."
                class="search-input"
                @input="applyFilters"
              />
            </div>

            <!-- Date Range -->
            <div class="date-row">
              <div class="date-field">
                <p class="df-label">📅 Date From</p>
                <input v-model="dateFrom" type="date" class="input-field" @change="applyFilters" />
              </div>
              <div class="date-arrow">→</div>
              <div class="date-field">
                <p class="df-label">📅 Date To</p>
                <input v-model="dateTo" type="date" class="input-field" @change="applyFilters" />
              </div>
            </div>

            <!-- Status Filter -->
            <div class="status-filter-row">
              <div
                v-for="f in statusFilters"
                :key="f"
                :class="['status-pill', statusFilter === f ? 'pill-active' : '']"
                @click="statusFilter = f; applyFilters()"
              >{{ f }}</div>
            </div>

            <button class="btn-clear" @click="clearFilters" v-if="hasActiveFilters">
              Clear Filters ✕
            </button>
          </div>

          <!-- Summary -->
          <div class="glass-card summary-row" v-if="filtered.length > 0">
            <div class="summary-item">
              <p class="sum-val">{{ filtered.length }}</p>
              <p class="sum-lbl">Records</p>
            </div>
            <div class="sum-divider"></div>
            <div class="summary-item">
              <p class="sum-val pink">₱{{ totalRevenue.toLocaleString() }}</p>
              <p class="sum-lbl">Total Revenue</p>
            </div>
            <div class="sum-divider"></div>
            <div class="summary-item">
              <p class="sum-val">{{ completedCount }}</p>
              <p class="sum-lbl">Completed</p>
            </div>
          </div>

          <!-- Loading -->
          <div class="glass-card center-card" v-if="isLoading">
            <p class="center-txt">Loading transactions...</p>
          </div>

          <!-- Empty -->
          <div class="glass-card center-card" v-else-if="filtered.length === 0">
            <div class="empty-icon">📊</div>
            <p class="empty-title">No records found</p>
            <p class="empty-sub">Try adjusting your search or date range.</p>
          </div>

          <!-- Results -->
          <div v-else>
            <p class="results-label">Showing {{ filtered.length }} result(s)</p>
            <div
              v-for="tx in filtered"
              :key="tx.Transaction_ID"
              class="glass-card tx-card"
              :class="statusBorderClass(tx.Rental_Status)"
            >
              <div class="tx-top">
                <div class="tx-icon">
                  <ion-icon name="car-outline"></ion-icon>
                </div>
                <div class="tx-info">
                  <p class="tx-vehicle">{{ tx.Vehicle_Model }}</p>
                  <p class="tx-person">
                    {{ isOwnerView ? tx.Customer_Name : tx.Owner_Name }}
                  </p>
                </div>
                <div :class="['status-chip', statusChipClass(tx.Rental_Status)]">
                  {{ tx.Rental_Status }}
                </div>
              </div>

              <div class="tx-divider"></div>

              <div class="tx-details">
                <div class="tx-row-detail">
                  <ion-icon name="calendar-outline" class="td-icon"></ion-icon>
                  <span>{{ formatDate(tx.Start_Date_and_Time) }} → {{ formatDate(tx.End_Date_and_Time) }}</span>
                </div>
                <div class="tx-row-detail">
                  <ion-icon name="time-outline" class="td-icon"></ion-icon>
                  <span>{{ tx.Rental_Duration }} day(s)</span>
                </div>
                <div class="tx-row-detail">
                  <ion-icon name="location-outline" class="td-icon"></ion-icon>
                  <span>{{ tx.Pickup_Location }}</span>
                </div>
                <div class="tx-row-detail">
                  <ion-icon name="receipt-outline" class="td-icon"></ion-icon>
                  <span>Transaction ID: {{ tx.Transaction_ID }}</span>
                </div>
              </div>

              <div class="tx-footer">
                <div>
                  <p class="tx-date-label">Transaction Date</p>
                  <p class="tx-date">{{ formatDate(tx.Transaction_Date) }}</p>
                </div>
                <p class="tx-amount">₱{{ (Number(tx.Daily_Rate) * Number(tx.Rental_Duration)).toLocaleString() }}</p>
              </div>
            </div>
          </div>

        </div>
        <div style="height: 80px"></div>
      </div>
    </ion-content>

    <!-- Tab Bar -->
    <div class="tab-bar">
      <div class="tab-item" @click="goTo('/owner-dashboard')">
        <ion-icon name="grid-outline"></ion-icon>
        <span>Dashboard</span>
      </div>
      <div class="tab-item" @click="goTo('/transaction-requests')">
        <ion-icon name="receipt-outline"></ion-icon>
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
      <div class="tab-item active" @click="goTo('/booking-history')">
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
  arrowBackOutline, searchOutline, carOutline,
  calendarOutline, timeOutline, locationOutline,
  receiptOutline, gridOutline, addOutline,
  listOutline, barChartOutline
} from 'ionicons/icons'
import { transactionAPI } from '@/api'

addIcons({
  'arrow-back-outline': arrowBackOutline,
  'search-outline': searchOutline,
  'car-outline': carOutline,
  'calendar-outline': calendarOutline,
  'time-outline': timeOutline,
  'location-outline': locationOutline,
  'receipt-outline': receiptOutline,
  'grid-outline': gridOutline,
  'add-outline': addOutline,
  'list-outline': listOutline,
  'bar-chart-outline': barChartOutline,
})

const router       = useIonRouter()
const isLoading    = ref(false)
const searchQuery  = ref('')
const dateFrom     = ref('')
const dateTo       = ref('')
const statusFilter = ref('All')
const allTransactions = ref<any[]>([])
const filtered        = ref<any[]>([])

const statusFilters = ['All', 'Pending', 'Confirmed', 'Ongoing', 'Completed', 'Cancelled']

const currentUser = () => JSON.parse(localStorage.getItem('user') || '{}')
const isOwnerView = computed(() => currentUser().role === 'Business_Owner')

const hasActiveFilters = computed(() =>
  searchQuery.value || dateFrom.value || dateTo.value || statusFilter.value !== 'All'
)

const totalRevenue = computed(() =>
  filtered.value
    .filter(tx => tx.Rental_Status === 'Completed')
    .reduce((sum, tx) => sum + Number(tx.Daily_Rate) * Number(tx.Rental_Duration), 0)
)

const completedCount = computed(() =>
  filtered.value.filter(tx => tx.Rental_Status === 'Completed').length
)

const applyFilters = () => {
  let result = [...allTransactions.value]

  // Keyword search
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(tx =>
      tx.Vehicle_Model?.toLowerCase().includes(q) ||
      tx.Customer_Name?.toLowerCase().includes(q) ||
      tx.Owner_Name?.toLowerCase().includes(q) ||
      tx.Transaction_ID?.toLowerCase().includes(q) ||
      tx.Pickup_Location?.toLowerCase().includes(q)
    )
  }

  // Date From
  if (dateFrom.value) {
    result = result.filter(tx =>
      new Date(tx.Transaction_Date) >= new Date(dateFrom.value)
    )
  }

  // Date To
  if (dateTo.value) {
    result = result.filter(tx =>
      new Date(tx.Transaction_Date) <= new Date(dateTo.value)
    )
  }

  // Status
  if (statusFilter.value !== 'All') {
    result = result.filter(tx => tx.Rental_Status === statusFilter.value)
  }

  filtered.value = result
}

const clearFilters = () => {
  searchQuery.value  = ''
  dateFrom.value     = ''
  dateTo.value       = ''
  statusFilter.value = 'All'
  filtered.value     = [...allTransactions.value]
}

const loadTransactions = async () => {
  isLoading.value = true
  try {
    const res = await transactionAPI.getAll()
    allTransactions.value = res.data.data ?? res.data
    filtered.value        = [...allTransactions.value]
  } catch (err) {
    console.error('Failed to load transactions', err)
  } finally {
    isLoading.value = false
  }
}

const formatDate = (dt: string) => {
  if (!dt) return '—'
  return new Date(dt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
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

const goBack = () => router.push('/owner-dashboard')
const goTo   = (path: string) => router.push(path)

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
.container { position: relative; z-index: 1; padding: 48px 16px 20px; }

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

/* Glass Card */
.glass-card {
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 18px; padding: 14px; margin-bottom: 12px;
}

/* Filter Card */
.filter-card { display: flex; flex-direction: column; gap: 12px; }
.card-label {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 12px; font-weight: 700;
  color: rgba(255,255,255,0.5);
  text-transform: uppercase; letter-spacing: 0.5px;
  margin: 0;
}

.search-row {
  display: flex; align-items: center; gap: 10px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 12px; padding: 10px 14px;
}
.search-icon { color: rgba(255,255,255,0.5); font-size: 18px; flex-shrink: 0; }
.search-input {
  flex: 1; background: transparent; border: none;
  outline: none; font-size: 14px; color: #ffffff;
  font-family: 'Gil Sans MT', sans-serif;
}
.search-input::placeholder { color: rgba(255,255,255,0.3); }

/* Date Row */
.date-row { display: flex; align-items: center; gap: 8px; }
.date-field { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.df-label {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 11px; color: rgba(255,255,255,0.5); font-weight: 600;
}
.date-arrow { font-size: 16px; color: rgba(255,255,255,0.4); flex-shrink: 0; }
.input-field {
  width: 100%;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 10px; padding: 8px 12px;
  font-size: 13px; color: #ffffff; outline: none;
  box-sizing: border-box; font-family: 'Gil Sans MT', sans-serif;
}

/* Status Pills */
.status-filter-row { display: flex; gap: 6px; flex-wrap: wrap; }
.status-pill {
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 16px; padding: 5px 12px;
  font-size: 11px; font-weight: 600;
  color: rgba(255,255,255,0.6);
  cursor: pointer; font-family: 'Gil Sans MT', sans-serif;
  transition: all 0.2s;
}
.pill-active { background: #b70b67; border-color: #b70b67; color: #ffffff; }

.btn-clear {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 20px; padding: 7px 16px;
  font-size: 12px; font-weight: 600;
  color: rgba(255,255,255,0.6);
  cursor: pointer; font-family: 'Gil Sans MT', sans-serif;
  align-self: flex-start;
}

/* Summary Row */
.summary-row {
  display: flex; align-items: center;
  justify-content: space-around; padding: 12px 0;
}
.summary-item { text-align: center; }
.sum-val {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 20px; font-weight: 800; color: #ffffff; margin: 0 0 3px;
}
.sum-val.pink { color: #fc89d0; }
.sum-lbl { font-size: 11px; color: rgba(255,255,255,0.5); font-family: 'Gil Sans MT', sans-serif; }
.sum-divider { width: 1px; height: 36px; background: rgba(255,255,255,0.15); }

.results-label {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 12px; color: rgba(255,255,255,0.5);
  margin-bottom: 10px; font-weight: 600;
}

/* Transaction Cards */
.tx-card { border-left: 4px solid rgba(255,255,255,0.2); }
.border-pending   { border-left-color: #f0c87c; }
.border-confirmed { border-left-color: #fc89d0; }
.border-ongoing   { border-left-color: #a8e07c; }
.border-done      { border-left-color: rgba(255,255,255,0.3); }
.border-cancelled { border-left-color: #ff9090; }

.tx-top { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.tx-icon {
  width: 38px; height: 38px;
  background: rgba(255,255,255,0.1);
  border-radius: 10px; display: flex;
  align-items: center; justify-content: center;
  font-size: 20px; color: rgba(255,255,255,0.6); flex-shrink: 0;
}
.tx-info { flex: 1; }
.tx-vehicle {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 14px; font-weight: 700; color: #ffffff; margin: 0 0 2px;
}
.tx-person {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 12px; color: rgba(255,255,255,0.5); margin: 0;
}

.status-chip {
  border-radius: 10px; padding: 4px 10px;
  font-size: 11px; font-weight: 700;
  font-family: 'Gil Sans MT', sans-serif;
}
.chip-pending   { background: rgba(240,200,124,0.2); color: #f0c87c; }
.chip-confirmed { background: rgba(252,137,208,0.2); color: #fc89d0; }
.chip-ongoing   { background: rgba(168,224,124,0.2); color: #a8e07c; }
.chip-done      { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.5); }
.chip-cancelled { background: rgba(255,144,144,0.2); color: #ff9090; }

.tx-divider { height: 1px; background: rgba(255,255,255,0.1); margin-bottom: 10px; }

.tx-details { display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px; }
.tx-row-detail {
  display: flex; align-items: center; gap: 8px;
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 12px; color: rgba(255,255,255,0.6);
}
.td-icon { color: #fc89d0; font-size: 13px; flex-shrink: 0; }

.tx-footer {
  display: flex; justify-content: space-between;
  align-items: center; padding-top: 10px;
  border-top: 1px solid rgba(255,255,255,0.1);
}
.tx-date-label {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 11px; color: rgba(255,255,255,0.4); margin: 0 0 2px;
}
.tx-date {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 13px; color: rgba(255,255,255,0.7); margin: 0;
}
.tx-amount {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 20px; font-weight: 800; color: #fc89d0; margin: 0;
}

/* Empty / Center */
.center-card {
  display: flex; flex-direction: column;
  align-items: center; padding: 40px 20px;
  gap: 8px; text-align: center;
}
.center-txt  { font-size: 14px; color: rgba(255,255,255,0.6); font-family: 'Gil Sans MT', sans-serif; }
.empty-icon  { font-size: 48px; }
.empty-title { font-size: 16px; font-weight: 700; color: #ffffff; margin: 0; font-family: 'Gil Sans MT', sans-serif; }
.empty-sub   { font-size: 13px; color: rgba(255,255,255,0.5); margin: 0; font-family: 'Gil Sans MT', sans-serif; }

/* Tab Bar */
.tab-bar {
  position: fixed; bottom: 0; left: 0; width: 100%;
  background: rgba(20,10,30,0.92); backdrop-filter: blur(16px);
  border-top: 1px solid rgba(255,255,255,0.1);
  display: flex; justify-content: space-around;
  padding: 10px 0; z-index: 100;
}
.tab-item {
  display: flex; flex-direction: column;
  align-items: center; gap: 4px;
  cursor: pointer; color: rgba(255,255,255,0.4);
  font-size: 10px; font-family: 'Gil Sans MT', sans-serif;
}
.tab-item ion-icon { font-size: 22px; }
.tab-item.active { color: #fc89d0; }
.plus-btn {
  width: 48px; height: 48px; border-radius: 50%;
  background: #b70b67; display: flex;
  align-items: center; justify-content: center;
  margin-top: -24px; box-shadow: 0 4px 12px rgba(183,11,103,0.5);
}
.plus-btn ion-icon { font-size: 26px; color: #ffffff; }
</style>