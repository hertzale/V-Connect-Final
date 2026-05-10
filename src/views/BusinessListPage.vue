<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="custom-toolbar">
        <div class="toolbar-inner">
          <div class="greeting">
            <p class="greeting-sub">Good day 👋</p>
            <h1 class="greeting-name">Find a Rental</h1>
          </div>
          <ion-avatar class="user-avatar" router-link="/profile">
            <img src="https://ionicframework.com/docs/img/demos/avatar.svg" alt="avatar" />
          </ion-avatar>
        </div>

        <div class="search-bar" @click="searchActive = true">
          <ion-icon name="search-outline" class="search-icon"></ion-icon>
          <ion-searchbar
            v-model="searchQuery"
            placeholder="Search businesses or vehicles..."
            :show-cancel-button="searchActive ? 'always' : 'never'"
            @ionCancel="searchActive = false"
            class="custom-searchbar"
          ></ion-searchbar>
        </div>

        <div class="filter-chips">
          <div
            v-for="f in filters"
            :key="f.key"
            class="chip"
            :class="{ active: activeFilter === f.key }"
            @click="activeFilter = f.key"
          >
            <span>{{ f.icon }}</span> {{ f.label }}
          </div>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="page-content">
      <ion-refresher slot="fixed" @ionRefresh="doRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <!-- Featured -->
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">Featured Businesses</h2>
          <span class="section-link">See all</span>
        </div>

        <div class="featured-scroll">
          <div
            v-for="biz in featuredBusinesses"
            :key="biz.id"
            class="featured-card"
            @click="goToBusiness(biz.id)"
          >
            <div class="featured-img" :style="{ background: biz.color }">
              <span class="featured-emoji">{{ biz.emoji }}</span>
              <div class="featured-badge" v-if="biz.badge">{{ biz.badge }}</div>
            </div>
            <div class="featured-info">
              <div class="featured-name">{{ biz.name }}</div>
              <div class="featured-meta">
                <ion-icon name="star" class="star-icon"></ion-icon>
                <span>{{ biz.rating }}</span>
                <span class="dot">·</span>
                <span>{{ biz.vehicleCount }} vehicles</span>
              </div>
              <div class="featured-location">
                <ion-icon name="location-outline"></ion-icon>
                {{ biz.location }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- All Businesses -->
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">All Businesses</h2>
          <span class="section-count">{{ filteredBusinesses.length }} results</span>
        </div>

        <div class="biz-list">
          <div
            v-for="biz in filteredBusinesses"
            :key="biz.id"
            class="biz-card"
            @click="goToBusiness(biz.id)"
          >
            <div class="biz-avatar" :style="{ background: biz.color }">
              {{ biz.emoji }}
            </div>
            <div class="biz-info">
              <div class="biz-name">{{ biz.name }}</div>
              <div class="biz-meta">
                <ion-icon name="star" class="star-icon"></ion-icon>
                <span>{{ biz.rating }}</span>
                <span class="dot">·</span>
                <span>{{ biz.vehicleCount }} vehicles</span>
                <span class="dot">·</span>
                <span>{{ biz.location }}</span>
              </div>
              <div class="biz-tags">
                <span v-for="tag in biz.tags" :key="tag" class="tag">{{ tag }}</span>
              </div>
            </div>
            <div class="biz-arrow">
              <ion-icon name="chevron-forward-outline"></ion-icon>
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
  IonPage, IonHeader, IonToolbar, IonContent, IonSearchbar,
  IonIcon, IonAvatar, IonRefresher, IonRefresherContent
} from '@ionic/vue'

const router = useRouter()
const searchQuery = ref('')
const searchActive = ref(false)
const activeFilter = ref('all')

const filters = [
  { key: 'all', label: 'All', icon: '🗂️' },
  { key: 'car', label: 'Cars', icon: '🚗' },
  { key: 'van', label: 'Vans', icon: '🚐' },
  { key: 'motorcycle', label: 'Motorcycles', icon: '🏍️' },
  { key: 'truck', label: 'Trucks', icon: '🚛' },
]

