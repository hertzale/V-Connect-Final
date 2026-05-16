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
        <ion-button class="empty-btn" router-link="/home" v-if="activeTab !== 'Completed'">
          Browse Vehicles
        </ion-button>
      </div>

      <!-- Transactions List -->
      <div class="tx-list" v-else>
        <div
          v-for="tx in filteredTransactions"
          :key="tx.Transaction_ID"
          class="tx-card"
          @click="openDetail(tx)"
        >
          <!-- Status Bar -->
          <div class="tx-status-bar" :class="tx.Rental_Status"></div>

          <div class="tx-card-inner">
            <div class="tx-header">
              <div class="tx-vehicle-emoji">🚗</div>
              <div class="tx-info">
                <div class="tx-vehicle-name">{{ tx.Vehicle_Model }}</div>
                <div class="tx-biz-name">{{ tx.Business_Name }}</div>
              </div>
              <div class="tx-status-badge" :class="tx.Rental_Status">
                {{ statusLabel(tx.Rental_Status) }}
              </div>
            </div>

            <div class="tx-divider"></div>

            <div class="tx-details">
              <div class="tx-detail-row">
                <ion-icon name="calendar-outline" class="td-icon"></ion-icon>
                <span>{{ tx.Start_Date }} → {{ tx.End_Date }}</span>
              </div>
              <div class="tx-detail-row">
                <ion-icon name="time-outline" class="td-icon"></ion-icon>
                <span>{{ tx.Rental_Duration }} day(s) · Pickup {{ tx.Start_Time }}</span>
              </div>
              <div class="tx-detail-row">
                <ion-icon name="location-outline" class="td-icon"></ion-icon>
                <span>{{ tx.Pickup_Location }}</span>
              </div>
            </div>

            <div class="tx-footer-row">
              <div class="tx-amount">₱{{ tx.Total_Amount.toLocaleString() }}</div>
              <div class="tx-actions">
                <ion-button
                  v-if="tx.Rental_Status === 'Pending'"
                  fill="outline"
                  size="small"
                  class="btn-cancel-tx"
                  @click.stop="cancelTransaction(tx)"
                >
                  Cancel
                </ion-button>
                <ion-button
                  v-if="tx.Rental_Status === 'Completed'"
                  fill="outline"
                  size="small"
                  class="btn-review"
                  @click.stop="openReview(tx)"
                >
                  <ion-icon name="star-outline" slot="start"></ion-icon>
                  Review
                </ion-button>
                <ion-button
                  v-if="tx.Rental_Status === 'Completed'"
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
import { ref, computed, onMounted } from 'vue'
import { useIonRouter, onIonViewWillEnter,
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonIcon, IonRefresher, IonRefresherContent
} from '@ionic/vue'
import { transactionAPI } from '@/api'

const router = useIonRouter()
const activeTab = ref('Pending')               
const transactions = ref<any[]>([])
const isLoading = ref(false)

const tabs = [
  { key: 'Pending',   label: 'Upcoming' },
  { key: 'Reserved',  label: 'Reserved' },
  { key: 'Ongoing',   label: 'Ongoing' },
  { key: 'Completed', label: 'Done' },
  { key: 'Cancelled', label: 'Cancelled' },
  { key: 'Overdue',   label: 'Overdue' },
]

const filteredTransactions = computed(() =>
  transactions.value.filter(t => t.Rental_Status === activeTab.value)
)

function countFor(status: string) {
  return transactions.value.filter(t => t.Rental_Status === status).length
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    Pending:   '🕐 Upcoming',
    Reserved:  '📋 Reserved',
    Ongoing:   '✅ Active',
    Completed: '✔ Done',
    Cancelled: '❌ Cancelled',
    Overdue:   '⚠️ Overdue',
  }
  return map[status] || status
}

function emptyStateFor(status: string) {
  const map: Record<string, { icon: string; title: string; sub: string }> = {
    Pending:   { icon: '🕐', title: 'No upcoming bookings',     sub: 'Browse vehicles to make a reservation.' },
    Reserved:  { icon: '📋', title: 'No reserved bookings',     sub: 'Confirmed bookings will appear here.' },
    Ongoing:   { icon: '🚗', title: 'No active rentals',        sub: 'Your active rentals will appear here.' },
    Completed: { icon: '✅', title: 'No completed rentals yet',  sub: 'Your rental history will appear here.' },
    Cancelled: { icon: '❌', title: 'No cancelled bookings',     sub: 'Cancelled transactions will show here.' },
    Overdue:   { icon: '⚠️', title: 'No overdue rentals',       sub: 'Overdue rentals will appear here.' },
  }
  return map[status] || { icon: '📋', title: 'Nothing here', sub: '' }
}

async function loadTransactions() {
  isLoading.value = true
  try {
    const res = await transactionAPI.getAll()
    transactions.value = res.data.data ?? res.data
  } catch (err) {
    console.error('Failed to load transactions', err)
  } finally {
    isLoading.value = false
  }
}

function openDetail(tx: any) {
  router.push(`/transaction/${tx.Transaction_ID}`)
}

function cancelTransaction(tx: any) {
  transactionAPI.updateStatus(tx.Transaction_ID, 'Cancelled')
    .then(() => tx.Rental_Status = 'Cancelled')
    .catch((err: any) => console.error(err))
}

function openReview(tx: any) {
  router.push(`/review/${tx.Transaction_ID}`)
}

function rebookVehicle(tx: any) {
  router.push(`/booking?vehicleId=${tx.Vehicle_ID}`)
}

function doRefresh(event: any) {
  loadTransactions().then(() => event.target.complete())
}

onIonViewWillEnter(loadTransactions)
onMounted(loadTransactions)
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
.tx-status-bar.Pending   { background: #fbbf24; }
.tx-status-bar.Reserved  { background: #fc89d0; }
.tx-status-bar.Ongoing   { background: #00c896; }
.tx-status-bar.Completed { background: #6b7280; }
.tx-status-bar.Cancelled { background: #e05555; }
.tx-status-bar.Overdue   { background: #ff6b35; }


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
.tx-status-badge.Pending   { background: #fef3c7; color: #d97706; }
.tx-status-badge.Reserved  { background: #ffedf6; color: #b70b67; }
.tx-status-badge.Ongoing   { background: #e8fdf6; color: #00a87e; }
.tx-status-badge.Completed { background: #f3f4f6; color: #6b7280; }
.tx-status-badge.Cancelled { background: #fde8e8; color: #e05555; }
.tx-status-badge.Overdue   { background: #fff0eb; color: #ff6b35; }

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