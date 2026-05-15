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
          <span class="pb-val listed">₱{{ listedPrice }}/day</span>        </div>
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
            <div v-if="msg.type === 'offer'" class="offer-card" :class="msg.sender === 'me' ? 'offer-mine' : 'offer-theirs'">
              <div class="offer-card-label">
                {{ msg.sender === 'me' ? '💬 You sent an offer' : '💬 Owner counteroffer' }}
              </div>
              <div class="offer-card-price">₱{{ msg.offerAmount }}<span>/day</span></div>
              <div class="offer-card-details" v-if="msg.offerDays">
                {{ msg.offerDays }} day(s) · {{ msg.offerStart }} to {{ msg.offerEnd }}
              </div>

              <!-- Action buttons for received offers -->
              <div v-if="msg.sender === 'owner' && msg.status === 'pending'" class="offer-actions">
                <ion-button size="small" fill="outline" class="btn-decline" @click="declineOffer(msg)">
                  Decline
                </ion-button>
                <ion-button size="small" class="btn-accept" @click="acceptOffer(msg)">
                  Accept ✓
                </ion-button>
              </div>
              <div v-if="msg.status === 'accepted'" class="offer-accepted-tag">✅ Accepted</div>
              <div v-if="msg.status === 'declined'" class="offer-declined-tag">❌ Declined</div>
            </div>

            <!-- Regular text bubble -->
            <div v-else class="msg-bubble" :class="msg.sender === 'me' ? 'bubble-mine' : 'bubble-theirs'">
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

    <!-- Input Area -->
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
          <ion-button fill="clear" class="send-btn" @click="sendMessage" :disabled="!inputText.trim()">
            <ion-icon name="send" class="send-icon"></ion-icon>
          </ion-button>
        </div>
      </div>
    </ion-footer>

    <!-- Agreed Footer -->
    <ion-footer class="ion-no-border agreed-footer" v-if="agreedPrice">
      <div class="agreed-footer-inner">
          <ion-button expand="block" class="btn-proceed" @click="goToBooking">
            Proceed to Booking · ₱{{ agreedPrice }}/day
          <ion-icon name="arrow-forward-outline" slot="end"></ion-icon>
        </ion-button>
      </div>
    </ion-footer>

    <!-- Offer Modal -->
    <ion-modal :is-open="showOfferModal" @did-dismiss="showOfferModal = false" class="offer-modal">
      <div class="modal-inner">
        <div class="modal-handle"></div>
        <h2 class="modal-title">Make an Offer</h2>
        <p class="modal-sub">Listed price is <strong>₱{{ listedPrice }}/day</strong>. Enter your offer below.</p>
        <div class="form-group">
          <label class="form-label">Your Price (per day)</label>
          <div class="price-input-row">
            <span class="peso-sign">₱</span>
            <input
              v-model="offerAmount"
              type="number"
              placeholder="700"
              class="price-input"
              min="1"
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Rental Dates</label>
          <div class="date-row">
            <div class="date-input-group">
              <label class="date-label-sm">Start Date</label>
              <input v-model="offerStart" type="date" class="date-input" />
            </div>
            <ion-icon name="arrow-forward-outline" class="date-arrow"></ion-icon>
            <div class="date-input-group">
              <label class="date-label-sm">End Date</label>
              <input v-model="offerEnd" type="date" class="date-input" />
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Message (optional)</label>
          <textarea v-model="offerMessage" placeholder="e.g. I'll pick up early morning..." class="offer-textarea"></textarea>
        </div>

        <div class="modal-actions">
          <ion-button fill="outline" class="btn-cancel" @click="showOfferModal = false">Cancel</ion-button>
          <ion-button class="btn-send-offer" @click="sendOffer" :disabled="!offerAmount">
            Send Offer
          </ion-button>
        </div>
      </div>
    </ion-modal>

  </ion-page>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import {
  IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton,
  IonButton, IonContent, IonFooter, IonIcon, IonTextarea,
  IonModal, useIonRouter
} from '@ionic/vue'

