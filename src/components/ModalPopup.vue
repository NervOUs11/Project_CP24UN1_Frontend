<template>
    <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div class="bg-white rounded-lg shadow-lg p-6 w-96">
        <h2 class="text-lg font-bold mb-4 text-center">Notification</h2>
        <p class="text-gray-700 text-center mb-6">{{ message }}</p>
        <div class="flex justify-center">
          <button 
            @click="handleOk" 
            class="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      show: {
        type: Boolean,
        required: true
      },
      message: {
        type: String,
        required: true
      },
      redirectUrl: {
        type: String,
        default: "/tracking"
      }
    },
    methods: {
      handleOk() {
        this.$emit("close"); // ส่ง event 'close' ไปปิด modal
        this.$router.push(this.redirectUrl); // ลิงก์ไปที่หน้า tracking
      }
    }
  };
  </script>
  
  <style scoped>
  
  </style>
  