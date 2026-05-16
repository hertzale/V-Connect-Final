<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="page">

        <img src="@/assets/new-bg.png" alt="Vcon Background" class="bg-mobile" />
        <img src="@/assets/v-connect-bg-web.png" class="bg-web" />

        <div class="container">

          <!-- Header -->
          <div class="post-header">
            <div class="back-btn" @click="goBack">
              <ion-icon name="arrow-back-outline"></ion-icon>
            </div>
            <h1 class="header-title">Leave a Review</h1>
          </div>

          <!-- Vehicle Summary -->
          <div class="glass-card vehicle-card">
            <div class="vc-icon">
              <ion-icon name="car-outline"></ion-icon>
            </div>
            <div class="vc-info">
              <p class="vc-name">{{ vehicleName }}</p>
              <p class="vc-meta">{{ bizName }} · {{ rentalDates }}</p>
              <p class="vc-id">Transaction: {{ transactionId }}</p>
            </div>
          </div>

          <!-- Already Submitted -->
          <div class="glass-card submitted-card" v-if="alreadySubmitted">
            <div class="submitted-icon">✅</div>
            <p class="submitted-title">Review Already Submitted!</p>
            <p class="submitted-sub">You have already left a review for this rental.</p>
            <!-- Show existing review -->
            <div class="existing-review">
              <div class="star-display">
                <span
                  v-for="s in 5"
                  :key="s"
                  class="star-display-item"
                  :class="s <= existingScore ? 'star-filled' : 'star-empty'"
                >★</span>
              </div>
              <p class="existing-comment">{{ existingComment }}</p>
            </div>
          </div>

          <!-- Feedback Form -->
          <div v-else>

            <!-- Star Rating -->
            <div class="glass-card rating-card">
              <p class="card-label">How was your experience?</p>
              <div class="stars-row">
                <div
                  v-for="s in 5"
                  :key="s"
                  class="star"
                  :class="s <= hoverStar || s <= score ? 'star-active' : ''"
                  @click="score = s"
                  @mouseenter="hoverStar = s"
                  @mouseleave="hoverStar = 0"
                >★</div>
              </div>
              <p class="score-label">{{ scoreLabel }}</p>
            </div>

            <!-- Comments -->
            <div class="glass-card">
              <p class="card-label">Tell us more (optional)</p>
              <textarea
                v-model="comments"
                :placeholder="commentPlaceholder"
                class="comment-input"
                maxlength="150"
              ></textarea>
              <p class="char-count">{{ comments.length }}/150</p>
            </div>

            <!-- Quick Tags -->
            <div class="glass-card">
              <p class="card-label">Quick Tags</p>
              <div class="tags-row">
                <div
                  v-for="tag in quickTags"
                  :key="tag"
                  :class="['tag', selectedTags.includes(tag) ? 'tag-active' : '']"
                  @click="toggleTag(tag)"
                >{{ tag }}</div>
              </div>
            </div>

            <!-- Error -->
            <p class="error-txt" v-if="errorMessage">{{ errorMessage }}</p>

            <!-- Submit -->
            <button
              class="btn-submit"
              @click="submitFeedback"
              :disabled="isLoading || score === 0"
            >
              {{ isLoading ? 'Submitting...' : 'Submit Review' }}
              <ion-icon name="send-outline"></ion-icon>
            </button>

            <p class="submit-note" v-if="score === 0">
              Please select a star rating to continue
            </p>

          </div>

        </div>
        <div style="height: 40px"></div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { IonPage, IonContent, IonIcon, useIonRouter, onIonViewWillEnter } from '@ionic/vue'
import { addIcons } from 'ionicons'
import { arrowBackOutline, carOutline, sendOutline } from 'ionicons/icons'
import api from '@/api'

addIcons({
  'arrow-back-outline': arrowBackOutline,
  'car-outline': carOutline,
  'send-outline': sendOutline,
})

const router = useIonRouter()
const route  = useRoute()

