<script setup>
import Navbar from '../components/Navbar.vue';
</script>

<template>
    <Navbar class="fixed top-0 left-0 w-full z-50 h-[4vh] p-2 shadow-md"/>
    <div class="app mt-16 w-full h-[80vh] bg-[#ffe5b4] flex justify-center items-center">
         <div class="button-container flex justify-between w-4/5 max-w-[800px]">
            <button class="large-button w-full p-8 text-lg bg-white text-black border-4 border-[#cc5200] font-bold rounded-full cursor-pointer transition duration-300 hover:bg-[#dfab89]">
              <router-link :to="{ name: 'adddocument' }">ใบคำร้องขอลากิจ/ลาป่วย</router-link>
            </button> 
            <!-- <button class="large-button w-full p-8 text-lg bg-white text-black border-4 border-[#cc5200] font-bold rounded-full cursor-pointer transition duration-300 hover:bg-[#dfab89]">
                แบบขออนุมัติการจัดกิจกรรม
            </button> -->
        </div>
    </div>
</template>

<style scoped>
html, body, #app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%; /* ทำให้ครอบคลุมทั้งหน้าจอ */
}

.app {
  min-height: 93.3vh;
  background-color: #fdf6ec;

}

.large-button {
  text-align: center;
}
</style>

