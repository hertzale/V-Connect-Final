import { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'

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
export const requireOwner = (
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
    if (!user.has_license) {
      next('/home') // ← not an owner → go to customer home
      return
    }
  }
  next()
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