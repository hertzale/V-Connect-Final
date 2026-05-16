<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="negotiate-toolbar">
        <ion-buttons slot="start">
          <ion-back-button default-href="/transaction-requests" text="" class="back-btn"></ion-back-button>
        </ion-buttons>
        <div class="toolbar-center">
          <div class="toolbar-customer-name">{{ customerName }}</div>
          <div class="toolbar-vehicle">{{ vehicleName }}</div>
        </div>
        <ion-buttons slot="end">
          <ion-button fill="clear" @click="showCounterModal = true" :disabled="!!agreedPrice">
            <ion-icon name="pricetag-outline" class="offer-icon"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>

      <!-- Price Summary Bar -->
      <div class="price-bar">
        <div class="price-bar-item">
          <span class="pb-label">Listed Price</span>
          <span class="pb-val listed">₱{{ listedPrice }}/day</span>
        </div>
        <ion-icon name="arrow-forward-outline" class="arrow-between"></ion-icon>
        <div class="price-bar-item">
          <span class="pb-label">Customer Offer</span>
          <span class="pb-val offer" v-if="customerOffer">₱{{ customerOffer }}/day</span>
          <span class="pb-val none" v-else>None yet</span>
        </div>
        <div class="price-bar-item" v-if="agreedPrice">
          <span class="pb-label">✅ Agreed</span>
          <span class="pb-val agreed">₱{{ agreedPrice }}/day</span>
        </div>
      </div>
    </ion-header>

    <!-- Loading -->
    <ion-content class="chat-content" ref="chatContent" v-if="isLoading">
      <div style="padding: 60px 20px; text-align: center; color: #999;">
        Loading inquiry...
      </div>
    </ion-content>

    <ion-content class="chat-content" ref="chatContent" v-else>
      <div class="chat-wrapper">

        <!-- Date label -->
        <div class="date-label">{{ formatDate(inquiry?.Created_At) }}</div>

        <!-- Inquiry Offer Card -->
        <div class="msg-row msg-left" v-if="inquiry">
          <div class="msg-avatar">👤</div>
          <div class="msg-bubble-wrap">
            <div class="offer-card offer-theirs">
              <div class="offer-card-label">💬 Customer sent an offer</div>
              <div class="offer-card-price">
                ₱{{ Number(inquiry.Offered_Price).toLocaleString() }}<span>/day</span>
              </div>
              <div class="offer-card-details">
                {{ calcDays(inquiry.Start_Date, inquiry.End_Date) }} day(s) ·
                {{ formatDate(inquiry.Start_Date) }} to {{ formatDate(inquiry.End_Date) }}
              </div>
              <div class="offer-card-message" v-if="inquiry.Message">
                💬 "{{ inquiry.Message }}"
              </div>

              <!-- Actions — only if still Pending -->
              <div class="offer-actions" v-if="inquiry.Inquiry_Status === 'Pending' && !agreedPrice">
                <ion-button size="small" fill="outline" class="btn-decline"
                  @click="declineOffer" :disabled="isActing">
                  Decline
                </ion-button>
                <ion-button size="small" fill="outline" class="btn-counter"
                  @click="showCounterModal = true" :disabled="isActing">
                  Counter
                </ion-button>
                <ion-button size="small" class="btn-accept"
                  @click="acceptOffer" :disabled="isActing">
                  {{ isActing ? '...' : 'Accept ✓' }}
                </ion-button>
              </div>

              <div v-if="inquiry.Inquiry_Status === 'Accepted'" class="offer-accepted-tag">
                ✅ You accepted this offer
              </div>
              <div v-if="inquiry.Inquiry_Status === 'Rejected'" class="offer-declined-tag">
                ❌ You declined this offer
              </div>
            </div>
            <div class="msg-time">{{ formatTime(inquiry.Created_At) }}</div>
          </div>
        </div>

        <!-- Chat Messages -->
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="msg-row"
          :class="msg.sender === 'me' ? 'msg-right' : 'msg-left'"
        >
          <div v-if="msg.sender === 'customer'" class="msg-avatar">👤</div>

          <div class="msg-bubble-wrap">
            <!-- Counter offer card -->
            <div
              v-if="msg.type === 'counter'"
              class="offer-card offer-mine"
            >
              <div class="offer-card-label">💬 Your counteroffer</div>
              <div class="offer-card-price">
                ₱{{ msg.offeredPrice?.toLocaleString() }}<span>/day</span>
              </div>
              <div class="offer-card-details" v-if="msg.offerDays">
                {{ msg.offerDays }} day(s) · {{ msg.startDate }} to {{ msg.endDate }}
              </div>
              <div v-if="msg.status === 'Pending'" class="offer-pending-tag">⏳ Waiting for response</div>
              <div v-if="msg.status === 'Accepted'" class="offer-accepted-tag">✅ Customer accepted</div>
              <div v-if="msg.status === 'Rejected'" class="offer-declined-tag">❌ Customer declined</div>
            </div>

            <!-- Regular text bubble -->
            <div
              v-else
              class="msg-bubble"
              :class="msg.sender === 'me' ? 'bubble-mine' : 'bubble-theirs'"
            >
              {{ msg.text }}
            </div>

            <div class="msg-time">{{ msg.time }}</div>
          </div>
        </div>

        <!-- Agreed Banner -->
        <div v-if="agreedPrice" class="agreed-banner">
          <ion-icon name="checkmark-circle" class="agreed-icon"></ion-icon>
          <div>
            <div class="agreed-title">Price Agreed! ₱{{ agreedPrice }}/day</div>
            <div class="agreed-sub">
              The customer will now proceed to booking.
            </div>
          </div>
        </div>

        <div style="height: 20px"></div>
      </div>
    </ion-content>

    <!-- Input Area -->
    <ion-footer class="ion-no-border chat-footer" v-if="!agreedPrice && !isLoading">
      <div class="chat-input-area">
        <div class="quick-actions">
          <div class="quick-chip" @click="addMessage('Thank you for your interest!')">
            Thank you!
          </div>
          <div class="quick-chip" @click="addMessage('The vehicle is available on your requested dates.')">
            Available ✅
          </div>
          <div class="quick-chip" @click="addMessage('Please note that fuel is not included in the rental.')">
            Fuel not included
          </div>
          <div class="quick-chip" @click="addMessage('Pickup is at our main location.')">
            Pickup info
          </div>
        </div>

        <div class="input-row">
          <ion-textarea
            v-model="inputText"
            placeholder="Type a message..."
            :auto-grow="true"
            :rows="1"
            class="chat-input"
            @keydown.enter.prevent="sendMessage"
          ></ion-textarea>
          <ion-button
            fill="clear"
            class="send-btn"
            @click="sendMessage"
            :disabled="!inputText.trim()"
          >
            <ion-icon name="send" class="send-icon"></ion-icon>
          </ion-button>
        </div>
      </div>
    </ion-footer>

    <!-- Agreed Footer -->
    <ion-footer class="ion-no-border agreed-footer" v-if="agreedPrice && !isLoading">
      <div class="agreed-footer-inner">
        <div class="agreed-info">
          <p class="agreed-info-label">Agreed Price</p>
          <p class="agreed-info-val">₱{{ agreedPrice }}/day</p>
        </div>
        <p class="agreed-info-sub">
          Waiting for customer to proceed to booking...
        </p>
      </div>
    </ion-footer>

    <!-- Counter Offer Modal -->
    <ion-modal :is-open="showCounterModal" @did-dismiss="showCounterModal = false" class="offer-modal">
      <div class="modal-inner">
        <div class="modal-handle"></div>
        <h2 class="modal-title">Send Counteroffer</h2>
        <p class="modal-sub">
          Customer offered <strong>₱{{ inquiry?.Offered_Price }}/day</strong>. Enter your counter price.
        </p>

        <div class="form-group">
          <label class="form-label">Your Price (per day)</label>
          <div class="price-input-row" :class="counterAmountError ? 'input-error' : ''">
            <span class="peso-sign">₱</span>
            <input
              v-model.number="counterAmount"
              type="number"
              placeholder="0"
              class="price-input"
              min="1"
            />
          </div>
          <p v-if="counterAmountError" class="field-error">{{ counterAmountError }}</p>
        </div>

        <div class="form-group">
          <label class="form-label">
            Message (optional)
            <span class="char-count">{{ counterMessage.length }}/150</span>
          </label>
          <textarea
            v-model="counterMessage"
            placeholder="e.g. Best I can offer for this vehicle..."
            class="offer-textarea"
            maxlength="150"
          ></textarea>
        </div>

        <div class="modal-actions">
          <ion-button fill="outline" class="btn-cancel" @click="showCounterModal = false">
            Cancel
          </ion-button>
          <ion-button class="btn-send-offer" @click="sendCounter" :disabled="isSendingCounter">
            {{ isSendingCounter ? 'Sending...' : 'Send Counter' }}
          </ion-button>
        </div>
      </div>
    </ion-modal>

    <!-- Toast -->
    <ion-toast
      :is-open="toast.show"
      :message="toast.message"
      :color="toast.color"
      :duration="2500"
      position="bottom"
      @did-dismiss="toast.show = false"
    ></ion-toast>

  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import {
  IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton,
  IonButton, IonContent, IonFooter, IonIcon, IonTextarea,
  IonModal, IonToast, useIonRouter, onIonViewWillEnter
} from '@ionic/vue'
import { addIcons } from 'ionicons'
import {
  arrowBackOutline, pricetagOutline, arrowForwardOutline,
  checkmarkCircle, send, informationCircleOutline
} from 'ionicons/icons'
import { inquiryAPI, notificationAPI } from '@/api'

