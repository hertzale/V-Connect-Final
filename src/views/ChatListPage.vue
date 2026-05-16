<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="page">

        <!-- HEADER -->
        <div class="header">
          <img src="@/assets/new-bg.png" alt="Vcon Background" class="bg-mobile" />
          <img src="@/assets/v-connect-bg-web.png" class="bg-web" />
          <div class="header-inner">
            <h1 class="header-title">Negotiations</h1>
            <div class="active-badge" v-if="chats.length > 0">
              {{ chats.length }} Active
            </div>
          </div>
        </div>

        <!-- Search -->
        <div class="search-wrap">
          <ion-icon name="search-outline" class="search-icon"></ion-icon>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search negotiations..."
            class="search-input"
          />
        </div>

        <!-- EMPTY -->
        <div class="empty-state" v-if="filteredChats.length === 0 && !isLoading">
          <div class="empty-icon">💬</div>
          <p class="empty-title">No active negotiations</p>
          <p class="empty-sub">When you negotiate a price with a business, it will appear here.</p>
          <button class="browse-btn" @click="goTo('/home')">Browse Businesses</button>
        </div>

        <!-- LOADING -->
        <div class="empty-state" v-else-if="isLoading">
          <p class="empty-sub">Loading...</p>
        </div>

        <!-- CHAT LIST -->
        <div class="chat-list" v-else>
          <div
            v-for="chat in filteredChats"
            :key="chat.Inquiry_ID"
            class="chat-card"
            @click="openChat(chat)"
          >
            <!-- Vehicle Image Placeholder -->
            <div class="chat-vehicle-icon">🚗</div>

            <div class="chat-info">
              <div class="chat-top-row">
                <div class="chat-vehicle-name">{{ chat.Vehicle_Model }}</div>
                <div class="chat-time">{{ chat.Created_At }}</div>
              </div>
              <div class="chat-biz-name">{{ chat.Business_Name }}</div>
              <div class="chat-last-msg">{{ chat.Message ?? 'No message yet' }}</div>

              <div class="chat-bottom-row">
                <!-- Price status -->
                <div class="price-status" v-if="chat.Inquiry_Status === 'Accepted'">
                  <span class="price-agreed">✅ ₱{{ chat.Agreed_Price }}/day agreed</span>
                </div>
                <div class="price-status" v-else-if="chat.Inquiry_Status === 'Pending'">
                  <span class="price-pending">💬 Your offer: ₱{{ chat.Offered_Price }}/day</span>
                </div>
                <div class="price-status" v-else>
                  <span class="price-listed">₱{{ chat.Offered_Price }}/day</span>
                </div>

                <!-- Unread badge -->
                <div class="unread-badge" v-if="chat.Inquiry_Status === 'Pending'">
                  New
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style="height: 80px"></div>
      </div>
    </ion-content>

    <!-- TAB BAR -->
    <div class="tab-bar">
            <!--Customer Tabs-->
      <template v-if="userRole?.toLowerCase() === 'customer'">
        <div class="tab-item" @click="goTo('/home')">
          <ion-icon name="grid-outline"></ion-icon>
          <span>Home</span>
        </div>
        <div class="tab-item active" @click="goTo('/chat')">
        <div class="notif-tab-wrap">
          <ion-icon name="chatbubble-outline"></ion-icon>
          <div class="tab-badge" v-if="totalUnread > 0">{{ totalUnread }}</div>
        </div>
        <span>Chat</span>
      </div>
        <div class="tab-item" @click="goTo('/transactions')">
          <ion-icon name="list-outline"></ion-icon>
          <span>Transactions</span>
        </div>
        <div class="tab-item" @click="goTo('/notifications')">
          <ion-icon name="notifications-outline"></ion-icon>
          <span>Alerts</span>
        </div>
      </template>

      <template v-else>
        <!-- Business Owner Tabs -->
        <div class="tab-item" @click="goTo('/owner-dashboard')">
          <ion-icon name="grid-outline"></ion-icon>
          <span>Dashboard</span>
        </div>
      <div class="tab-item active" @click="goTo('/chat')">
        <div class="notif-tab-wrap">
          <ion-icon name="chatbubble-outline"></ion-icon>
          <div class="tab-badge" v-if="totalUnread > 0">{{ totalUnread }}</div>
        </div>
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

        <div class="tab-item" @click="goTo('/notifications')">
          <ion-icon name="notifications-outline"></ion-icon>
          <span>Alerts</span>
        </div>
      </template>
    </div>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { IonPage, IonContent, IonIcon, useIonRouter, onIonViewWillEnter } from '@ionic/vue'
