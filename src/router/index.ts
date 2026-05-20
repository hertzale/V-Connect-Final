import { createRouter, createWebHistory } from "@ionic/vue-router";
import { RouteRecordRaw } from "vue-router";
import { requireAuth, requireCustomer, requireOwner } from './guard';

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
    beforeEnter: requireCustomer

  },
  {
    //hardoced
    path: "/business/:id",
    name: "BusinessDetail",
    component: () => import("../views/BusinessDetailPage.vue"),
    beforeEnter: requireCustomer
  },
  {
    //hardcoded
    path: "/vehicle/:id",
    name: "VehicleDetail",
    component: () => import("../views/VehicleDetailPage.vue"),
    beforeEnter: requireCustomer
  },
  {
    //hardcoded
    path: "/negotiate/:id?",
    name: "Negotiate",
    component: () => import("../views/NegotiatePage.vue"),
    beforeEnter: requireCustomer
  },
  {
    path: "/booking",
    name: "Booking",
    component: () => import("../views/BookingPage.vue"),
    beforeEnter: requireCustomer
  },
  {
    path: "/transactions",
    name: "Transactions",
    component: () => import("../views/TransactionPage.vue"),
    beforeEnter: requireCustomer
  },
  {
    path: "/transactions/:id",
    name: "TransactionDetail",
    component: () => import("../views/TransactionDetailPage.vue"),
    beforeEnter: requireCustomer
  },
  {
    path: "/profile",
    name: "Profile",
    component: () => import("../views/ProfilePage.vue"),
    beforeEnter: requireCustomer
  },
  {
    path: "/notifications",
    name: "Notifications",
    component: () => import("../views/NotificationsPage.vue"),
    beforeEnter: requireCustomer
  },
  {
    path: "/chat",
    name: "Chats",
    component: () => import("../views/ChatListPage.vue"),
    beforeEnter: requireCustomer
  },
  {
    path: "/feedback",
    name: "Feedback",
    component: () => import("../views/FeedbackPage.vue"),
    beforeEnter: requireCustomer
  },
  {
    path: '/payment',
    name: 'Payment',
    component: () => import('../views/PaymentPage.vue'),
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
    path: '/create-business',
    component: () => import('@/views/CreateBusinessPage.vue')
  },
  {
    path: "/listings",
    name: "Listings",
    component: () => import("../views/ListingsPage.vue"),
  },
  {
    path: '/negotiate-owner/:id',
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
  {
    path: '/negotiate-list',
    name: 'NegotiateList',
    component: () => import('../views/BusinessChatlist.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  /*const user = JSON.parse(localStorage.getItem('user') || '{}')
  const role = user.Role

  if (to.path === '/owner-dashboard' && role !== 'Business_Owner') {
    next('/home')
  } else if (to.path === '/home' && role === 'Business_Owner') {
    next('/owner-dashboard')
  } else {
    next()
  }*/
 next()
})

export default router;