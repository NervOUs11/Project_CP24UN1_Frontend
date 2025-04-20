<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { tracking } from '../functions/tracking.js';
import Navbar from '../components/Navbar.vue';

onMounted(async () => {
  try {

  } catch (error) {

  }
});

</script>

<template>
  <Navbar class="fixed top-0 left-0 w-full z-50 h-[4vh] p-2 shadow-md" />
  
  <div class="flex justify-center items-center min-h-screen bg-container">
    <div class="bg-white bg-opacity-80 p-8 rounded-2xl shadow-lg max-w-4xl w-full text-center space-y-2 mt-20">
      <h1 class="text-3xl font-bold text-orange-500">About KMUTT TRACK</h1>

      <p class="text-lg text-left indent-8">
        This project presents a web application designed to streamline the process of submitting and tracking student documents within an academic environment. The system allows students to submit two types of documents: absence documents and activity approval requests to signers. Signers can review, approve, or reject submissions. The system also features an automated email notification. It improves communication, reduces processing time, and provides a transparent tracking system for both students and signers, enhancing the overall efficiency of document handling in educational institutions.
      </p>

      <div>
        <h2 class="text-2xl font-semibold mb-4">Advisor</h2>
        <div class="flex flex-col items-center">
          <img src="/images/unhawa.jpg" alt="Dr.Unhawa Ninrutsirikun" class="w-32 h-45 object-cover mb-2" style="border-radius: 15px;" />
          <div class="font-medium">Dr.Unhawa Ninrutsirikun</div>
        </div>
      </div>

      <div>
        <h2 class="text-2xl font-semibold mb-4">Members</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="flex flex-col items-center">
            <img src="/images/sasithon.jpg" alt="Sasithon Dontree" class="w-32 h-45 object-cover mb-2" style="border-radius: 15px;" />
            <div class="font-medium">Sasithon Dontree</div>
            <div class="text-sm text-gray-600">Front-End, DevOps</div>
          </div>
          <div class="flex flex-col items-center">
            <img src="/images/nitis.jpg" alt="Nitis Visayataksin" class="w-32 h-45 object-cover mb-2" style="border-radius: 15px;" />
            <div class="font-medium">Nitis Visayataksin</div>
            <div class="text-sm text-gray-600">Back-End</div>
          </div>
          <div class="flex flex-col items-center">
            <img src="/images/phongsathon.jpg" alt="Phongsathon Chansongkrao" class="w-32 h-45 object-cover mb-2" style="border-radius: 15px;" />
            <div class="font-medium">Phongsathon Chansongkrao</div>
            <div class="text-sm text-gray-600">Front-End</div>
          </div>
        </div>
      </div>

    </div>
  </div>

</template>

<style scoped>
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