addIcons({
  'arrow-back-outline': arrowBackOutline,
  'pricetag-outline': pricetagOutline,
  'arrow-forward-outline': arrowForwardOutline,
  'checkmark-circle': checkmarkCircle,
  'send': send,
  'information-circle-outline': informationCircleOutline,
})

// ─── Types ─────────────────────────────────────────────────
type InquiryStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Completed'

interface ChatMessage {
  id: number
  sender: 'me' | 'customer'
  type: 'text' | 'counter'
  text?: string
  offeredPrice?: number
  offerDays?: number
  startDate?: string
  endDate?: string
  status?: InquiryStatus
  time: string
}

// ─── Route params ──────────────────────────────────────────
const route  = useRoute()
const router = useIonRouter()

const inquiryId      = ref(route.params.id as string || route.query.inquiryId as string || '')
const vehicleName    = ref(route.query.vehicleName   as string || 'Vehicle')
const customerName   = ref(route.query.customerName  as string || 'Customer')
const listedPrice    = ref(Number(route.query.dailyRate) || 0)
const customerOffer  = ref<number | null>(null)
const agreedPrice    = ref<number | null>(null)

// ─── State ─────────────────────────────────────────────────
const inquiry          = ref<any>(null)
const isLoading        = ref(false)
const isActing         = ref(false)
const isSendingCounter = ref(false)
const showCounterModal = ref(false)
const inputText        = ref('')
const counterAmount    = ref<number | ''>('')
const counterMessage   = ref('')
const chatContent      = ref<any>(null)
const messages         = ref<ChatMessage[]>([])
let msgId = 100

