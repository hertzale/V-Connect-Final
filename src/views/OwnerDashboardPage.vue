<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="page">

        <img src="@/assets/new-bg.png" alt="Vcon Background" class="bg-mobile" />
        <img src="@/assets/v-connect-bg-web.png" class="bg-web" />

        <div class="container">

          <!-- Header -->
          <div class="dash-header">
            <div>
              <p class="header-sub">Business Dashboard</p>
              <h1 class="header-name">{{ userName }} 🏢</h1>
            </div>
            <div class="avatar-wrapper">
              <div class="avatar" @click="toggleMenu">{{ userInitials }}</div>
              <div class="dropdown-menu" v-if="showMenu">
                <div class="dropdown-item" @click="goToProfile">
                  <ion-icon name="person-outline"></ion-icon>
                  <span>Business Profile</span>
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

          <!-- Stats -->
          <div class="stats-row">
            <div class="stat-card">
              <p class="stat-val">{{ totalVehicles }}</p>
              <p class="stat-lbl">Vehicles</p>
            </div>
            <div class="stat-card highlight">
              <p class="stat-val pink">{{ pendingCount }}</p>
              <p class="stat-lbl">Pending</p>
            </div>
            <div class="stat-card">
              <p class="stat-val">{{ ongoingCount }}</p>
              <p class="stat-lbl">Ongoing</p>
            </div>
            <div class="stat-card">
              <p class="stat-val">{{ completedCount }}</p>
              <p class="stat-lbl">Done</p>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="section-label">Quick Actions</div>
          <div class="quick-actions">
            <div class="qa-card" @click="goTo('/post')">
              <div class="qa-icon" style="background: rgba(183,11,103,0.3)">➕</div>
              <span>Post Vehicle</span>
            </div>
            <div class="qa-card" @click="goTo('/listings')">
              <div class="qa-icon" style="background: rgba(24,95,165,0.3)">📋</div>
              <span>My Listings</span>
            </div>
            <div class="qa-card" @click="goTo('/transaction-requests')">
              <div class="qa-icon" style="background: rgba(186,117,23,0.3)">🔔</div>
              <div class="qa-badge" v-if="pendingCount > 0">{{ pendingCount }}</div>
              <span>Requests</span>
            </div>
            <div class="qa-card" @click="goTo('/booking-history')">
              <div class="qa-icon" style="background: rgba(59,109,17,0.3)">📊</div>
              <span>Reports</span>
            </div>
          </div>

          <!-- Pending Requests -->
          <div v-if="pendingRequests.length > 0">
            <div class="section-label">
              Pending Requests
              <span class="see-all" @click="goTo('/transaction-requests')">See all</span>
            </div>
            <div
              v-for="req in pendingRequests.slice(0, 3)"
              :key="req.Transaction_ID"
              class="glass-card req-card"
            >
              <div class="req-top">
                <div class="req-avatar">{{ getInitials(req.Customer_Name) }}</div>
                <div class="req-info">
                  <p class="req-name">{{ req.Customer_Name }}</p>
                  <p class="req-vehicle">{{ req.Vehicle_Model }}</p>
                </div>
                <p class="req-time">{{ formatDate(req.Transaction_Date) }}</p>
              </div>
              <div class="req-dates">
                📅 {{ formatDate(req.Start_Date) }} → {{ formatDate(req.End_Date) }}
                · {{ req.Rental_Duration }} day(s)
              </div>
              <div class="req-actions">
                <button class="btn-decline" @click="updateStatus(req, 'Cancelled')" :disabled="loadingId === req.Transaction_ID">
                  Decline
                </button>
                <button class="btn-confirm" @click="updateStatus(req, 'Reserved')" :disabled="loadingId === req.Transaction_ID">
                  ✓ Confirm
                </button>
              </div>
            </div>
          </div>

          <!-- My Vehicles Summary -->
          <div v-if="myVehicles.length > 0">
            <div class="section-label">
              My Vehicles
              <span class="see-all" @click="goTo('/listings')">See all</span>
            </div>
            <div
              v-for="v in myVehicles.slice(0, 3)"
              :key="v.Vehicle_ID"
              class="glass-card vehicle-row"
            >
              <div class="vr-icon">
                <ion-icon name="car-outline"></ion-icon>
              </div>
              <div class="vr-info">
                <p class="vr-name">{{ v.Vehicle_Model }}</p>
                <p class="vr-meta">{{ v.Vehicle_Type }} · ₱{{ v.Daily_Rate }}/day</p>
              </div>
              <span :class="['vr-status', getStatusClass(v.Vehicle_Status)]">
                {{ v.Vehicle_Status }}
              </span>
            </div>
          </div>

          <!-- Recent Transactions -->
          <div v-if="recentTransactions.length > 0">
            <div class="section-label">
              Recent Transactions
              <span class="see-all" @click="goTo('/booking-history')">See all</span>
            </div>
            <div
              v-for="tx in recentTransactions.slice(0, 3)"
              :key="tx.Transaction_ID"
              class="glass-card tx-row"
            >
              <div class="tx-info">
                <p class="tx-vehicle">{{ tx.Vehicle_Model }}</p>
                <p class="tx-customer">{{ tx.Customer_Name }} · {{ formatDate(tx.Start_Date) }}</p>
              </div>
              <div class="tx-right">
                <p class="tx-amount">₱{{ Number(tx.Total_Amount).toLocaleString() }}</p>
                <span :class="['tx-status', getStatusClass(tx.Rental_Status)]">{{ tx.Rental_Status }}</span>
              </div>
            </div>
          </div>

        </div>
        <div style="height: 80px"></div>
      </div>
    </ion-content>

    <!-- Tab Bar -->
    <div class="tab-bar">
      <div class="tab-item active" @click="goTo('/owner-dashboard')">
        <ion-icon name="grid-outline"></ion-icon>
        <span>Dashboard</span>
      </div>
      <div class="tab-item" @click="goTo('/transaction-requests')">
        <div class="notif-wrap">
          <ion-icon name="receipt-outline"></ion-icon>
          <div class="tab-badge" v-if="pendingCount > 0">{{ pendingCount }}</div>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { IonPage, IonContent, IonIcon, useIonRouter, onIonViewWillEnter } from '@ionic/vue'
