<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>Set Up Your Business</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <p class="subtitle">Before you continue, set up your business profile.</p>

      <p class="error-txt" v-if="errorMsg">{{ errorMsg }}</p>

      <div class="form-group">
        <label>Business Name *</label>
        <input v-model="businessName" type="text" placeholder="e.g. Kurt's Kotse" class="form-input" />
      </div>

      <div class="form-group">
        <label>Business Address *</label>
        <input v-model="businessAddress" type="text" placeholder="e.g. Naga City" class="form-input" />
      </div>

      <div class="form-group">
        <label>Description</label>
        <textarea v-model="description" placeholder="Tell customers about your business..." class="form-input" rows="3"></textarea>
      </div>

      <div class="form-group">
        <label>Service Area</label>
        <input v-model="serviceArea" type="text" placeholder="e.g. Naga, Pili, Cam Sur" class="form-input" />
      </div>

      <div class="form-group">
        <label>Contact Number</label>
        <input v-model="contactNumber" type="tel" placeholder="09XXXXXXXXX" class="form-input" />
      </div>

      <ion-button expand="block" @click="createBusiness" :disabled="isLoading" class="btn-create">
        {{ isLoading ? 'Creating...' : 'Create Business' }}
      </ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useIonRouter } from '@ionic/vue'
import {
  IonPage, IonHeader, IonToolbar, IonTitle,
  IonContent, IonButton
} from '@ionic/vue'
import { businessAPI } from '@/api'

const router = useIonRouter()
const businessName   = ref('')
const businessAddress = ref('')
const description    = ref('')
const serviceArea    = ref('')
const contactNumber  = ref('')
const errorMsg       = ref('')
const isLoading      = ref(false)

const createBusiness = async () => {
  if (!businessName.value || !businessAddress.value) {
    errorMsg.value = 'Business name and address are required.'
    return
  }
  isLoading.value = true
  try {
    await businessAPI.create({
      business_name:    businessName.value,
      business_address: businessAddress.value,
      description:      description.value || undefined,
      service_area:     serviceArea.value || undefined,
      business_contactno: contactNumber.value || undefined,
    })
    router.push('/owner-dashboard')
  } catch (err: any) {
    errorMsg.value = err.response?.data?.message || 'Failed to create business.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.subtitle {
  font-size: 14px;
  color: #888;
  margin-bottom: 20px;
}
.error-txt {
  color: #e05555;
  font-size: 13px;
  margin-bottom: 12px;
}
.form-group {
  margin-bottom: 16px;
}
.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #555;
  margin-bottom: 6px;
}
.form-input {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid #ddd;
  border-radius: 12px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
  background: #f9f9f9;
}
.form-input:focus {
  border-color: #00c896;
}
.btn-create {
  --background: #00c896;
  --border-radius: 14px;
  font-weight: 700;
  margin-top: 10px;
}
</style>