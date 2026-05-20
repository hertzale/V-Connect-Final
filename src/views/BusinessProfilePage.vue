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
          <h1 class="biz-name">{{ biz.Business_Name }}</h1>
          <div class="biz-meta-row">
            <div class="biz-meta-item">
              <ion-icon name="star" class="star-icon"></ion-icon>
              {{ biz.Service_Area }}
            </div>
            <div class="biz-meta-item">
              <ion-icon name="location-outline"></ion-icon>
              {{ biz.Business_Address }}
            </div>
          </div>
          <div class="biz-type-badge">🏢 Rental Business</div>
        </div>

        <div class="biz-stats">
          <div class="bs-item">
            <div class="bs-val">{{ vehicleCount }}</div>
            <div class="bs-label">Vehicles</div>
          </div>
        </div>
      </div>

      <!-- Business Info -->
      <div class="section-card">
        <h2 class="card-title">Business Information</h2>

        <template v-if="!editMode">
          <div class="info-row">
            <div class="ir-label">Business Name</div>
            <div class="ir-val">{{ biz.Business_Name }}</div>
          </div>
          <div class="info-row">
            <div class="ir-label">Description</div>
            <div class="ir-val">{{ biz.Description }}</div>
          </div>
          <div class="info-row">
            <div class="ir-label">Address</div>
            <div class="ir-val">{{ biz.Business_Address }}</div>
          </div>
          <div class="info-row">
            <div class="ir-label">Contact Number</div>
            <div class="ir-val">{{ biz.Business_ContactNo }}</div>
          </div>
          <div class="info-row">
            <div class="ir-label">Email</div>
            <div class="ir-val">{{ biz.Business_Email }}</div>
          </div>
          <div class="info-row last">
            <div class="ir-label">Service Area</div>
            <div class="ir-val">{{ biz.Service_Area }}</div>
          </div>
        </template>

        <template v-else>
          <div class="form-group">
            <label class="form-label">Business Name</label>
            <input v-model="biz.Business_Name" type="text" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea v-model="biz.Description" class="form-textarea"></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Address</label>
            <textarea v-model="biz.Business_Address" class="form-textarea" style="height:60px"></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Contact Number</label>
            <input v-model="biz.Business_ContactNo" type="tel" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input v-model="biz.Business_Email" type="email" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Service Area</label>
            <input v-model="biz.Service_Area" type="text" class="form-input" />
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
          <div v-for="type in vehicleTypes" :key="type" class="type-tag">
            {{ type }}
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
            <div class="lic-num">{{ ownerLicense }}</div>
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
import { ref, onMounted } from 'vue'
import { useIonRouter } from '@ionic/vue'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonButton, IonContent, IonIcon
} from '@ionic/vue'
import { businessAPI, personAPI } from '@/api'

const router   = useIonRouter()
const editMode = ref(false)
const isLoading = ref(false)
const errorMsg  = ref('')
const ownerLicense = ref('')  // you would load this from the business data
const bizID = ref('')  // store the business ID
const vehicleTypes = ref<string[]>([])
// form fields mapped to DB columns
const biz = ref({
  Business_Name:    '',
  Description:      '',
  Business_Address: '',
  Business_ContactNo:   '',
  Business_Email:            '',
  Service_Area:     '',
})

// read-only from DB — no matching column, derive from vehicles
const vehicleCount = ref(0)

async function loadBusiness() {
  isLoading.value = true
  try {
    const res = await businessAPI.getAll()
    console.log('RAW response:', JSON.stringify(res.data))          // or getOne(id) if you have the ID
    const data = res.data.data ?? res.data
    
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const myAccountId = user.account_id || user.Account_ID

    const myBiz = Array.isArray(data) 
      ? data.find((b: any) => b.Owner_Account_ID === myAccountId)
      : data

    console.log('myBiz keys:', Object.keys(myBiz ?? {}))
  console.log('bizID found:', myBiz?.Business_ID)
    if (myBiz) {
      bizID.value = myBiz.Business_ID ?? ''
      biz.value.Business_Name      = myBiz.Business_Name      ?? ''
      biz.value.Description        = myBiz.Description        ?? ''
      biz.value.Business_Address   = myBiz.Business_Address   ?? ''
      biz.value.Business_ContactNo = myBiz.Business_ContactNo ?? ''
      biz.value.Business_Email     = myBiz.Business_Email     ?? ''
      biz.value.Service_Area       = myBiz.Service_Area       ?? ''

      const vRes = await businessAPI.getVehicles(bizID.value)
      const vehicles = vRes.data.data ?? vRes.data
      vehicleCount.value = vehicles.length
      vehicleTypes.value = [...new Set<string>(vehicles.map((v: any) => v.Vehicle_Type as string).filter(Boolean))]
    }
  } catch (err) {
    console.error('Failed to load business', err)
  } finally {
    isLoading.value = false
  }
}

async function loadProfile() {
  try{
    const res = await personAPI.getMe()
    const person = res.data.data ?? res.data
    ownerLicense.value = person.Drivers_License ?? '--'
  } catch (err){
    console.error('Failed to load profile', err)
  }
}
async function saveProfile() {
  console.log('bizID:', bizID.value)
  try {
    // you'll need the business ID — store it when loading
    await businessAPI.update(bizID.value, {
      business_name:       biz.value.Business_Name,
      description:         biz.value.Description,
      business_address:    biz.value.Business_Address,
      business_contactno: biz.value.Business_ContactNo,
      business_email:      biz.value.Business_Email,
      service_area:        biz.value.Service_Area,
    })
    editMode.value = false
    router.push('/owner-dashboard') // redirect back to dashboard after saving
  } catch (err) {
    errorMsg.value = 'Failed to save. Try again.'
  }
}

onMounted(async () => {
  await Promise.all([loadBusiness(), loadProfile()])
})
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