<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="tx-toolbar">
        <ion-title class="toolbar-title">My Transactions</ion-title>
      </ion-toolbar>

      <!-- Tabs -->
      <div class="tx-tabs">
        <div
          v-for="tab in tabs"
          :key="tab.key"
          class="tx-tab"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
          <span class="tab-count" v-if="countFor(tab.key)">{{ countFor(tab.key) }}</span>
        </div>
      </div>
    </ion-header>

    <ion-content class="page-content">
      <ion-refresher slot="fixed" @ionRefresh="doRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <!-- Empty State -->
      <div class="empty-state" v-if="filteredTransactions.length === 0">
        <div class="empty-icon">{{ emptyStateFor(activeTab).icon }}</div>
        <div class="empty-title">{{ emptyStateFor(activeTab).title }}</div>
        <div class="empty-sub">{{ emptyStateFor(activeTab).sub }}</div>
        <ion-button class="empty-btn" router-link="/businesses" v-if="activeTab !== 'done'">
          Browse Vehicles
        </ion-button>
      </div>

      <!-- Transactions List -->
      <div class="tx-list" v-else>
        <div
          v-for="tx in filteredTransactions"
          :key="tx.id"
          class="tx-card"
          @click="openDetail(tx)"
        >
          <!-- Status Bar -->
          <div class="tx-status-bar" :class="tx.status"></div>

          <div class="tx-card-inner">
            <div class="tx-header">
              <div class="tx-vehicle-emoji">{{ tx.emoji }}</div>
              <div class="tx-info">
                <div class="tx-vehicle-name">{{ tx.vehicleName }}</div>
                <div class="tx-biz-name">{{ tx.bizName }}</div>
              </div>
              <div class="tx-status-badge" :class="tx.status">
                {{ statusLabel(tx.status) }}
              </div>
            </div>

            <div class="tx-divider"></div>

            <div class="tx-details">
              <div class="tx-detail-row">
                <ion-icon name="calendar-outline" class="td-icon"></ion-icon>
                <span>{{ tx.startDate }} → {{ tx.endDate }}</span>
              </div>
              <div class="tx-detail-row">
                <ion-icon name="time-outline" class="td-icon"></ion-icon>
                <span>{{ tx.days }} day(s) · Pickup {{ tx.pickupTime }}</span>
              </div>
              <div class="tx-detail-row">
                <ion-icon name="location-outline" class="td-icon"></ion-icon>
                <span>{{ tx.location }}</span>
              </div>
            </div>

            <div class="tx-footer-row">
              <div class="tx-amount">₱{{ tx.amount.toLocaleString() }}</div>
              <div class="tx-actions">
                <ion-button
                  v-if="tx.status === 'pending'"
                  fill="outline"
                  size="small"
                  class="btn-cancel-tx"
                  @click.stop="cancelTransaction(tx)"
                >
                  Cancel
                </ion-button>
                <ion-button
                  v-if="tx.status === 'done'"
                  fill="outline"
                  size="small"
                  class="btn-review"
                  @click.stop="openReview(tx)"
                >
                  <ion-icon name="star-outline" slot="start"></ion-icon>
                  Review
                </ion-button>
                <ion-button
                  v-if="tx.status === 'done'"
                  size="small"
                  class="btn-rebook"
                  @click.stop="rebookVehicle(tx)"
                >
                  Rebook
                </ion-button>
              </div>
            </div>
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
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonIcon, IonRefresher, IonRefresherContent
} from '@ionic/vue'

const router = useRouter()
const activeTab = ref('pending')

const tabs = [
  { key: 'pending',   label: 'Upcoming' },
  { key: 'active',    label: 'Active' },
  { key: 'done',      label: 'Done' },
  { key: 'cancelled', label: 'Cancelled' },
]

interface Transaction {
  id: number
  vehicleName: string
  emoji: string
  bizName: string
  status: 'pending' | 'active' | 'done' | 'cancelled'
  startDate: string
  endDate: string
  days: number
  pickupTime: string
  location: string
  amount: number
}

const transactions = ref<Transaction[]>([
  {
    id: 1, vehicleName: 'Toyota Vios 2022', emoji: '🚗',
    bizName: 'AutoLux Rentals', status: 'pending',
    startDate: 'Jun 10', endDate: 'Jun 13', days: 3,
    pickupTime: '8:00 AM', location: 'Makati City',
    amount: 2250
  },
  {
    id: 2, vehicleName: 'Yamaha Mio 2023', emoji: '🏍️',
    bizName: 'Speedy Wheels', status: 'active',
    startDate: 'Jun 5', endDate: 'Jun 7', days: 2,
    pickupTime: '9:00 AM', location: 'BGC, Taguig',
    amount: 800
  },
  {
    id: 3, vehicleName: 'Honda City 2021', emoji: '🚙',
    bizName: 'CityDrive PH', status: 'done',
    startDate: 'May 20', endDate: 'May 22', days: 2,
    pickupTime: '10:00 AM', location: 'Manila',
    amount: 1800
  },
  {
    id: 4, vehicleName: 'Toyota Innova', emoji: '🚌',
    bizName: 'BizFleet Co.', status: 'cancelled',
    startDate: 'May 10', endDate: 'May 11', days: 1,
    pickupTime: '7:00 AM', location: 'Pasig City',
    amount: 1800
  },
])