import { addIcons } from 'ionicons'
import {
  gridOutline, receiptOutline, addOutline,
  listOutline, barChartOutline, carOutline,
  personOutline, settingsOutline, logOutOutline 
} from 'ionicons/icons'
import { transactionAPI, vehicleAPI } from '@/api'

addIcons({
  'grid-outline': gridOutline,
  'receipt-outline': receiptOutline,
  'add-outline': addOutline,
  'list-outline': listOutline,
  'bar-chart-outline': barChartOutline,
  'car-outline': carOutline,
  'person-outline': personOutline,
  'settings-outline': settingsOutline,
  'log-out-outline': logOutOutline
})

const router = useIonRouter()
const userName    = ref('Owner')
const userInitials = ref('OW')
const transactions = ref<any[]>([])
const myVehicles   = ref<any[]>([])
const loadingId    = ref('')
const showMenu       = ref(false)

const toggleMenu = () => { showMenu.value = !showMenu.value }
const goToProfile = () => { router.push('/business-profile')}
const goToSettings = () => { router.push('/settings') }


const loadUser = () => {
  const u = localStorage.getItem('user')
  if (u) {
    const user = JSON.parse(u)
    userName.value     = user.Person_Name || 'Owner'
    const names        = user.Person_Name?.split(' ') || ['O']
    userInitials.value = names.map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  }
}

const pendingRequests = computed(() =>
  transactions.value.filter(tx => tx.Rental_Status === 'Pending')
)
const pendingCount   = computed(() => pendingRequests.value.length)
const ongoingCount   = computed(() => transactions.value.filter(tx => tx.Rental_Status === 'Ongoing').length)
const completedCount = computed(() => transactions.value.filter(tx => tx.Rental_Status === 'Completed').length)
const totalVehicles  = computed(() => myVehicles.value.length)
const recentTransactions = computed(() =>
  transactions.value.filter(tx => tx.Rental_Status !== 'Pending')
)