// From route query — passed from TransactionPage
const transactionId = ref(route.query.transactionId as string || '')
const vehicleId     = ref(route.query.vehicleId     as string || '')
const vehicleName   = ref(route.query.vehicleName   as string || 'Vehicle')
const bizName       = ref(route.query.bizName       as string || 'Owner')
const rentalDates   = ref(route.query.rentalDates   as string || '')

// Form state
const score         = ref(0)
const hoverStar     = ref(0)
const comments      = ref('')
const selectedTags  = ref<string[]>([])
const isLoading     = ref(false)
const errorMessage  = ref('')
const alreadySubmitted = ref(false)
const existingScore    = ref(0)
const existingComment  = ref('')

const quickTags = [
  '✅ Clean vehicle', '⏰ On time', '👍 Great service',
  '💰 Worth the price', '🚗 Good condition', '📞 Responsive owner',
  '⚠️ Needs improvement', '🔧 Minor issues'
]

const scoreLabel = computed(() => {
  const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent!']
  return hoverStar > 0 ? labels[hoverStar] : labels[score.value] || 'Tap a star to rate'
})

const commentPlaceholder = computed(() => {
  if (score.value >= 4) return 'What did you love about this rental?'
  if (score.value === 3) return 'What could be improved?'
  if (score.value <= 2) return 'Tell us what went wrong...'
  return 'Share your experience...'
})

const toggleTag = (tag: string) => {
  const idx = selectedTags.value.indexOf(tag)
  if (idx === -1) selectedTags.value.push(tag)
  else selectedTags.value.splice(idx, 1)

  // Append tag to comments
  const tagText = selectedTags.value.join(', ')
  if (tagText && !comments.value.includes(tagText.split(',')[0])) {
    comments.value = tagText
  }
}

const submitFeedback = async () => {
  if (score.value === 0) {
    errorMessage.value = 'Please select a rating.'
    return
  }

  isLoading.value  = true
  errorMessage.value = ''

  try {
    await api.post('/api/feedback', {
      transaction_id:      transactionId.value,
      vehicle_id:          vehicleId.value,
      score:               score.value,
      comments:            comments.value || null,
      date_submitted:      new Date().toISOString().split('T')[0],
    })

    // Show success and go back
    alreadySubmitted.value = true
    existingScore.value    = score.value
    existingComment.value  = comments.value

    setTimeout(() => {
      router.push('/transactions')
    }, 2000)

  } catch (err: any) {
    if (err.response?.status === 409) {
      // Already submitted
      alreadySubmitted.value = true
    } else {
      errorMessage.value = err.response?.data?.message || 'Failed to submit review. Try again.'
    }
  } finally {
    isLoading.value = false
  }
}

// Mock fallback if no query params
const loadMockIfEmpty = () => {
  if (!transactionId.value) {
    transactionId.value = 'TXN-0001'
    vehicleId.value     = 'VH-001'
    vehicleName.value   = 'Toyota Vios 2022'
    bizName.value       = 'AutoLux Rentals'
    rentalDates.value   = 'Jun 10 → Jun 13'
  }
}

const goBack = () => router.back()

onIonViewWillEnter(loadMockIfEmpty)
onMounted(loadMockIfEmpty)
</script>

<style scoped>
.page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  padding-bottom: 40px;
}
.bg-mobile {
  display: block; position: absolute;
  inset: 0; width: 100%; height: 100%;
  object-fit: cover; z-index: 0; opacity: 0.9;
}
.bg-web {
  display: none; position: absolute;
  inset: 0; width: 100%; height: 100%;
  object-fit: cover; z-index: 0; opacity: 0.9;
}
@media (min-width: 768px) {
  .bg-mobile { display: none; }
  .bg-web    { display: block; }
}

.container {
  position: relative;
  z-index: 1;
  padding: 48px 16px 20px;
}

/* Header */
.post-header {
  display: flex; align-items: center;
  gap: 12px; margin-bottom: 16px;
}
.back-btn {
  width: 36px; height: 36px; border-radius: 50%;
  background: rgba(255,255,255,0.2);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #ffffff; font-size: 20px; flex-shrink: 0;
}
.header-title {
  font-family: 'Gil Sans MT', sans-serif;
  color: #ffffff; font-size: 20px; font-weight: 700; margin: 0;
}

