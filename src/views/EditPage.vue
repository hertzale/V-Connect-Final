<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="page">
        <img src="@/assets/new-bg.png" class="bg-mobile" />
        <img src="@/assets/new-bg.png" class="bg-web" />

        <div class="container">
          <!-- Header -->
          <div class="post-header">
            <div class="back-btn" @click="goBack">
              <ion-icon name="arrow-back-outline"></ion-icon>
            </div>
            <h1 class="header-title">Edit Vehicle</h1>
          </div>

          <!-- Form -->
          <div class="form-card">

            <!-- Vehicle Type -->
            <div class="form-group">
              <label>Vehicle Type</label>
              <select v-model="form.vehicleType" class="input-field">
                <option value="" disabled>Select type</option>
                <option>Cars</option>
                <option>Vans</option>
                <option>Motorcycles</option>
                <option>Trucks</option>
              </select>
            </div>

            <!-- Vehicle Model -->
            <div class="form-group">
              <label>Vehicle Model</label>
              <input type="text" placeholder="e.g. Toyota Vios 2022"
                v-model="form.vehicleModel" class="input-field" />
            </div>

            <!-- Vehicle Color -->
            <div class="form-group">
              <label>Vehicle Color</label>
              <input type="text" placeholder="e.g. White"
                v-model="form.vehicleColor" class="input-field" />
            </div>

            <!-- Seat Capacity -->
            <div class="form-group">
              <label>Seat Capacity</label>
              <input type="number" placeholder="e.g. 5"
                v-model="form.seatCapacity" class="input-field" />
            </div>

            <!-- Daily Rate -->
            <div class="form-group">
              <label>Daily Rate (₱)</label>
              <input type="number" placeholder="e.g. 800"
                v-model="form.dailyRate" class="input-field" />
            </div>

            <!-- Plate Number -->
            <div class="form-group">
              <label>Plate Number</label>
              <input type="text" placeholder="Enter plate number"
                v-model="form.plateNumber" class="input-field" />
            </div>

            <!-- Registration Date -->
            <div class="form-group">
              <label>Registration Date</label>
              <input type="date" v-model="form.registrationDate"
                class="input-field" />
            </div>

            <!-- Fuel Type -->
            <div class="form-group">
              <label>Fuel Type (Optional)</label>
              <input type="text" placeholder="e.g. Gasoline"
                v-model="form.fuelType" class="input-field" />
            </div>

            <!-- Error Message -->
            <p class="error-txt" v-if="errorMessage">{{ errorMessage }}</p>

            <!-- Submit Button -->
            <button class="btn" @click="submitEdit" :disabled="isLoading">
              {{ isLoading ? 'Saving...' : 'SAVE CHANGES' }}
            </button>

          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useIonRouter, IonPage, IonContent, IonIcon } from '@ionic/vue'
import { useRoute } from 'vue-router'
import { addIcons } from 'ionicons'
import { arrowBackOutline } from 'ionicons/icons'
import { vehicleAPI } from '@/api'

addIcons({ 'arrow-back-outline': arrowBackOutline })

const router = useIonRouter()
const route = useRoute()
const vehicleId = route.params.id // ← gets ID from URL

const errorMessage = ref('')
const isLoading = ref(false)

const form = reactive({
  vehicleType: '',
  vehicleModel: '',
  vehicleColor: '',
  seatCapacity: '',
  dailyRate: '',
  plateNumber: '',
  registrationDate: '',
  fuelType: ''
})

// Load existing vehicle data
onMounted(async () => {
  try {
    const response = await vehicleAPI.getOne(vehicleId)
    const v = response.data.data

    // Pre-fill form with existing data
    form.vehicleType = v.Vehicle_Type
    form.vehicleModel = v.Vehicle_Model
    form.vehicleColor = v.Vehicle_Color
    form.seatCapacity = v.Seat_Capacity
    form.dailyRate = v.Daily_Rate
    form.plateNumber = v.Plate_Number
    form.registrationDate = v.Registration_Date?.split('T')[0] // format date
    form.fuelType = v.Fuel_Type || ''
  } catch (err) {
    errorMessage.value = 'Failed to load vehicle data'
  }
})

const goBack = () => router.back()

const submitEdit = async () => {
  if (
    !form.vehicleType ||
    !form.vehicleModel ||
    !form.seatCapacity ||
    !form.dailyRate ||
    !form.plateNumber ||
    !form.registrationDate
  ) {
    errorMessage.value = 'Please fill in all fields'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    await vehicleAPI.update(vehicleId, {
      vehicle_type: form.vehicleType,
      vehicle_model: form.vehicleModel,
      vehicle_color: form.vehicleColor,
      seat_capacity: Number(form.seatCapacity),
      daily_rate: Number(form.dailyRate),
      plate_number: form.plateNumber,
      registration_date: form.registrationDate,
      fuel_type: form.fuelType || null
    })

    router.push('/listings') // ← redirect after saving

  } catch (err) {
    if (err.response?.data?.message) {
      errorMessage.value = err.response.data.message
    } else {
      errorMessage.value = 'Failed to save changes'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  padding-bottom: 40px;
}

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

@media(min-width: 768px) {
  .bg-mobile { display: none; }
  .bg-web { display: block; }
}

.container {
  position: relative;
  z-index: 1;
  padding: 48px 16px 40px;
}

.post-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.back-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #ffffff;
  font-size: 20px;
}

.header-title {
  font-family: 'Gil Sans MT', sans-serif;
  color: #ffffff;
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}

.form-card {
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 24px;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #ffffff;
}

.input-field {
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.4);
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 13px;
  color: #ffffff;
  outline: none;
  width: 100%;
}

.input-field::placeholder {
  color: rgba(255,255,255,0.5);
}

select.input-field option {
  color: #1a1a2e;
  background: #ffffff;
}

.error-txt {
  color: #ff6b6b;
  font-size: 13px;
  text-align: center;
  margin: 0;
}

.btn {
  width: 100%;
  padding: 14px;
  background: #b70b67;
  color: #ffffff;
  border: none;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 6px;
}

.btn:hover {
  background: #fc89d0;
}
</style>