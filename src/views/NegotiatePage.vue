<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="negotiate-toolbar">
        <ion-buttons slot="start">
          <ion-back-button default-href="/vehicle/1" text="" class="back-btn"></ion-back-button>
        </ion-buttons>
        <div class="toolbar-center">
          <div class="toolbar-biz-name">{{ ownerName }}</div>
          <div class="toolbar-vehicle">{{ vehicleName }}</div>
        </div>
        <ion-buttons slot="end">
          <ion-button fill="clear" @click="showOfferModal = true">
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
          <span class="pb-label">Your Offer</span>
          <span class="pb-val offer" v-if="currentOffer">₱{{ currentOffer }}/day</span>
          <span class="pb-val none" v-else>None yet</span>
        </div>
        <div class="price-bar-item" v-if="agreedPrice">
          <span class="pb-label">✅ Agreed</span>
          <span class="pb-val agreed">₱{{ agreedPrice }}/day</span>
        </div>
      </div>
    </ion-header>

    <ion-content class="chat-content" ref="chatContent">
      <div class="chat-wrapper">

        <!-- Date label -->
        <div class="date-label">Today</div>

        <!-- Messages -->
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="msg-row"
          :class="msg.sender === 'me' ? 'msg-right' : 'msg-left'"
        >
          <!-- Avatar for owner -->
          <div v-if="msg.sender === 'owner'" class="msg-avatar">🏢</div>

          <div class="msg-bubble-wrap">

            <!-- Offer card -->
            <div
              v-if="msg.type === 'offer'"
              class="offer-card"
              :class="msg.sender === 'me' ? 'offer-mine' : 'offer-theirs'"
            >
              <div class="offer-card-label">
                {{ msg.sender === 'me' ? '💬 You sent an offer' : '💬 Owner counteroffer' }}
              </div>

              <!-- msg.offeredPrice → INQUIRY.Offered_Price -->
              <div class="offer-card-price">
                ₱{{ msg.offeredPrice?.toLocaleString() }}<span>/day</span>
              </div>

              <!-- msg.startDate / msg.endDate → INQUIRY.Start_Date / End_Date -->
              <div class="offer-card-details" v-if="msg.offerDays">
                {{ msg.offerDays }} day(s) · {{ msg.startDate }} to {{ msg.endDate }}
              </div>

              <!-- msg.inquiryStatus → INQUIRY.Inquiry_Status -->
              <div
                v-if="msg.sender === 'owner' && (msg.inquiryStatus === 'Pending' || msg.inquiryStatus === 'Owner_Quoted' || msg.inquiryStatus === 'Negotiating')"
                class="offer-actions"
              >
                <ion-button size="small" fill="outline" class="btn-decline" @click="declineOffer(msg)">
                  Decline
                </ion-button>
                <ion-button size="small" class="btn-accept" @click="acceptOffer(msg)">
                  Accept ✓
                </ion-button>
              </div>
              <div v-if="msg.inquiryStatus === 'Accepted'" class="offer-accepted-tag">✅ Accepted</div>
              <div v-if="msg.inquiryStatus === 'Rejected'" class="offer-declined-tag">❌ Declined</div>
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
            <div class="agreed-sub">Proceed to booking to confirm your reservation.</div>
          </div>
        </div>

        <div style="height: 20px"></div>
      </div>
    </ion-content>

    <!-- Input Area (hidden once agreed) -->
    <ion-footer class="ion-no-border chat-footer" v-if="!agreedPrice">
      <div class="chat-input-area">
        <div class="quick-actions">
          <div class="quick-chip" @click="openOfferModal">
            <ion-icon name="pricetag-outline"></ion-icon> Send Offer
          </div>
          <div class="quick-chip" @click="addMessage('Is this still available?')">
            Is this available?
          </div>
          <div class="quick-chip" @click="addMessage('Can I get a discount for 3+ days?')">
            3+ day discount?
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
    <ion-footer class="ion-no-border agreed-footer" v-if="agreedPrice">
      <div class="agreed-footer-inner">
        <ion-button expand="block" class="btn-proceed" @click="goToBooking">
          View My Transaction
          <ion-icon name="arrow-forward-outline" slot="end"></ion-icon>
        </ion-button>
      </div>
    </ion-footer>

    <!-- Offer Modal -->
    <ion-modal :is-open="showOfferModal" @did-dismiss="showOfferModal = false" class="offer-modal">
      <div class="modal-inner">
        <div class="modal-handle"></div>
        <h2 class="modal-title">Make an Offer</h2>
        <p class="modal-sub">
          Listed price is <strong>₱{{ listedPrice }}/day</strong>. Enter your offer below.
        </p>

        <!-- Offered_Price -->
        <div class="form-group">
          <label class="form-label">Your Price (per day)</label>
          <div class="price-input-row" :class="offerAmountError ? 'input-error' : ''">
            <span class="peso-sign">₱</span>
            <input
              v-model.number="offerAmount"
              type="number"
              placeholder="0"
              class="price-input"
              min="1"
            />
          </div>
          <p v-if="offerAmountError" class="field-error">{{ offerAmountError }}</p>
        </div>

        <!-- Start_Date / End_Date -->
        <div class="form-group">
          <label class="form-label">Rental Dates</label>
          <div class="date-row">
            <div class="date-input-group">
              <label class="date-label-sm">Start Date</label>
              <input v-model="offerStart" type="date" class="date-input" :min="todayStr" />
            </div>
            <ion-icon name="arrow-forward-outline" class="date-arrow"></ion-icon>
            <div class="date-input-group">
              <label class="date-label-sm">End Date</label>
              <input v-model="offerEnd" type="date" class="date-input" :min="offerStart || todayStr" />
            </div>
          </div>
          <p v-if="dateError" class="field-error">{{ dateError }}</p>
        </div>

        <!-- Message — VARCHAR(150) enforced via maxlength + live counter -->
        <div class="form-group">
          <label class="form-label">
            Message (optional)
            <span class="char-count">{{ offerMessage.length }}/150</span>
          </label>
          <textarea
            v-model="offerMessage"
            placeholder="e.g. I'll pick up early morning..."
            class="offer-textarea"
            maxlength="150"
          ></textarea>
        </div>

        <div class="modal-actions">
          <ion-button fill="outline" class="btn-cancel" @click="showOfferModal = false">
            Cancel
          </ion-button>
          <ion-button class="btn-send-offer" @click="sendOffer" :disabled="isSendingOffer">
            {{ isSendingOffer ? 'Sending...' : 'Send Offer' }}
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
import { ref, computed, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import {
  IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton,
  IonButton, IonContent, IonFooter, IonIcon, IonTextarea,
  IonModal, IonToast, useIonRouter, onIonViewWillEnter, onIonViewWillLeave
} from '@ionic/vue'
import { inquiryAPI, notificationAPI } from '@/api'

let pollInterval: any = null

async function pollInquiryStatus() {
  const lastInquiryId = messages.value
    .filter(m => m.type === 'offer')
    .slice(-1)[0]?.inquiryId

  if (!lastInquiryId) return

  try {
    const res = await inquiryAPI.getOne(lastInquiryId)
    const inq = res.data.data ?? res.data

    // ✅ existing: owner accepted
    if (inq.Inquiry_Status === 'Confirmed' && !agreedPrice.value) {
      agreedPrice.value = Number(inq.Final_Agreed_Price) || Number(inq.Offered_Price)
      messages.value.push({
        id: msgId++, sender: 'owner', type: 'text',
        text: `✅ Offer of ₱${agreedPrice.value}/day accepted! You can now view your transaction.`,
        time: getNow()
      })
      scrollBottom()
    }

    // ✅ existing: owner rejected
    if (inq.Inquiry_Status === 'Rejected') {
      const existing = messages.value.find(
        m => m.inquiryId === lastInquiryId && m.inquiryStatus === 'Rejected'
      )
      if (!existing) {
        messages.value.forEach(m => {
          if (m.inquiryId === lastInquiryId) m.inquiryStatus = 'Rejected'
        })
        messages.value.push({
          id: msgId++, sender: 'owner', type: 'text',
          text: `Sorry, I cannot accept this offer. Feel free to send a new one.`,
          time: getNow()
        })
        scrollBottom()
      }
    }

    // ✅ NEW: owner sent a counteroffer
    if (
      inq.Inquiry_Status === 'Pending' &&
      inq.Sender_Type === 'Owner'  // ← backend needs to return this
    ) {
      const alreadyShown = messages.value.find(
        m => m.type === 'offer' && m.sender === 'owner' && m.inquiryId === lastInquiryId
      )
      if (!alreadyShown) {
        messages.value.push({
          id: msgId++,
          sender: 'owner',
          type: 'offer',
          inquiryId:     lastInquiryId,
          offeredPrice:  Number(inq.Offered_Price),
          offerDays:     calcDays(inq.Start_Date, inq.End_Date),
          startDate:     inq.Start_Date,
          endDate:       inq.End_Date,
          time:          getNow(),
          inquiryStatus: 'Pending'
        })
        scrollBottom()
      }
    }

  } catch (e) {
    console.warn('Poll failed', e)
  }
}

function calcDays(start: string, end: string) {
  if (!start || !end) return 0
  return Math.ceil(
    (new Date(end).getTime() - new Date(start).getTime()) / 86400000
  )
}

onIonViewWillEnter(() => {
  loadInquiryHistory()

  pollInterval = setInterval(
    pollInquiryStatus,
    5000
  )
})

onIonViewWillLeave(() => {
  if (pollInterval) clearInterval(pollInterval)
})

// ─── Schema-aligned Inquiry_Status values ─────────────────────────────────────
type InquiryStatus = 'Pending' | 'Owner_Quoted' | 'Negotiating' | 'Accepted' | 'Rejected' | 'Completed'

// ─── Message shape (local chat UI only) ───────────────────────────────────────
interface Message {
  id: number
  sender: 'me' | 'owner'
  type: 'text' | 'offer'
  text?: string
  inquiryId?: string         // INQUIRY.Inquiry_ID
  offeredPrice?: number      // INQUIRY.Offered_Price
  offerDays?: number
  startDate?: string         // INQUIRY.Start_Date
  endDate?: string           // INQUIRY.End_Date
  time: string
  inquiryStatus?: InquiryStatus  // INQUIRY.Inquiry_Status
}

// ─── Route params ─────────────────────────────────────────────────────────────
// All must be passed via route.query when navigating here:
// vehicleId, dailyRate, ownerName, vehicleName, withDriver,
// customerAccountId, ownerAccountId
const route = useRoute()
const router = useIonRouter()

const vehicleId         = ref(route.query.vehicleId         as string || '')
const listedPrice       = ref(Number(route.query.dailyRate) || 0)      // VEHICLE.Daily_Rate
const ownerName         = ref(route.query.ownerName         as string || '')
const vehicleName       = ref(route.query.vehicleName       as string || '')
const customerAccountId = ref(route.query.customerAccountId as string || '')  // PERSON.Account_ID (customer)
const ownerAccountId    = ref(route.query.ownerAccountId    as string || '')  // PERSON.Account_ID (owner)

// ─── Chat state ───────────────────────────────────────────────────────────────
const inputText      = ref('')
const showOfferModal = ref(false)
const offerAmount    = ref<number | ''>('')
const offerStart     = ref('')
const offerEnd       = ref('')
const offerMessage   = ref('')
const currentOffer   = ref<number | null>(null)
const agreedPrice    = ref<number | null>(null)
const isSendingOffer = ref(false)
const chatContent    = ref<any>(null)
let msgId = 10

// ─── Toast ────────────────────────────────────────────────────────────────────
const toast = ref({ show: false, message: '', color: 'success' })
const showToast = (message: string, color: 'success' | 'danger' = 'success') => {
  toast.value = { show: true, message, color }
}

// ─── Validation ───────────────────────────────────────────────────────────────
const todayStr = new Date().toISOString().split('T')[0]

const offerAmountError = computed(() => {
  if (offerAmount.value === '') return ''
  if (Number(offerAmount.value) <= 0) return 'Offer must be greater than ₱0.'
  return ''
})

const dateError = computed(() => {
  if (offerStart.value && offerEnd.value && offerEnd.value < offerStart.value)
    return 'End date cannot be before start date.'
  return ''
})

// ─── Initial welcome message ──────────────────────────────────────────────────
const messages = ref<Message[]>([
  {
    id: 1, sender: 'owner', type: 'text',
    text: `Hi! Welcome to ${ownerName.value}. The ${vehicleName.value} is available at ₱${listedPrice.value}/day. How can I help you?`,
    time: getNow()
  }
])

// load history messages
async function loadInquiryHistory() {
  try {
    const inquiryId = route.params.id as string
    if (!inquiryId) return

    const res = await inquiryAPI.getOne(inquiryId)
    const inq = res.data.data ?? res.data

    // Set vehicle/owner info from the inquiry
    vehicleId.value   = inq.Vehicle_ID
    vehicleName.value = inq.Vehicle_Model  || vehicleName.value
    ownerName.value   = inq.Owner_Name     || ownerName.value
    listedPrice.value = Number(inq.Daily_Rate) || listedPrice.value

    const loadedMessages: Message[] = []

    // Customer's original offer
    loadedMessages.push({
      id: msgId++,
      sender: 'me',
      type: 'offer',
      inquiryId:     inq.Inquiry_ID,
      offeredPrice:  Number(inq.Offered_Price),
      offerDays:     calcDays(inq.Start_Date, inq.End_Date),
      startDate:     inq.Start_Date,
      endDate:       inq.End_Date,
      time:          new Date(inq.Inquiry_Date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      inquiryStatus: inq.Inquiry_Status
    })

    // Customer message
    if (inq.Customer_Message) {
      loadedMessages.push({
        id: msgId++, sender: 'me', type: 'text',
        text: inq.Customer_Message, time: getNow()
      })
    }

    // Owner counteroffer
    if (inq.Owner_Set_Price || inq.Owner_Price_Min) {
      loadedMessages.push({
        id: msgId++,
        sender: 'owner',
        type: 'offer',
        inquiryId:     inq.Inquiry_ID,
        offeredPrice:  Number(inq.Owner_Set_Price || inq.Owner_Price_Min),
        offerDays:     calcDays(inq.Start_Date, inq.End_Date),
        startDate:     inq.Start_Date,
        endDate:       inq.End_Date,
        time:          getNow(),
        inquiryStatus: inq.Inquiry_Status
      })
    }

    // Owner message
    if (inq.Owner_Message) {
      loadedMessages.push({
        id: msgId++, sender: 'owner', type: 'text',
        text: inq.Owner_Message, time: getNow()
      })
    }

    // Customer counter
    if (inq.Customer_Counter_Price) {
      loadedMessages.push({
        id: msgId++,
        sender: 'me',
        type: 'offer',
        inquiryId:     inq.Inquiry_ID,
        offeredPrice:  Number(inq.Customer_Counter_Price),
        offerDays:     calcDays(inq.Start_Date, inq.End_Date),
        startDate:     inq.Start_Date,
        endDate:       inq.End_Date,
        time:          getNow(),
        inquiryStatus: inq.Inquiry_Status
      })
    }

    // If confirmed/cancelled
    if (inq.Inquiry_Status === 'Confirmed') {
      agreedPrice.value = Number(inq.Final_Agreed_Price || inq.Owner_Set_Price)
    }

    currentOffer.value = Number(
      inq.Customer_Counter_Price || inq.Owner_Set_Price || inq.Offered_Price
    )

    messages.value = [messages.value[0], ...loadedMessages]
    scrollBottom()

  } catch (err) {
    console.error('Failed loading inquiry history', err)
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getNow() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function addMessage(text: string) {
  messages.value.push({ id: msgId++, sender: 'me', type: 'text', text, time: getNow() })
  scrollBottom()
}

async function scrollBottom() {
  await nextTick()
  chatContent.value?.$el?.scrollToBottom(300)
}

function sendMessage() {
  if (!inputText.value.trim()) return
  addMessage(inputText.value.trim())
  inputText.value = ''
}

function openOfferModal() {
  showOfferModal.value = true
}

// ─── Send Offer → POST to INQUIRY ─────────────────────────────────────────────
// Agreed_Price omitted — nullable in schema, only set on accept
// Inquiry_Status omitted — DB DEFAULT 'Pending' handles it automatically
const withDriver = ref(route.query.withDriver === '1')
async function sendOffer() {
  if (!offerAmount.value || Number(offerAmount.value) <= 0) {
    showToast('Please enter a valid offer amount.', 'danger')
    return
  }
  if (offerAmountError.value || dateError.value) return
  if (!offerStart.value || !offerEnd.value) {
    showToast('Please select both start and end dates.', 'danger')
    return
  }

  isSendingOffer.value = true
  try {
    const payload = {
      vehicle_id:          vehicleId.value,
      owner_account_id:    ownerAccountId.value,
      customer_account_id: customerAccountId.value,  // ✅ add back
      offered_price:       Number(offerAmount.value),
      start_date:          offerStart.value,
      end_date:            offerEnd.value,
      message:             offerMessage.value || undefined,
      sender_type:         'Customer',
      with_driver:         withDriver.value ? 1: 0,// pass withDriver if needed
    }

    const response = await inquiryAPI.create(payload)
    const newInquiryId: string = response.data.data.Inquiry_ID

    const days = Math.ceil(
      (new Date(offerEnd.value).getTime() - new Date(offerStart.value).getTime()) / 86400000
    )

    messages.value.push({
      id: msgId++,
      sender: 'me',
      type: 'offer',
      inquiryId:     newInquiryId,
      offeredPrice:  Number(offerAmount.value),
      offerDays:     days,
      startDate:     offerStart.value,
      endDate:       offerEnd.value,
      time:          getNow(),
      inquiryStatus: 'Pending'
    })

    currentOffer.value = Number(offerAmount.value)

    if (offerMessage.value) {
      messages.value.push({
        id: msgId++, sender: 'me', type: 'text',
        text: offerMessage.value, time: getNow()
      })
    }

    // Notify owner — non-blocking, won't fail the whole sendOffer if this errors
    notificationAPI.create({
      notification_type: 'Inquiry',
      message: `New offer of ₱${offerAmount.value}/day for ${vehicleName.value}`,
      reference_id: newInquiryId,
      reference_type: 'Inquiry',
      is_read: false
    }).catch(() => console.warn('Notification could not be created.'))

    offerAmount.value    = ''
    offerStart.value     = ''
    offerEnd.value       = ''
    offerMessage.value   = ''
    showOfferModal.value = false
    scrollBottom()
    showToast('Offer sent successfully!')

  } catch (err: any) {
    console.log('Error response:', err.response?.data)  // ← add this
    showToast(err.response?.data?.message || 'Failed to send offer.', 'danger')
  } finally {
    isSendingOffer.value = false
  }
}

// ─── Accept Offer → PATCH Inquiry_Status='Accepted', Agreed_Price = offeredPrice
async function acceptOffer(msg: Message) {
  if (!msg.inquiryId) return
  try {
    await inquiryAPI.respond(msg.inquiryId, { decision: 'accept', counter_price: msg.offeredPrice })

    msg.inquiryStatus = 'Accepted'
    agreedPrice.value  = msg.offeredPrice ?? null

    await notificationAPI.create({
      notification_type: 'Inquiry',
      message:           `Offer of ₱${msg.offeredPrice}/day has been accepted.`,
      reference_id:      msg.inquiryId,
      reference_type:    'Inquiry',
      is_read:           false
    }).catch(() => console.warn('Notification could not be created.'))

    messages.value.push({
      id: msgId++, sender: 'me', type: 'text',
      text: `✅ I accept ₱${msg.offeredPrice}/day! Let's proceed to booking.`,
      time: getNow()
    })
    scrollBottom()
  } catch (err: any) {
    showToast(err.response?.data?.message || 'Failed to accept offer.', 'danger')
  }
}

// ─── Decline Offer → PATCH Inquiry_Status='Rejected'
// Agreed_Price omitted — nullable, stays NULL when no deal is reached
async function declineOffer(msg: Message) {
  if (!msg.inquiryId) return
  try {
    await inquiryAPI.respond(msg.inquiryId, { decision: 'decline' })

    msg.inquiryStatus = 'Rejected'

    await notificationAPI.create({
      notification_type: 'Inquiry',
      message:           `Offer of ₱${msg.offeredPrice}/day has been declined.`,
      reference_id:      msg.inquiryId,
      reference_type:    'Inquiry',
      is_read:           false
    }).catch(() => console.warn('Notification could not be created.'))

    messages.value.push({
      id: msgId++, sender: 'me', type: 'text',
      text: 'I declined this offer. Can we negotiate further?',
      time: getNow()
    })
    scrollBottom()
  } catch (err: any) {
    showToast(err.response?.data?.message || 'Failed to decline offer.', 'danger')
  }
}


// ─── Proceed to Booking ───────────────────────────────────────────────────────
// agreedPrice (INQUIRY.Agreed_Price) passed as dailyRate for Total_Amount calculation
async function goToBooking() {
  try {
    const inquiryId = route.params.id as string
    if (!inquiryId) return

    const res = await inquiryAPI.book(inquiryId)
    const { transaction_id, payment_id, final_price } = res.data.data

    // Navigate to payment page with negotiated price
    router.push({
      path: '/receipt',
      query: {
        transactionId:  transaction_id,
        paymentId:      payment_id,
        vehicleName:    vehicleName.value,
        amount:         String(final_price || agreedPrice.value),
        paymentType:    'Full',
        date:           new Date().toISOString().split('T')[0],
      }
  }) 
}catch (err: any) {
    showToast(err.response?.data?.message || 'Failed to create booking.', 'danger')
  }
}

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
.toolbar-biz-name { font-size: 15px; font-weight: 800; color: #0f0f1a; }
.toolbar-vehicle { font-size: 11px; color: #999; }
.back-btn { --color: #0f0f1a; }
.offer-icon { font-size: 20px; color: #00c896; }

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
.pb-val.listed { color: #555; text-decoration: line-through; }
.pb-val.offer { color: #0070f3; }
.pb-val.agreed { color: #b70b67; }
.pb-val.none { color: #bbb; font-weight: 400; font-size: 12px; }
.arrow-between { color: #ccc; font-size: 16px; }

.chat-wrapper { padding: 16px 12px; }
.date-label {
  text-align: center;
  font-size: 12px;
  color: #aaa;
  margin-bottom: 16px;
  font-weight: 600;
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
  background: linear-gradient(135deg,#667eea,#b70b67);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
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
  background: #aa065e;
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

.offer-card {
  background: #fff;
  border-radius: 18px;
  padding: 14px 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  min-width: 200px;
}
.offer-mine   { border: 2px solid #b70b67; }
.offer-theirs { border: 2px solid #b70b67; }

.offer-card-label   { font-size: 11px; color: #999; margin-bottom: 6px; font-weight: 600; }
.offer-card-price   { font-size: 26px; font-weight: 800; color: #0f0f1a; margin-bottom: 4px; }
.offer-card-price span { font-size: 13px; color: #999; font-weight: 400; }
.offer-card-details { font-size: 12px; color: #777; margin-bottom: 12px; }

.offer-actions { display: flex; gap: 8px; margin-top: 4px; }
.btn-decline {
  flex: 1;
  --color: #e05555;
  --border-color: #e05555;
  --border-radius: 10px;
  font-weight: 700;
  height: 36px;
}
.btn-accept {
  flex: 1;
  --background: #00c896;
  --color: #fff;
  --border-radius: 10px;
  font-weight: 700;
  height: 36px;
}
.offer-accepted-tag { font-size: 13px; color: #00a87e; font-weight: 700; margin-top: 6px; }
.offer-declined-tag { font-size: 13px; color: #e05555; font-weight: 700; margin-top: 6px; }

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
.quick-chip ion-icon { color: #00c896; }

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
.send-btn  { --color: #00c896; margin: 0; flex-shrink: 0; }
.send-icon { font-size: 20px; }

.agreed-footer       { background: #fff; box-shadow: 0 -4px 20px rgba(0,0,0,0.07); }
.agreed-footer-inner { padding: 12px 16px 28px; }
.btn-proceed {
  --background: #b70b67;
  --color: #fff;
  --border-radius: 14px;
  --box-shadow: 0 4px 16px rgba(0,200,150,0.35);
  font-weight: 700;
  font-size: 15px;
  height: 52px;
}

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

.form-group { margin-bottom: 20px; }
.form-label { display: block; font-size: 13px; font-weight: 700; color: #333; margin-bottom: 8px; }

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
.price-input-row:focus-within { border-color: #00c896; }
.input-error { border-color: #e05555 !important; }
.peso-sign { font-size: 18px; font-weight: 800; color: #00c896; margin-right: 4px; }
.price-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 22px;
  font-weight: 800;
  color: #0f0f1a;
  outline: none;
}

.field-error { font-size: 12px; color: #e05555; margin-top: 4px; }

.date-row { display: flex; align-items: center; gap: 8px; }
.date-input-group { flex: 1; }
.date-label-sm { display: block; font-size: 11px; color: #999; margin-bottom: 4px; }
.date-input {
  width: 100%;
  background: #f4f4f8;
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 13px;
  color: #0f0f1a;
  outline: none;
  box-sizing: border-box;
}
.date-input:focus { border-color: #00c896; }
.date-arrow { color: #ccc; flex-shrink: 0; }

.offer-textarea {
  width: 100%;
  background: #f4f4f8;
  border: 2px solid transparent;
  border-radius: 14px;
  padding: 12px 14px;
  font-size: 14px;
  color: #0f0f1a;
  outline: none;
  resize: none;
  height: 80px;
  box-sizing: border-box;
  font-family: inherit;
}
.offer-textarea:focus { border-color: #00c896; }

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
  --background: #00c896;
  --color: #fff;
  --border-radius: 14px;
  font-weight: 700;
  height: 50px;
}
</style>