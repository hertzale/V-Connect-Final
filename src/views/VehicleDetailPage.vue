<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="detail-toolbar">
        <ion-buttons slot="start">
          <ion-back-button default-href="/businesses" text="" class="back-btn"></ion-back-button>
        </ion-buttons>
        <ion-title class="toolbar-title">Vehicle Details</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear">
            <ion-icon name="heart-outline" class="fav-icon"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="page-content">

      <!-- Image / Emoji -->
      <div class="vehicle-hero">
        <div class="vehicle-emoji">{{ vehicle.emoji }}</div>
        <div class="avail-badge" :class="vehicle.available ? 'avail' : 'unavail'">
          <ion-icon :name="vehicle.available ? 'checkmark-circle' : 'close-circle'"></ion-icon>
          {{ vehicle.available ? 'Available Now' : 'Currently Booked' }}
        </div>
      </div>

      <!-- Main Info -->
      <div class="info-card">
        <div class="info-top">
          <div>
            <h1 class="vehicle-name">{{ vehicle.name }}</h1>
            <div class="vehicle-type-tag">{{ vehicle.type }}</div>
          </div>
          <div class="price-block">
            <div class="price-val">₱{{ vehicle.price }}</div>
            <div class="price-unit">per day</div>
          </div>
        </div>

        <div class="rating-row">
          <ion-icon name="star" class="star-icon"></ion-icon>
          <span class="rating-val">{{ vehicle.rating }}</span>
          <span class="rating-count">({{ vehicle.reviews }} reviews)</span>
          <span class="dot">·</span>
          <span class="rental-count">{{ vehicle.rentals }} rentals</span>
        </div>

        <!-- Specs Grid -->
        <div class="specs-grid">
          <div class="spec-item">
            <ion-icon name="people-outline" class="spec-icon"></ion-icon>
            <div class="spec-label">Seats</div>
            <div class="spec-val">{{ vehicle.seats }}</div>
          </div>
          <div class="spec-item">
            <ion-icon name="settings-outline" class="spec-icon"></ion-icon>
            <div class="spec-label">Transmission</div>
            <div class="spec-val">{{ vehicle.transmission }}</div>
          </div>
          <div class="spec-item">
            <ion-icon name="water-outline" class="spec-icon"></ion-icon>
            <div class="spec-label">Fuel</div>
            <div class="spec-val">{{ vehicle.fuel }}</div>
          </div>
          <div class="spec-item">
            <ion-icon name="speedometer-outline" class="spec-icon"></ion-icon>
            <div class="spec-label">Year</div>
            <div class="spec-val">{{ vehicle.year }}</div>
          </div>
        </div>
      </div>

      <!-- Description -->
      <div class="section">
        <h2 class="section-title">Description</h2>
        <p class="desc-text">{{ vehicle.description }}</p>
      </div>

      <!-- Inclusions -->
      <div class="section">
        <h2 class="section-title">Inclusions</h2>
        <div class="inclusions">
          <div v-for="item in vehicle.inclusions" :key="item" class="inclusion-item">
            <ion-icon name="checkmark-outline" class="check-icon"></ion-icon>
            {{ item }}
          </div>
        </div>
      </div>

      <!-- Business Info -->
      <div class="section">
        <h2 class="section-title">Offered by</h2>
        <div class="biz-chip" @click="goToBusiness">
          <div class="biz-chip-avatar">🚗</div>
          <div class="biz-chip-info">
            <div class="biz-chip-name">{{ vehicle.businessName }}</div>
            <div class="biz-chip-rating">
              <ion-icon name="star" class="star-icon"></ion-icon>
              {{ vehicle.businessRating }} · {{ vehicle.businessLocation }}
            </div>
          </div>
          <ion-icon name="chevron-forward-outline" class="arrow"></ion-icon>
        </div>
      </div>

      <div style="height: 120px"></div>
    </ion-content>

    <!-- Footer Actions -->
    <ion-footer class="ion-no-border footer-bar">
      <div class="footer-inner">
        <ion-button
          expand="block"
          fill="outline"
          class="btn-negotiate"
          router-link="/negotiate"
          :disabled="!vehicle.available"
        >
          <ion-icon name="chatbubbles-outline" slot="start"></ion-icon>
          Negotiate Price
        </ion-button>
        <ion-button
          expand="block"
          class="btn-book"
          router-link="/booking"
          :disabled="!vehicle.available"
        >
          Book Now
          <ion-icon name="arrow-forward-outline" slot="end"></ion-icon>
        </ion-button>
      </div>
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton,
  IonTitle, IonButton, IonContent, IonIcon, IonFooter
} from '@ionic/vue'

const router = useRouter()

