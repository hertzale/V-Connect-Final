import { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import axios from 'axios'

// Check if logged in
export const requireAuth = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const token = localStorage.getItem('token')
  if (!token) {
    next('/login')
  } else {
    next()
  }
}

// Check if owner
export const requireOwner = async (to, from, next) => {
  const token = localStorage.getItem('token')
  if (!token) return next('/login')
  
  try {
    const res = await axios.get('http://localhost:3000/api/persons/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.data.data.Drivers_License) {
      next()
    } else {
      next('/home')
    }
  } catch {
    next('/login')
  }
}

// Check if customer only
export const requireCustomer = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const token = localStorage.getItem('token')
  const savedUser = localStorage.getItem('user')

  if (!token) {
    next('/login')
    return
  }

  if (savedUser) {
    const user = JSON.parse(savedUser)
    if (user.has_license) {
      next('/owner-dashboard') // ← owner → go to owner dashboard
      return
    }
  }
  next()
}