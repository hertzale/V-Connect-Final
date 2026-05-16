<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="detail-toolbar">
        <ion-buttons slot="start">
          <ion-back-button default-href="/businesses" text="" class="back-btn"></ion-back-button>
        </ion-buttons>
        <ion-buttons slot="end">
          <ion-button fill="clear" class="share-btn">
            <ion-icon name="share-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="page-content">
      <!--Loading-->
      <div v-if="isLoading" style="text-align:center; padding: 60px 20px; color: #999;">
        Loading...
      </div>

      <!--NOT FoUND-->
      <div v-else-if="!business" style="text-align:center; padding: 60px 20px; color: #999;">
        Business not found.
      </div>
      
      <div v-else>
      <!-- Business Header -->
        <div class="biz-header">
          <div class="biz-header-emoji">🚗</div>
          <div class="biz-header-overlay">
            <h1 class="biz-header-name">{{ business?.Business_Name }}</h1>
            <div class="biz-header-meta">
              <ion-icon name="location-outline" class="star-icon"></ion-icon>
              <span>{{ business?.Service_Area }}</span>
            </div>
          </div>
        </div>
      <!-- Stats Row -->
      <div class="stats-row">
        <div class="stat-item">
          <div class="stat-val">{{ vehicles.length }}</div>
          <div class="stat-lbl">Vehicles</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-val">{{ business?.Business_Email ?? '—' }}</div>
          <div class="stat-lbl">Email</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-val">{{ business?.Business_ContactNo ?? '—' }}</div>
          <div class="stat-lbl">Contact</div>
        </div>
      </div>

      <!-- About -->
      <div class="section">
        <h2 class="section-title">About</h2>
        <p class="about-text">{{ business?.Description ?? 'No description available.' }}</p>
        <div class="contact-row">
          <div class="contact-chip">
            <ion-icon name="call-outline"></ion-icon> {{ business?.Business_ContactNo ?? '—' }}
          </div>
          <div class="contact-chip">
            <ion-icon name="location-outline"></ion-icon> {{ business?.Service_Area ?? '—' }}
          </div>
        </div>
      </div>

      <!-- Filter Chips -->
      <div class="section">
        <div class="filter-chips">
          <div
            v-for="f in vehicleFilters"
            :key="f"
            class="chip"
            :class="{ active: activeFilter === f }"
            @click="activeFilter = f"
          >{{ f }}</div>
        </div>
      </div>

      <!-- Vehicles -->
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">Available Vehicles</h2>
          <span class="section-count">{{ filteredVehicles.length }} available</span>
        </div>

        <div class="vehicles-grid">
          <div
            v-for="v in filteredVehicles"
            :key="v.Vehicle_ID"
            class="vehicle-card"
            @click="goToVehicle(v.Vehicle_ID)"
          >
            <div class="vehicle-img-wrapper">
              <div class="vehicle-img-placeholder">🚗</div>
              <div class="vehicle-status" :class="v.Vehicle_Status === 'Available' ? 'avail' : 'unavail'">
                {{ v.Vehicle_Status }}
              </div>
            </div>
            <div class="vehicle-info">
              <div class="vehicle-name">{{ v.Vehicle_Model }}</div>
              <div class="vehicle-type">{{ v.Vehicle_Type }}</div>
              <div class="vehicle-price">
                <span class="price-val">₱{{ Number(v.Daily_Rate).toLocaleString() }}</span>
                <span class="price-unit">/day</span>
              </div>
              <div class="vehicle-specs">
                <span>{{ v.Seat_Capacity }} seats</span>
                <span class="dot">·</span>
                <span>{{ v.Fuel_Type }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      <div style="height: 100px"></div>
    </ion-content>

    <!-- Bottom CTA -->
    <ion-footer class="ion-no-border footer-bar">
      <div class="footer-inner">
        <div class="footer-info">
          <div class="footer-label">Starting from</div>
          <div class="footer-price">₱{{ minPrice }}<span>/day</span></div>
        </div>
        <ion-button class="btn-book" router-link="/vehicles">
          View All Vehicles
          <ion-icon name="arrow-forward-outline" slot="end"></ion-icon>
        </ion-button>
      </div>
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton,
  IonButton, IonContent, IonIcon, IonFooter
} from '@ionic/vue'
import { businessAPI } from '@/api'

const router = useRouter()
const route  = useRoute()

const bizId        = route.params.id as string   // from /business/:id
const activeFilter = ref('All')
const vehicleFilters = ['All', 'Cars', 'Vans', 'Motorcycles', 'Trucks']
const isLoading    = ref(false)
const business     = ref<any>(null)
const vehicles     = ref<any[]>([])

const filteredVehicles = computed(() =>
  vehicles.value.filter(v =>
    activeFilter.value === 'All' || v.Vehicle_Type === activeFilter.value
  )
)