// ─── Toast ─────────────────────────────────────────────────
const toast = ref({ show: false, message: '', color: 'success' })
const showToast = (message: string, color: 'success' | 'danger' = 'success') => {
  toast.value = { show: true, message, color }
}

// ─── Validation ────────────────────────────────────────────
const counterAmountError = computed(() => {
  if (counterAmount.value === '') return ''
  if (Number(counterAmount.value) <= 0) return 'Price must be greater than ₱0.'
  return ''
})

// ─── Helpers ───────────────────────────────────────────────
function getNow() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatDate(dt: string) {
  if (!dt) return '—'
  return new Date(dt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatTime(dt: string) {
  if (!dt) return ''
  return new Date(dt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function calcDays(start: string, end: string) {
  if (!start || !end) return 0
  return Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86400000)
}

async function scrollBottom() {
  await nextTick()
  chatContent.value?.$el?.scrollToBottom(300)
}

// ─── Load Inquiry ──────────────────────────────────────────
async function loadInquiry() {
  if (!inquiryId.value) return
  isLoading.value = true
  try {
    const res = await inquiryAPI.getOne(inquiryId.value)
    inquiry.value = res.data.data ?? res.data

    customerOffer.value = Number(inquiry.value.Offered_Price) || null
    vehicleName.value   = inquiry.value.Vehicle_Model   || vehicleName.value
    customerName.value  = inquiry.value.Customer_Name   || customerName.value
    listedPrice.value   = Number(inquiry.value.Daily_Rate) || listedPrice.value

    if (inquiry.value.Inquiry_Status === 'Accepted') {
      agreedPrice.value = Number(inquiry.value.Agreed_Price) || customerOffer.value
    }

  } catch (err) {
    console.error('Failed to load inquiry', err)
    showToast('Failed to load inquiry.', 'danger')
  } finally {
    isLoading.value = false
    scrollBottom()
  }
}

// ─── Accept Offer ──────────────────────────────────────────
async function acceptOffer() {
  if (!inquiry.value) return
  isActing.value = true
  try {
    await inquiryAPI.respond(inquiryId.value, 'Accepted', Number(inquiry.value.Offered_Price))

    inquiry.value.Inquiry_Status = 'Accepted'
    agreedPrice.value = Number(inquiry.value.Offered_Price)

    // Notify customer
    await notificationAPI.create({
      Notification_Type: 'Inquiry',
      Message:           `Your offer of ₱${inquiry.value.Offered_Price}/day has been accepted!`,
      Reference_ID:      inquiryId.value,
      Reference_Type:    'Inquiry',
      Is_Read:           false
    }).catch(() => console.warn('Notification failed'))

    messages.value.push({
      id: msgId++, sender: 'me', type: 'text',
      text: `✅ I've accepted your offer of ₱${inquiry.value.Offered_Price}/day. Please proceed to booking!`,
      time: getNow()
    })
    scrollBottom()
    showToast('Offer accepted!')

  } catch (err: any) {
    showToast(err.response?.data?.message || 'Failed to accept offer.', 'danger')
  } finally {
    isActing.value = false
  }
}

// ─── Decline Offer ─────────────────────────────────────────
async function declineOffer() {
  if (!inquiry.value) return
  isActing.value = true
  try {
    await inquiryAPI.respond(inquiryId.value, 'Rejected')

    inquiry.value.Inquiry_Status = 'Rejected'

    // Notify customer
    await notificationAPI.create({
      Notification_Type: 'Inquiry',
      Message:           `Your offer of ₱${inquiry.value.Offered_Price}/day has been declined.`,
      Reference_ID:      inquiryId.value,
      Reference_Type:    'Inquiry',
      Is_Read:           false
    }).catch(() => console.warn('Notification failed'))

    messages.value.push({
      id: msgId++, sender: 'me', type: 'text',
      text: `I'm sorry, I cannot accept this offer. Feel free to send a new offer.`,
      time: getNow()
    })
    scrollBottom()
    showToast('Offer declined.')

  } catch (err: any) {
    showToast(err.response?.data?.message || 'Failed to decline offer.', 'danger')
  } finally {
    isActing.value = false
  }
}

// ─── Send Counter Offer ────────────────────────────────────
async function sendCounter() {
  if (!counterAmount.value || Number(counterAmount.value) <= 0) {
    showToast('Please enter a valid price.', 'danger')
    return
  }
  if (counterAmountError.value) return

  isSendingCounter.value = true
  try {
    // Create a new inquiry as owner's counteroffer
    const res = await inquiryAPI.create({
      vehicle_id:          inquiry.value.Vehicle_ID,
      owner_account_id:    inquiry.value.Owner_Account_ID,
      customer_account_id: inquiry.value.Customer_Account_ID,
      offered_price:       Number(counterAmount.value),
      start_date:          inquiry.value.Start_Date,
      end_date:            inquiry.value.End_Date,
      message:             counterMessage.value || undefined,
      sender_type:         'Owner',
    })

    const newInquiryId = res.data.data.Inquiry_ID

    const days = calcDays(inquiry.value.Start_Date, inquiry.value.End_Date)

    messages.value.push({
      id: msgId++,
      sender: 'me',
      type: 'counter',
      offeredPrice: Number(counterAmount.value),
      offerDays:    days,
      startDate:    inquiry.value.Start_Date,
      endDate:      inquiry.value.End_Date,
      status:       'Pending',
      time:         getNow()
    })

    // Notify customer
    await notificationAPI.create({
      Notification_Type: 'Inquiry',
      Message:           `Owner sent a counteroffer of ₱${counterAmount.value}/day.`,
      Reference_ID:      newInquiryId,
      Reference_Type:    'Inquiry',
      Is_Read:           false
    }).catch(() => console.warn('Notification failed'))

    counterAmount.value    = ''
    counterMessage.value   = ''
    showCounterModal.value = false
    scrollBottom()
    showToast('Counteroffer sent!')

  } catch (err: any) {
    showToast(err.response?.data?.message || 'Failed to send counteroffer.', 'danger')
  } finally {
    isSendingCounter.value = false
  }
}

// ─── Send Text Message ─────────────────────────────────────
function addMessage(text: string) {
  messages.value.push({ id: msgId++, sender: 'me', type: 'text', text, time: getNow() })
  scrollBottom()
}

function sendMessage() {
  if (!inputText.value.trim()) return
  addMessage(inputText.value.trim())
  inputText.value = ''
}

onIonViewWillEnter(loadInquiry)
onMounted(loadInquiry)
</script>

<style scoped>
.chat-content { --background: #f0f0f7; }

.negotiate-toolbar {
  --background: #fff;
  box-shadow: 0 1px 0 #eee;
}
.toolbar-center {
  text-align: center;
  flex: 1;
  font-family: 'Gil Sans MT', sans-serif;
}
.toolbar-customer-name { font-size: 15px; font-weight: 800; color: #0f0f1a; }
.toolbar-vehicle { font-size: 11px; color: #999; }
.back-btn { --color: #0f0f1a; }
.offer-icon { font-size: 20px; color: #b70b67; }

/* Price Bar */
.price-bar {
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 10px 16px;
  border-bottom: 1px solid #eee;
  gap: 8px;
  font-family: 'Gil Sans MT', sans-serif;
}
.price-bar-item { text-align: center; }
.pb-label { display: block; font-size: 10px; color: #999; margin-bottom: 2px; }
.pb-val { font-size: 14px; font-weight: 800; }
.pb-val.listed { color: #555; }
.pb-val.offer  { color: #0070f3; }
.pb-val.agreed { color: #b70b67; }
.pb-val.none   { color: #bbb; font-weight: 400; font-size: 12px; }
.arrow-between { color: #ccc; font-size: 16px; }

/* Chat */
.chat-wrapper { padding: 16px 12px; }
.date-label {
  text-align: center;
  font-size: 12px; color: #aaa;
  margin-bottom: 16px; font-weight: 600;
}

.msg-row {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
  align-items: flex-end;
}
.msg-right { flex-direction: row-reverse; }
.msg-left  { flex-direction: row; }

.msg-avatar {
  width: 32px; height: 32px;
  background: linear-gradient(135deg, #667eea, #b70b67);
  border-radius: 10px;
  display: flex; align-items: center;
  justify-content: center;
  font-size: 16px; flex-shrink: 0;
}

.msg-bubble-wrap {
  max-width: 78%;
  display: flex;
  flex-direction: column;
}
.msg-right .msg-bubble-wrap { align-items: flex-end; }

.msg-bubble {
  padding: 10px 14px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.5;
}
.bubble-mine {
  background: #b70b67;
  color: #fff;
  border-bottom-right-radius: 6px;
}
.bubble-theirs {
  background: #fff;
  color: #0f0f1a;
  border-bottom-left-radius: 6px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.msg-time { font-size: 10px; color: #bbb; margin-top: 4px; padding: 0 4px; }

/* Offer Card */
.offer-card {
  background: #fff;
  border-radius: 18px;
  padding: 14px 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  min-width: 220px;
}
.offer-mine   { border: 2px solid #b70b67; }
.offer-theirs { border: 2px solid #0070f3; }

.offer-card-label   { font-size: 11px; color: #999; margin-bottom: 6px; font-weight: 600; }
.offer-card-price   { font-size: 26px; font-weight: 800; color: #0f0f1a; margin-bottom: 4px; }
.offer-card-price span { font-size: 13px; color: #999; font-weight: 400; }
.offer-card-details { font-size: 12px; color: #777; margin-bottom: 8px; }
.offer-card-message {
  font-size: 12px; color: #555;
  font-style: italic;
  background: #f8f8fb;
  border-radius: 8px;
  padding: 8px 10px;
  margin-bottom: 10px;
}

.offer-actions { display: flex; gap: 6px; margin-top: 4px; flex-wrap: wrap; }
.btn-decline {
  flex: 1;
  --color: #e05555;
  --border-color: #e05555;
  --border-radius: 10px;
  font-weight: 700;
  height: 34px;
  font-size: 12px;
}
.btn-counter {
  flex: 1;
  --color: #0070f3;
  --border-color: #0070f3;
  --border-radius: 10px;
  font-weight: 700;
  height: 34px;
  font-size: 12px;
}
.btn-accept {
  flex: 1.5;
  --background: #00c896;
  --color: #fff;
  --border-radius: 10px;
  font-weight: 700;
  height: 34px;
  font-size: 12px;
}

.offer-accepted-tag { font-size: 12px; color: #00a87e; font-weight: 700; margin-top: 6px; }
.offer-declined-tag { font-size: 12px; color: #e05555; font-weight: 700; margin-top: 6px; }
.offer-pending-tag  { font-size: 12px; color: #f5a623; font-weight: 700; margin-top: 6px; }

/* Agreed Banner */
.agreed-banner {
  background: #f6eaf0;
  border: 2px solid #e46fae;
  border-radius: 18px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 8px 0;
}
.agreed-icon  { font-size: 28px; color: #00c896; flex-shrink: 0; }
.agreed-title { font-size: 15px; font-weight: 800; color: #0f0f1a; margin-bottom: 3px; }
.agreed-sub   { font-size: 12px; color: #555; }

/* Footer */
.chat-footer { background: #fff; box-shadow: 0 -4px 20px rgba(0,0,0,0.07); }
.chat-input-area { padding: 8px 12px 28px; }

.quick-actions {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 8px;
  scrollbar-width: none;
}
.quick-actions::-webkit-scrollbar { display: none; }
.quick-chip {
  display: flex;
  align-items: center;
  gap: 5px;
  background: #f0f0f7;
  border-radius: 16px;
  padding: 7px 14px;
  font-size: 12px;
  font-weight: 600;
  color: #444;
  white-space: nowrap;
  cursor: pointer;
}

.input-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  background: #f4f4f8;
  border-radius: 20px;
  padding: 4px 4px 4px 14px;
}
.chat-input {
  flex: 1;
  --background: transparent;
  --padding-start: 0;
  --padding-end: 0;
  font-size: 14px;
  color: #0f0f1a;
  max-height: 80px;
}
.send-btn  { --color: #b70b67; margin: 0; flex-shrink: 0; }
.send-icon { font-size: 20px; }

/* Agreed Footer */
.agreed-footer { background: #fff; box-shadow: 0 -4px 20px rgba(0,0,0,0.07); }
.agreed-footer-inner {
  padding: 14px 16px 28px;
  text-align: center;
}
.agreed-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.agreed-info-label { font-size: 13px; color: #999; margin: 0; }
.agreed-info-val   { font-size: 20px; font-weight: 800; color: #b70b67; margin: 0; }
.agreed-info-sub   { font-size: 12px; color: #aaa; margin: 0; }

/* Counter Modal */
.offer-modal {
  --border-radius: 28px 28px 0 0;
  --height: auto;
  align-items: flex-end;
}
.modal-inner {
  background: #fff;
  border-radius: 28px 28px 0 0;
  padding: 16px 24px 48px;
}
.modal-handle {
  width: 40px; height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
  margin: 0 auto 20px;
}
.modal-title { font-size: 22px; font-weight: 800; color: #0f0f1a; margin: 0 0 6px; }
.modal-sub   { font-size: 14px; color: #666; margin: 0 0 24px; }

.form-group  { margin-bottom: 20px; }
.form-label  { display: block; font-size: 13px; font-weight: 700; color: #333; margin-bottom: 8px; }

.price-input-row {
  display: flex;
  align-items: center;
  background: #f4f4f8;
  border-radius: 14px;
  padding: 0 16px;
  height: 52px;
  border: 2px solid transparent;
  transition: border 0.2s;
}
.price-input-row:focus-within { border-color: #b70b67; }
.input-error { border-color: #e05555 !important; }
.peso-sign {
  font-size: 18px; font-weight: 800;
  color: #b70b67; margin-right: 4px;
}
.price-input {
  flex: 1; border: none;
  background: transparent;
  font-size: 22px; font-weight: 800;
  color: #0f0f1a; outline: none;
}
.field-error { font-size: 12px; color: #e05555; margin-top: 4px; }

.offer-textarea {
  width: 100%;
  background: #f4f4f8;
  border: 2px solid transparent;
  border-radius: 14px;
  padding: 12px 14px;
  font-size: 14px; color: #0f0f1a;
  outline: none; resize: none;
  height: 80px;
  box-sizing: border-box;
  font-family: inherit;
}
.offer-textarea:focus { border-color: #b70b67; }
.char-count { font-size: 11px; color: #aaa; font-weight: 400; margin-left: 6px; }

.modal-actions { display: flex; gap: 10px; margin-top: 8px; }
.btn-cancel {
  flex: 1;
  --color: #555;
  --border-color: #ddd;
  --border-radius: 14px;
  font-weight: 600;
  height: 50px;
}
.btn-send-offer {
  flex: 1.5;
  --background: #b70b67;
  --color: #fff;
  --border-radius: 14px;
  font-weight: 700;
  height: 50px;
}
</style>