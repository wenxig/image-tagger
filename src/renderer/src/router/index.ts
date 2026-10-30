import { useFilesStore } from "@renderer/stores"
import { createMemoryHistory, createRouter, createWebHistory } from "vue-router"

export const router = createRouter({
  history: createWebHistory('/'),
  routes: [{
    path: '/',
    component: () => import('../pages/index.vue'),
    children: [{
      path: 'files/overview',
      component: () => import('../pages/overview/index.vue')
    }, {
      path: 'files/statistics',
      component: () => import('../pages/statistics/index.vue')
    }]
  }]
})
router.beforeEach(to => {
  const store = useFilesStore()
  if (to.path !== '/' && store.files.length === 0) {
    return '/'
  }
  return true
})