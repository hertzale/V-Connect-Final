<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="dash-toolbar">
        <div class="toolbar-inner">
          <div class="greeting">
            <p class="greeting-sub">Business Dashboard</p>
            <h1 class="greeting-name">AutoLux Rentals 🏢</h1>
          </div>
          <ion-avatar class="user-avatar" router-link="/business-profile">
            <div class="avatar-biz">AL</div>
          </ion-avatar>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="page-content">
      <ion-refresher slot="fixed" @ionRefresh="doRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <!-- Stats Overview -->
      <div class="stats-section">
        <div class="stats-grid">
          <div class="stat-card primary">
            <div class="sc-icon">💰</div>
            <div class="sc-val">₱24,500</div>
            <div class="sc-label">This Month</div>
            <div class="sc-change up">↑ 12% vs last month</div>
          </div>
          <div class="stat-card">
            <div class="sc-icon">📋</div>
            <div class="sc-val">{{ pendingCount }}</div>
            <div class="sc-label">Pending Requests</div>
          </div>
          <div class="stat-card">
            <div class="sc-icon">🚗</div>
            <div class="sc-val">{{ activeVehicles }}/{{ totalVehicles }}</div>
            <div class="sc-label">Vehicles Active</div>
          </div>
          <div class="stat-card">
            <div class="sc-icon">⭐</div>
            <div class="sc-val">4.8</div>
            <div class="sc-label">Avg Rating</div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="section">
        <h2 class="section-title">Quick Actions</h2>
        <div class="quick-actions">
          <div class="qa-card" router-link="/post-vehicle" @click="$router.push('/post')">
            <div class="qa-icon add">➕</div>
            <div class="qa-label">Add Vehicle</div>
          </div>
          <div class="qa-card" @click="$router.push('/listings')">
            <div class="qa-icon list">📋</div>
            <div class="qa-label">My Listings</div>
          </div>
          <div class="qa-card" @click="$router.push('/transaction-requests')">
            <div class="qa-icon req">🔔</div>
            <div class="qa-label">Requests</div>
            <div class="qa-badge" v-if="pendingCount">{{ pendingCount }}</div>
          </div>
          <div class="qa-card" @click="$router.push('/booking-history')">
            <div class="qa-icon hist">📊</div>
            <div class="qa-label">History</div>
          </div>
        </div>
      </div>

      <!-- Pending Requests -->
      <div class="section" v-if="pendingRequests.length > 0">
        <div class="section-header">
          <h2 class="section-title">Pending Requests</h2>
          <span class="section-link" @click="$router.push('/transaction-requests')">See all</span>
        </div>

        <div class="requests-list">
          <div v-for="req in pendingRequests" :key="req.id" class="request-card">
            <div class="req-header">
              <div class="req-avatar">{{ req.customerInitials }}</div>
              <div class="req-info">
                <div class="req-name">{{ req.customerName }}</div>
                <div class="req-vehicle">{{ req.vehicleName }}</div>
              </div>
              <div class="req-time">{{ req.time }}</div>
            </div>
            <div class="req-details">
              <span>📅 {{ req.startDate }} → {{ req.endDate }}</span>
              <span>· {{ req.days }} day(s)</span>
            </div>

            <!-- Offered Price (negotiated) -->
            <div class="req-price-row">
              <div class="req-price-info">
                <span class="rp-label">Offered Price:</span>
                <span class="rp-val" :class="req.negotiated ? 'negotiated' : ''">
                  ₱{{ req.offeredPrice }}/day
                </span>
                <span class="negotiated-tag" v-if="req.negotiated">🤝 Negotiated</span>
              </div>
              <span class="rp-listed">(Listed: ₱{{ req.listedPrice }})</span>
            </div>

            <div class="req-actions">
              <ion-button fill="outline" size="small" class="btn-reject" @click="rejectRequest(req)">
                Decline
              </ion-button>
              <ion-button fill="outline" size="small" class="btn-counter" @click="openCounter(req)">
                <ion-icon name="chatbubbles-outline" slot="start"></ion-icon>
                Counter
              </ion-button>
              <ion-button size="small" class="btn-approve" @click="approveRequest(req)">
                ✓ Approve
              </ion-button>
            </div>
          </div>
        </div>
      </div>

      <!-- Active Rentals -->
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">Active Rentals</h2>
          <span class="section-count">{{ activeRentals.length }} active</span>
        </div>

        <div class="active-rentals">
          <div v-for="rental in activeRentals" :key="rental.id" class="rental-row">
            <div class="rental-emoji">{{ rental.emoji }}</div>
            <div class="rental-info">
              <div class="rental-vehicle">{{ rental.vehicleName }}</div>
              <div class="rental-renter">Rented by {{ rental.renterName }}</div>
              <div class="rental-dates">{{ rental.startDate }} → {{ rental.endDate }}</div>
            </div>
            <div class="rental-amount">₱{{ rental.amount.toLocaleString() }}</div>
          </div>
        </div>
      </div>

      <!-- Revenue Chart Placeholder -->
      <div class="section">
        <h2 class="section-title">Booking Performance</h2>
        <div class="chart-placeholder">
          <div class="chart-bars">
            <div v-for="(bar, i) in chartBars" :key="i" class="chart-bar-wrap">
              <div class="chart-bar" :style="{ height: bar.height + 'px' }"></div>
              <div class="chart-bar-label">{{ bar.label }}</div>
            </div>
          </div>
          <div class="chart-legend">
            <span>📊 Monthly Bookings (Last 6 months)</span>
          </div>
        </div>
      </div>

      <div style="height: 80px"></div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonPage, IonHeader, IonToolbar, IonContent, IonAvatar,
  IonButton, IonIcon, IonRefresher, IonRefresherContent
} from '@ionic/vue'

