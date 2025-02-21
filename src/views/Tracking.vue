<script setup>
import { ref, onMounted, computed  } from 'vue';
import { useRouter } from 'vue-router';
import { tracking } from '../functions/tracking.js';
import Navbar from '../components/Navbar.vue';

const currentPage = ref(1);
const itemsPerPage = 5;

const documents = ref([]);
const router = useRouter();
const firstName = ref(localStorage.getItem('firstName'));

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

onMounted(async () => {
  try {
    let id =  null
    const role = localStorage.getItem("role");

    if(role === "Student"){
      id = localStorage.getItem("studentID");
    }
    else if (role !== "Student") {
      id = localStorage.getItem("staffID");
    }
    documents.value = await tracking(id);
    console.log(documents.value)

    

  } catch (error) {
    console.error("Error fetching documents:", error);
  }
});

const sortedDocuments = computed(() =>
  documents.value.slice().sort((a, b) => new Date(b.editDate) - new Date(a.editDate))
);

const totalPages = computed(() => Math.ceil(sortedDocuments.value.length / itemsPerPage));

const paginatedDocuments = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return sortedDocuments.value.slice(start, end);
});

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const goHome = () => {
  router.push({ name: 'home' });
}

const goToDocument = (documentType, documentID) => {
  if (documentType === 'ลากิจ' || documentType === 'ลาป่วย') {
    goToDocumentDetail(documentID);
  } else if (documentType === 'Workshop' || documentType === 'Volunteer' || documentType === 'Seminar') {
    goToActivityDocument(documentID);
  }
};


const goToDocumentDetail = (documentID) => {
  router.push({ name: 'DocumentDetail', params: { id: documentID } }); 
};

const goToActivityDocument = (documentID) => {
  router.push({ name: 'ActivityDocumentDetail', params: { id: documentID } }); 
}

const filteredDocuments = computed(() =>
  documents.value.filter(
    (doc) => doc.status === 'Waiting for approve' || doc.status === 'Waiting for approve'
  )
);

</script>

<template>
  <Navbar class="fixed top-0 left-0 w-full z-50 h-[4vh] p-2 shadow-md" />
  <div class="flex justify-center items-center min-h-screen bg-orange-100">
    <div class="bg-white p-6 rounded-lg shadow-lg w-[1100px]">
      <h1 class="text-2xl font-bold mb-4 text-center text-orange-500">{{ firstName }}'s Tracking Document</h1>
      <table class="document-table w-full text-left border-collapse">
        <thead>
          <tr class="bg-orange-500 text-white">
            <th class="px-4 py-2">#</th>
            <th class="px-4 py-2">Document Name</th>
            <th class="px-4 py-2">Status</th>
            <th class="px-4 py-2">Date Sent</th>
            <th class="px-4 py-2">Last Edit</th>
          </tr>
        </thead>
        <tbody v-if="documents.length === 0">
          <tr>
            <td class="text-center text-red-600 font-bold text-2xl" colspan="5">No Document Send</td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr
            v-for="(doc, index) in paginatedDocuments"
            :key="doc.documentID"
            class="hover:bg-orange-100 border-b border-gray-200"
            @click="goToDocument(doc.documentType, doc.documentID)"
          >
            <td class="px-4 py-2">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
            <td class="px-4 py-2">{{ doc.documentType }}</td>
            <td class="px-4 py-2">
              <span
                :class="{
                  'text-green-500 font-bold': doc.status === 'Approve',
                  'text-red-500 font-bold': doc.status === 'Reject',
                  'text-orange-500 font-bold': doc.status === 'Waiting for approve',
                  'text-blue-500 font-bold': doc.status === 'Other advisor approve',
                }"
              >
                {{ doc.status }}
              </span>
            </td>
            <td class="px-4 py-2">{{ formatDate(doc.createDate) }}</td>
            <td class="px-4 py-2">{{ formatDate(doc.editDate) }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="flex justify-center mt-4">
        <button
          v-for="page in totalPages"
          :key="page"
          :class="['pagination-button', { 'bg-orange-500 text-white': currentPage === page }]"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>
      </div>

      <div class="text-center mt-6">
        <button 
          @click="goHome"
          class="form-button"
        >
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
  font-weight: bold;
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
  padding: 10px 0;
  border: none;
  border-radius: 100px;
  background-color: #fb923c;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}

.document-table {
  border-collapse: collapse;
  width: 100%;
  margin-top: 20px;
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
</style>
