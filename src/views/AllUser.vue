<script setup>
import Navbar from '../components/Navbar.vue';
import { ref, onMounted, computed } from "vue";
import { getAllUser } from "../functions/getAllUser";

const users = ref([]);
const searchQuery = ref("");
const selectedRole = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(5);

const fetchUsers = async () => {
  const data = await getAllUser();
  if (data) {
    // ตรวจสอบ userId และตั้ง role เป็น "Student" หากมี userId
    users.value = data.map((user) => {
      if (user.studentID) {
        user.role = "Student";
      }
      return user;
    });
  }
};

// Filtered Users: ใช้สำหรับค้นหาและกรองตาม Role
const filteredUsers = computed(() => {
  return users.value.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesRole = selectedRole.value
      ? user.role === selectedRole.value
      : true;
    return matchesSearch && matchesRole;
  });
});

// Pagination & Sorting
const totalPages = computed(() => Math.ceil(filteredUsers.value.length / itemsPerPage.value));
const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredUsers.value.slice(start, end);
});

const goToPage = (page) => {
  currentPage.value = page;
};

// Unique Roles for Dropdown
const uniqueRoles = computed(() => {
  const roles = users.value.map((user) => user.role);
  return [...new Set(roles)];
});

// เรียก fetchUsers เมื่อ component ถูก mount
onMounted(() => {
  fetchUsers();
});
</script>

<template>
<Navbar class="fixed top-0 left-0 w-full z-50 h-[4vh] p-2 shadow-md" />
  <div class="flex flex-col items-center min-h-screen bg-orange-100 p-4">
    <div class="bg-white p-6 rounded-lg shadow-lg w-[1100px]" style="margin-top: 180px;">
      <h1 class="text-2xl font-bold mb-4 text-center text-orange-500">All Users</h1>

      <!-- Search and Sort Section -->
        <div class="flex justify-between items-center mb-4">
        <div class="flex items-center space-x-4 w-[100%] mr-80 search-bar">
            <span class="text-orange-500 w-[80%] font-bold">Search by Name or Username</span>
            <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by Username or Name"
            class="form-input w-[100%] px-8 py-2 border border-gray-300 rounded-lg"
            />
        </div>
        <select
            v-model="selectedRole"
            class="form-select w-[25%] px-4 py-2 border border-gray-300 rounded-lg"
        >
            <option value="">All Roles</option>
            <option v-for="role in uniqueRoles" :key="role" :value="role">{{ role }}</option>
        </select>
        </div>

      <table class="document-table w-full text-left border-collapse">
        <thead>
          <tr class="bg-orange-500 text-white">
            <th class="px-4 py-2">#</th>
            <th class="px-4 py-2">Username</th>
            <th class="px-4 py-2">Name</th>
            <th class="px-4 py-2">Email</th>
            <th class="px-4 py-2">Role</th>
          </tr>
        </thead>
        <tbody v-if="filteredUsers.length === 0">
          <tr>
            <td class="text-center text-red-600 font-bold text-2xl" colspan="5">No Users Found</td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr
            v-for="(user, index) in paginatedUsers"
            :key="user.staffID || user.userId"
            class="hover:bg-orange-100 border-b border-gray-200"
          >
            <td class="px-4 py-2">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
            <td class="px-4 py-2">{{ user.username }}</td>
            <td class="px-4 py-2">{{ user.name }}</td>
            <td class="px-4 py-2">{{ user.email }}</td>
            <td class="px-4 py-2">{{ user.role }}</td>
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