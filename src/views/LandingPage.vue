<template>
  <ion-page>
    <ion-content :fullscreen="true" class="landing-content">
      <div class="landing-wrapper">

        <div class="hero-section">
          <img src="@/assets/new-bg.png" alt="Vcon Background" class="bg-mobile" />
          <img src="@/assets/v-connect-bg-web.png" class="bg-web" />

          <div class="brand">
            <div class="brand-icon">🚗</div>
            <h1 class="brand-name">RentGo</h1>
            <p class="brand-tagline">Your trusted vehicle rental platform</p>
          </div>

          <div class="hero-cards">
            <div class="hero-card">
              <span class="hc-icon">🏢</span>
              <div>
                <div class="hc-label">50+ Businesses</div>
                <div class="hc-sub">Browse &amp; Compare</div>
              </div>
            </div>
            <div class="hero-card">
              <span class="hc-icon">🚘</span>
              <div>
                <div class="hc-label">200+ Vehicles</div>
                <div class="hc-sub">All types available</div>
              </div>
            </div>
            <div class="hero-card accent">
              <span class="hc-icon">💬</span>
              <div>
                <div class="hc-label">Negotiate Price</div>
                <div class="hc-sub">Get the best deal</div>
              </div>
            </div>
          </div>
        </div>

        <div class="cta-section">
          <h2 class="cta-title">Ready to ride?</h2>
          <p class="cta-sub">Sign up to browse vehicles, negotiate prices, and manage your bookings.</p>

          <div class="cta-buttons">
            <ion-button expand="block" class="btn-main" router-link="/register-type">
              Get Started
              <ion-icon name="arrow-forward-outline" slot="end"></ion-icon>
            </ion-button>
            <ion-button expand="block" fill="outline" class="btn-secondary" router-link="/login">
              I already have an account
            </ion-button>
          </div>

          <div class="feature-pills">
            <div class="pill">✅ Free to sign up</div>
            <div class="pill">📋 Track bookings</div>
            <div class="pill">💰 Negotiate prices</div>
          </div>
        </div>

      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonButton, IonIcon } from '@ionic/vue'
</script>

<style scoped>
.landing-content {
  --background: transparent;
}

.landing-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ── Hero ── */
.hero-section {
  position: relative;
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 64px 24px 40px;
  gap: 32px;
}

/* Background images */
.bg-mobile {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
  display: block;
}
.bg-web {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
  display: none;
}

@media (min-width: 768px) {
  .bg-mobile { display: none; }
  .bg-web    { display: block; }
}

.brand { position: relative; z-index: 1; }

/* dim the bg slightly so text is readable */
.hero-section::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 0;
  pointer-events: none;
}
.brand-icon { font-size: 52px; margin-bottom: 8px; }
.brand-name {
  font-size: 38px;
  font-weight: 800;
  color: #fff;
  margin: 0 0 6px;
  letter-spacing: -1.5px;
}
.brand-tagline {
  font-size: 14px;
  color: rgba(255,255,255,0.5);
  margin: 0;
}

.hero-cards {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  max-width: 340px;
}

.hero-card {
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  text-align: left;
  backdrop-filter: blur(12px);
}
.hero-card.accent {
  background: rgba(0,200,150,0.14);
  border-color: rgba(0,200,150,0.3);
}
.hc-icon { font-size: 26px; }
.hc-label { font-size: 14px; font-weight: 700; color: #fff; }
.hc-sub   { font-size: 12px; color: rgba(255,255,255,0.45); margin-top: 2px; }

/* ── CTA ── */
.cta-section {
  background: #fff;
  border-radius: 32px 32px 0 0;
  padding: 36px 24px 52px;
}
.cta-title {
  font-size: 24px;
  font-weight: 800;
  color: #0f0f1a;
  margin: 0 0 8px;
}
.cta-sub {
  font-size: 14px;
  color: #666;
  margin: 0 0 28px;
  line-height: 1.6;
}
.cta-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}
.btn-main {
  --background: #00c896;
  --background-activated: #00a87e;
  --color: #fff;
  --border-radius: 14px;
  --box-shadow: 0 6px 20px rgba(0,200,150,0.35);
  font-weight: 700;
  font-size: 16px;
  height: 52px;
}
.btn-secondary {
  --color: #0f0f1a;
  --border-color: #ddd;
  --border-radius: 14px;
  font-weight: 600;
  font-size: 15px;
  height: 52px;
}
.feature-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}
.pill {
  background: #f4f4f8;
  border-radius: 20px;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 600;
  color: #444;
}
</style>