const router = useRouter()

const totalVehicles = 12
const activeVehicles = 9

interface Request {
  id: number
  customerName: string
  customerInitials: string
  vehicleName: string
  startDate: string
  endDate: string
  days: number
  offeredPrice: number
  listedPrice: number
  negotiated: boolean
  time: string
  status: string
}

const pendingRequests = ref<Request[]>([
  {
    id: 1, customerName: 'Maria Santos', customerInitials: 'MS',
    vehicleName: 'Toyota Vios 2022', startDate: 'Jun 10', endDate: 'Jun 13',
    days: 3, offeredPrice: 750, listedPrice: 850, negotiated: true, time: '2h ago', status: 'pending'
  },
  {
    id: 2, customerName: 'Pedro Reyes', customerInitials: 'PR',
    vehicleName: 'Honda City 2021', startDate: 'Jun 15', endDate: 'Jun 16',
    days: 1, offeredPrice: 900, listedPrice: 900, negotiated: false, time: '5h ago', status: 'pending'
  },
])

const pendingCount = computed(() => pendingRequests.value.length)

const activeRentals = ref([
  { id: 1, vehicleName: 'Yamaha Mio 2023', emoji: '🏍️', renterName: 'Ana Cruz', startDate: 'Jun 5', endDate: 'Jun 7', amount: 800 },
  { id: 2, vehicleName: 'Toyota Innova', emoji: '🚌', renterName: 'Jose Bautista', startDate: 'Jun 4', endDate: 'Jun 6', amount: 3600 },
])

const chartBars = ref([
  { label: 'Jan', height: 40 },
  { label: 'Feb', height: 60 },
  { label: 'Mar', height: 45 },
  { label: 'Apr', height: 80 },
  { label: 'May', height: 65 },
  { label: 'Jun', height: 90 },
])

function approveRequest(req: Request) {
  pendingRequests.value = pendingRequests.value.filter(r => r.id !== req.id)
}

function rejectRequest(req: Request) {
  pendingRequests.value = pendingRequests.value.filter(r => r.id !== req.id)
}

function openCounter(req: Request) {
  router.push(`/negotiate/${req.id}`)
}

function doRefresh(event: any) {
  setTimeout(() => event.target.complete(), 1000)
}
</script>