/* Glass Card */
.glass-card {
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 18px;
  padding: 16px;
  margin-bottom: 14px;
}

/* Vehicle Card */
.vehicle-card {
  display: flex;
  align-items: center;
  gap: 14px;
}
.vc-icon {
  width: 50px; height: 50px;
  background: rgba(255,255,255,0.1);
  border-radius: 14px;
  display: flex; align-items: center;
  justify-content: center;
  font-size: 26px;
  color: rgba(255,255,255,0.7);
  flex-shrink: 0;
}
.vc-name {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 15px; font-weight: 800;
  color: #ffffff; margin: 0 0 3px;
}
.vc-meta {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 12px; color: rgba(255,255,255,0.6); margin: 0 0 2px;
}
.vc-id {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 11px; color: rgba(255,255,255,0.35); margin: 0;
}

/* Card Label */
.card-label {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 12px; font-weight: 700;
  color: rgba(255,255,255,0.5);
  text-transform: uppercase; letter-spacing: 0.5px;
  margin: 0 0 14px;
}

/* Stars */
.rating-card { text-align: center; }
.stars-row {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 10px;
}
.star {
  font-size: 42px;
  color: rgba(255,255,255,0.2);
  cursor: pointer;
  transition: all 0.15s;
  line-height: 1;
}
.star:hover { transform: scale(1.15); }
.star-active { color: #fc89d0; }
.score-label {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 15px; font-weight: 700;
  color: rgba(255,255,255,0.7); margin: 0;
}

/* Comments */
.comment-input {
  width: 100%;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 14px; color: #ffffff;
  outline: none; resize: none;
  height: 90px;
  box-sizing: border-box;
  font-family: 'Gil Sans MT', sans-serif;
  transition: border 0.2s;
}
.comment-input::placeholder { color: rgba(255,255,255,0.3); }
.comment-input:focus { border-color: #fc89d0; }
.char-count {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 11px; color: rgba(255,255,255,0.35);
  text-align: right; margin: 6px 0 0;
}

/* Quick Tags */
.tags-row { display: flex; flex-wrap: wrap; gap: 8px; }
.tag {
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 12px; font-weight: 600;
  color: rgba(255,255,255,0.7);
  cursor: pointer;
  font-family: 'Gil Sans MT', sans-serif;
  transition: all 0.2s;
}
.tag-active {
  background: rgba(183,11,103,0.4);
  border-color: #fc89d0;
  color: #ffffff;
}

/* Error */
.error-txt {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 13px; color: #ff9090;
  text-align: center; margin: 0 0 12px;
}

/* Submit */
.btn-submit {
  width: 100%; padding: 14px;
  background: #b70b67; border: none;
  border-radius: 50px; color: #ffffff;
  font-size: 15px; font-weight: 700;
  letter-spacing: 1px; cursor: pointer;
  display: flex; align-items: center;
  justify-content: center; gap: 8px;
  font-family: 'Gil Sans MT', sans-serif;
  transition: background 0.2s;
  margin-bottom: 8px;
}
.btn-submit:hover    { background: #fc89d0; }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
.submit-note {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 12px; color: rgba(255,255,255,0.4);
  text-align: center; margin: 0;
}

/* Already Submitted */
.submitted-card { text-align: center; }
.submitted-icon { font-size: 48px; margin-bottom: 10px; }
.submitted-title {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 18px; font-weight: 800;
  color: #ffffff; margin: 0 0 6px;
}
.submitted-sub {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 13px; color: rgba(255,255,255,0.5); margin: 0 0 16px;
}
.existing-review {
  background: rgba(255,255,255,0.08);
  border-radius: 12px; padding: 12px;
}
.star-display {
  display: flex; justify-content: center;
  gap: 4px; margin-bottom: 8px;
}
.star-display-item { font-size: 24px; }
.star-filled { color: #fc89d0; }
.star-empty  { color: rgba(255,255,255,0.2); }
.existing-comment {
  font-family: 'Gil Sans MT', sans-serif;
  font-size: 13px; color: rgba(255,255,255,0.7);
  font-style: italic; margin: 0;
}
</style>