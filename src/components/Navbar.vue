<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const role = localStorage.getItem("role")
const firstName = ref(localStorage.getItem('firstName'));
const showLogoutPopup = ref(false);

const openLogoutPopup = () => {
  showLogoutPopup.value = true;
};

const closeLogoutPopup = () => {
  showLogoutPopup.value = false;
};

const handleLogout = () => {
  localStorage.clear();
  showLogoutPopup.value = false;
  router.push("/login");
};


const navigateTo = (path) => {
  router.push(path);
};

</script>

<template>
  <nav class="navbar">
    <div class="navbar-brand">KMUTT TRACK</div>
    <ul class="navbar-menu">
      <li>
        <button @click="navigateTo('/home')" class="nav-button">Home</button>
      </li>
      <li>
        <button @click="navigateTo('/tracking')" class="nav-button">Status</button>
      </li>
      <li v-if="role == 'Administrator'">
        <button @click="navigateTo('/allUser')" class="nav-button">Users</button>
      </li>
      <li>
        <button @click="navigateTo('/about')" class="nav-button">About KMUTT TRACK</button>
      </li>
      <li v-if="firstName" class="navbar-item">
        <span class="welcome-message">Welcome, {{ firstName }}!</span>
      </li>
      <li>
        <button @click="openLogoutPopup()" class="nav-button logout-button">Logout</button>
      </li>
    </ul>

    <!-- Modal สำหรับ Logout -->
    <div 
      v-if="showLogoutPopup"
      class="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
      <div class="bg-white p-6 rounded shadow-md w-[400px]" style="border-radius: 20px;">
        <h2 class="text-lg font-bold mb-4 text-center text-black">Are you sure you want to logout?</h2>
        <div class="flex justify-center gap-2">
          <button class="bg-gray-500 text-white px-4 py-2 rounded-3xl" @click="closeLogoutPopup">
            Cancel
          </button>
          <button class="bg-red-500 text-white px-4 py-2 rounded-3xl" @click="handleLogout">
            Logout
          </button>
        </div>    
      </div>
    </div>

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
  