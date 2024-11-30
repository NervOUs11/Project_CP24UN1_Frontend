<script setup>
import Navbar from '../components/Navbar.vue';
</script>

<template>
  <Navbar class="fixed top-0 left-0 w-full z-50 h-[4vh] p-2 shadow-md"/>
  <div class="app mt-16 w-full h-[80vh] bg-[#ffe5b4] flex justify-center items-center">
    <div class="button-container flex justify-center w-4/5 max-w-[800px]">
      <router-link 
        :to="{ name: 'adddocument' }" 
        class="large-button flex justify-center items-center w-full"
      >
        <button class="w-full p-8 text-lg bg-white text-black border-4 border-[#cc5200] font-bold rounded-full cursor-pointer transition duration-300 hover:bg-[#dfab89]">
          ใบคำร้องขอลากิจ/ลาป่วย
        </button>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
html, body, #app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%; /* ครอบคลุมทั้งหน้าจอ */
}

.app {
  min-height: 93.3vh;
  background-color: #fdf6ec;
}

.button-container {
  display: flex;
  justify-content: center; /* จัดตำแหน่งปุ่มให้อยู่ตรงกลาง */
  align-items: center; /* จัดแนวในแนวตั้ง */
  width: 100%; 
}

.large-button {
  display: inline-block; /* ทำให้ router-link มีขนาดตามเนื้อหา */
  text-align: center;
}
</style>
