<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="toolbar">
        <ion-buttons slot="start">
          <ion-back-button default-href="/dashboard" text="" class="back-btn"></ion-back-button>
        </ion-buttons>
        <ion-title class="toolbar-title">Booking History</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" class="filter-btn" @click="showFilterModal = true">
            <ion-icon name="filter-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="page-content">
      <ion-refresher slot="fixed" @ionRefresh="doRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <!-- Summary Cards -->
      <div class="summary-section">
        <div class="summary-scroll">
          <div class="summary-card highlight">
            <div class="sc-icon">💰</div>
            <div class="sc-val">₱{{ summary.totalRevenue.toLocaleString() }}</div>
            <div class="sc-label">Total Revenue</div>
          </div>
          <div class="summary-card">
            <div class="sc-icon">📋</div>
            <div class="sc-val">{{ summary.totalBookings }}</div>
            <div class="sc-label">Total Bookings</div>
          </div>
          <div class="summary-card">
            <div class="sc-icon">🚗</div>
            <div class="sc-val">{{ summary.mostBooked }}</div>
            <div class="sc-label">Most Booked</div>
          </div>
          <div class="summary-card">
            <div class="sc-icon">⭐</div>
            <div class="sc-val">{{ summary.avgRating }}</div>
            <div class="sc-label">Avg Rating</div>
          </div>
        </div>
      </div>

      <!-- Filter Row -->
      <div class="filter-row">
        <div class="filter-chips">
          <div
            v-for="f in vehicleFilters"
            :key="f"
            class="chip"
            :class="{ active: vehicleFilter === f }"
            @click="vehicleFilter = f"
          >{{ f }}</div>
        </div>

        <div class="date-filter" @click="showFilterModal = true">
          <ion-icon name="calendar-outline"></ion-icon>
          <span>{{ selectedRange }}</span>
        </div>
      </div>

      <!-- Results Count -->
      <div class="results-label">
        Showing {{ filteredHistory.length }} booking(s)
      </div>

      <!-- History List -->
      <div class="list">
        <div
          v-for="item in filteredHistory"
          :key="item.id"
          class="history-card"
        >
          <div class="hc-header">
            <div class="hc-vehicle">
              <div class="hc-emoji">{{ item.emoji }}</div>
              <div>
                <div class="hc-vehicle-name">{{ item.vehicleName }}</div>
                <div class="hc-renter">Rented by {{ item.renterName }}</div>
              </div>
            </div>
            <div class="hc-status" :class="item.status">{{ statusLabel(item.status) }}</div>
          </div>

          <div class="hc-divider"></div>

          <div class="hc-details">
            <div class="hc-detail-row">
              <ion-icon name="calendar-outline" class="hd-icon"></ion-icon>
              <span>{{ item.startDate }} → {{ item.endDate }} ({{ item.days }} day(s))</span>
            </div>
            <div class="hc-detail-row">
              <ion-icon name="cash-outline" class="hd-icon"></ion-icon>
              <span>
                ₱{{ item.pricePerDay }}/day
                <span class="negotiated-note" v-if="item.negotiated">(negotiated from ₱{{ item.listedPrice }})</span>
              </span>
            </div>
            <div class="hc-detail-row" v-if="item.rating">
              <ion-icon name="star" class="hd-icon star"></ion-icon>
              <span>{{ item.rating }} — "{{ item.review }}"</span>
            </div>
          </div>

          <div class="hc-footer">
            <div class="hc-total">₱{{ item.totalAmount.toLocaleString() }}</div>
            <div class="hc-booking-id">ID #{{ item.id }}</div>
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div class="empty-state" v-if="filteredHistory.length === 0">
        <div class="empty-icon">📊</div>
        <div class="empty-title">No bookings found</div>
        <div class="empty-sub">Try adjusting your filters.</div>
      </div>

      <div style="height: 80px"></div>
    </ion-content>

    <!-- Filter Modal -->
    <ion-modal :is-open="showFilterModal" @did-dismiss="showFilterModal = false" class="filter-modal">
      <div class="modal-inner">
        <div class="modal-handle"></div>
        <h2 class="modal-title">Filter History</h2>

        <div class="form-group">
          <label class="form-label">Date Range</label>
          <div class="range-options">
            <div
              v-for="r in dateRanges"
              :key="r"
              class="range-chip"
              :class="{ active: selectedRange === r }"
              @click="selectedRange = r"
            >{{ r }}</div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Specific Date</label>
          <input v-model="specificDate" type="date" class="form-input" />
        </div>

        <div class="modal-actions">
          <ion-button fill="outline" class="btn-reset" @click="resetFilters">Reset</ion-button>
          <ion-button class="btn-apply" @click="showFilterModal = false">Apply Filters</ion-button>
        </div>
      </div>
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonButton, IonContent, IonIcon, IonRefresher, IonRefresherContent, IonModal
} from '@ionic/vue'

