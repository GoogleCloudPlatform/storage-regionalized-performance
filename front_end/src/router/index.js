import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'downloads',
    component: () => import(/* webpackChunkName: "about" */ '../views/DownloadsView.vue')
  },
  {
    path: '/uploads',
    name: 'uploads',
    component: () => import(/* webpackChunkName: "about" */ '../views/UploadsView.vue')
  },


]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
