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
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  },

]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