const showFilterModal = ref(false)
const vehicleFilter = ref('All Vehicles')
const selectedRange = ref('This Month')
const specificDate = ref('')

const vehicleFilters = ['All Vehicles', 'Toyota Vios', 'Honda City', 'Yamaha Mio', 'Toyota Innova']
const dateRanges = ['Today', 'This Week', 'This Month', 'Last 3 Months', 'This Year']

const summary = ref({
  totalRevenue: 48500,
  totalBookings: 34,
  mostBooked: 'Vios 2022',
  avgRating: '4.8',
})

interface HistoryItem {
  id: number
  vehicleName: string
  emoji: string
  renterName: string
  startDate: string
  endDate: string
  days: number
  pricePerDay: number
  listedPrice: number
  negotiated: boolean
  totalAmount: number
  status: 'done' | 'cancelled'
  rating?: number
  review?: string
}

const history = ref<HistoryItem[]>([
  {
    id: 1001, vehicleName: 'Toyota Vios 2022', emoji: '🚗', renterName: 'Maria Santos',
    startDate: 'May 20', endDate: 'May 23', days: 3,
    pricePerDay: 750, listedPrice: 850, negotiated: true, totalAmount: 2250,
    status: 'done', rating: 5, review: 'Great vehicle, very smooth ride!'
  },
  {
    id: 1002, vehicleName: 'Honda City 2021', emoji: '🚙', renterName: 'Pedro Reyes',
    startDate: 'May 15', endDate: 'May 16', days: 1,
    pricePerDay: 900, listedPrice: 900, negotiated: false, totalAmount: 900,
    status: 'done', rating: 4, review: 'Good condition, will rent again.'
  },
  {
    id: 1003, vehicleName: 'Yamaha Mio 2023', emoji: '🏍️', renterName: 'Ana Cruz',
    startDate: 'May 10', endDate: 'May 12', days: 2,
    pricePerDay: 380, listedPrice: 400, negotiated: true, totalAmount: 760,
    status: 'done', rating: 5, review: 'Perfect for city rides!'
  },
  {
    id: 1004, vehicleName: 'Toyota Innova', emoji: '🚌', renterName: 'Jose Bautista',
    startDate: 'May 5', endDate: 'May 6', days: 1,
    pricePerDay: 1800, listedPrice: 1800, negotiated: false, totalAmount: 1800,
    status: 'cancelled', rating: undefined, review: undefined
  },
  {
    id: 1005, vehicleName: 'Toyota Vios 2022', emoji: '🚗', renterName: 'Liza Mendoza',
    startDate: 'Apr 28', endDate: 'May 1', days: 3,
    pricePerDay: 800, listedPrice: 850, negotiated: true, totalAmount: 2400,
    status: 'done', rating: 4, review: 'Nice and clean!'
  },
])

const filteredHistory = computed(() => {
  return history.value.filter(h => {
    if (vehicleFilter.value !== 'All Vehicles') {
      return h.vehicleName.includes(vehicleFilter.value.split(' ')[1] || vehicleFilter.value)
    }
    return true
  })
})

function statusLabel(status: string) {
  return status === 'done' ? '✔ Done' : '❌ Cancelled'
}

function resetFilters() {
  vehicleFilter.value = 'All Vehicles'
  selectedRange.value = 'This Month'
  specificDate.value = ''
  showFilterModal.value = false
}

