<script setup>
import { ref, onMounted } from 'vue'
import { getAllSigner, getAllFaculty, getAllDepartment } from "../functions/getData"
import { signup } from '../functions/signup'
import { useRouter } from 'vue-router'

const router = useRouter()
const studentID = ref()
const username = ref('')
const password = ref('')
const firstname = ref('')
const lastname = ref('')
const phoneNumber = ref('')
const backupEmail = ref('')
const advisor1 = ref('')
const advisor2 = ref('')
const faculty = ref('')
const department = ref('')
const allFaculties = ref([])
const allDepartments = ref([])
const advisors = ref([])
// const errorMessage = ref('')
// const successMessage = ref('')

// fetch all faculty, department and signer from database
onMounted(async () => {
  try {
    const facultyList = await getAllFaculty()
    allFaculties.value = facultyList.map(faculty => faculty[1])
    const departmentList = await getAllDepartment()
    allDepartments.value = departmentList.map(department => department[1])
    const advisorsList = await getAllSigner()
    advisors.value = advisorsList.map(advisor => `${advisor[3]} ${advisor[4]}`)
  } 
  catch (error) {
    console.error('Error fetching data:', error)
  }
})

const doSignUp = async () => {
  const signature = "dummySignature" 
  try {
    const res = await signup(studentID.value, username.value, password.value, firstname.value, 
                             lastname.value, phoneNumber.value, backupEmail.value, advisor1.value,
                             advisor2.value, faculty.value, department.value, signature)
    if (res.status === 200) {
      alert("User signed up successfully")
      router.push("login")
    }
  }
  catch (error) {
    console.log(error)
  }
}

</script>

<template>
  <div class="flex justify-center items-center min-h-screen bg-gray-100">
    <div class="bg-white p-6 rounded-lg shadow-lg w-[500px]">
      <h1 class="text-2xl font-bold mb-4 text-center text-orange-500">User Sign-Up</h1>

      <form onsubmit="return false">
        <!-- <div v-if="errorMessage" class="text-red-500 mb-3">{{ errorMessage }}</div>
        <div v-if="successMessage" class="text-green-500 mb-3">{{ successMessage }}</div> -->

        <div class="mb-3">
          <label for="studentID" class="block text-gray-700 mb-1">Student ID</label>
          <input 
            type="number" 
            id="studentID" 
            v-model="studentID"
            class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
            required
          />
        </div>

        <div class="mb-3">
          <label for="username" class="block text-gray-700 mb-1">Username</label>
          <input 
            type="email" 
            id="username" 
            v-model="username" 
            class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
            required
          />
        </div>

        <div class="mb-3">
          <label for="password" class="block text-gray-700 mb-1">Password</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
            required
          />
        </div>

        <div class="flex gap-2 mb-3">
          <div class="flex-1">
            <label for="firstname" class="block text-gray-700 mb-1">First Name</label>
            <input 
              type="text" 
              id="firstname" 
              v-model="firstname" 
              class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
          </div>
          <div class="flex-1">
            <label for="lastname" class="block text-gray-700 mb-1">Last Name</label>
            <input 
              type="text" 
              id="lastname" 
              v-model="lastname" 
              class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
          </div>
        </div>

        <div class="mb-3">
          <label for="phoneNumber" class="block text-gray-700 mb-1">Phone Number</label>
          <input 
            type="tel" 
            id="phoneNumber" 
            v-model="phoneNumber" 
            class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
            required
          />
        </div>

        <div class="mb-3">
          <label for="backupEmail" class="block text-gray-700 mb-1">Backup Email</label>
          <input 
            type="email" 
            id="backupEmail" 
            v-model="backupEmail" 
            class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <div class="flex gap-2 mb-3">
          <div class="mb-3">
          <label for="advisor1" class="block text-gray-700 mb-1">Advisor 1</label>
          <select 
            id="advisor1" 
            v-model="advisor1" 
            class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
            required
          >
            <option value="" disabled>Select Advisor 1</option>
            <option v-for="advisor in advisors" :key="advisor" :value="advisor">{{ advisor }}</option>
          </select>
        </div>

        <div class="mb-3">
          <label for="advisor2" class="block text-gray-700 mb-1">Advisor 2</label>
          <select 
            id="advisor2" 
            v-model="advisor2" 
            class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
            required
          >
            <option value="" disabled>Select Advisor 2</option>
            <option v-for="advisor in advisors" :key="advisor" :value="advisor">{{ advisor }}</option>
          </select>
        </div>
        </div>

        <div class="mb-3">
          <label for="faculty" class="block text-gray-700 mb-1">Faculty</label>
          <select 
            id="faculty" 
            v-model="faculty" 
            class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
            required
          >
            <option value="" disabled>Select Faculty</option>
            <option v-for="faculty in allFaculties" :key="faculty" :value="faculty">{{ faculty }}</option>
          </select>
        </div>

        <div class="mb-3">
          <label for="department" class="block text-gray-700 mb-1">Department</label>
          <select 
            id="department" 
            v-model="department" 
            class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
            required
          >
            <option value="" disabled>Select Department</option>
            <option v-for="department in allDepartments" :key="department" :value="department">{{ department }}</option>
          </select>
        </div>

        <button 
          type="submit" 
          class="w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600"
          @click="doSignUp">
          Sign Up
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
</style>
