<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="toolbar">
        <ion-buttons slot="start">
          <ion-back-button default-href="/owner-dashboard" text="" class="back-btn"></ion-back-button>
        </ion-buttons>
        <ion-title class="toolbar-title">Business Profile</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" class="edit-btn" @click="editMode = !editMode">
            {{ editMode ? 'Cancel' : 'Edit' }}
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="page-content">

      <!-- Business Header -->
      <div class="biz-header">
        <div class="biz-banner"></div>
        <div class="biz-avatar-wrap">
          <div class="biz-avatar">🚗</div>
          <div class="avatar-cam" v-if="editMode">
            <ion-icon name="camera-outline"></ion-icon>
          </div>
        </div>
        <div class="biz-header-info">
          <h1 class="biz-name">{{ biz.name }}</h1>
          <div class="biz-meta-row">
            <div class="biz-meta-item">
              <ion-icon name="star" class="star-icon"></ion-icon>
              {{ biz.rating }}
            </div>
            <span class="dot">·</span>
            <div class="biz-meta-item">{{ biz.totalRentals }} rentals</div>
            <span class="dot">·</span>
            <div class="biz-meta-item">
              <ion-icon name="location-outline"></ion-icon>
              {{ biz.location }}
            </div>
          </div>
          <div class="biz-type-badge">🏢 Rental Business</div>
        </div>

        <div class="biz-stats">
          <div class="bs-item">
            <div class="bs-val">{{ biz.vehicleCount }}</div>
            <div class="bs-label">Vehicles</div>
          </div>
          <div class="bs-divider"></div>
          <div class="bs-item">
            <div class="bs-val">{{ biz.totalRentals }}</div>
            <div class="bs-label">Rentals</div>
          </div>
          <div class="bs-divider"></div>
          <div class="bs-item">
            <div class="bs-val">{{ biz.responseTime }}</div>
            <div class="bs-label">Response</div>
          </div>
          <div class="bs-divider"></div>
          <div class="bs-item">
            <div class="bs-val">{{ biz.memberSince }}</div>
            <div class="bs-label">Since</div>
          </div>
        </div>
      </div>

      <!-- Business Info -->
      <div class="section-card">
        <h2 class="card-title">Business Information</h2>

        <template v-if="!editMode">
          <div class="info-row">
            <div class="ir-label">Business Name</div>
            <div class="ir-val">{{ biz.name }}</div>
          </div>
          <div class="info-row">
            <div class="ir-label">Description</div>
            <div class="ir-val">{{ biz.description }}</div>
          </div>
          <div class="info-row">
            <div class="ir-label">Address</div>
            <div class="ir-val">{{ biz.address }}</div>
          </div>
          <div class="info-row">
            <div class="ir-label">Contact Number</div>
            <div class="ir-val">{{ biz.phone }}</div>
          </div>
          <div class="info-row">
            <div class="ir-label">Email</div>
            <div class="ir-val">{{ biz.email }}</div>
          </div>
          <div class="info-row last">
            <div class="ir-label">Operating Hours</div>
            <div class="ir-val">{{ biz.hours }}</div>
          </div>
        </template>

        <template v-else>
          <div class="form-group">
            <label class="form-label">Business Name</label>
            <input v-model="biz.name" type="text" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea v-model="biz.description" class="form-textarea"></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Address</label>
            <textarea v-model="biz.address" class="form-textarea" style="height:60px"></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Contact Number</label>
            <input v-model="biz.phone" type="tel" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input v-model="biz.email" type="email" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Operating Hours</label>
            <input v-model="biz.hours" type="text" class="form-input" />
          </div>
          <ion-button expand="block" class="btn-save" @click="saveProfile">
            Save Changes
            <ion-icon name="checkmark-outline" slot="end"></ion-icon>
          </ion-button>
        </template>
      </div>

      <!-- Vehicle Types Offered -->
      <div class="section-card">
        <h2 class="card-title">Vehicle Types Offered</h2>
        <div class="type-tags">
          <div v-for="type in biz.vehicleTypes" :key="type" class="type-tag">
            {{ type }}
          </div>
          <div class="type-tag add" v-if="editMode" @click="addType">
            <ion-icon name="add-outline"></ion-icon> Add Type
          </div>
        </div>
      </div>

      <!-- Driver License (Owner) -->
      <div class="section-card">
        <div class="section-header-row">
          <h2 class="card-title" style="margin:0">Owner's Driver License</h2>
          <div class="verified-badge">✅ Verified</div>
        </div>
        <div class="license-row">
          <ion-icon name="card-outline" class="lic-icon"></ion-icon>
          <div>
            <div class="lic-num">{{ biz.ownerLicense }}</div>
            <div class="lic-exp">Expires: {{ biz.licenseExp }}</div>
          </div>
        </div>
      </div>

      <!-- Danger Zone -->
      <div class="section-card danger-card">
        <h2 class="card-title danger-title">Danger Zone</h2>
        <p class="danger-sub">These actions are irreversible. Be careful.</p>
        <ion-button expand="block" fill="outline" class="btn-deactivate">
          <ion-icon name="pause-circle-outline" slot="start"></ion-icon>
          Deactivate Business
        </ion-button>
      </div>

      <div style="height: 80px"></div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonButton, IonContent, IonIcon
} from '@ionic/vue'

const editMode = ref(false)

