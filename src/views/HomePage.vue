<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="page">

        <!-- HEADER -->
        <div class="header">
          <img src="@/assets/giphy.gif" alt="header-bg" class="backgroundHeader">
          <img src="@/assets/v-connect.png" alt="vcunt logo" class="logo" />
          <div class="header-top">
            <div class="greeting">
              <p class="greeting-sub">Good Day!</p>
              <p class="greeting-name">{{ userName }}</p>
            </div>

            <div class="avatar-wrapper">
              <div class="avatar" @click="toggleMenu">{{ userInitials }}</div>
              <div class="dropdown-menu" v-if="showMenu">
                <div class="dropdown-item" @click="goToProfile">
                  <ion-icon name="person-outline"></ion-icon>
                  <span>Profile</span>
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

          <div class="search-bar">
            <ion-icon name="search-outline" class="search-icon"></ion-icon>
            <input
              type="text"
              placeholder="Search businesses..."
              v-model="searchQuery"
              class="search-input"
            />
          </div>
        </div>

        <!-- CATEGORY PILLS -->
        <div class="categories">
          <span
            v-for="cat in categories"
            :key="cat"
            :class="['pill', selectedCategory === cat ? 'pill-active' : '']"
            @click="selectedCategory = cat"
          >{{ cat }}</span>
        </div>

        <!-- LOADING -->
        <div v-if="isLoading" class="listings">
          <p class="section-title">Loading businesses...</p>
        </div>

        <!-- EMPTY -->
        <div v-else-if="filteredBusinesses.length === 0" class="listings">
          <p class="section-title">No businesses found</p>
        </div>

        <!-- BUSINESS LISTING -->
        <div class="listings" v-else>
          <p class="section-title">Rental Businesses near you</p>

          <div
            v-for="biz in filteredBusinesses"
            :key="biz.Business_ID"
            class="business-card"
            @click="goToBusiness(biz)"
          >
            <div class="card-image">
              <ion-icon name="business-outline" class="biz-icon"></ion-icon>
            </div>
            <div class="card-body">
              <div class="card-row">
                <div class="card-info">
                  <p class="biz-name">{{ biz.Business_Name }}</p>
                  <p class="biz-info">
                    <ion-icon name="location-outline" class="inline-icon"></ion-icon>
                    {{ biz.Business_Address || biz.Owner_Address || 'Naga City' }}
                  </p>
                  <p class="biz-info">
                    <ion-icon name="car-outline" class="inline-icon"></ion-icon>
                    {{ biz.Vehicle_Count ?? '—' }} vehicles available
                  </p>
                </div>
                <div class="card-right">
                  <span class="badge-active">Active</span>
                  <div class="view-btn">
                    <ion-icon name="chevron-forward-outline"></ion-icon>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </ion-content>

    <!-- TAB BAR -->
    <div class="tab-bar">
      <div class="tab-item active" @click="goTo('/home')">
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
      <div class="tab-item" @click="goTo('/notifications')">
        <ion-icon name="notifications-outline"></ion-icon>
        <span>Alerts</span>
      </div>
    </div>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  IonPage, IonContent, IonIcon,
  useIonRouter, onIonViewWillEnter
} from '@ionic/vue'
import { addIcons } from 'ionicons'
import {
  searchOutline, gridOutline, addCircleOutline, carOutline, addOutline,
  notificationsOutline, listOutline, chatbubbleOutline, personOutline,
  settingsOutline, logOutOutline, businessOutline, locationOutline,
  chevronForwardOutline
} from 'ionicons/icons'
import { businessAPI } from '@/api'

addIcons({
  'search-outline': searchOutline,
  'grid-outline': gridOutline,
  'notifications-outline': notificationsOutline,
  'add-circle-outline': addCircleOutline,
  'car-outline': carOutline,
  'add-outline': addOutline,
  'list-outline': listOutline,
  'chatbubble-outline': chatbubbleOutline,
  'person-outline': personOutline,
  'settings-outline': settingsOutline,
  'log-out-outline': logOutOutline,
  'business-outline': businessOutline,
  'location-outline': locationOutline,
  'chevron-forward-outline': chevronForwardOutline
})

const router = useIonRouter()
const searchQuery = ref('')
const selectedCategory = ref('All')
const userName = ref('Guest')
const userInitials = ref('??')
const showMenu = ref(false)
const businesses = ref<any[]>([])
const isLoading = ref(false)

const categories = ['All', 'Tricycle', 'Motorcycle', 'Car', 'Van']

const loadUser = () => {
  const savedUser = localStorage.getItem('user')
  if (savedUser) {
    const user = JSON.parse(savedUser)
    userName.value = user.name || 'Guest'
    const names = user.name.split(' ')
    userInitials.value = names.map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  }
}

const toggleMenu = () => { showMenu.value = !showMenu.value }
const goToProfile = () => { showMenu.value = false; router.push('/profile') }
const goToSettings = () => { showMenu.value = false; router.push('/settings') }
const logout = () => {
  showMenu.value = false
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}
const closeMenu = (e: Event) => {
  if (!(e.target as HTMLElement).closest('.avatar-wrapper')) showMenu.value = false
}

const loadBusinesses = async () => {
  isLoading.value = true
  try {
    const response = await businessAPI.getAll()
    // ⚠️ adjust this once you check your backend response shape:
    // if your backend returns { data: [...] }  → response.data.data
    // if your backend returns [...]             → response.data
    businesses.value = response.data.data ?? response.data
    console.log('Businesses:', businesses.value)
  } catch (err) {
    console.error('Failed to load businesses', err)
  } finally {
    isLoading.value = false
  }
}

