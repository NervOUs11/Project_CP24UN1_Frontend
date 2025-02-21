<script setup>
import { ref, onMounted } from 'vue'
import { getAllFaculty } from "../functions/getData"
import { addDocument } from '../functions/adddocument'
import { useRouter } from "vue-router";

import ModalPopup from "../components/ModalPopup.vue"
const showModal = ref(false);
const alertMessage = ref("");
const today = ref(new Date().toISOString().split("T")[0]);
const router = useRouter()

const type = ref('');
const detail = ref('');
const remainingCharacters = ref(500);

const updateRemainingCharacters = () => {
  remainingCharacters.value = 500 - detail.value.length;
};

const attachmentFile1 = ref("");
const attachmentFile2 = ref("");

// ตัวแปรการเลือกประเภทการลาและช่วงเวลา
const leaveType = ref('')
const oneDayDate = ref('')
const oneDaySession = ref({
  morning: false,
  afternoon: false
})

// ตัวแปรสำหรับการลาแบบหลายวัน
const starttime = ref('')
const endtime = ref('')

const userData = ref({
  name: '',
  studentId: '',
  faculty: '',
  department: '',
  classLevel: '',
  studyLevel: '',
  programType: '',
  studentStatus: '',
  currentGPA: '',
  cumulativeGPA: '',
  advisor: '',
  tel: '',
  email: ''
})

onMounted(() => {
  userData.value = {
    name: localStorage.getItem("firstName") + " " + localStorage.getItem("lastName"),
    studentId: localStorage.getItem("studentID"),
    faculty: localStorage.getItem("faculty"),
    department: localStorage.getItem("department"),
    classLevel: localStorage.getItem("year"),
    studyLevel: "ปริญญาตรี",
    programType: "ปกติ",
    studentStatus: "ปกติ",
    currentGPA: localStorage.getItem("currentGPA"),
    cumulativeGPA: localStorage.getItem("cumulativeGPA"),
    advisor: localStorage.getItem("advisor"),
    tel: localStorage.getItem("tel"),
    email: localStorage.getItem("email")
  }
})