<style scoped>
.page-content { --background: #f5f5f7; }

.dash-toolbar {
  --background: #fff;
  padding-bottom: 8px;
}
.toolbar-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px 8px;
}
.greeting-sub { font-size: 12px; color: #999; margin: 0 0 2px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
.greeting-name { font-size: 20px; font-weight: 800; color: #0f0f1a; margin: 0; }

.avatar-biz {
  width: 40px; height: 40px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 800;
  color: #fff;
  cursor: pointer;
}

/* Stats */
.stats-section { padding: 16px 16px 0; }
.stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

.stat-card {
  background: #fff;
  border-radius: 18px;
  padding: 16px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}
.stat-card.primary {
  background: linear-gradient(135deg, #0f0f1a, #1e1e3a);
  grid-column: span 2;
  display: flex;
  align-items: center;
  gap: 16px;
}
.stat-card.primary .sc-val { color: #fff; font-size: 28px; }
.stat-card.primary .sc-label { color: rgba(255,255,255,0.5); }

.sc-icon { font-size: 24px; margin-bottom: 6px; }
.stat-card.primary .sc-icon { font-size: 36px; margin-bottom: 0; }
.sc-val { font-size: 22px; font-weight: 800; color: #0f0f1a; margin-bottom: 2px; }
.sc-label { font-size: 12px; color: #999; }
.sc-change { font-size: 11px; font-weight: 700; margin-top: 4px; }
.sc-change.up { color: #00c896; }

/* Sections */
.section { padding: 20px 16px 0; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.section-title { font-size: 17px; font-weight: 800; color: #0f0f1a; margin: 0 0 14px; }
.section-link  { font-size: 13px; color: #00c896; font-weight: 600; cursor: pointer; }
.section-count { font-size: 13px; color: #999; }

/* Quick Actions */
.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}
.qa-card {
  background: #fff;
  border-radius: 16px;
  padding: 14px 8px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  cursor: pointer;
  position: relative;
}
.qa-icon { font-size: 24px; margin-bottom: 6px; }
.qa-label { font-size: 11px; font-weight: 700; color: #333; }
.qa-badge {
  position: absolute;
  top: 6px; right: 6px;
  background: #e05555;
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  border-radius: 10px;
  padding: 2px 5px;
}

/* Requests */
.requests-list { display: flex; flex-direction: column; gap: 12px; }
.request-card {
  background: #fff;
  border-radius: 18px;
  padding: 16px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  border-left: 4px solid #fbbf24;
}
.req-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.req-avatar {
  width: 38px; height: 38px;
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 800;
  color: #fff;
  flex-shrink: 0;
}
.req-info { flex: 1; }
.req-name { font-size: 14px; font-weight: 800; color: #0f0f1a; }
.req-vehicle { font-size: 12px; color: #999; }
.req-time { font-size: 11px; color: #bbb; }

.req-details { font-size: 13px; color: #555; margin-bottom: 10px; }

.req-price-row {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f8f8fb;
  border-radius: 10px;
  padding: 8px 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.rp-label { font-size: 12px; color: #999; margin-right: 4px; }
.rp-val { font-size: 16px; font-weight: 800; color: #0f0f1a; }
.rp-val.negotiated { color: #0070f3; }
.negotiated-tag {
  background: #e8f0fe;
  color: #0070f3;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 8px;
}
.rp-listed { font-size: 12px; color: #bbb; text-decoration: line-through; }

.req-actions { display: flex; gap: 8px; }
.btn-reject {
  --color: #e05555;
  --border-color: #e05555;
  --border-radius: 10px;
  font-weight: 700;
  height: 36px;
}
.btn-counter {
  --color: #0070f3;
  --border-color: #0070f3;
  --border-radius: 10px;
  font-weight: 700;
  height: 36px;
}
.btn-approve {
  flex: 1;
  --background: #00c896;
  --color: #fff;
  --border-radius: 10px;
  font-weight: 700;
  height: 36px;
}

/* Active Rentals */
.active-rentals { display: flex; flex-direction: column; gap: 10px; }
.rental-row {
  background: #fff;
  border-radius: 16px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.rental-emoji {
  width: 44px; height: 44px;
  background: #f0f0f7;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}
.rental-info { flex: 1; }
.rental-vehicle { font-size: 14px; font-weight: 700; color: #0f0f1a; }
.rental-renter { font-size: 12px; color: #999; margin: 2px 0; }
.rental-dates { font-size: 12px; color: #aaa; }
.rental-amount { font-size: 16px; font-weight: 800; color: #00c896; }

/* Chart */
.chart-placeholder {
  background: #fff;
  border-radius: 18px;
  padding: 20px 16px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}
.chart-bars {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 100px;
  margin-bottom: 10px;
}
.chart-bar-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  height: 100%;
}
.chart-bar {
  width: 100%;
  background: linear-gradient(180deg, #00c896, #00a87e);
  border-radius: 6px 6px 0 0;
  min-height: 4px;
  transition: height 0.3s;
}
.chart-bar-label { font-size: 10px; color: #aaa; font-weight: 600; }
.chart-legend { text-align: center; font-size: 12px; color: #999; }
</style>