import { createRouter, createWebHistory } from "@ionic/vue-router";
import { RouteRecordRaw } from "vue-router";
import { requireAuth, requireOwner } from './guard';

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/welcome",
  },

  // ── Public ────────────────────────────────────────────────
  {
    path: "/welcome",
    name: "Landing",
    component: () => import("../views/LandingPage.vue"),
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("../views/LoginPage.vue"),
  },
  {
    path: "/register-type",
    name: "RegisterType",
    component: () => import("../views/RegisterTypePage.vue"),
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("../views/RegisterPage.vue"),
  },
  {
    path: "/receipt",
    name: "Receipt",
    component: () => import("../views/ReceiptPage.vue"),
  },

  // ── Customer ──────────────────────────────────────────────
  {
    path: "/home",
    name: "Home",
    component: () => import("../views/HomePage.vue"),

  },
  {
    //hardoced
    path: "/business/:id",
    name: "BusinessDetail",
    component: () => import("../views/BusinessDetailPage.vue"),
  },
  {
    //hardcoded
    path: "/vehicle/:id",
    name: "VehicleDetail",
    component: () => import("../views/VehicleDetailPage.vue"),
  },
  {
    //hardcoded
    path: "/negotiate/:id?",
    name: "Negotiate",
    component: () => import("../views/NegotiatePage.vue"),
  },
  {
    path: "/booking",
    name: "Booking",
    component: () => import("../views/BookingPage.vue"),
  },
  {
    path: "/transactions",
    name: "Transactions",
    component: () => import("../views/TransactionPage.vue"),
  },
  {
    path: "/profile",
    name: "Profile",
    component: () => import("../views/ProfilePage.vue"),
  },
  {
    path: "/notifications",
    name: "Notifications",
    component: () => import("../views/NotificationsPage.vue"),
  },
  {
    path: "/chat",
    name: "Chats",
    component: () => import("../views/ChatListPage.vue"),
  },
  {
    path: "/feedback",
    name: "Feedback",
    component: () => import("../views/FeedbackPage.vue"),
  },

  // ── Business Owner ────────────────────────────────────────
  {
    path: "/post",
    name: "Post",
    component: () => import("../views/PostPage.vue"),
  },
  {
    path: "/edit-vehicle/:id",
    name: "EditVehicle",
    component: () => import("../views/EditPage.vue"),
  },
  {
    path: "/listings",
    name: "Listings",
    component: () => import("../views/ListingsPage.vue"),
  },
  {
    path: '/owner-negotiate/:id',
    name: 'OwnerNegotiate',
    component: () => import('../views/OwnerNegotiatePage.vue'),
  },
  {
    path: "/transaction-requests",
    name: "TransactionRequests",
    component: () => import("../views/TransactionRequestsPage.vue"),
  },
  {
    path: "/booking-history",
    name: "BookingHistory",
    component: () => import("../views/BookingHistoryPage.vue"),
  },
  {
    path: "/business-profile",
    name: "BusinessProfile",
    component: () => import("../views/BusinessProfilePage.vue"),
  },
  {
    path: "/owner-dashboard",
    name: "OwnerDashboard",
    component: () => import("../views/OwnerDashboardPage.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const role = user.role

  if (to.path === '/owner-dashboard' && role !== 'Business_Owner') {
    next('/home')
  } else if (to.path === '/home' && role === 'Business_Owner') {
    next('/owner-dashboard')
  } else {
    next()
  }
})

export default router;