const handleFileChange = async (e) => {
  console.log("Input changed:", e.target.files)
  const file = e.target.files[0];
  if (file) {
    const base64 = await fileToBase64(file);
    // console.log("Base64 file:", base64);
    attachmentFile1.value = base64
    // downloadPDF(base64, 'base64topdf.pdf');
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

function downloadPDF(base64String, filename) {
    const link = document.createElement('a');
    link.href = 'data:application/pdf;base64,' + base64String;
    link.download = filename;
    link.click();
}

function convertToISOWithTimezone(dateString, time) {
  try {
    let date;

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      date = new Date(`${dateString}T${time}`);
    } else {
      date = new Date(dateString);
      if (isNaN(date)) {
        throw new Error(`Invalid dateString: "${dateString}".`);
      }

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      dateString = `${year}-${month}-${day}`;
      date = new Date(`${dateString}T${time}`);
    }

    if (isNaN(date)) {
      throw new Error("Invalid date or time value.");
    }

    return date.toISOString();
  } catch (error) {
    return `Error: ${error.message}`;
  }
}

const getNextDay = (date) => {
  if (!date) return today.value; // ถ้ายังไม่มี starttime ให้ใช้ today
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  return nextDay.toISOString().split("T")[0];
};

const addDoc = async () => {
  try {
    // ดึงค่า studentFacultyID และ studentDepartmentID จาก local storage
    const studentFacultyID = parseInt(localStorage.getItem("facultyId"));
    const studentDepartmentID = parseInt(localStorage.getItem("departmentId"));
    const studentID = parseInt(localStorage.getItem("studentID"))
    // ตรวจสอบว่าข้อมูลจำเป็นถูกต้อง
    if (!studentFacultyID || !studentDepartmentID) {
      throw new Error("ไม่พบข้อมูล studentFacultyID หรือ studentDepartmentID ใน local storage");
    }

    // ตรวจสอบวันที่วันนี้
    const today = new Date();
    today.setHours(0, 0, 0, 0); // รีเซ็ตเวลาเป็น 00:00:00

    // กำหนดเวลา startTime และ endTime ตามประเภทการลา
    let startTime = null;
    let endTime = null;

    if (leaveType.value === "oneDay") {
      // ลาวันเดียว

      const date = new Date(oneDayDate.value);

      if (date < today) {
        alert("วันลาต้องเป็นวันนี้หรือหลังจากวันนี้");
        throw new Error("Leave date must be today or in the future");
      }

      // const date = oneDayDate.value;
      if (oneDaySession.value.morning && oneDaySession.value.afternoon) {
        startTime = convertToISOWithTimezone(date, "09:00:00");
        endTime = convertToISOWithTimezone(date, "17:00:00");
      } else if (oneDaySession.value.morning) {
        startTime = convertToISOWithTimezone(date, "09:00:00");
        endTime = convertToISOWithTimezone(date, "12:00:00");
      } else if (oneDaySession.value.afternoon) {
        startTime = convertToISOWithTimezone(date, "13:00:00");
        endTime = convertToISOWithTimezone(date, "17:00:00");
      } else {
        throw new Error("กรุณาเลือกช่วงเวลาการลาวันเดียว");
      }
    } else if (leaveType.value === "multipleDays") {
      // ลาหลายวัน
      const startDate = new Date(starttime.value);
      const endDate = new Date(endtime.value);

      if (startDate < today || endDate < today) {
        alert("วันลาต้องเป็นวันนี้หรือหลังจากวันนี้");
        throw new Error("Leave dates must be today or in the future");
      }

      if (endDate <= startDate) {
        alert("วันที่สิ้นสุดต้องมากกว่าวันที่เริ่มต้น")
        throw new Error("EndDate must more than StartDate");
      }
      
      startTime = convertToISOWithTimezone(starttime.value, "09:00:00");
      endTime = convertToISOWithTimezone(endtime.value, "17:00:00");

    } else {
      throw new Error("กรุณาเลือกประเภทการลา");
    }

    if(detail.value.trim().length === 0){
      alert('กรุณากรอกเหตุผลและรายละเอียดการลา')
      throw new Error("กรุณากรอกเหตุผลและรายละเอียดการลา");
    }

    const dataToSend = {
      studentID: studentID,
      type: type.value,
      // createDate: new Date().toISOString(), // เวลาที่สร้าง
      // editDate: new Date().toISOString(), // เวลาที่แก้ไขล่าสุด
      startTime: startTime,
      endTime: endTime,
      detail: detail.value,
      attachmentFile1: attachmentFile1.value,
      attachmentFile2: "",
      attachmentFile2Name: "File 2 name", // ชื่อไฟล์แนบ 2 (ถ้าต้องการแยกต่างหาก)
      studentFacultyID: studentFacultyID,
      studentDepartmentID: studentDepartmentID,
    };
    console.log("Data to send:", dataToSend);
    const res = await addDocument(dataToSend);
    console.log("API response:", res[1]);


    if (res[1] === 201) {
      // alertMessage.value = "Add Document Successfully!";
      // showModal.value = true;
      alert("Add New Document Successfully!");
      try {
        router.push("/tracking");
      } catch (error) {
        console.error(error);
      }
    }
  } catch (error) {
    // alertMessage.value = "Add Document Failed";
    // showModal.value = true;
    console.error("Failed to add absence document:", error.message);
  }
};

</script>

<template>
  <div class="flex justify-center items-center min-h-screen bg-orange-100">
    <div class="bg-white p-6 rounded-lg shadow-lg w-[1100px]">
      <h1 class="text-2xl font-bold mb-4 text-center text-orange-500">Add Absence Document</h1>

      <form @submit.prevent="addDoc">
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div class="mb-3">
            <label for="name" class="block text-gray-700 mb-1">ชื่อ: {{ userData.name }}</label>
          </div>

          <div class="mb-3">
            <label for="studentId" class="block text-gray-700 mb-1">รหัสประจำตัวนักศึกษา: {{ userData.studentId }}</label>
          </div>

          <div class="mb-3">
            <label for="faculty" class="block text-gray-700 mb-1">คณะ: {{ userData.faculty }}</label>
          </div>

          <div class="mb-3">
            <label for="department" class="block text-gray-700 mb-1">ภาควิชา/สาขาวิชา: {{ userData.department }}</label>
          </div>

          <div class="mb-3">
            <label for="classLevel" class="block text-gray-700 mb-1">ชั้นปีที่: {{ userData.classLevel }}</label>
          </div>

          <div class="mb-3">
            <label for="studyLevel" class="block text-gray-700 mb-1">ระดับการศึกษา: {{ userData.studyLevel }}</label>
          </div>

          <div class="mb-3">
            <label for="programType" class="block text-gray-700 mb-1">ประเภทหลักสูตร: {{ userData.programType }}</label>
          </div>

          <div class="mb-3">
            <label for="studentStatus" class="block text-gray-700 mb-1">สถานะนักศึกษา: {{ userData.studentStatus }}</label>
          </div>

          <div class="mb-3">
            <label for="currentGPA" class="block text-gray-700 mb-1">คะแนนเฉลี่ยประจำภาค: {{ userData.currentGPA }}</label>
          </div>

          <div class="mb-3">
            <label for="cumulativeGPA" class="block text-gray-700 mb-1">คะแนนเฉลี่ยสะสม: {{ userData.cumulativeGPA }}</label>
          </div>

          <div class="mb-3">
            <label for="contact" class="block text-gray-700 mb-1">ข้อมูลการติดต่อนักศึกษา: {{ userData.tel }}</label>
          </div>

          <div class="mb-3">
            <label for="email" class="block text-gray-700 mb-1">อีเมล: {{ userData.email }}</label>
          </div>

        </div>

        <!-- ฟอร์มการกรอกข้อมูลการลา -->
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div class="mb-3">
            <label for="type" class="block text-gray-700 mb-1">เรื่อง<span class="text-red-500 ml-1">*</span></label>
            <select 
              id="type" 
              v-model="type"
              class="form-input"
              required
            >
              <option value="" disabled>เลือกประเภทการลา</option>
              <option value="ลากิจ">ขออนุญาตลากิจ</option>
              <option value="ลาป่วย">ขออนุญาตลาป่วย</option>
            </select>
          </div>

          <div class="mb-3" style="margin-top: 30px;">
            <label for="email" class="block text-gray-700 mb-1">อาจารย์ที่ปรึกษา: {{ userData.advisor }}</label>
          </div>

          <div class="mb-3">
            <label for="leaveType" class="block text-gray-700 mb-1">ประเภทการลา<span class="text-red-500 ml-1">*</span></label>
            <select 
              id="leaveType" 
              v-model="leaveType"
              class="form-input"
              required
            >
              <option value="" disabled>เลือกประเภทการลา</option>
              <option value="oneDay">ลา 1 วัน</option>
              <option value="multipleDays">ลาหลายวัน</option>
            </select>
          </div>

          <!-- ถ้าเลือกลา 1 วัน -->
          <div v-if="leaveType === 'oneDay'">
            <div class="mb-3">
              <label for="oneDayDate" class="block text-gray-700 mb-1">เลือกวันที่<span class="text-red-500 ml-1">*</span></label>
              <input 
                type="date" 
                id="oneDayDate" 
                v-model="oneDayDate"
                class="form-input"
                :min="today"
                required
              />
            </div>

            <div class="mb-3">
              <label for="oneDaySession" class="block text-gray-700 mb-1">ช่วงเวลา<span class="text-red-500 ml-1">*</span></label>
              
              <div class="flex items-center space-x-4">
                <label class="flex items-center">
                  <input 
                    type="checkbox" 
                    v-model="oneDaySession.morning" 
                    class="form-checkbox"
                  />
                  <span class="ml-2">เช้า</span>
                </label>
                <label class="flex items-center">
                  <input 
                    type="checkbox" 
                    v-model="oneDaySession.afternoon" 
                    class="form-checkbox"
                  />
                  <span class="ml-2">บ่าย</span>
                </label>
              </div>
            </div>
          </div>

          <!-- ถ้าเลือก ลาหลายวัน -->
          <div v-if="leaveType === 'multipleDays'" class="grid grid-cols-2 gap-4 mb-4">
            <!-- วันที่เริ่มต้น -->
            <div class="mb-3">
              <label for="starttime" class="block text-gray-700 mb-1">ระหว่างวันที่<span class="text-red-500 ml-1">*</span></label>
              <input 
                type="date" 
                id="starttime" 
                v-model="starttime"
                class="form-input"
                :min="today"
                required
              />
            </div>

            <!-- วันที่สิ้นสุด -->
            <div class="mb-3">
              <label for="endtime" class="block text-gray-700 mb-1">ถึงวันที่<span class="text-red-500 ml-1">*</span></label>
              <input 
                type="date" 
                id="endtime" 
                v-model="endtime"
                class="form-input"
                 :min="getNextDay(starttime)"
                required
              />
            </div>
          </div>

          <div class="mb-3 col-span-2">
            <label for="detail" class="block text-gray-700 mb-1">โดยมีเหตุผลและรายละเอียด<span class="text-red-500 ml-1">*</span></label>
            <textarea 
              id="detail" 
              v-model="detail"
              class="form-input detail-input"
              maxlength="500"
              required
              @input="updateRemainingCharacters"
            ></textarea>
            <div class="text-right text-sm text-gray-600">
              ตัวอักษรที่สามารถใส่ได้ {{ remainingCharacters }} 
            </div>
          </div>

          <div class="mb-3">
            <label for="attachmentFile1" class="block text-gray-700 mb-1">หนังสือรับรองผู้ปกครอง/ใบรับรองแพทย์</label>
            <input 
              type="file" 
              id="attachmentFile1" 
              @change="handleFileChange" 
              class="form-input"
            />
          </div>

          <div class="mb-3">
            <label for="attachmentFile2" class="block text-gray-700 mb-1">หลักฐานอื่นๆ</label>
            <input 
              type="file" 
              id="attachmentFile2" 
              @change="e => attachmentFile2.value = e.target.files[0]"
              class="form-input"
            />
          </div>
        </div>

        <button 
          type="submit" 
          class="form-button"
        >
          Add New Document
        </button>

      </form>
      <!-- Modal Popup -->
      <ModalPopup :show="showModal" :message="alertMessage" @close="showModal = false" />
    </div>
  </div>
</template>

<style scoped>
.form-input {
  width: 100%;
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 100px;
  outline: none;
  transition: border-color 0.2s ease-in-out;
}

.detail-input {
  border-radius: 20px;
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

.form-input:focus {
  border-color: #fb923c;
  box-shadow: 0 0 0 2px rgba(251, 146, 60, 0.3);
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