const businesses = ref([
  {
    id: 1, name: 'AutoLux Rentals', emoji: '🚗', color: 'linear-gradient(135deg,#667eea,#764ba2)',
    rating: '4.8', vehicleCount: 12, location: 'Makati', tags: ['Cars', 'Vans'], badge: '⭐ Top Rated',
    type: 'car'
  },
  {
    id: 2, name: 'Speedy Wheels', emoji: '🏍️', color: 'linear-gradient(135deg,#f093fb,#f5576c)',
    rating: '4.6', vehicleCount: 8, location: 'BGC', tags: ['Motorcycles'], badge: null,
    type: 'motorcycle'
  },
  {
    id: 3, name: 'BizFleet Co.', emoji: '🚐', color: 'linear-gradient(135deg,#4facfe,#00f2fe)',
    rating: '4.7', vehicleCount: 6, location: 'Pasig', tags: ['Vans', 'Trucks'], badge: '🆕 New',
    type: 'van'
  },
  {
    id: 4, name: 'RoadKing Motors', emoji: '🚛', color: 'linear-gradient(135deg,#43e97b,#38f9d7)',
    rating: '4.5', vehicleCount: 10, location: 'QC', tags: ['Trucks', 'Cars'], badge: null,
    type: 'truck'
  },
  {
    id: 5, name: 'CityDrive PH', emoji: '🚙', color: 'linear-gradient(135deg,#fa709a,#fee140)',
    rating: '4.9', vehicleCount: 15, location: 'Manila', tags: ['Cars'], badge: '🔥 Popular',
    type: 'car'
  },
])

const featuredBusinesses = computed(() =>
  businesses.value.filter(b => b.badge)
)

const filteredBusinesses = computed(() => {
  return businesses.value.filter(b => {
    const matchSearch = b.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchFilter = activeFilter.value === 'all' || b.type === activeFilter.value
    return matchSearch && matchFilter
  })
})

function goToBusiness(id: number) {
  router.push(`/business/${id}`)
}

function doRefresh(event: any) {
  setTimeout(() => event.target.complete(), 1000)
}
</script>

<style scoped>
.page-content { --background: #f5f5f7; }

.custom-toolbar {
  --background: #ffffff;
  --padding-start: 0;
  --padding-end: 0;
  padding-bottom: 8px;
}

.toolbar-inner {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px 20px 8px;
}

.greeting-sub { font-size: 13px; color: #999; margin: 0 0 2px; }
.greeting-name { font-size: 22px; font-weight: 800; color: #0f0f1a; margin: 0; }

.user-avatar { width: 40px; height: 40px; cursor: pointer; }

.search-bar { padding: 0 12px 4px; }
.custom-searchbar {
  --background: #f4f4f8;
  --border-radius: 14px;
  --box-shadow: none;
  --placeholder-color: #aaa;
  padding: 0;
}

.filter-chips {
  display: flex;
  gap: 8px;
  padding: 4px 16px 8px;
  overflow-x: auto;
  scrollbar-width: none;
}
.filter-chips::-webkit-scrollbar { display: none; }

.chip {
  display: flex;
  align-items: center;
  gap: 5px;
  background: #f4f4f8;
  border-radius: 20px;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 600;
  color: #555;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}
.chip.active {
  background: #e8fdf6;
  color: #00a87e;
  border-color: #00c896;
}

/* Sections */
.section { padding: 20px 16px 0; }

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}
.section-title { font-size: 17px; font-weight: 800; color: #0f0f1a; margin: 0; }
.section-link  { font-size: 13px; color: #00c896; font-weight: 600; cursor: pointer; }
.section-count { font-size: 13px; color: #999; }

/* Featured horizontal scroll */
.featured-scroll {
  display: flex;
  gap: 14px;
  overflow-x: auto;
  padding-bottom: 8px;
  scrollbar-width: none;
}
.featured-scroll::-webkit-scrollbar { display: none; }

.featured-card {
  min-width: 200px;
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.07);
  cursor: pointer;
  flex-shrink: 0;
}
.featured-img {
  position: relative;
  height: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.featured-emoji { font-size: 40px; }
.featured-badge {
  position: absolute;
  top: 8px; right: 8px;
  background: rgba(255,255,255,0.9);
  border-radius: 10px;
  padding: 3px 8px;
  font-size: 11px;
  font-weight: 700;
}
.featured-info { padding: 12px 14px; }
.featured-name { font-size: 14px; font-weight: 700; color: #0f0f1a; margin-bottom: 4px; }
.featured-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}
.featured-location {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  color: #999;
}
.star-icon { color: #f5a623; font-size: 12px; }
.dot { color: #ccc; }

/* Biz list */
.biz-list { display: flex; flex-direction: column; gap: 10px; }

.biz-card {
  background: #fff;
  border-radius: 18px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  cursor: pointer;
}
.biz-avatar {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}
.biz-info { flex: 1; min-width: 0; }
.biz-name { font-size: 15px; font-weight: 700; color: #0f0f1a; margin-bottom: 3px; }
.biz-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #777;
  margin-bottom: 6px;
  flex-wrap: wrap;
}
.biz-tags { display: flex; gap: 6px; }
.tag {
  background: #f0f0f5;
  border-radius: 8px;
  padding: 3px 8px;
  font-size: 11px;
  font-weight: 600;
  color: #555;
}
.biz-arrow { color: #ccc; }
</style>