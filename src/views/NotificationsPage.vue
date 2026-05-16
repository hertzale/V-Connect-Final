<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="page">

        <!-- HEADER -->
        <div class="header">
          <img src="@/assets/new-bg.png" alt="Vcon Background" class="bg-mobile" />
          <img src="@/assets/v-connect-bg-web.png" class="bg-web" />
          <div class="header-inner">
            <h1 class="header-title">Notifications</h1>
            <button class="mark-all-btn" @click="markAllRead" v-if="unreadCount > 0">
              Mark all as read
            </button>
          </div>
        </div>

        <!-- LOADING -->
        <div class="content-area" v-if="isLoading">
          <p class="empty-label">Loading...</p>
        </div>

        <!-- EMPTY -->
        <div class="content-area empty-state" v-else-if="notifications.length === 0">
          <div class="empty-icon">🔔</div>
          <p class="empty-title">No notifications yet</p>
          <p class="empty-sub">You'll be notified about bookings, offers, and updates here.</p>
        </div>

        <!-- NOTIFICATIONS LIST -->
        <div class="content-area" v-else>

          <!-- Unread -->
          <div v-if="unreadNotifs.length > 0">
            <p class="group-label">New</p>
            <div
              v-for="notif in unreadNotifs"
              :key="notif.id"
              class="notif-card unread"
              @click="openNotif(notif)"
            >
              <div class="notif-icon-wrap" :class="notif.type">
                {{ iconFor(notif.type) }}
              </div>
              <div class="notif-body">
                <div class="notif-title">{{ notif.title }}</div>
                <div class="notif-message">{{ notif.message }}</div>
                <div class="notif-time">{{ notif.time }}</div>
              </div>
              <div class="unread-dot"></div>
            </div>
          </div>

          <!-- Read -->
          <div v-if="readNotifs.length > 0">
            <p class="group-label">Earlier</p>
            <div
              v-for="notif in readNotifs"
              :key="notif.id"
              class="notif-card"
              @click="openNotif(notif)"
            >
              <div class="notif-icon-wrap" :class="notif.type">
                {{ iconFor(notif.type) }}
              </div>
              <div class="notif-body">
                <div class="notif-title">{{ notif.title }}</div>
                <div class="notif-message">{{ notif.message }}</div>
                <div class="notif-time">{{ notif.time }}</div>
              </div>
            </div>
          </div>

        </div>

        <div style="height: 80px"></div>
      </div>
    </ion-content>

    <!-- TAB BAR -->
    <div class="tab-bar">
      <div class="tab-item" @click="goTo('/home')">
        <ion-icon name="grid-outline"></ion-icon>
        <span>Home</span>
      </div>
      <div class="tab-item" @click="goTo('/chat')">
        <ion-icon name="chatbubble-outline"></ion-icon>
        <span>Chat</span>
      </div>
      <div class="tab-item" @click="goTo('/post')">
        <div class="plus-btn">
          <ion-icon name="add-outline"></ion-icon>
        </div>
        <span>Post</span>
      </div>
      <div class="tab-item" @click="goTo('/listings')">
        <ion-icon name="list-outline"></ion-icon>
        <span>Listing</span>
      </div>
      <div class="tab-item active" @click="goTo('/notifications')">
        <div class="notif-tab-wrap">
          <ion-icon name="notifications-outline"></ion-icon>
          <div class="tab-badge" v-if="unreadCount > 0">{{ unreadCount }}</div>
        </div>
        <span>Alerts</span>
      </div>
    </div>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { IonPage, IonContent, IonIcon, useIonRouter, onIonViewWillEnter } from '@ionic/vue'
import { addIcons } from 'ionicons'
import {
  gridOutline, chatbubbleOutline, addOutline,
  listOutline, notificationsOutline
} from 'ionicons/icons'

addIcons({
  'grid-outline': gridOutline,
  'chatbubble-outline': chatbubbleOutline,
  'add-outline': addOutline,
  'list-outline': listOutline,
  'notifications-outline': notificationsOutline,
})

const router = useIonRouter()

interface Notification {
  id: number
  type: 'offer' | 'approved' | 'declined' | 'booking' | 'cancelled' | 'negotiation'
  title: string
  message: string
  time: string
  is_read: boolean
  reference_id?: number
  reference_type?: 'booking' | 'negotiation'
}

const isLoading = ref(false)

const notifications = ref<Notification[]>([])
// TODO: Replace with notificationsAPI.getAll() when backend route is added