const minPrice = computed(() => {
  if (!vehicles.value.length) return 0
  return Math.min(...vehicles.value.map(v => Number(v.Daily_Rate))).toLocaleString()
})

async function loadBusiness() {
  isLoading.value = true
  try {
    const [bizRes, vehiclesRes] = await Promise.all([
      businessAPI.getOne(bizId),
      businessAPI.getVehicles(bizId),
    ])
    business.value = bizRes.data.data ?? bizRes.data
    vehicles.value = vehiclesRes.data.data ?? vehiclesRes.data
  } catch (err) {
    console.error('Failed to load business', err)
  } finally {
    isLoading.value = false
  }
}

function goToVehicle(id: string) {
  router.push(`/vehicle/${id}`)
}

onMounted(loadBusiness)
</script>

<style scoped>
.page-content { --background: #f5f5f7; }

.detail-toolbar {
  --background: transparent;
  --border-width: 0;
  position: absolute;
  top: 0; left: 0; right: 0;
  z-index: 10;
}
.back-btn { --color: #fff; }
.share-btn { --color: #fff; }

/* Business Header */
.biz-header {
  height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 24px;
  position: relative;
}
.biz-header-emoji {
  font-size: 64px;
  position: absolute;
  top: 50px;
}
.biz-header-overlay {
  text-align: center;
  z-index: 1;
}
.biz-header-name {
  font-size: 22px;
  font-weight: 800;
  color: #fff;
  margin: 0 0 4px;
  text-shadow: 0 2px 8px rgba(0,0,0,0.3);
}
.biz-header-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  font-size: 13px;
  color: rgba(255,255,255,0.85);
}
.star-icon { color: #ffd700; font-size: 12px; }
.dot { color: rgba(255,255,255,0.5); }

/* Stats */
.stats-row {
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 18px 16px;
  margin: -1px 0 0;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}
.stat-item { text-align: center; }
.stat-val { font-size: 20px; font-weight: 800; color: #0f0f1a; }
.stat-lbl { font-size: 12px; color: #999; margin-top: 2px; }
.stat-divider { width: 1px; height: 36px; background: #eee; }

/* Sections */
.section { padding: 20px 16px 0; }
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}
.section-title { font-size: 17px; font-weight: 800; color: #0f0f1a; margin: 0 0 10px; }
.section-count { font-size: 13px; color: #999; }

.about-text { font-size: 14px; color: #555; line-height: 1.6; margin: 0 0 12px; }
.contact-row { display: flex; gap: 10px; flex-wrap: wrap; }
.contact-chip {
  display: flex;
  align-items: center;
  gap: 5px;
  background: #f4f4f8;
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 13px;
  color: #444;
  font-weight: 500;
}

/* Filter chips */
.filter-chips {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: none;
}
.filter-chips::-webkit-scrollbar { display: none; }
.chip {
  background: #f4f4f8;
  border-radius: 20px;
  padding: 7px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #555;
  white-space: nowrap;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
}
.chip.active {
  background: #e8fdf6;
  color: #00a87e;
  border-color: #00c896;
}

/* Vehicles grid */
.vehicles-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.vehicle-card {
  background: #fff;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
  cursor: pointer;
}
.vehicle-img-wrapper { position: relative; }
.vehicle-img-placeholder {
  height: 100px;
  background: #f0f0f7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 44px;
}
.vehicle-status {
  position: absolute;
  top: 8px; right: 8px;
  border-radius: 8px;
  padding: 3px 8px;
  font-size: 10px;
  font-weight: 700;
}
.vehicle-status.avail { background: #e8fdf6; color: #00a87e; }
.vehicle-status.unavail { background: #fde8e8; color: #e05555; }

.vehicle-info { padding: 10px 12px 12px; }
.vehicle-name { font-size: 14px; font-weight: 700; color: #0f0f1a; margin-bottom: 2px; }
.vehicle-type { font-size: 11px; color: #999; margin-bottom: 6px; }
.vehicle-price { margin-bottom: 4px; }
.price-val { font-size: 16px; font-weight: 800; color: #00c896; }
.price-unit { font-size: 11px; color: #999; }
.vehicle-specs {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #aaa;
}

/* Footer */
.footer-bar {
  background: #fff;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
}
.footer-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px 28px;
}
.footer-label { font-size: 12px; color: #999; }
.footer-price { font-size: 20px; font-weight: 800; color: #0f0f1a; }
.footer-price span { font-size: 13px; color: #999; font-weight: 400; }
.btn-book {
  --background: #00c896;
  --color: #fff;
  --border-radius: 14px;
  --box-shadow: 0 4px 14px rgba(0,200,150,0.35);
  font-weight: 700;
  height: 48px;
  font-size: 14px;
}
</style>