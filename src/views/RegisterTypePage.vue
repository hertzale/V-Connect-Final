<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="page">

        <!-- Background -->
        <img src="@/assets/new-bg.png" class="bg-mobile" />
        <img src="@/assets/v-connect-bg-web.png" class="bg-web" />

        <div class="container">

          <!-- Logo -->
          <img src="@/assets/v-connect.png" alt="V-Connect Logo" class="logo" />

          <!-- Title -->
          <h1 class="title">Join V-Connect</h1>
          <p class="subtitle">How would you like to use V-Connect?</p>

          <!-- Customer Option -->
          <div class="option-card" @click="goToRegister('customer')">
            <div class="option-icon customer-icon">
              <ion-icon name="person-outline"></ion-icon>
            </div>
            <div class="option-text">
              <p class="option-title">I'm a Customer</p>
              <p class="option-desc">Browse and rent vehicles near you</p>
            </div>
            <ion-icon name="chevron-forward-outline" class="arrow"></ion-icon>
          </div>

          <!-- Business Owner Option -->
          <div class="option-card" @click="goToRegister('business')">
            <div class="option-icon business-icon">
              <ion-icon name="car-outline"></ion-icon>
            </div>
            <div class="option-text">
              <p class="option-title">I'm a Vehicle Owner</p>
              <p class="option-desc">List your vehicles and earn money</p>
            </div>
            <ion-icon name="chevron-forward-outline" class="arrow"></ion-icon>
          </div>

          <!-- Login Link -->
          <p class="login-link">
            Already have an account?
            <span @click="goToLogin">Log in</span>
          </p>

        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { IonPage, IonContent, IonIcon, useIonRouter } from '@ionic/vue'
import { addIcons } from 'ionicons'
import {
  personOutline,
  carOutline,
  chevronForwardOutline
} from 'ionicons/icons'

addIcons({
  'person-outline': personOutline,
  'car-outline': carOutline,
  'chevron-forward-outline': chevronForwardOutline
})

const router = useIonRouter()

const goToRegister = (type) => {
  router.push(`/register?type=${type}`)
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

/* Mobile background */
.bg-mobile {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
  opacity: 0.9;
}

/* Web background */
.bg-web {
  display: none;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
  opacity: 0.9;
}

@media (min-width: 768px) {
  .bg-mobile {
    display: none;
  }
  .bg-web {
    display: block;
  }
}

.container {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px 40px;
  max-width: 500px;
  margin: 0 auto;
}

.logo {
  width: 90px;
  height: 90px;
  object-fit: contain;
  margin-bottom: 20px;
  filter: drop-shadow(0 0 15px rgba(3, 3, 66, 0.7));
}

.title {
  font-family: 'Gil Sans MT', sans-serif;
  color: #ffffff;
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px;
  text-align: center;
  text-shadow: 1px 1px 4px rgba(0,0,0,0.8);
}

.subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  margin: 0 0 32px;
  text-align: center;
  text-shadow: 1px 1px 3px rgba(0,0,0,0.6);
}

.option-card {
  width: 100%;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 18px;
  padding: 20px 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.option-card:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
}

.option-card:active {
  transform: translateY(0);
}

.option-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  color: #ffffff;
  flex-shrink: 0;
}

.customer-icon {
  background: #fc89d0;
}

.business-icon {
  background: #b70b67;
}

.option-text {
  flex: 1;
}

.option-title {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 4px;
  text-shadow: 1px 1px 3px rgba(0,0,0,0.5);
}

.option-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.75);
  margin: 0;
}

.arrow {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.6);
  flex-shrink: 0;
}

.login-link {
  margin-top: 24px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.75);
  text-align: center;
}

.login-link span {
  color: #fc89d0;
  font-weight: 700;
  cursor: pointer;
  text-decoration: underline;
}

/* Web responsive */
@media (min-width: 768px) {
  .container {
    padding: 60px 40px;
  }

  .title {
    font-size: 36px;
  }

  .subtitle {
    font-size: 16px;
    margin-bottom: 40px;
  }

  .option-card {
    padding: 24px 20px;
    margin-bottom: 20px;
  }

  .option-icon {
    width: 60px;
    height: 60px;
    font-size: 30px;
  }

  .option-title {
    font-size: 18px;
  }

  .option-desc {
    font-size: 14px;
  }
}
</style>