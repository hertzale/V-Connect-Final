import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    user: JSON.parse(localStorage.getItem('user') || '{}')
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
    isOwner: (state) => !!state.user?.has_license
  },
  actions: {
    setAuth(token: string, user: any) {
      this.token = token
      this.user = user
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
    },
    logout() {
      this.token = ''
      this.user = {}
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }
})