const loadData = async () => {
  try {
    const [txRes, vRes] = await Promise.all([
      transactionAPI.getAll(),
      vehicleAPI.getMy()
    ])
    transactions.value = txRes.data.data ?? txRes.data
    myVehicles.value   = vRes.data.data  ?? vRes.data
  } catch (err) {
    console.error('Failed to load dashboard', err)
  }
}

const updateStatus = async (tx: any, status: 'Reserved' | 'Ongoing' | 'Completed' | 'Cancelled') => {
  loadingId.value = tx.Transaction_ID
  try {
    await transactionAPI.updateStatus(tx.Transaction_ID, status)
    tx.Rental_Status = status
  } catch (err: any) {
    console.error(err.response?.data?.message || 'Failed')
  } finally {
    loadingId.value = ''
  }
}

const getInitials = (name: string) =>
  name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'

const formatDate = (dt: string) => {
  if (!dt) return '—'
  return new Date(dt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
}

const getStatusClass = (status: string) => {
  const map: Record<string, string> = {
    Available: 'status-available',
    Rented: 'status-rented',
    'Under Maintenance': 'status-maintenance',
    Pending: 'status-pending',
    Reserved: 'status-confirmed',
    Ongoing: 'status-ongoing',
    Completed: 'status-done',
    Cancelled: 'status-cancelled',
  }
  return map[status] || ''
}

const logout = () => {
  showMenu.value = false
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}

const closeMenu = (e: Event) => {
  if (!(e.target as HTMLElement).closest('.avatar-wrapper')) {
    showMenu.value = false
  }
}

const goTo = (path: string) => router.push(path)

onIonViewWillEnter(() => { loadUser(); loadData() })
onMounted(() => { 
  loadUser(); 
  loadData() 
  document.addEventListener('click', closeMenu)
  })
onUnmounted(() => {
  document.removeEventListener('click', closeMenu)
})
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

.container {
  position: relative;
  z-index: 1;
  padding: 48px 16px 20px;
}

/* Header */
.dash-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}
.header-sub {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 12px;
  color: rgba(255,255,255,0.5);
  margin: 0 0 3px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.header-name {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
}
/* Avatar & Dropdown */
.avatar-wrapper { position: relative; z-index: 999; }
.avatar {
  width: 44px; height: 44px;
  border-radius: 14px;
  background: #b70b67; color: #ffffff;
  display: flex; align-items: center; justify-content: center;
  font-size: 15px; font-weight: 800; cursor: pointer;
  font-family: 'Gil Sans MT', sans-serif;
}
.dropdown-menu {
  position: absolute; top: 54px; right: 0;
  background: #ffffff; border-radius: 14px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  min-width: 180px; overflow: hidden; z-index: 200;
}
.dropdown-item {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 16px; cursor: pointer;
  font-size: 14px; color: #1a1a2e; transition: background 0.2s;
  font-family: 'Gil Sans MT', sans-serif;
}
.dropdown-item:hover { background: #f4f6f9; }
.dropdown-item ion-icon { font-size: 18px; color: #1a3a5c; }
.dropdown-divider { height: 0.5px; background: #e0e0e0; margin: 4px 0; }
.dropdown-item.logout { color: #a83434; }
.dropdown-item.logout ion-icon { color: #a83434; }
/* Stats */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 20px;
}
.stat-card {
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 14px;
  padding: 12px 8px;
  text-align: center;
}
.stat-card.highlight { border-color: rgba(252,137,208,0.4); }
.stat-val {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 3px;
}
.stat-val.pink { color: #fc89d0; }
.stat-lbl {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 10px;
  color: rgba(255,255,255,0.5);
  margin: 0;
}

/* Section Label */
.section-label {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: rgba(255,255,255,0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.see-all {
  font-size: 12px;
  color: #fc89d0;
  cursor: pointer;
  text-transform: none;
  letter-spacing: 0;
}

/* Quick Actions */
.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}
.qa-card {
  background: rgba(255,255,255,0.12);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 16px;
  padding: 14px 8px;
  text-align: center;
  cursor: pointer;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: all 0.15s;
}
.qa-card:active { transform: scale(0.96); }
.qa-icon {
  width: 44px; height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}
.qa-card span {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 10px;
  font-weight: 700;
  color: rgba(255,255,255,0.8);
}
.qa-badge {
  position: absolute;
  top: 6px; right: 6px;
  background: #fc89d0;
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  border-radius: 10px;
  padding: 1px 5px;
}

/* Glass Card */
.glass-card {
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 16px;
  padding: 14px;
  margin-bottom: 10px;
}

/* Request Card */
.req-card { border-left: 4px solid #f0c87c; }
.req-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.req-avatar {
  width: 36px; height: 36px;
  background: rgba(183,11,103,0.4);
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
.req-info { flex: 1; }
.req-name {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 2px;
}
.req-vehicle {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 12px;
  color: rgba(255,255,255,0.6);
  margin: 0;
}
.req-time {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 11px;
  color: rgba(255,255,255,0.4);
  margin: 0;
}
.req-dates {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 12px;
  color: rgba(255,255,255,0.6);
  margin-bottom: 10px;
}
.req-actions { display: flex; gap: 8px; }
.btn-decline {
  flex: 1;
  padding: 8px;
  background: transparent;
  border: 1px solid #ff9090;
  border-radius: 10px;
  color: #ff9090;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  font-family: 'Gil Sans MT', sans-serif;
}
.btn-confirm {
  flex: 2;
  padding: 8px;
  background: #b70b67;
  border: none;
  border-radius: 10px;
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  font-family: 'Gil Sans MT', sans-serif;
}
.btn-decline:disabled,
.btn-confirm:disabled { opacity: 0.5; cursor: not-allowed; }

/* Vehicle Row */
.vehicle-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.vr-icon {
  width: 40px; height: 40px;
  background: rgba(255,255,255,0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: rgba(255,255,255,0.6);
  flex-shrink: 0;
}
.vr-info { flex: 1; }
.vr-name {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 2px;
}
.vr-meta {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 11px;
  color: rgba(255,255,255,0.5);
  margin: 0;
}

/* Transaction Row */
.tx-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.tx-vehicle {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 2px;
}
.tx-customer {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 11px;
  color: rgba(255,255,255,0.5);
  margin: 0;
}
.tx-right { text-align: right; }
.tx-amount {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 15px;
  font-weight: 800;
  color: #fc89d0;
  margin: 0 0 3px;
}

/* Status badges */
.vr-status, .tx-status {
  font-size: 10px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 8px;
  font-family: 'Gil Sans MT', sans-serif;
}
.status-available  { background: rgba(59,109,17,0.3);  color: #a8e07c; }
.status-rented     { background: rgba(24,95,165,0.3);  color: #7cb8f0; }
.status-maintenance{ background: rgba(186,117,23,0.3); color: #f0c87c; }
.status-pending    { background: rgba(240,200,124,0.2);color: #f0c87c; }
.status-confirmed  { background: rgba(252,137,208,0.2);color: #fc89d0; }
.status-ongoing    { background: rgba(168,224,124,0.2);color: #a8e07c; }
.status-done       { background: rgba(255,255,255,0.1);color: rgba(255,255,255,0.5); }
.status-cancelled  { background: rgba(255,144,144,0.2);color: #ff9090; }

/* Tab Bar */
.tab-bar {
  position: fixed;
  bottom: 0; left: 0; width: 100%;
  background: rgba(20,10,30,0.92);
  backdrop-filter: blur(16px);
  border-top: 1px solid rgba(255,255,255,0.1);
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
  color: rgba(255,255,255,0.4);
  font-size: 10px;
  font-family: 'Gil Sans MT', sans-serif;
}
.tab-item ion-icon { font-size: 22px; }
.tab-item.active { color: #fc89d0; }
.notif-wrap { position: relative; }
.tab-badge {
  position: absolute;
  top: -4px; right: -6px;
  background: #fc89d0;
  color: #fff;
  font-size: 9px;
  font-weight: 800;
  border-radius: 10px;
  padding: 1px 5px;
}
.plus-btn {
  width: 48px; height: 48px;
  border-radius: 50%;
  background: #b70b67;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -24px;
  box-shadow: 0 4px 12px rgba(183,11,103,0.5);
}
.plus-btn ion-icon { font-size: 26px; color: #ffffff; }
</style>