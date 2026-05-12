<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="toolbar">
        <ion-buttons slot="start">
          <ion-back-button default-href="/dashboard" text="" class="back-btn"></ion-back-button>
        </ion-buttons>
        <ion-title class="toolbar-title">Transaction Requests</ion-title>
      </ion-toolbar>

      <div class="tab-row">
        <div
          v-for="tab in tabs"
          :key="tab.key"
          class="tab"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
          <span class="tab-badge" v-if="countFor(tab.key)">{{ countFor(tab.key) }}</span>
        </div>
      </div>
    </ion-header>

    <ion-content class="page-content">
      <ion-refresher slot="fixed" @ionRefresh="doRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <!-- Empty State -->
      <div class="empty-state" v-if="filtered.length === 0">
        <div class="empty-icon">{{ emptyFor(activeTab).icon }}</div>
        <div class="empty-title">{{ emptyFor(activeTab).title }}</div>
        <div class="empty-sub">{{ emptyFor(activeTab).sub }}</div>
      </div>

      <!-- Request Cards -->
      <div class="list" v-else>
        <div
          v-for="req in filtered"
          :key="req.id"
          class="req-card"
          :class="req.status"
        >
          <div class="req-top">
            <div class="renter-avatar">{{ req.initials }}</div>
            <div class="renter-info">
              <div class="renter-name">{{ req.customerName }}</div>
              <div class="renter-contact">{{ req.customerPhone }}</div>
            </div>
            <div class="req-time-badge">{{ req.submittedAt }}</div>
          </div>

          <div class="vehicle-row">
            <div class="v-emoji">{{ req.emoji }}</div>
            <div class="v-info">
              <div class="v-name">{{ req.vehicleName }}</div>
              <div class="v-dates">
                <ion-icon name="calendar-outline"></ion-icon>
                {{ req.startDate }} → {{ req.endDate }} · {{ req.days }} day(s)
              </div>
              <div class="v-pickup">
                <ion-icon name="time-outline"></ion-icon>
                Pickup: {{ req.pickupTime }} · {{ req.deliveryType }}
              </div>
            </div>
          </div>

          <!-- Price Block -->
          <div class="price-block">
            <div class="pb-row">
              <span class="pb-label">Listed Price</span>
              <span class="pb-val listed">₱{{ req.listedPrice }}/day</span>
            </div>
            <div class="pb-row" v-if="req.negotiated">
              <span class="pb-label">Customer Offer</span>
              <span class="pb-val offer">₱{{ req.offeredPrice }}/day</span>
              <span class="neg-tag">🤝 Negotiated</span>
            </div>
            <div class="pb-divider"></div>
            <div class="pb-row total">
              <span>Total ({{ req.days }} days)</span>
              <span class="pb-total">₱{{ (req.offeredPrice * req.days).toLocaleString() }}</span>
            </div>
          </div>

          <!-- Notes -->
          <div class="req-notes" v-if="req.notes">
            <ion-icon name="chatbubble-outline" class="notes-icon"></ion-icon>
            <span>"{{ req.notes }}"</span>
          </div>

          <!-- Status Badge for non-pending -->
          <div class="status-row" v-if="req.status !== 'pending'">
            <div class="status-chip" :class="req.status">
              {{ statusLabel(req.status) }}
            </div>
            <div class="status-date">{{ req.resolvedAt }}</div>
          </div>

          <!-- Actions for pending -->
          <div class="req-actions" v-if="req.status === 'pending'">
            <ion-button fill="outline" size="small" class="btn-decline" @click="decline(req)">
              Decline
            </ion-button>
            <ion-button fill="outline" size="small" class="btn-counter" @click="counter(req)">
              <ion-icon name="chatbubbles-outline" slot="start"></ion-icon>
              Counter Offer
            </ion-button>
            <ion-button size="small" class="btn-approve" @click="approve(req)">
              ✓ Approve
            </ion-button>
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
  IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonButton, IonContent, IonIcon, IonRefresher, IonRefresherContent
} from '@ionic/vue'

const router = useRouter()
const activeTab = ref('pending')

const tabs = [
  { key: 'pending',   label: 'Pending' },
  { key: 'approved',  label: 'Approved' },
  { key: 'declined',  label: 'Declined' },
]

