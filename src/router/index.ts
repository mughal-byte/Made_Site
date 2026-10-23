import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/AuthView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/AuthView.vue'),
    },
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
    },
    {
      path: '/notifications',
      name: 'notifications',
      component: () => import('../views/NotificationsView.vue'),
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminView.vue'),
    },
    {
      path: '/projects/new',
      name: 'create-project',
      component: () => import('../views/CreateProjectView.vue'),
    },
    {
      path: '/projects/:id/editor',
      name: 'project-editor',
      component: () => import('../views/ProjectEditorView.vue'),
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (!auth.ready) await auth.load()

  const isPublic = to.name === 'login' || to.name === 'register'
  if (!auth.user && !isPublic) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (auth.user && isPublic) return { path: '/' }

  if (to.name === 'admin' && auth.user && !auth.user.admin) {
    return { path: '/' }
  }
})

export default router