const unreadNotifs = computed(() => notifications.value.filter(n => !n.is_read))
const readNotifs   = computed(() => notifications.value.filter(n => n.is_read))
const unreadCount  = computed(() => unreadNotifs.value.length)

function iconFor(type: string) {
  const map: Record<string, string> = {
    offer:       '💬',
    approved:    '✅',
    declined:    '❌',
    booking:     '📋',
    cancelled:   '🚫',
    negotiation: '🤝',
  }
  return map[type] || '🔔'
}

function openNotif(notif: Notification) {
  notif.is_read = true
  if (notif.reference_type === 'negotiation') {
    router.push(`/negotiate/${notif.reference_id}`)
  } else if (notif.reference_type === 'booking') {
    router.push('/transactions')
  }
}

function markAllRead() {
  notifications.value.forEach(n => n.is_read = true)
}

const goTo = (path: string) => router.push(path)

onIonViewWillEnter(() => {
  // replace mock data with: notificationsAPI.getAll() later
})
</script>

<style scoped>
.page {
  background: #f4f6f9;
  min-height: 100vh;
}

/* Header */
.header {
  position: relative;
  padding: 60px 20px 24px;
  overflow: hidden;
  min-height: 120px;
  display: flex;
  align-items: flex-end;
}

.bg-mobile {
  position: absolute;
  inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  z-index: 0;
  display: block;
}
.bg-web {
  position: absolute;
  inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  z-index: 0;
  display: none;
}
@media (min-width: 768px) {
  .bg-mobile { display: none; }
  .bg-web    { display: block; }
}

/* dim overlay */
.header::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.45);
  z-index: 0;
}

.header-inner {
  position: relative;
  z-index: 1;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.header-title {
  font-size: 26px;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
  font-family: 'Gil Sans MT', sans-serif;
}

.mark-all-btn {
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.4);
  border-radius: 20px;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 600;
  color: #ffffff;
  cursor: pointer;
}

/* Content */
.content-area {
  padding: 16px 16px 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 32px;
  text-align: center;
}
.empty-icon  { font-size: 52px; margin-bottom: 14px; }
.empty-title { font-size: 17px; font-weight: 700; color: #1a1a2e; margin: 0 0 6px; }
.empty-sub   { font-size: 13px; color: #999; margin: 0; }
.empty-label { font-size: 14px; color: #999; text-align: center; padding: 40px; }

/* Group Label */
.group-label {
  font-size: 12px;
  font-weight: 700;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 12px 0 8px;
}

/* Notification Card */
.notif-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 14px;
  margin-bottom: 10px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  cursor: pointer;
  border: 1.5px solid transparent;
  transition: all 0.2s;
  position: relative;
}
.notif-card.unread {
  border-color: #fc89d0;
  background: #fff5fb;
}
.notif-card:active { transform: scale(0.98); }

.notif-icon-wrap {
  width: 44px; height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}
.notif-icon-wrap.offer       { background: #e8f0fe; }
.notif-icon-wrap.approved    { background: #eaf3de; }
.notif-icon-wrap.declined    { background: #fde8e8; }
.notif-icon-wrap.booking     { background: #fff3e0; }
.notif-icon-wrap.cancelled   { background: #fde8e8; }
.notif-icon-wrap.negotiation { background: #f3e8ff; }

.notif-body { flex: 1; min-width: 0; }
.notif-title {
  font-size: 14px;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 3px;
}
.notif-message {
  font-size: 13px;
  color: #555;
  line-height: 1.4;
  margin-bottom: 5px;
}
.notif-time {
  font-size: 11px;
  color: #bbb;
  font-weight: 600;
}

.unread-dot {
  width: 9px; height: 9px;
  background: #fc89d0;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 4px;
}

/* Tab Bar */
.tab-bar {
  position: fixed;
  bottom: 0; left: 0;
  width: 100%;
  background: #ffffff;
  border-top: 0.5px solid #e0e0e0;
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
  color: #888;
  font-size: 10px;
}
.tab-item ion-icon { font-size: 22px; }
.tab-item.active { color: #fc89d0; }

.notif-tab-wrap { position: relative; }
.tab-badge {
  position: absolute;
  top: -4px; right: -6px;
  background: #fc89d0;
  color: #fff;
  font-size: 9px;
  font-weight: 800;
  border-radius: 10px;
  padding: 1px 5px;
  min-width: 16px;
  text-align: center;
}

.plus-btn {
  width: 48px; height: 48px;
  border-radius: 50%;
  background: #ef70be;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -24px;
  box-shadow: 0 4px 12px rgba(255,137,208,0.5);
}
.plus-btn ion-icon { font-size: 26px; color: #ffffff; }
</style>