interface Request {
  id: number
  customerName: string
  customerPhone: string
  initials: string
  vehicleName: string
  emoji: string
  startDate: string
  endDate: string
  days: number
  pickupTime: string
  deliveryType: string
  listedPrice: number
  offeredPrice: number
  negotiated: boolean
  notes: string
  status: 'pending' | 'approved' | 'declined'
  submittedAt: string
  resolvedAt?: string
}

const requests = ref<Request[]>([
  {
    id: 1, customerName: 'Maria Santos', customerPhone: '+63 912 111 2222',
    initials: 'MS', vehicleName: 'Toyota Vios 2022', emoji: '🚗',
    startDate: 'Jun 10', endDate: 'Jun 13', days: 3,
    pickupTime: '8:00 AM', deliveryType: 'Self Pickup',
    listedPrice: 850, offeredPrice: 750, negotiated: true,
    notes: 'I will pick up early morning, can we make it 7:30 AM?',
    status: 'pending', submittedAt: '2h ago',
  },
  {
    id: 2, customerName: 'Pedro Reyes', customerPhone: '+63 917 333 4444',
    initials: 'PR', vehicleName: 'Honda City 2021', emoji: '🚙',
    startDate: 'Jun 15', endDate: 'Jun 16', days: 1,
    pickupTime: '10:00 AM', deliveryType: 'Delivery (+₱200)',
    listedPrice: 900, offeredPrice: 900, negotiated: false,
    notes: '',
    status: 'pending', submittedAt: '5h ago',
  },
  {
    id: 3, customerName: 'Ana Cruz', customerPhone: '+63 998 555 6666',
    initials: 'AC', vehicleName: 'Yamaha Mio 2023', emoji: '🏍️',
    startDate: 'Jun 5', endDate: 'Jun 7', days: 2,
    pickupTime: '9:00 AM', deliveryType: 'Self Pickup',
    listedPrice: 400, offeredPrice: 380, negotiated: true,
    notes: '',
    status: 'approved', submittedAt: '1d ago', resolvedAt: 'Approved Jun 4'
  },
  {
    id: 4, customerName: 'Jose Bautista', customerPhone: '+63 919 777 8888',
    initials: 'JB', vehicleName: 'Toyota Innova', emoji: '🚌',
    startDate: 'May 10', endDate: 'May 11', days: 1,
    pickupTime: '7:00 AM', deliveryType: 'Delivery (+₱200)',
    listedPrice: 1800, offeredPrice: 1500, negotiated: true,
    notes: 'Offering 1500 for one day only.',
    status: 'declined', submittedAt: '3d ago', resolvedAt: 'Declined May 9'
  },
])

const filtered = computed(() =>
  requests.value.filter(r => r.status === activeTab.value)
)

function countFor(status: string) {
  return requests.value.filter(r => r.status === status).length
}

function emptyFor(status: string) {
  const map: Record<string, { icon: string; title: string; sub: string }> = {
    pending:  { icon: '🕐', title: 'No pending requests', sub: 'New booking requests will appear here.' },
    approved: { icon: '✅', title: 'No approved requests', sub: 'Requests you approved will show here.' },
    declined: { icon: '❌', title: 'No declined requests', sub: 'Requests you declined will show here.' },
  }
  return map[status]
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    approved: '✅ Approved',
    declined: '❌ Declined',
  }
  return map[status] || status
}

function approve(req: Request) {
  req.status = 'approved'
  req.resolvedAt = 'Approved just now'
}

function decline(req: Request) {
  req.status = 'declined'
  req.resolvedAt = 'Declined just now'
}

function counter(req: Request) {
  router.push(`/negotiate/${req.id}`)
}

function doRefresh(event: any) {
  setTimeout(() => event.target.complete(), 1000)
}
</script>

