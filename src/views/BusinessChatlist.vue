<template>
  <ion-page>
    <ion-header class="ion-no-border">
    <ion-toolbar class="chat-toolbar">
      <ion-buttons slot="start">
        <ion-back-button 
          default-href="/owner-dashboard" 
          text="" 
          class="back-btn">
        </ion-back-button>
      </ion-buttons>
      <ion-title class="toolbar-title">Negotiations</ion-title>
      <ion-buttons slot="end">
        <ion-badge v-if="pendingCount" color="danger" class="pending-badge">
          {{ pendingCount }}
        </ion-badge>
      </ion-buttons>
    </ion-toolbar>

      <!-- Filter Tabs -->
      <div class="filter-tabs">
        <div
          v-for="tab in tabs"
          :key="tab.key"
          class="filter-tab"
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

      <!-- Loading -->
      <div v-if="isLoading" class="empty-state">
        <div class="empty-icon">💬</div>
        <div class="empty-title">Loading...</div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" v-else-if="filteredInquiries.length === 0">
        <div class="empty-icon">{{ emptyStateFor(activeTab).icon }}</div>
        <div class="empty-title">{{ emptyStateFor(activeTab).title }}</div>
        <div class="empty-sub">{{ emptyStateFor(activeTab).sub }}</div>
      </div>

      <!-- Chat List -->
      <div class="chat-list" v-else>
        <div
          v-for="inq in filteredInquiries"
          :key="inq.Inquiry_ID"
          class="chat-item"
          @click="openNegotiate(inq)"
        >
          <!-- Avatar -->
          <div class="chat-avatar" :class="avatarClass(inq.Inquiry_Status)">
            {{ getInitials(inq.Customer_Name) }}
          </div>

          <!-- Info -->
          <div class="chat-info">
            <div class="chat-top">
              <span class="chat-name">{{ inq.Customer_Name }}</span>
              <span class="chat-time">{{ formatTime(inq.Created_At) }}</span>
            </div>
            <div class="chat-vehicle">{{ inq.Vehicle_Model }}</div>
            <div class="chat-bottom">
              <span class="chat-offer">₱{{ Number(inq.Offered_Price).toLocaleString() }}/day</span>
              <span class="status-badge" :class="inq.Inquiry_Status">
                {{ statusLabel(inq.Inquiry_Status) }}
              </span>
            </div>
          </div>

          <!-- Unread dot -->
          <div class="unread-dot" v-if="inq.Inquiry_Status === 'Pending'"></div>
        </div>
      </div>

      <div style="height: 80px"></div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonBadge, IonRefresher, IonBackButton,  
  IonRefresherContent,
  useIonRouter, onIonViewWillEnter
} from '@ionic/vue'
import { inquiryAPI } from '@/api'

const router    = useIonRouter()
const inquiries = ref<any[]>([])
const isLoading = ref(false)
const activeTab = ref('All')

const tabs = [
  { key: 'All',      label: 'All' },
  { key: 'Pending',  label: 'Pending' },
  { key: 'Accepted', label: 'Accepted' },
  { key: 'Rejected', label: 'Rejected' },
  { key: 'Completed',label: 'Completed' },
]

const filteredInquiries = computed(() => {
  if (activeTab.value === 'All') return inquiries.value
  return inquiries.value.filter(i => i.Inquiry_Status === activeTab.value)
})

const pendingCount = computed(() =>
  inquiries.value.filter(i => i.Inquiry_Status === 'Pending').length
)

function countFor(key: string) {
  if (key === 'All') return 0
  return inquiries.value.filter(i => i.Inquiry_Status === key).length
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    Pending:   '⏳ Pending',
    Accepted:  '✅ Accepted',
    Rejected:  '❌ Rejected',
    Completed: '✔ Done',
  }
  return map[status] || status
}

function emptyStateFor(tab: string) {
  const map: Record<string, { icon: string; title: string; sub: string }> = {
    All:       { icon: '💬', title: 'No negotiations yet',     sub: 'Customer offers will appear here.' },
    Pending:   { icon: '⏳', title: 'No pending offers',       sub: 'New customer offers will show here.' },
    Accepted:  { icon: '✅', title: 'No accepted offers',      sub: 'Accepted negotiations will appear here.' },
    Rejected:  { icon: '❌', title: 'No rejected offers',      sub: 'Rejected negotiations will appear here.' },
    Completed: { icon: '✔',  title: 'No completed deals yet',  sub: 'Completed negotiations will appear here.' },
  }
  return map[tab] || { icon: '💬', title: 'Nothing here', sub: '' }
}

