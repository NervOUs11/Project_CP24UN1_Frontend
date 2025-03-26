<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();
const goBack = () => {
  router.push('/tracking');
};
</script>

<template>
  <div class="flex justify-center items-center min-h-screen bg-orange-100">
    <div class="bg-white p-6 rounded-lg shadow-lg w-[600px] text-center">
      <h1 class="text-2xl font-bold text-orange-600">Access Denied</h1>
      <p class="mt-4 text-gray-700">You do not have permission to access this document.</p>
      <button 
        @click="goBack" 
        class="mt-6 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600">
        Go Back
      </button>
    </div>
  </div>
</template>

<style scoped>
</style>