function doRefresh(event: any) {
  setTimeout(() => event.target.complete(), 1000)
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
.filter-btn { --color: #00c896; }

/* Summary */
.summary-section { padding: 16px 16px 0; }
.summary-scroll {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  scrollbar-width: none;
  padding-bottom: 4px;
}
.summary-scroll::-webkit-scrollbar { display: none; }

.summary-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  min-width: 110px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  flex-shrink: 0;
}
.summary-card.highlight {
  background: linear-gradient(135deg, #0f0f1a, #1e1e3a);
  min-width: 130px;
}
.summary-card.highlight .sc-val { color: #00c896; }
.summary-card.highlight .sc-label { color: rgba(255,255,255,0.5); }
.summary-card.highlight .sc-icon { font-size: 28px; }

.sc-icon { font-size: 22px; margin-bottom: 6px; }
.sc-val { font-size: 18px; font-weight: 800; color: #0f0f1a; margin-bottom: 3px; }
.sc-label { font-size: 11px; color: #999; }

/* Filter Row */
.filter-row {
  display: flex;
  align-items: center;
  padding: 14px 16px 0;
  gap: 10px;
}
.filter-chips {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  flex: 1;
  scrollbar-width: none;
}
.filter-chips::-webkit-scrollbar { display: none; }
.chip {
  background: #f4f4f8;
  border-radius: 20px;
  padding: 7px 14px;
  font-size: 12px;
  font-weight: 600;
  color: #555;
  white-space: nowrap;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
  flex-shrink: 0;
}
.chip.active { background: #e8fdf6; color: #00a87e; border-color: #00c896; }

.date-filter {
  display: flex;
  align-items: center;
  gap: 5px;
  background: #f4f4f8;
  border-radius: 12px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  color: #555;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}
.date-filter ion-icon { color: #00c896; }

.results-label {
  padding: 12px 20px 0;
  font-size: 13px;
  color: #999;
  font-weight: 600;
}

/* List */
.list { padding: 12px 16px; display: flex; flex-direction: column; gap: 12px; }

.history-card {
  background: #fff;
  border-radius: 18px;
  padding: 16px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.hc-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}
.hc-vehicle { display: flex; align-items: center; gap: 10px; }
.hc-emoji {
  width: 42px; height: 42px;
  background: #f0f0f7;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}
.hc-vehicle-name { font-size: 15px; font-weight: 800; color: #0f0f1a; margin-bottom: 2px; }
.hc-renter { font-size: 12px; color: #999; }

.hc-status {
  border-radius: 10px;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 700;
}
.hc-status.done      { background: #f0f0f5; color: #6b7280; }
.hc-status.cancelled { background: #fde8e8; color: #e05555; }

.hc-divider { height: 1px; background: #f5f5f7; margin-bottom: 12px; }

.hc-details { display: flex; flex-direction: column; gap: 7px; margin-bottom: 12px; }
.hc-detail-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: #555;
  line-height: 1.4;
}
.hd-icon { color: #00c896; font-size: 14px; flex-shrink: 0; margin-top: 1px; }
.hd-icon.star { color: #f5a623; }
.negotiated-note { font-size: 11px; color: #0070f3; margin-left: 4px; }

.hc-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid #f5f5f7;
}
.hc-total { font-size: 20px; font-weight: 800; color: #0f0f1a; }
.hc-booking-id { font-size: 12px; color: #bbb; }

/* Empty */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 32px;
  text-align: center;
}
.empty-icon { font-size: 48px; margin-bottom: 12px; }
.empty-title { font-size: 17px; font-weight: 800; color: #0f0f1a; margin-bottom: 6px; }
.empty-sub { font-size: 14px; color: #999; }

/* Modal */
.filter-modal {
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
.modal-title { font-size: 20px; font-weight: 800; color: #0f0f1a; margin: 0 0 20px; }

.form-group { margin-bottom: 20px; }
.form-label { display: block; font-size: 13px; font-weight: 700; color: #333; margin-bottom: 10px; }

.range-options { display: flex; flex-wrap: wrap; gap: 8px; }
.range-chip {
  background: #f4f4f8;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #555;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
}
.range-chip.active { background: #e8fdf6; color: #00a87e; border-color: #00c896; }

.form-input {
  width: 100%;
  background: #f4f4f8;
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 15px;
  color: #0f0f1a;
  outline: none;
  box-sizing: border-box;
}
.form-input:focus { border-color: #00c896; }

.modal-actions { display: flex; gap: 10px; }
.btn-reset {
  flex: 1;
  --color: #555;
  --border-color: #ddd;
  --border-radius: 14px;
  font-weight: 600;
  height: 50px;
}
.btn-apply {
  flex: 2;
  --background: #00c896;
  --color: #fff;
  --border-radius: 14px;
  font-weight: 700;
  height: 50px;
}
</style>