function avatarClass(status: string) {
  const map: Record<string, string> = {
    Pending:   'avatar-pending',
    Accepted:  'avatar-accepted',
    Rejected:  'avatar-rejected',
    Completed: 'avatar-completed',
  }
  return map[status] || 'avatar-pending'
}

function getInitials(name: string) {
  if (!name) return '?'
  return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
}

function formatTime(dt: string) {
  if (!dt) return ''
  const date = new Date(dt)
  const now  = new Date()
  const diff = now.getTime() - date.getTime()
  const mins = Math.floor(diff / 60000)
  const hrs  = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hrs  < 24) return `${hrs}h ago`
  return `${days}d ago`
}

async function loadInquiries() {
  isLoading.value = true
  try {
    const res = await inquiryAPI.getAll()
    inquiries.value = (res.data.data ?? res.data).sort(
      (a: any, b: any) =>
        new Date(b.Created_At).getTime() - new Date(a.Created_At).getTime()
    )
  } catch (e) {
    console.error('Failed to load inquiries', e)
  } finally {
    isLoading.value = false
  }
}

function openNegotiate(inq: any) {
  router.push({
    path: `/negotiate-owner/${inq.Inquiry_ID}`,
    query: {
      vehicleName:  inq.Vehicle_Model,
      customerName: inq.Customer_Name,
      dailyRate:    inq.Daily_Rate,
      vehicleId:   inq.Vehicle_ID,
    }
  })
}

function doRefresh(event: any) {
  loadInquiries().then(() => event.target.complete())
}

onIonViewWillEnter(loadInquiries)
onMounted(loadInquiries)
</script>

<style scoped>
.page-content { --background: #f5f5f7; }

.chat-toolbar {
  --background: #fff;
  box-shadow: 0 1px 0 #eee;
}
.toolbar-title { font-size: 18px; font-weight: 800; color: #0f0f1a; }

.pending-badge {
  font-size: 11px;
  font-weight: 800;
  margin-right: 8px;
}

/* Filter Tabs */
.filter-tabs {
  display: flex;
  background: #fff;
  padding: 0 12px;
  border-bottom: 2px solid #f0f0f5;
  gap: 4px;
  overflow-x: auto;
  scrollbar-width: none;
}
.filter-tabs::-webkit-scrollbar { display: none; }

.back-btn { --color: #0f0f1a; }

.filter-tab {
  flex-shrink: 0;
  padding: 12px 8px;
  font-size: 12px;
  font-weight: 600;
  color: #aaa;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}
.filter-tab.active {
  color: #b70b67;
  border-bottom-color: #b70b67;
}

.tab-count {
  background: #b70b67;
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  border-radius: 10px;
  padding: 1px 5px;
  min-width: 16px;
  text-align: center;
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
.empty-icon  { font-size: 56px; margin-bottom: 16px; }
.empty-title { font-size: 18px; font-weight: 800; color: #0f0f1a; margin-bottom: 8px; }
.empty-sub   { font-size: 14px; color: #999; }

/* Chat List */
.chat-list { background: #fff; }

.chat-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-bottom: 0.5px solid #f0f0f5;
  cursor: pointer;
  transition: background 0.15s;
}
.chat-item:active { background: #fafafa; }

/* Avatar */
.chat-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 800;
  flex-shrink: 0;
}
.avatar-pending   { background: #fef3c7; color: #d97706; }
.avatar-accepted  { background: #e8fdf6; color: #00a87e; }
.avatar-rejected  { background: #fde8e8; color: #e05555; }
.avatar-completed { background: #f3f4f6; color: #6b7280; }

/* Info */
.chat-info { flex: 1; min-width: 0; }

.chat-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3px;
}
.chat-name {
  font-size: 15px;
  font-weight: 800;
  color: #0f0f1a;
}
.chat-time {
  font-size: 11px;
  color: #bbb;
}
.chat-vehicle {
  font-size: 12px;
  color: #999;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.chat-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.chat-offer {
  font-size: 14px;
  font-weight: 800;
  color: #0f0f1a;
}

/* Status Badge */
.status-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 8px;
}
.status-badge.Pending   { background: #fef3c7; color: #d97706; }
.status-badge.Accepted  { background: #e8fdf6; color: #00a87e; }
.status-badge.Rejected  { background: #fde8e8; color: #e05555; }
.status-badge.Completed { background: #f3f4f6; color: #6b7280; }

/* Unread dot */
.unread-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #b70b67;
  flex-shrink: 0;
}
</style>