interface Message {
  id: number
  sender: 'me' | 'owner'
  type: 'text' | 'offer'
  text?: string
  offerAmount?: string
  offerDays?: number
  offerStart?: string
  offerEnd?: string
  time: string
  status?: 'pending' | 'accepted' | 'declined'
}

const route = useRoute()
const router = useIonRouter()
const vehicleId = ref(route.query.vehicleId as string || '')
const listedPrice = ref(Number(route.query.dailyRate) || 0)
const withDriver = ref(Number(route.query.withDriver) || 0)
const ownerName = ref(route.query.ownerName as string || 'AutoLux Rentals')
const vehicleName = ref(route.query.vehicleName as string || 'Toyota Vios 2022')

const inputText = ref('')
const showOfferModal = ref(false)
const offerAmount = ref('')
const offerStart = ref('')
const offerEnd = ref('')
const offerMessage = ref('')
const currentOffer = ref('')
const agreedPrice = ref('')
const chatContent = ref<any>(null)
let msgId = 10

const messages = ref<Message[]>([
  {
    id: 1, sender: 'owner', type: 'text',
    text: `Hi! Welcome to ${ownerName.value}. The ${vehicleName.value} is available at ₱${listedPrice.value}/day. How can I help you?`,
    time: '10:01 AM'
  }
])

function getNow() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function addMessage(text: string) {
  messages.value.push({ id: msgId++, sender: 'me', type: 'text', text, time: getNow() })
  scrollBottom()
}

function goToBooking() {
  router.push({
    path: '/booking',
    query: {
      vehicleId:   vehicleId.value,
      vehicleName: vehicleName.value,
      ownerName:   ownerName.value,
      dailyRate:   agreedPrice.value,  // agreed price not listed
      withDriver:  withDriver.value,
      negotiated:  'true'
    }
  })
}

function sendMessage() {
  if (!inputText.value.trim()) return
  addMessage(inputText.value.trim())
  inputText.value = ''
  // Simulate owner reply
  setTimeout(() => {
    messages.value.push({
      id: msgId++, sender: 'owner', type: 'text',
      text: 'Thank you for your message! Let me check availability.',
      time: getNow()
    })

    scrollBottom()
  }, 1000)
}

function openOfferModal() {
  showOfferModal.value = true
}

function sendOffer() {
  if (!offerAmount.value) return
  const days = offerStart.value && offerEnd.value
    ? Math.ceil((new Date(offerEnd.value).getTime() - new Date(offerStart.value).getTime()) / 86400000)
    : undefined

  messages.value.push({
    id: msgId++, sender: 'me', type: 'offer',
    offerAmount: offerAmount.value,
    offerDays: days,
    offerStart: offerStart.value || undefined,
    offerEnd: offerEnd.value || undefined,
    time: getNow(),
    status: 'pending'
  })
  currentOffer.value = offerAmount.value

  if (offerMessage.value) {
    messages.value.push({ id: msgId++, sender: 'me', type: 'text', text: offerMessage.value, time: getNow() })
  }

  showOfferModal.value = false
  offerAmount.value = ''
  offerStart.value = ''
  offerEnd.value = ''
  offerMessage.value = ''
  scrollBottom()

  // Simulate owner counter-offer
  setTimeout(() => {
    messages.value.push({
      id: msgId++, sender: 'owner', type: 'text',
      text: 'Thanks for your offer! Let me check if I can match that.',
      time: getNow()
    })
    scrollBottom()
  }, 1200)
}

function acceptOffer(msg: Message) {
  msg.status = 'accepted'
  agreedPrice.value = msg.offerAmount || ''
  messages.value.push({
    id: msgId++, sender: 'me', type: 'text',
    text: `✅ I accept ₱${msg.offerAmount}/day! Let's proceed to booking.`,
    time: getNow()
  })
  scrollBottom()
}

