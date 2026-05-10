import { createRouter, createWebHistory } from "@ionic/vue-router";
import { RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("../views/LoginPage.vue"),
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("../views/RegisterPage.vue"),
  },
  {
    path: "/home",
    name: "Home",
    component: () => import("../views/HomePage.vue"),
  },
  {
    path: "/post",
    name: "post",
    component: () => import("../views/PostPage.vue"),
  },
  {
    path: "/listings",
    name: "listings",
    component: () => import("../views/ListingsPage.vue"),
  },
  {
    path: '/edit-vehicle/:id',
    component: () => import('../views/EditPage.vue')
  },
  {
    path:'/',
    redirect: '/welcome'
  },
  {
    path: '/registeras',
    component: () => import('../views/RegisterTypePage.vue')
  },
  {
    path: '/profile',
    component: () => import('../views/ProfilePage.vue')
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