const biz = ref({
  name: 'AutoLux Rentals',
  description: 'Premium vehicle rental service offering reliable cars, vans, and motorcycles for all your travel needs. Serving Metro Manila and nearby areas.',
  address: '123 Ayala Ave, Makati City, Metro Manila',
  phone: '+63 912 345 6789',
  email: 'autolux@email.com',
  hours: 'Mon–Sun, 6:00 AM – 10:00 PM',
  location: 'Makati City',
  rating: '4.8',
  vehicleCount: 12,
  totalRentals: 342,
  responseTime: '~1hr',
  memberSince: '2023',
  vehicleTypes: ['🚗 Cars', '🚐 Vans', '🏍️ Motorcycles'],
  ownerLicense: 'N01-23-456789',
  licenseExp: 'Dec 2027',
})

function saveProfile() {
  editMode.value = false
}

function addType() {
  // open type selector
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
.edit-btn { --color: #00c896; font-weight: 700; font-size: 15px; }

/* Business Header */
.biz-header {
  background: #fff;
  margin-bottom: 8px;
}
.biz-banner {
  height: 100px;
  background: linear-gradient(135deg, #667eea, #764ba2);
}
.biz-avatar-wrap {
  position: relative;
  width: 80px;
  margin: -40px auto 0;
  z-index: 1;
}
.biz-avatar {
  width: 80px; height: 80px;
  background: #fff;
  border-radius: 22px;
  border: 3px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 38px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
}
.avatar-cam {
  position: absolute;
  bottom: 0; right: -4px;
  width: 26px; height: 26px;
  background: #00c896;
  border-radius: 50%;
  border: 2px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 13px;
}

.biz-header-info {
  text-align: center;
  padding: 12px 20px 0;
}
.biz-name { font-size: 22px; font-weight: 800; color: #0f0f1a; margin: 0 0 6px; }
.biz-meta-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 13px;
  color: #666;
  margin-bottom: 10px;
}
.biz-meta-item { display: flex; align-items: center; gap: 3px; }
.star-icon { color: #f5a623; font-size: 13px; }
.dot { color: #ddd; }
.biz-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #f0f0f7;
  border-radius: 16px;
  padding: 5px 14px;
  font-size: 12px;
  font-weight: 600;
  color: #555;
  margin-bottom: 18px;
}

.biz-stats {
  display: flex;
  align-items: center;
  justify-content: space-around;
  border-top: 1px solid #f5f5f7;
  padding: 16px 0;
  margin: 0 16px;
}
.bs-item { text-align: center; }
.bs-val { font-size: 18px; font-weight: 800; color: #0f0f1a; margin-bottom: 2px; }
.bs-label { font-size: 11px; color: #999; }
.bs-divider { width: 1px; height: 32px; background: #f0f0f5; }

/* Section Cards */
.section-card {
  background: #fff;
  padding: 18px 20px;
  margin-bottom: 8px;
}
.card-title { font-size: 16px; font-weight: 800; color: #0f0f1a; margin: 0 0 14px; }

.section-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.verified-badge { font-size: 13px; font-weight: 700; color: #00a87e; }

/* Info Rows */
.info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f7;
  gap: 12px;
}
.info-row.last { border-bottom: none; }
.ir-label { font-size: 13px; color: #999; flex-shrink: 0; width: 110px; }
.ir-val { font-size: 14px; font-weight: 600; color: #0f0f1a; text-align: right; flex: 1; line-height: 1.4; }

/* Form */
.form-group { margin-bottom: 14px; }
.form-label { display: block; font-size: 12px; font-weight: 700; color: #999; margin-bottom: 5px; }
.form-input {
  width: 100%;
  background: #f4f4f8;
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 11px 14px;
  font-size: 15px;
  color: #0f0f1a;
  outline: none;
  box-sizing: border-box;
}
.form-input:focus { border-color: #00c896; }
.form-textarea {
  width: 100%;
  background: #f4f4f8;
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 11px 14px;
  font-size: 14px;
  color: #0f0f1a;
  outline: none;
  resize: none;
  height: 80px;
  box-sizing: border-box;
  font-family: inherit;
}
.form-textarea:focus { border-color: #00c896; }
.btn-save {
  --background: #00c896;
  --color: #fff;
  --border-radius: 14px;
  font-weight: 700;
  height: 48px;
  margin-top: 6px;
}

/* Type Tags */
.type-tags { display: flex; flex-wrap: wrap; gap: 8px; }
.type-tag {
  background: #f0f0f7;
  border-radius: 12px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  color: #444;
}
.type-tag.add {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #e8fdf6;
  color: #00a87e;
  cursor: pointer;
  border: 2px dashed #00c896;
}

/* License */
.license-row {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #f8f8fb;
  border-radius: 14px;
  padding: 14px;
}
.lic-icon { font-size: 28px; color: #00c896; }
.lic-num { font-size: 15px; font-weight: 700; color: #0f0f1a; margin-bottom: 2px; }
.lic-exp { font-size: 12px; color: #999; }

/* Danger Zone */
.danger-card { border-top: 3px solid #fde8e8; }
.danger-title { color: #e05555; }
.danger-sub { font-size: 13px; color: #999; margin: -8px 0 14px; }
.btn-deactivate {
  --color: #e05555;
  --border-color: #e05555;
  --border-radius: 14px;
  font-weight: 700;
  height: 50px;
}
</style>