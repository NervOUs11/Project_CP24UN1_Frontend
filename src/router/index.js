import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Signup from '../views/SignUp.vue'
import Home from '../views/Home.vue'
import AddDocument from '../views/AddDocument.vue'
import Tracking from '../views/Tracking.vue'
import DocumentDetail from '../views/DocumentDetail.vue'
import DocumentEdit from '../views/DocumentEdit.vue'
import StampText from '../views/stamptext.vue'
import AddActivityDocument from '../views/AddActivityDocument.vue'
import AllUser from '../views/AllUser.vue'
import ActivityDocumentDetail from '@/views/ActivityDocumentDetail.vue'
import EditActivityDocument from '@/views/EditActivityDocument.vue'
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
      path: '/document/add',
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
      path: "/documentEdit/:id",
      name: "DocumentEdit",
      component: DocumentEdit
    },
    {
      path: "/stamptext",
      name: "stamptext",
      component: StampText
    },
    {
      path: "/addActivityDocument",
      name: "AddActivityDocument",
      component: AddActivityDocument
    },
    {
      path: "/allUser",
      name: "AllUser",
      component: AllUser
    },
    {
      path: "/activityDocumentDetail/:id",
      name: "ActivityDocumentDetail",
      component: ActivityDocumentDetail
    },
    {
      path: "/editActivityDocument/:id",
      name: "EditActivityDocument",
      component: EditActivityDocument
    }
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
