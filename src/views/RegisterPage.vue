<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="page">
        <img src="@/assets/new-bg.png" alt="Vcon Background" class="bg-mobile"/>
        <img src="@/assets/v-connect-bg-web.png" alt="Vcon Background" class="bg-web"/>

        <div class="container">
          <img src="@/assets/v-connect.png" alt="vcunt logo" class="logo" />

          <div class="glass-panel">
            <h1 class="title">SIGN UP</h1>

            <!-- Type Badge -->
            <div :class="['type-badge', isBusiness ? 'badge-business' : 'badge-customer']">
              <span>{{ isBusiness ? '🚗 Registering as Vehicle Owner' : '👤 Registering as Customer' }}</span>
            </div>

            <p class="error-txt" v-if="errorMessage">{{ errorMessage }}</p>

            <div class="form-group">
              <label>Username</label>
              <div class="input-wrapper">
                <input type="text" placeholder="Create Username" v-model="username" />
              </div>
            </div>

            <div class="form-group">
              <label>Email</label>
              <div class="input-wrapper">
                <input type="text" placeholder="Enter Email" v-model="email">
              </div>
            </div>

            <div class="form-group">
              <label>Contact Number</label>
              <div class="input-wrapper">
                <input type="text" placeholder="Enter Contact Number" v-model="contact_number">
              </div>
            </div>

            <div class="form-group">
              <label>Address</label>
              <div class="input-wrapper">
                <input type="text" placeholder="Enter Home Address" v-model="address">
              </div>
            </div>

            <!-- Driver's License - Required for business, optional for customer -->
            <div class="form-group">
              <label>
                Driver's License
                <span class="label-tag" v-if="isBusiness">Required</span>
                <span class="label-tag optional" v-else>Optional</span>
              </label>
              <div class="input-wrapper">
                <input
                  type="text"
                  :placeholder="isBusiness ? 'Required to post vehicles' : 'Optional - needed for self-drive'"
                  v-model="drivers_license"
                />
              </div>
            </div>

            <div class="form-group">
              <label>Password</label>
              <div class="input-wrapper">
                <input type="password" placeholder="Create Password" v-model="password">
              </div>
            </div>

            <div class="form-group">
              <label>Confirm Password</label>
              <div class="input-wrapper">
                <input type="password" placeholder="Confirm Password" v-model="confirmpassword">
              </div>
            </div>

            <button class="btn" @click="register" :disabled="isLoading">
              {{ isLoading ? 'Signing up...' : 'SIGN UP' }}
            </button>

            <p class="register-link" @click="goLogin">
              Already Have an Account
            </p>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useIonRouter, IonPage, IonContent } from '@ionic/vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const router = useIonRouter()
const route = useRoute()

// Get type from URL query
const registerType = route.query.type || 'customer'
const isBusiness = computed(() => registerType === 'business')

const username = ref('')
const email = ref('')
const password = ref('')
const confirmpassword = ref('')
const errorMessage = ref('')
const address = ref('')
const contact_number = ref('')
const drivers_license = ref('')
const isLoading = ref(false)

const goLogin = () => {
  router.push('/login')
}

const register = async () => {
  // Validate FIRST before anything else
  if (!username.value || !email.value || !password.value ||
      !confirmpassword.value || !address.value || !contact_number.value) {
    errorMessage.value = 'Please fill in all fields'
    return
  }
  if (isBusiness.value && !drivers_license.value) {
    errorMessage.value = "Driver's license is required for vehicle owners"
    return
  }
  if (password.value !== confirmpassword.value) {
    errorMessage.value = 'Passwords do not match!'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    await axios.post('http://localhost:3000/api/auth/register', {
      name: username.value,
      email: email.value,
      contact_number: contact_number.value,
      address: address.value,
      drivers_license: drivers_license.value || null,
      password: password.value,
      role: isBusiness.value ? 'business' : 'customer'
    })

    if (isBusiness.value) {
      const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
        email: email.value,
        password: password.value
      })
      console.log('loginRes.data:', JSON.stringify(loginRes.data))
      const token = loginRes.data.data.token
      console.log('token:', token)

      // Store token first so auth interceptor picks it up
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(loginRes.data.user))

      await axios.post('http://localhost:3000/api/businesses', {
        business_name: username.value + "'s Business",
        business_address: address.value,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
    }

    router.push('/login')

  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'Registration failed.'
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
}

.bg-mobile {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  object-fit: cover;
  z-index: 0;
}

.bg-web {
  display: none;
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  object-fit: cover;
  z-index: 0;
}

@media (min-width: 768px) {
  .bg-mobile { display: none; }
  .bg-web { display: block; }
}

.logo {
  display: block;
  margin: 20px auto 0;
  width: 100px;
  height: 100px;
  object-fit: contain;
  filter: drop-shadow(0 0 15px rgba(3, 3, 66, 0.7));
}

.container {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 12px;
  padding: 50px 20px;
}

.glass-panel {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 24px;
  padding: 16px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  width: 332px;
  max-width: 95%;
}

.title {
  font-family: 'Planet Kosmos', sans-serif;
  font-size: 50px;
  margin-bottom: 8px;
  color: #ffffff;
}

/* Type Badge */
.type-badge {
  border-radius: 20px;
  padding: 6px 14px;
  margin-bottom: 12px;
  font-size: 12px;
  font-weight: 600;
}

.badge-customer {
  background: rgba(252, 137, 208, 0.2);
  border: 1px solid #fc89d0;
  color: #ffffff;
}

.badge-business {
  background: rgba(183, 11, 103, 0.3);
  border: 1px solid #b70b67;
  color: #ffffff;
}

.error-txt {
  font-family: 'Gil Sans MT', sans-serif;
  font-weight: 700;
  font-size: 0.85rem;
  color: #ff6b6b;
  text-align: center;
  margin: 4px 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  width: 250px;
  max-width: 400px;
  gap: 6px;
  margin-left: 30px;
  margin-right: 30px;
}

.form-group label {
  font-family: 'Gil Sans MT', sans-serif;
  font-weight: 700;
  font-size: 0.85rem;
  margin-top: 7px;
  color: aliceblue;
  display: flex;
  align-items: center;
  gap: 6px;
}

.label-tag {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  background: #b70b67;
  color: #ffffff;
  font-weight: 600;
}

.label-tag.optional {
  background: rgba(255,255,255,0.2);
}

.input-wrapper {
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 5px 10px;
  gap: 10px;
}

.input-wrapper input {
  font-family: 'Gil Sans MT', sans-serif;
  border: none;
  outline: none;
  width: 100%;
  font-size: 0.7rem;
  background: transparent;
  color: #ffffff;
}

.input-wrapper input::placeholder {
  color: rgba(255,255,255,0.5);
}

.btn {
  width: 200px;
  max-width: 400px;
  padding: 14px;
  background-color: #b70b67;
  color: white;
  border: none;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 2px;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 12px;
}

.btn:hover {
  background-color: #fc89d0;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.register-link {
  font-size: 13px;
  color: rgba(255,255,255,0.8);
  cursor: pointer;
  margin-top: 8px;
  margin-bottom: 8px;
}

.register-link:hover {
  color: #fc89d0;
}

/* Web responsive */
@media (min-width: 768px) {
  .glass-panel {
    width: 420px;
  }

  .form-group {
    width: 320px;
  }

  .title {
    font-size: 60px;
  }
}
</style>