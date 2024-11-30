<script setup>
import { ref, onMounted, computed  } from 'vue';
import { useRouter } from 'vue-router';
import { tracking } from '../functions/tracking.js';
import Navbar from '../components/Navbar.vue';

const documents = ref([]);
const router = useRouter();
const firstName = ref(localStorage.getItem('firstName'));
const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
}

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
  } catch (error) {
    console.error("Error fetching documents:", error);
  }
});

const goHome = () => {
  router.push({ name: 'home' });
}

const goToDocumentDetail = (documentID) => {
  router.push({ name: 'DocumentDetail', params: { id: documentID } }); 
};

// const filteredDocuments = computed(() =>
//   documents.value.filter(
//     (doc) => doc.status === 'Waiting for approve' || doc.isApprove === 'Waiting for approve' || 
//   )
// );

</script>

<template>
  <Navbar class="fixed top-0 left-0 w-full z-50 h-[4vh] p-2 shadow-md"/>
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
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(doc, index) in documents"
            :key="doc.documentID"
            class="hover:bg-orange-100 border-b border-gray-200"
            @click="goToDocumentDetail(doc.documentID)"
          >
            <td class="px-4 py-2">{{ index + 1 }}</td>
            <td class="px-4 py-2">{{ doc.documentType }}</td>
            <td class="px-4 py-2">
              <span
                :class="{
                  'text-green-500 font-bold': doc.status === 'Approve' || doc.isApprove === 'Approve',
                  'text-red-500 font-bold': doc.status === 'Reject' || doc.isApprove === 'Reject',
                  'text-orange-500 font-bold': doc.status === 'Waiting for approve' || doc.isApprove === 'Waiting for approve',
                }"
              >
                {{ doc.status || doc.isApprove }}
              </span>
            </td>
            <td class="px-4 py-2">{{ formatDate(doc.createDate) }}</td>
          </tr>
        </tbody>
      </table>

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
  text-align: left;
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