const vehicle = ref({
  id: 1,
  name: 'Toyota Vios 2022',
  emoji: '🚗',
  type: 'Sedan',
  price: '850',
  rating: '4.8',
  reviews: 47,
  rentals: 123,
  available: true,
  seats: 5,
  transmission: 'Automatic',
  fuel: 'Gasoline',
  year: '2022',
  description: 'A reliable and fuel-efficient sedan perfect for city driving or out-of-town trips. Well-maintained with regular servicing. Clean interior with AC, Bluetooth audio, and reverse camera.',
  inclusions: [
    'Unlimited mileage (Makati area)',
    'Full tank on pickup',
    'Comprehensive insurance',
    'Free roadside assistance',
    '24/7 support',
  ],
  businessName: 'AutoLux Rentals',
  businessRating: '4.8',
  businessLocation: 'Makati City',
})

function goToBusiness() {
  router.push('/business/1')
}
</script>

<style scoped>
.page-content { --background: #f5f5f7; }

.detail-toolbar {
  --background: #fff;
  --border-width: 0;
  box-shadow: 0 1px 0 #eee;
}
.toolbar-title { font-size: 16px; font-weight: 700; }
.back-btn { --color: #0f0f1a; }
.fav-icon { font-size: 22px; color: #555; }

/* Hero */
.vehicle-hero {
  background: linear-gradient(135deg, #f0f0f7, #e8e8f0);
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 12px;
  position: relative;
}
.vehicle-emoji { font-size: 80px; }
.avail-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  border-radius: 20px;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 700;
}
.avail-badge.avail { background: #e8fdf6; color: #00a87e; }
.avail-badge.unavail { background: #fde8e8; color: #e05555; }

/* Info Card */
.info-card {
  background: #fff;
  padding: 20px 20px 16px;
  margin-bottom: 2px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.04);
}
.info-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}
.vehicle-name {
  font-size: 22px;
  font-weight: 800;
  color: #0f0f1a;
  margin: 0 0 6px;
}
.vehicle-type-tag {
  display: inline-block;
  background: #f0f0f7;
  border-radius: 8px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  color: #555;
}
.price-block { text-align: right; }
.price-val { font-size: 24px; font-weight: 800; color: #00c896; }
.price-unit { font-size: 12px; color: #999; }

.rating-row {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: #555;
  margin-bottom: 18px;
}
.star-icon { color: #f5a623; font-size: 13px; }
.rating-val { font-weight: 700; }
.rating-count { color: #999; }
.rental-count { color: #999; }
.dot { color: #ddd; }

/* Specs */
.specs-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  background: #f8f8fb;
  border-radius: 16px;
  padding: 14px 8px;
}
.spec-item { text-align: center; }
.spec-icon { font-size: 20px; color: #00c896; margin-bottom: 4px; }
.spec-label { font-size: 10px; color: #999; margin-bottom: 2px; }
.spec-val { font-size: 12px; font-weight: 700; color: #0f0f1a; }

/* Sections */
.section {
  background: #fff;
  padding: 18px 20px;
  margin-top: 8px;
}
.section-title { font-size: 16px; font-weight: 800; color: #0f0f1a; margin: 0 0 10px; }
.desc-text { font-size: 14px; color: #555; line-height: 1.6; margin: 0; }

.inclusions { display: flex; flex-direction: column; gap: 8px; }
.inclusion-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #333;
}
.check-icon { color: #00c896; font-size: 16px; flex-shrink: 0; }

/* Business chip */
.biz-chip {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #f8f8fb;
  border-radius: 16px;
  padding: 14px 16px;
  cursor: pointer;
}
.biz-chip-avatar {
  width: 44px; height: 44px;
  background: linear-gradient(135deg,#667eea,#764ba2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}
.biz-chip-info { flex: 1; }
.biz-chip-name { font-size: 15px; font-weight: 700; color: #0f0f1a; margin-bottom: 3px; }
.biz-chip-rating { font-size: 12px; color: #777; display: flex; align-items: center; gap: 4px; }
.arrow { color: #ccc; }

/* Footer */
.footer-bar {
  background: #fff;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
}
.footer-inner {
  display: flex;
  gap: 10px;
  padding: 12px 16px 28px;
}
.btn-negotiate {
  flex: 1;
  --color: #00c896;
  --border-color: #00c896;
  --border-radius: 14px;
  font-weight: 700;
  height: 50px;
}
.btn-book {
  flex: 1.4;
  --background: #00c896;
  --color: #fff;
  --border-radius: 14px;
  --box-shadow: 0 4px 14px rgba(0,200,150,0.35);
  font-weight: 700;
  height: 50px;
}
</style>