<script setup>
import { fetchDocumentDetail } from '../functions/documentDetail';
import { ref, onMounted } from 'vue';
import { useRouter } from "vue-router";
import Navbar from '../components/Navbar.vue';

const data = ref(null);

const router = useRouter();

const goBack = () => {
  router.push("/tracking");
};

const formatDateTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return {
    date: date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    time: date.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }) + ' น.'
  };
};
const preview = ref({
  visible: false,
  title: '',
  data: '',
  type: ''
});

const openFileInNewTab = (base64String, mimeType) => {
  const byteCharacters = atob(base64String.split(',')[1]);
  const byteNumbers = new Uint8Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const blob = new Blob([byteNumbers], { type: mimeType });

  const blobUrl = URL.createObjectURL(blob);

  window.open(blobUrl);

  setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
  }, 1000);
};

onMounted(async () => {
  const rawData = await fetchDocumentDetail();
  if (rawData) {
    data.value = {
      ...rawData,
      startTime: formatDateTime(rawData.startTime),
      endTime: formatDateTime(rawData.endTime),
      createDate: formatDateTime(rawData.createDate),
      editDate: formatDateTime(rawData.editDate),
      file1: `data:image/jpeg;base64,${rawData.file1}`
    };
  }
  // console.log(data.value); // ตรวจสอบข้อมูลใน console ว่าถูกต้องหรือไม่
});

</script>

<template>
<Navbar class="fixed top-0 left-0 w-full z-50 h-[4vh] p-2 shadow-md"/>
  <!-- Show loading or skeleton while data is being fetched -->
  <div v-if="data === null" class="flex justify-center items-center min-h-screen">
    <span>Loading...</span>
  </div>

  <!-- Show the document details once data is fetched -->
  <div v-else class="flex justify-center items-center min-h-screen bg-orange-100">
    <div class="bg-white p-6 rounded-lg shadow-lg w-[900px]">
      <h1 class="text-2xl font-bold mb-4 text-center text-orange-500">Document Detail</h1>

      <div class="mb-6">
        <h2 class="text-lg font-semibold text-gray-700 mb-2">Document Information</h2>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <span class="font-bold">Document ID:</span> {{ data.DocumentID }}
          </div>
          <div>
            <span class="font-bold">ประเภทการลา:</span> {{ data.DocumentType }}
          </div>
          <div class="col-span-2">
            <span class="font-bold">เหตุผลและรายละเอียด:</span> {{ data.detail }}
          </div>

          <div>
            <span class="font-bold">วันที่เริ่มลา:</span> {{ data.startTime.date }} เวลา {{ data.startTime.time }}
          </div>
          <div>
            <span class="font-bold">ลาถึงวันที่:</span> {{ data.endTime.date }} เวลา {{ data.endTime.time }}
          </div>
          <div>
            <span class="font-bold">วันที่สร้างแบบฟอร์ม:</span> {{ data.createDate.date }} เวลา {{ data.createDate.time }}
          </div>
          <div>
            <span class="font-bold">วันที่แก้ไขแบบฟอร์ม:</span> {{ data.editDate.date }} เวลา {{ data.editDate.time }}
          </div>

        </div>
      </div>

      <div class="mb-6">
        <h2 class="text-lg font-semibold text-gray-700 mb-2">Files</h2>
        <div class="grid grid-cols-2 gap-4">
          <div v-if="data.file1">
            <span class="font-bold">File 1:</span>
            <a 
              href="javascript:void(0);" 
              @click="openFileInNewTab(data.file1, 'application/pdf')" 
              class="text-orange-500 underline">
              View File
            </a>
          </div>
          <div v-if="data.file2">
            <span class="font-bold">File 2:</span>
            <a :href="data.file2" target="_blank" class="text-orange-500 underline">
              {{ data.file2Name || "View File" }}
            </a>
          </div>
        </div>
      </div>

      <div class="mb-6">
        <h2 class="text-lg font-semibold text-gray-700 mb-2">Progress</h2>
        <ul class="list-disc pl-6 text-gray-700">
          <li v-for="(step, index) in data.allProgress" :key="index">
            {{ step.staffName }} - {{ step.staffRole }} - {{ step.status }}
          </li>
        </ul>
      </div>

      <div class="text-center">
        <button class="form-button" @click="goBack">
          Back to Tracking
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-button {
  width: 100%;
  padding: 10px 0;
  border: none;
  border-radius: 100px;
  background-color: #fb923c;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}

.form-button:hover {
  background-color: #f97316;
}

.grid {
  display: grid;
}

.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
</style>
