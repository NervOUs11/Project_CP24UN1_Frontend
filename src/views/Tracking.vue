<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { tracking } from '../functions/tracking.js';
import Navbar from '../components/Navbar.vue';

const currentPage = ref(1);
const itemsPerPage = 5;

const documents = ref([]);
const router = useRouter();
const firstName = ref(localStorage.getItem('firstName'));

const filterDate = ref("");
const filterType = ref("");
const filterStatus = ref("");
const filterName = ref("");

const clearFilters = () => {
  filterDate.value = "";
  filterType.value = "";
  filterStatus.value = "";
  filterName.value = "";
};

const filteredDocuments = computed(() => {
  return documents.value.filter(doc => {
    const matchDate = filterDate.value ? doc.createDate.startsWith(filterDate.value) : true;
    const matchType = filterType.value ? doc.documentType === filterType.value : true;
    const matchStatus = filterStatus.value
      ? doc.status === filterStatus.value
      : true;
    const matchName = filterName.value ? doc.documentName.toLowerCase().includes(filterName.value.toLowerCase()) : true;
    return matchDate && matchType && matchStatus && matchName;
  });
});

// ฟังก์ชันจัดรูปแบบวันที่
const formatDate = (dateString) => {
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };

  const date = new Date(dateString);
  const localOffset = date.getTimezoneOffset() / 60;
  const localDate = new Date(date.getTime() - (localOffset * 60 * 60 * 1000));

  return localDate.toLocaleString('th-TH', options);
};

// โหลดข้อมูลเมื่อ Component ถูก mount
onMounted(async () => {
  try {
    let id = null;
    const role = localStorage.getItem("role");

    if (role === "Student") {
      id = localStorage.getItem("studentID");
    } else {
      id = localStorage.getItem("staffID");
    }
    documents.value = await tracking(id);
  } catch (error) {
    console.error("Error fetching documents:", error);
  }
});

// เรียงเอกสารจากล่าสุดไปเก่าสุด
const sortedDocuments = computed(() =>
  filteredDocuments.value.slice().sort((a, b) => new Date(b.editDate) - new Date(a.editDate))
);

// คำนวณจำนวนหน้าทั้งหมด
const totalPages = computed(() => Math.ceil(sortedDocuments.value.length / itemsPerPage));

// จัดการเอกสารให้แสดงตามหน้าปัจจุบัน
const paginatedDocuments = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return sortedDocuments.value.slice(start, start + itemsPerPage);
});

// เปลี่ยนหน้าที่แสดงผล
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const goHome = () => {
  router.push({ name: 'home' });
};

const goToDocument = (documentType, documentID) => {
  if (documentType === 'ใบคำร้องขอลากิจ/ลาป่วย') {
    goToDocumentDetail(documentID);
  } else if (documentType === 'ใบคำร้องขออนุมัติจัดกิจกรรม') {
    goToActivityDocument(documentID);
  }
};

const goToDocumentDetail = (documentID) => {
  router.push({ name: 'DocumentDetail', params: { id: documentID } });
};

const goToActivityDocument = (documentID) => {
  router.push({ name: 'ActivityDocumentDetail', params: { id: documentID } });
};
</script>