function declineOffer(msg: Message) {
  msg.status = 'declined'
  messages.value.push({
    id: msgId++, sender: 'me', type: 'text',
    text: 'I declined this offer. Can we negotiate further?',
    time: getNow()
  })
  scrollBottom()
}

async function scrollBottom() {
  await nextTick()
  if (chatContent.value?.$el) {
    chatContent.value.$el.scrollToBottom(300)
  }
}
</script>

<style scoped>
.chat-content { --background: #f0f0f7; }

/* Toolbar */
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
.price-bar-item { 
  text-align: center;
}
.pb-label { 
  display: block; 
  font-size: 10px; 
  color: #999; 
  margin-bottom: 2px;
}
.pb-val { font-size: 14px; font-weight: 800; }
.pb-val.listed { color: #555; text-decoration: line-through; }
.pb-val.offer { color: #0070f3; }
.pb-val.agreed { color: #b70b67; }
.pb-val.none { color: #bbb; font-weight: 400; font-size: 12px; }
.arrow-between { color: #ccc; font-size: 16px; }

/* Chat */
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
.msg-left { flex-direction: row; }

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

/* Offer Card */
.offer-card {
  background: #fff;
  border-radius: 18px;
  padding: 14px 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  min-width: 200px;
}
.offer-mine { border: 2px solid #b70b67; }
.offer-theirs { border: 2px solid #b70b67; }

.offer-card-label { font-size: 11px; color: #999; margin-bottom: 6px; font-weight: 600; }
.offer-card-price { font-size: 26px; font-weight: 800; color: #0f0f1a; margin-bottom: 4px; }
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
.agreed-icon { font-size: 28px; color: #00c896; flex-shrink: 0; }
.agreed-title { font-size: 15px; font-weight: 800; color: #0f0f1a; margin-bottom: 3px; }
.agreed-sub { font-size: 12px; color: #555; }

/* Footer Input */
.chat-footer {
  background: #fff;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.07);
}
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
.send-btn {
  --color: #00c896;
  margin: 0;
  flex-shrink: 0;
}
.send-icon { font-size: 20px; }

/* Agreed Footer */
.agreed-footer { background: #fff; box-shadow: 0 -4px 20px rgba(0,0,0,0.07); }
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

/* Offer Modal */
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
.modal-sub { font-size: 14px; color: #666; margin: 0 0 24px; }

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

.date-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
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

<!-- Attributes called: 
 ownerName - database (route query): The name of the vehicle owner
 vehicleName - database (route query): The name or model of the vehicle
 listedPrice - database (route query): The original listed price of the vehicle
 currentOffer - local reactive state: The current offer amount in the negotiation
 agreedPrice - local reactive state: The price that has been agreed upon
 messages - local reactive state: Array of chat messages in the negotiation
 inputText - local reactive state: The text input for sending a message
 showOfferModal - local reactive state: Boolean to show/hide the offer modal
 offerAmount - local reactive state: The amount of the offer being made
 offerStart - local reactive state: Start date of the offer (rental period)
 offerEnd - local reactive state: End date of the offer (rental period)
 offerMessage - local reactive state: Message accompanying the offer
 chatContent - local ref: Reference to the chat content element
 vehicleId - database (route query): Unique ID of the vehicle
 withDriver - database (route query): Whether the rental includes a driver
 getNow - local helper function: Function to get current timestamp
 addMessage - local function: Function to add a message to the chat
 goToBooking - local function: Function to navigate to booking page
 sendMessage - local function: Function to send a message
 openOfferModal - local function: Function to open the offer modal
 sendOffer - local function: Function to send an offer
 acceptOffer - local function: Function to accept an offer
 declineOffer - local function: Function to decline an offer
 scrollBottom - local helper function: Function to scroll chat to bottom -->