const filteredTransactions = computed(() =>
  transactions.value.filter(t => t.status === activeTab.value)
)

function countFor(status: string) {
  return transactions.value.filter(t => t.status === status).length
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    pending: '🕐 Upcoming',
    active: '✅ Active',
    done: '✔ Done',
    cancelled: '❌ Cancelled',
  }
  return map[status] || status
}

function emptyStateFor(status: string) {
  const map: Record<string, { icon: string; title: string; sub: string }> = {
    pending:   { icon: '🕐', title: 'No upcoming bookings', sub: 'Browse vehicles to make a reservation.' },
    active:    { icon: '🚗', title: 'No active rentals', sub: 'Your active rentals will appear here.' },
    done:      { icon: '✅', title: 'No completed rentals yet', sub: 'Your rental history will appear here.' },
    cancelled: { icon: '❌', title: 'No cancelled bookings', sub: 'Cancelled transactions will show here.' },
  }
  return map[status] || { icon: '📋', title: 'Nothing here', sub: '' }
}

function openDetail(tx: Transaction) {
  router.push(`/transaction/${tx.id}`)
}

function cancelTransaction(tx: Transaction) {
  tx.status = 'cancelled'
}

function openReview(tx: Transaction) {
  // open review modal / page
}

function rebookVehicle(tx: Transaction) {
  router.push(`/booking?vehicleId=${tx.id}`)
}

function doRefresh(event: any) {
  setTimeout(() => event.target.complete(), 1000)
}
</script>

<style scoped>
.page-content { --background: #f5f5f7; }

.tx-toolbar {
  --background: #fff;
  box-shadow: 0 1px 0 #eee;
}
.toolbar-title { font-size: 18px; font-weight: 800; color: #0f0f1a; }

/* Tabs */
.tx-tabs {
  display: flex;
  background: #fff;
  padding: 0 12px 0;
  border-bottom: 2px solid #f0f0f5;
  gap: 4px;
}
.tx-tab {
  flex: 1;
  padding: 12px 4px;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: #aaa;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  white-space: nowrap;
}
.tx-tab.active {
  color: #00c896;
  border-bottom-color: #00c896;
}
.tab-count {
  background: #00c896;
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  border-radius: 10px;
  padding: 1px 5px;
  min-width: 16px;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 32px;
  text-align: center;
}
.empty-icon { font-size: 56px; margin-bottom: 16px; }
.empty-title { font-size: 18px; font-weight: 800; color: #0f0f1a; margin-bottom: 8px; }
.empty-sub { font-size: 14px; color: #999; margin-bottom: 24px; }
.empty-btn {
  --background: #00c896;
  --color: #fff;
  --border-radius: 14px;
  font-weight: 700;
}

/* Transaction Cards */
.tx-list { padding: 16px; display: flex; flex-direction: column; gap: 12px; }

.tx-card {
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  cursor: pointer;
  display: flex;
}

.tx-status-bar {
  width: 5px;
  flex-shrink: 0;
}
.tx-status-bar.pending   { background: #fbbf24; }
.tx-status-bar.active    { background: #00c896; }
.tx-status-bar.done      { background: #6b7280; }
.tx-status-bar.cancelled { background: #e05555; }

.tx-card-inner {
  flex: 1;
  padding: 16px;
}

.tx-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.tx-vehicle-emoji {
  width: 44px; height: 44px;
  background: #f0f0f7;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}
.tx-info { flex: 1; }
.tx-vehicle-name { font-size: 15px; font-weight: 800; color: #0f0f1a; margin-bottom: 2px; }
.tx-biz-name { font-size: 12px; color: #999; }

.tx-status-badge {
  border-radius: 10px;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}
.tx-status-badge.pending   { background: #fef3c7; color: #d97706; }
.tx-status-badge.active    { background: #e8fdf6; color: #00a87e; }
.tx-status-badge.done      { background: #f3f4f6; color: #6b7280; }
.tx-status-badge.cancelled { background: #fde8e8; color: #e05555; }

.tx-divider { height: 1px; background: #f0f0f5; margin-bottom: 12px; }

.tx-details { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
.tx-detail-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #555;
}
.td-icon { color: #00c896; font-size: 14px; flex-shrink: 0; }

.tx-footer-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.tx-amount { font-size: 20px; font-weight: 800; color: #0f0f1a; }
.tx-actions { display: flex; gap: 8px; }

.btn-cancel-tx {
  --color: #e05555;
  --border-color: #e05555;
  --border-radius: 10px;
  font-weight: 700;
  height: 34px;
}
.btn-review {
  --color: #f5a623;
  --border-color: #f5a623;
  --border-radius: 10px;
  font-weight: 700;
  height: 34px;
}
.btn-rebook {
  --background: #00c896;
  --color: #fff;
  --border-radius: 10px;
  font-weight: 700;
  height: 34px;
}
</style>