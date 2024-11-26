<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const firstName = ref(localStorage.getItem('firstName'));

const logout = () => {
  localStorage.clear();
  router.push('/login');
};

const navigateTo = (path) => {
  router.push(path);
};

</script>

<template>
  <nav class="navbar">
    <div class="navbar-brand">K-MUTTRACK</div>
    <ul class="navbar-menu">
      <li>
        <button @click="navigateTo('/home')" class="nav-button">Home</button>
      </li>
      <li>
        <button @click="navigateTo('/tracking')" class="nav-button">Status</button>
      </li>
      <li>
        <!-- <button @click="navigateTo('/about')" class="nav-button">About K-MUTTRACK</button> -->
        <button class="nav-button">About K-MUTTRACK</button>
      </li>
      <li v-if="firstName" class="navbar-item">
        <span class="welcome-message">Welcome, {{ firstName }}!</span>
      </li>
      <li>
        <button @click="logout()" class="nav-button logout-button">Logout</button>
      </li>
    </ul>
    
  </nav>
</template>
  
<style scoped>
  .navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    background-color: #ff6600;
    color: white;
    height: 65px;
    font-family: 'Arial', sans-serif;
  }
  
  .navbar-brand {
    font-size: 1.5rem;
    font-weight: bold;
  }
  
  .navbar-menu {
    list-style: none;
    display: flex;
    gap: 1rem;
  }
  
  .navbar-menu li {
    display: flex;
    align-items: center;
    transition: background-color 0.3s ease; 
  }
  
  .navbar-menu a {
    color: white;
    text-decoration: none;
  }

  .navbar-menu li:hover {
  background-color: #ff8540; /* สีส้มอ่อนลง */
}
</style>
  