<template>
  
  <Navbar class="fixed top-0 left-0 w-full z-50 h-[4vh] p-2 shadow-md" />
  <div class="flex justify-center items-center min-h-screen bg-container">
    <div class="bg-white p-6 rounded-lg shadow-lg w-[1200px]">
      <h1 class="text-4xl font-bold mt-2 mb-8 text-center text-orange-500">{{ firstName }}'s Tracking Document</h1>

    <div class="mb-4 flex flex-wrap gap-4 items-center">
      <input type="text" v-model="filterName" placeholder="Search by name" class="border p-2 rounded w-64" />

      <select v-model="filterType" class="border p-2 rounded">
        <option value="">All Types</option>
        <option value="ใบคำร้องขอลากิจ/ลาป่วย">ใบคำร้องขอลากิจ/ลาป่วย</option>
        <option value="ใบคำร้องขออนุมัติจัดกิจกรรม">ใบคำร้องขออนุมัติจัดกิจกรรม</option>
      </select>

      <select v-model="filterStatus" class="border p-2 rounded">
        <option value="">All Status</option>
        <option value="Waiting for approve">Waiting for approve</option>
        <option value="Approve">Approve</option>
        <option value="Reject">Reject</option>
      </select>

      <input type="date" v-model="filterDate" class="border p-2 rounded" />
      
      <div class=" text-center text-xs inline-flex">
        <button @click="clearFilters" class="form-button">
          Clear Filter
        </button>
      </div>
    </div>

      <table class="document-table w-full table-fixed border-collapse">
        <thead>
          <tr class="bg-orange-500 text-white">
            <th class="px-4 py-2 text-center">No.</th>
            <th class="px-4 py-2 text-center">Document Type</th>
            <th class="px-4 py-2 text-center">Document Name</th>
            <th class="px-4 py-2 text-center">Status</th>
            <th class="px-4 py-2 text-center"> Sent Date</th>
            <th class="px-4 py-2 text-center">Last Edited Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="paginatedDocuments.length === 0">
            <td class="text-center text-red-600 font-bold text-2xl" colspan="6">No Document Send</td>
          </tr>
        
        
          <tr v-else v-for="(doc, index) in paginatedDocuments" :key="doc.documentID"
            class="hover:bg-orange-100 border-b border-gray-200"
            @click="goToDocument(doc.documentType, doc.documentID)">
            <td class="px-4 py-2 text-center font-medium">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
            <td class="px-4 py-2">{{ doc.documentType }}</td>
            <td class="px-4 py-2">{{ doc.documentName }}</td>
            <td class="px-4 py-2">
              <span :class="{
                'text-green-500 font-bold': doc.status === 'Approve',
                'text-red-500 font-bold': doc.status === 'Reject',
                'text-orange-500 font-bold': doc.status === 'Waiting for approve',
                'text-blue-500 font-bold': doc.status === 'Other advisor approve',
              }">
                {{ doc.status }}
              </span>

            </td>
            <td class="px-4 py-2">{{ formatDate(doc.createDate) }}</td>
            <td class="px-4 py-2">{{ formatDate(doc.editDate) }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="flex justify-center mt-4 overflow-x-auto">
        <button v-for="page in totalPages" :key="page"
          :class="['pagination-button', { 'bg-orange-500 text-white': currentPage === page }]" @click="goToPage(page)">
          {{ page }}
        </button>
      </div>

      <div class=" text-center text-xs inline-flex mt-6">
        <button @click="goHome" class="form-button">
          Back to Home
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pagination-button {
  padding: 10px 15px;
  margin-left: 0px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: white;
  color: #fb923c;
  font-weight: bolder;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}

.pagination-button:hover {
  background-color: #fb923c;
  color: white;
}

.pagination-button.bg-orange-500 {
  border-color: #fb923c;
}



.form-button {
  width: 100%;
  padding: 15px 15px;
  border: none;
  border-radius: 100px;
  background-color: #fb923c;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}

.document-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: auto;
  /* ให้ตารางปรับขนาดตามเนื้อหา */
}

.document-table th,
.document-table td {
  white-space: nowrap;
  /* ป้องกันข้อความขึ้นบรรทัดใหม่ */
  padding: 10px;
  border: 1px solid #d1d5db;
}

.document-table th {
  background-color: #fb923c;
  color: white;
  font-weight: bold;
}


.document-table th,
.document-table td {
  padding: 10px;
  border: 1px solid #d1d5db;
}

.document-table th {
  background-color: #fb923c;
  color: white;
  font-weight: bold;
}

.document-table tbody tr:hover {
  background-color: #fef3c7;
}

.document-table tbody tr {
  cursor: pointer;
}

.document-table tbody td {
  /* text-align: left; */
  vertical-align: middle;
}

.flex {
  display: flex;
}

.justify-center {
  justify-content: center;
}

.items-center {
  align-items: center;
}

.min-h-screen {
  min-height: 100vh;
}

.bg-orange-100 {
  background-color: #fff7ed;
}

.bg-white {
  background-color: white;
}

.text-orange-500 {
  color: #f97316;
}

.text-green-500 {
  color: #16a34a;
}

.text-yellow-500 {
  color: #ca8a04;
}

.text-red-500 {
  color: #dc2626;
}

.rounded-lg {
  border-radius: 8px;
}

.shadow-lg {
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.w-full {
  width: 100%;
}

@media (max-width: 768px) {

  .document-table th,
  .document-table td {
    font-size: 14px;
    padding: 6px;
  }

  .text-2xl {
    font-size: 1.25rem;
    /* ลดขนาดหัวข้อ */
  }
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
