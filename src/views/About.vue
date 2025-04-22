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

<div class="flex flex-col items-center min-h-screen bg-container pt-20 px-4">
  <div class="bg-white bg-opacity-90 p-8 rounded-2xl shadow-lg w-full max-w-6xl space-y-12">

    <!-- Introduction -->
    <section class="text-center space-y-4">
      <h1 class="text-4xl font-bold">About KMUTT TRACK</h1>
      <h5 class="text-2xl font-semibold text-left">Introduction to KMUTT TRACK</h5>
      <p class="text-left indent-8 text-lg">
        KMUTT TRACK is a web application designed to simplify the process of submitting and tracking student request forms, such as absence notifications and activity approval requests. Our platform aims to reduce processing time and enhance transparency for both students and approvers.
      </p>
    </section>

    <!-- Types of Request Forms -->
    <section class="space-y-6">
      <h5 class="text-3xl font-semibold text-center">Types of Request Forms</h5>
      <div class="flex justify-between items-center">
        <div class="flex flex-col items-center w-1/2">
          <h3 class="text-2xl font-medium mb-2">Absence Document Form</h3>
          <img src="/images/absence.jpg" alt="Absence Form Template" class="mx-auto rounded-lg shadow-md" style="width: 80%;" />
        </div>
        <div class="flex flex-col items-center w-1/2">
          <h3 class="text-2xl font-medium mb-2">Activity Document Form</h3>
          <img src="/images/activity.jpg" alt="Activity Request Form Signature Page" class="mx-auto rounded-lg shadow-md" style="width: 80%;" />
        </div>
      </div>
    </section>


  <div class="text-center text-xl font-semibold text-primary mt-8">
      "Just log in, and we make your approval requests easier!"
  </div>

    <!-- Submitting Absence Request -->
    <section class="space-y-6">
      <h5 class="text-3xl font-semibold text-center">Submitting an Absence or Sick Leave Form</h5>
      <img src="/images/absence.jpg" alt="Absence Form Template" class="mx-auto rounded-lg shadow-md" style="width: 40%;" />
      <div class="space-y-2 text-lg text-left">
        <ul class="list-disc pl-8 space-y-2">
          <li>
            When submitting an absence or sick leave request, basic student information is automatically retrieved and displayed to you.
            <div class="mt-2">
              <img src="/images/basic-info.jpg" alt="Dropdown for Leave Type" class="rounded-md shadow" style="width: 60%;" />
            </div>
          </li>
          <li>
            Select the type of leave from the provided options.
            <div class="mt-2">
              <img src="/images/type-absence.jpg" alt="Dropdown for Leave Type" class="rounded-md shadow" />
            </div>
          </li>
        </ul>
      </div>
    </section>

    <!-- Submitting Activity Request -->
    <section class="space-y-6">
      <h5 class="text-3xl font-semibold text-center">Submitting an Activity Resquest Form</h5>
      <img src="/images/activity.jpg" alt="Absence Form Template" class="mx-auto rounded-lg shadow-md" style="width: 40%;" />
      <div class="space-y-2 text-lg text-left">
        <ul class="list-disc pl-8 space-y-2">
          <li>
            Example data in schedule details.
            <div class="mt-2">
              <img src="/images/step.jpg" alt="Dropdown for Leave Type" class="rounded-md shadow" style="width: 40%;" />
            </div>
          </li>
          <li>
            Example data in budget file.
            <div class="mt-2">
              <img src="/images/budget.jpg" alt="Dropdown for Leave Type" class="rounded-md shadow" style="width: 40%;" />
            </div>
          </li>
        </ul>
      </div>
    </section>

    <div class="bg-yellow-100 border-l-4 border-yellow-400 p-4 rounded-md text-left text-md">
      <h3 class="font-bold mb-2 text-yellow-800">Important Notes:</h3>
      <ul class="list-disc pl-6 space-y-1 text-yellow-800">
        <li>Make sure to upload all necessary documents as specified in the guidelines.</li>
        <li>Fill in all information accurately and completely. Description for each section are provided below the respective headings.</li>
        <li>Fields marked with a red star are required. Fields without a red star are optional.</li>
      </ul>
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
