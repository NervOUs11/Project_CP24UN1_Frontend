<script setup>
import { ref } from 'vue';  // Import ref from Vue
import { useRouter } from 'vue-router';

// Get the router instance to handle redirection
const router = useRouter();

// Define the firstName as a reactive property
const firstName = ref(localStorage.getItem('firstName'));

// Define the logout function
const logout = () => {
  localStorage.clear();  // Clear all data in localStorage
  router.push('/login'); // Redirect to login page
};
</script>

<template>
  <nav class="navbar">
    <div class="navbar-brand">K-MUTTRACK</div>
    <ul class="navbar-menu">
      <li><router-link to="/home">Home</router-link></li>
      <li><router-link to="/tracking">Status</router-link></li>
      <li><router-link to="">About K-MUTTRACK</router-link></li>
      <li v-if="firstName" class="navbar-item">
        <span class="welcome-message">Welcome, {{ firstName }}!</span>
      </li>
      <li>
        <button @click="logout()" class="logout-button">Logout</button>
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
    height: 30px;
    font-family: 'Arial', sans-serif;
  }
  
  .navbar-brand {
    font-size: 1.5rem;
    font-weight: bold;
  }
  
  .navbar-menu {
    list-style: none;
    display: flex;
    gap: 1.5rem;
  }
  
  .navbar-menu li {
    display: inline;
    margin: 0 25px;
  }
  
  .navbar-menu a {
    color: white;
    text-decoration: none;
  }
  
  .navbar-menu a:hover {
    text-decoration: underline;
  }
</style>
  