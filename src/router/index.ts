import { createRouter, createWebHistory } from "@ionic/vue-router";
import { RouteRecordRaw } from "vue-router";

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

  // ── Customer ──────────────────────────────────────────────
  {
    path: "/home",
    name: "Home",
    component: () => import("../views/HomePage.vue"),
  },
  {
    path: "/businesses",
    name: "BusinessList",
    component: () => import("../views/BusinessListPage.vue"),
  },
  {
    path: "/business/:id",
    name: "BusinessDetail",
    component: () => import("../views/BusinessDetailPage.vue"),
  },
  {
    path: "/vehicle/:id",
    name: "VehicleDetail",
    component: () => import("../views/VehicleDetailPage.vue"),
  },
  {
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

  // ── Business Owner ────────────────────────────────────────
  {
    path: "/dashboard",
    name: "Dashboard",
    component: () => import("../views/BusinessDashboard.vue"),
  },
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
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;