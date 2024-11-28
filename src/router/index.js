import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Signup from '../views/SignUp.vue'
import Home from '../views/Home.vue'
import AddDocument from '../views/AddDocument.vue'
import Tracking from '../views/Tracking.vue'
import DocumentDetail from '../views/DocumentDetail.vue'
import StampText from '../views/stamptext.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/signup',
      name: 'signup',
      component: Signup
    },
    {
      path: '/home',
      name: 'home',
      component: Home
    },
    {
      path: '/adddocument',
      name: 'adddocument',
      component: AddDocument
    },
    {
      path: '/tracking',
      name: 'tracking',
      component: Tracking
    },
    {
      path: "/documentDetail/:id",
      name: "DocumentDetail",
      component: DocumentDetail
    },
    {
      path: "/stamptext",
      name: "stamptext",
      component: StampText
    },
  ]
})

router.beforeEach((to, from, next) => {
  const isLoggedIn = !!localStorage.getItem('username');
  const role = localStorage.getItem('role');
  if (to.name !== 'login' && to.name !== 'signup' && !isLoggedIn) {
    next({ name: 'login' });
  } 
  else if (to.name === 'home') {
    if (role === 'Student') {
      next();
    } else if (role !== 'Student') {
      next({ name: 'tracking' });
    }
  }
  else {
    next();
  }
  
});

export default router