const filteredBusinesses = computed(() => {
  return businesses.value.filter((b: any) => {
    const matchSearch =
      b.Business_Name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      b.Business_Address?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      b.Owner_Address?.toLowerCase().includes(searchQuery.value.toLowerCase())

    // filters businesses that carry this vehicle type — adjust column name as needed
    const matchCategory =
      selectedCategory.value === 'All' ||
      b.Vehicle_Types?.includes(selectedCategory.value)

    return matchSearch && matchCategory
  })
})

const goToBusiness = (biz: any) => {
  router.push(`/business/${biz.Business_ID}`)
}

const goTo = (path: string) => router.push(path)

onIonViewWillEnter(async () => {
  loadUser()
  await loadBusinesses()
})

onMounted(async () => {
  loadUser()
  await loadBusinesses()
  document.addEventListener('click', closeMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', closeMenu)
})
</script>

<style scoped>
.page {
  background: #f4f6f9;
  min-height: 100vh;
}

.header {
  background: #1a3a5c;
  padding: 130px 16px 15px;
  position: relative;
  overflow: visible;
}

.backgroundHeader {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  z-index: 0;
  opacity: 0.7;
}

.logo {
  position: absolute;
  top: 12px; left: 16px;
  width: 30px; height: 30px;
  object-fit: contain;
  filter: drop-shadow(0 0 15px rgba(3,3,66,0.7));
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  position: relative;
  z-index: 1;
}

.greeting-sub {
  font-family: 'Gil Sans MT', sans-serif;
  color: #ffffff; font-size: 15px; margin: 0;
}
.greeting-name {
  font-family: 'Gil Sans MT', sans-serif;
  color: #ffffff; font-size: 18px; font-weight: 600; margin: 4px 0 0;
}

.avatar-wrapper { position: relative; z-index: 999; }
.avatar {
  width: 42px; height: 42px; border-radius: 50%;
  background: #b83a96; color: #e8f4ff;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 600; cursor: pointer;
}

.dropdown-menu {
  position: absolute; top: 50px; right: 0;
  background: #ffffff; border-radius: 14px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  min-width: 180px; overflow: hidden; z-index: 200;
}
.dropdown-item {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 16px; cursor: pointer;
  font-size: 14px; color: #1a1a2e; transition: background 0.2s;
}
.dropdown-item:hover { background: #f4f6f9; }
.dropdown-item ion-icon { font-size: 18px; color: #1a3a5c; }
.dropdown-divider { height: 0.5px; background: #e0e0e0; margin: 4px 0; }
.dropdown-item.logout { color: #a83434; }
.dropdown-item.logout ion-icon { color: #a83434; }

.search-bar {
  border-radius: 10px;
  border: 1.5px solid rgba(255,255,255,0.8);
  padding: 10px 14px;
  display: flex; align-items: center; gap: 10px;
  background: transparent; z-index: 10;
}
.search-icon { color: #ffffff; font-size: 18px; }
.search-input {
  border: none; outline: none; width: 100%;
  font-size: 14px; color: #ffffff; background: transparent;
}
.search-input::placeholder { color: rgba(255,255,255,0.7); }

.categories {
  display: flex; gap: 8px;
  padding: 12px 16px; overflow-x: auto;
}
.pill {
  background: #ffffff; color: #888; font-size: 12px;
  padding: 6px 16px; border-radius: 20px;
  white-space: nowrap; border: 0.5px solid #ddd; cursor: pointer;
}
.pill-active {
  background: #fc89d0; color: #ffffff;
  filter: drop-shadow(0 0 1px rgba(3,3,66,0.7));
}

.listings { padding: 0 16px 100px; }
.section-title {
  font-size: 13px; font-weight: 600; color: #888; margin: 0 0 12px;
}

/* Business Card */
.business-card {
  background: #ffffff; border-radius: 14px;
  border: 0.5px solid #e0e0e0; margin-bottom: 14px;
  overflow: hidden; cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}
.business-card:active {
  transform: scale(0.98);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.card-image {
  background: #e8f0f8; height: 90px;
  display: flex; align-items: center; justify-content: center;
}
.biz-icon { font-size: 48px; color: #2d6a9f; opacity: 0.5; }

.card-body { padding: 12px; }
.card-row {
  display: flex; justify-content: space-between; align-items: center;
}
.card-info { flex: 1; }

.biz-name {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 15px; font-weight: 600; color: #1a1a2e; margin: 0 0 4px;
}
.biz-info {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 12px; color: #888; margin: 0 0 3px;
  display: flex; align-items: center; gap: 4px;
}
.inline-icon { font-size: 12px; }

.card-right {
  display: flex; flex-direction: column; align-items: flex-end; gap: 8px;
}
.badge-active {
  background: #eaf3de; color: #3b6d11;
  font-size: 11px; padding: 3px 10px; border-radius: 20px;
}
.view-btn {
  width: 32px; height: 32px; background: #f4f6f9;
  border-radius: 50%; display: flex;
  align-items: center; justify-content: center; color: #1a3a5c;
}

/* Tab Bar */
.tab-bar {
  position: fixed; bottom: 0; left: 0; width: 100%;
  background: #ffffff; border-top: 0.5px solid #e0e0e0;
  display: flex; justify-content: space-around;
  padding: 10px 0; z-index: 100;
}
.tab-item {
  display: flex; flex-direction: column;
  align-items: center; gap: 4px;
  cursor: pointer; color: #888; font-size: 10px;
}
.tab-item ion-icon { font-size: 22px; }
.tab-item.active { color: #fc89d0; }
.plus-btn {
  width: 48px; height: 48px; border-radius: 50%;
  background: #ef70be; display: flex;
  align-items: center; justify-content: center;
  margin-top: -24px; box-shadow: 0 4px 12px rgba(255,137,208,0.5);
}
.plus-btn ion-icon { font-size: 26px; color: #ffffff; }
</style>