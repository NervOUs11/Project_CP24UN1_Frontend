<script setup>
import Navbar from '../components/Navbar.vue';
</script>

<template>
  <Navbar class="fixed top-0 left-0 w-full z-50 h-[4vh] p-2 shadow-md" />

  <div class="app mt-16 w-full h-[80vh] flex justify-center items-center bg-container">
    <div class="button-container flex justify-center w-4/5 max-w-[800px]">
      <router-link :to="{ name: 'adddocument' }" class="large-button flex justify-center items-center w-full">
        <button
          class="w-full p-8 text-lg bg-white text-black border-4 border-[#cc5200] font-bold rounded-full cursor-pointer transition duration-300 hover:bg-[#dfab89]">
          ใบคำร้องขอลากิจ/ลาป่วย
        </button>
      </router-link>
      <router-link :to="{ name: 'AddActivityDocument' }" class="large-button flex justify-center items-center w-full">
        <button
          class="w-full p-8 text-lg bg-white text-black border-4 whitespace-nowrap border-[#cc5200] font-bold rounded-full cursor-pointer transition duration-300 hover:bg-[#dfab89]">
          ใบคำร้องขออนุมัติการจัดกิจกรรม
        </button>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
html,
body,
#app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}

.app {
  min-height: 93.3vh;
  background-color: #fdf6ec;
}

.button-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.large-button {
  display: inline-block;
  text-align: center;
  margin-left: 20px;
}

.bg-container {
    background: url('/images/bg-image.jpg') no-repeat center center fixed;
    background-size: cover;
    position: relative;
}

.bg-container::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(82, 82, 82, 0.7);
    backdrop-filter: blur(10px);
    z-index: 0;
}

.bg-container > div {
    position: relative;
    z-index: 10;
}
</style>