<style scoped>
.page-content { --background: #f5f5f7; }

.toolbar {
  --background: #fff;
  box-shadow: 0 1px 0 #eee;
}
.toolbar-title { font-size: 17px; font-weight: 800; color: #0f0f1a; }
.back-btn { --color: #0f0f1a; }

.tab-row {
  display: flex;
  background: #fff;
  padding: 0 16px;
  border-bottom: 2px solid #f0f0f5;
  gap: 4px;
}
.tab {
  flex: 1;
  padding: 12px 4px;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: #aaa;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: all 0.2s;
  font-family: 'Gil Sans MT', sans-serif;  
}
.tab.active { color: #b70b67; border-bottom-color: #b70b67; }
.tab-badge {
  background: #e05555;
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  border-radius: 10px;
  padding: 1px 6px;
}

/* Empty */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 32px;
  text-align: center;
}
.empty-icon { font-size: 52px; margin-bottom: 14px; }
.empty-title { font-size: 18px; font-weight: 800; color: #0f0f1a; margin-bottom: 6px; }
.empty-sub { font-size: 14px; color: #999; }

/* List */
.list { padding: 16px; display: flex; flex-direction: column; gap: 14px; }

.req-card {
  background: #fff;
  border-radius: 20px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  border-left: 5px solid #ddd;
  font-family: 'Gil Sans MT', sans-serif;  
}
.req-card.pending  { border-left-color: #b70b67; }
.req-card.approved { border-left-color: #b70b67; }
.req-card.declined { border-left-color: #b70b67; }

/* Renter */
.req-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}
.renter-avatar {
  width: 40px; height: 40px;
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 800;
  color: #fff;
  flex-shrink: 0;
}
.renter-info { flex: 1; }
.renter-name { font-size: 15px; font-weight: 800; color: #0f0f1a; }
.renter-contact { font-size: 12px; color: #999; margin-top: 1px; }
.req-time-badge { font-size: 11px; color: #bbb; white-space: nowrap; }

/* Vehicle Row */
.vehicle-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #f8f8fb;
  border-radius: 14px;
  padding: 12px 14px;
  margin-bottom: 12px;
}
.v-emoji {
  font-size: 30px;
  flex-shrink: 0;
  margin-top: 2px;
}
.v-info { flex: 1; }
.v-name { font-size: 15px; font-weight: 800; color: #0f0f1a; margin-bottom: 6px; }
.v-dates, .v-pickup {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #666;
  margin-bottom: 3px;
}
.v-dates ion-icon, .v-pickup ion-icon { color: #00c896; font-size: 13px; }

/* Price Block */
.price-block {
  background: #f8f8fb;
  border-radius: 14px;
  padding: 12px 14px;
  margin-bottom: 12px;
}
.pb-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.pb-row.total { margin-bottom: 0; }
.pb-label { font-size: 12px; color: #999; flex: 1; }
.pb-val { font-size: 15px; font-weight: 700; }
.pb-val.listed { color: #aaa; text-decoration: line-through; font-size: 13px; }
.pb-val.offer { color: #0070f3; }
.neg-tag {
  background: #e8f0fe;
  color: #0070f3;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 8px;
}
.pb-divider { height: 1px; background: #eee; margin: 8px 0; }
.pb-total { font-size: 18px; font-weight: 800; color: #0f0f1a; }

.pb-row.total{
  color: #05052e;
  font-size: 12px;
  font-family: 'Gil Sans MT', sans-serif;
}

/* Notes */
.req-notes {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: #fff8e1;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 13px;
  color: #666;
  font-style: italic;
  margin-bottom: 12px;
}
.notes-icon { color: #f5a623; flex-shrink: 0; margin-top: 1px; }

/* Status */
.status-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 4px;
}
.status-chip {
  border-radius: 10px;
  padding: 5px 12px;
  font-size: 12px;
  font-weight: 700;
}
.status-chip.approved { background: #e8fdf6; color: #00a87e; }
.status-chip.declined { background: #fde8e8; color: #e05555; }
.status-date { font-size: 12px; color: #bbb; }

/* Actions */
.req-actions { display: flex; gap: 8px; margin-top: 4px; }
.btn-decline {
  --color: #e05555;
  --border-color: #e05555;
  --border-radius: 10px;
  font-weight: 700;
  height: 38px;
}
.btn-counter {
  --color: #0070f3;
  --border-color: #0070f3;
  --border-radius: 10px;
  font-weight: 700;
  height: 38px;
}
.btn-approve {
  flex: 1;
  --background: #00c896;
  --color: #fff;
  --border-radius: 10px;
  font-weight: 700;
  height: 38px;
}
</style>