import { addIcons } from 'ionicons'
import {
  gridOutline, chatbubbleOutline, addOutline,
  listOutline, notificationsOutline, searchOutline
} from 'ionicons/icons'
import { inquiryAPI } from '@/api'

addIcons({
  'grid-outline': gridOutline,
  'chatbubble-outline': chatbubbleOutline,
  'add-outline': addOutline,
  'list-outline': listOutline,
  'notifications-outline': notificationsOutline,
  'search-outline': searchOutline,
})

const router = useIonRouter()
const searchQuery = ref('')
const isLoading = ref(false)
const chats = ref<any[]>([])
const userRole = ref('')

const filteredChats = computed(() =>
  chats.value.filter(c =>
    c.Vehicle_Model?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    c.Business_Name?.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
)

// unread = inquiries with Inquiry_Status === 'Pending'
const totalUnread = computed(() =>
  chats.value.filter(c => c.Inquiry_Status === 'Pending').length
)

async function loadChats() {
  isLoading.value = true
  try {
    const res = await inquiryAPI.getAll()
    chats.value = res.data.data ?? res.data
  } catch (err) {
    console.error('Failed to load negotiations', err)
  } finally {
    isLoading.value = false
  }
}

function loadUserRole() {
  const savedUser = localStorage.getItem('user')

  if (savedUser) {
    const user = JSON.parse(savedUser)

    // adjust this depending on your backend field
    userRole.value = user.Role || ''

    console.log('USER ROLE:', userRole.value)
  }
}

function openChat(chat: any) {
  router.push({ 
    path: `/negotiate/${chat.Inquiry_ID}`,
    query: { 
      vehicle: chat.Vehicle_Model, 
      dailyRate: String(chat.Offered_Price),
      ownerName: chat.Business_Name,
      vehicleName: chat.Vehicle_Model,
      withDriver: chat.With_Driver,
      customerAccountId: chat.Customer_Account_ID,
      ownerAccountId: chat.Business_Account_ID,
    } 
  })
}

const goTo = (path: string) => router.push(path)

onIonViewWillEnter(() => {
  loadUserRole()
  loadChats()
})

onMounted(() => {
  loadUserRole()
  loadChats()
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

.active-badge {
  background: #fc89d0;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 20px;
}

/* Search */
.search-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #ffffff;
  border-radius: 14px;
  padding: 12px 16px;
  margin: 14px 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  border: 1px solid #eee;
}
.search-icon { color: #bbb; font-size: 18px; }
.search-input {
  border: none; outline: none;
  width: 100%;
  font-size: 14px;
  color: #1a1a2e;
  background: transparent;
}
.search-input::placeholder { color: #bbb; }

/* Empty */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 32px;
  text-align: center;
}
.empty-icon  { font-size: 52px; margin-bottom: 14px; }
.empty-title { font-size: 17px; font-weight: 700; color: #1a1a2e; margin: 0 0 8px; }
.empty-sub   { font-size: 13px; color: #999; margin: 0 0 20px; }
.browse-btn {
  background: #fc89d0;
  color: #fff;
  border: none;
  border-radius: 20px;
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

/* Chat List */
.chat-list { padding: 0 16px; }

.chat-card {
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
  transition: all 0.15s;
}
.chat-card:active { transform: scale(0.98); }

.chat-vehicle-icon {
  width: 52px; height: 52px;
  background: #f4f6f9;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  flex-shrink: 0;
}

.chat-info { flex: 1; min-width: 0; }

.chat-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2px;
}
.chat-vehicle-name {
  font-size: 15px;
  font-weight: 700;
  color: #1a1a2e;
}
.chat-time {
  font-size: 11px;
  color: #bbb;
  flex-shrink: 0;
}

.chat-biz-name {
  font-size: 12px;
  color: #999;
  margin-bottom: 5px;
}

.chat-last-msg {
  font-size: 13px;
  color: #555;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 8px;
}

.chat-bottom-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price-agreed  { font-size: 12px; font-weight: 700; color: #3b6d11; }
.price-pending { font-size: 12px; font-weight: 700; color: #b83a96; }
.price-listed  { font-size: 12px; color: #aaa; }

.unread-badge {
  background: #fc89d0;
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  border-radius: 10px;
  padding: 2px 7px;
  min-width: 20px;
  text-align: center;
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