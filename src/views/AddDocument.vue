<script setup>
import { ref, onMounted } from 'vue'
import { getAllFaculty } from "../functions/getData"
import { addDocument } from '../functions/adddocument'
const type = ref('');

const detail = ref('');
const attachmentFile1 = ref(null);
const attachmentFile2 = ref(null);

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
  contact: ''
})

onMounted(() => {
  userData.value = {
    name: 'นายพงศธร จันทร์สงเคราะห์',
    studentId: '64130500051',
    faculty: 'เทคโนโลยีสารสนเทศ',
    department: 'เทคโนโลยีสารสนเทศ',
    classLevel: 'ปีที่ 4',
    studyLevel: 'ปริญญาตรี',
    programType: 'ปกติ',
    studentStatus: 'ปกติ',
    currentGPA: '3.5',
    cumulativeGPA: '3.4',
    advisor: 'อ.สายชล ใจเย็น',
    tel: '095-557-3902',
    email: 'phongsathon.chan@kmutt.ac.th'  
  }
})

const addDoc = async () => {
  try {
    const res = await addDocument({
      type: type.value,

      leaveType: leaveType.value, //ประเภทการลา
      //ลาวันเดียว
      oneDayDate: oneDayDate.value, // วันที่ลา
      oneDaySession: oneDaySession.value, // ช่วงเช้า-ช่วงบ่าย
      //ลาหลายวัน
      startTime: starttime.value, // วันที่เริ่มลา
      endTime: endtime.value, // วันที่สิ้นสุด

      detail: detail.value,
      attachmentFile1: attachmentFile1.value,
      attachmentFile2: attachmentFile2.value,
    });

    if (res.status === 200) {
      alert("Add new document successfully")
      router.push("tracking")
    }
  } catch (error) {
    console.error(error)
  }
}
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
            <label for="type" class="block text-gray-700 mb-1">เรื่อง</label>
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

          <!-- <div class="mb-3">
            <label for="starttime" class="block text-gray-700 mb-1">ระหว่างวันที่</label>
            <input 
              type="datetime-local" 
              id="starttime" 
              v-model="starttime"
              class="form-input"
              required
            />
          </div>

          <div class="mb-3">
            <label for="endtime" class="block text-gray-700 mb-1">ถึงวันที่</label>
            <input 
              type="datetime-local" 
              id="endtime" 
              v-model="endtime"
              class="form-input"
              required
            />
          </div> -->

          <div class="mb-3">
            <label for="leaveType" class="block text-gray-700 mb-1">ประเภทการลา</label>
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
              <label for="oneDayDate" class="block text-gray-700 mb-1">เลือกวันที่</label>
              <input 
                type="date" 
                id="oneDayDate" 
                v-model="oneDayDate"
                class="form-input"
                required
              />
            </div>

            <div class="mb-3">
              <label for="oneDaySession" class="block text-gray-700 mb-1">ช่วงเวลา</label>
              
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
              <label for="starttime" class="block text-gray-700 mb-1">ระหว่างวันที่</label>
              <input 
                type="date" 
                id="starttime" 
                v-model="starttime"
                class="form-input"
                required
              />
            </div>

            <!-- วันที่สิ้นสุด -->
            <div class="mb-3">
              <label for="endtime" class="block text-gray-700 mb-1">ถึงวันที่</label>
              <input 
                type="date" 
                id="endtime" 
                v-model="endtime"
                class="form-input"
                required
              />
            </div>
          </div>

          <div class="mb-3 col-span-2">
            <label for="detail" class="block text-gray-700 mb-1">โดยมีเหตุผลและรายละเอียด</label>
            <textarea 
              id="detail" 
              v-model="detail"
              class="form-input detail-input"
              required
              maxlength="500"
            ></textarea>
          </div>

          <div class="mb-3">
            <label for="attachmentFile1" class="block text-gray-700 mb-1">หนังสือรับรองผู้ปกครอง/ใบรับรองแพทย์</label>
            <input 
              type="file" 
              id="attachmentFile1" 
              @change="e => attachmentFile1.value = e.target.files[0]"
              class="form-input"
              required
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