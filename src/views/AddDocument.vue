<script setup>
import { ref, onMounted } from 'vue'
import { getAllFaculty } from "../functions/getData"
import { addDocument } from '../functions/adddocument'
import { useRouter } from "vue-router";

// import ModalPopup from "../components/ModalPopup.vue"
// const showModal = ref(false);
// const alertMessage = ref("");
const today = ref(new Date().toISOString().split("T")[0]);
const router = useRouter()

const showSuccessPopup = ref(false);
const successMessage = ref("");
const showSuccess = (type) => {
  if (type === "add") {
    successMessage.value = "Added Document Successfully!";

  } else if (type === "edit") {
    successMessage.value = "Edited Successfully!";
  } else if (type === "delete") {
    successMessage.value = "Deleted Successfully!";
  }
  showSuccessPopup.value = true;
};
const redirectToTracking = () => {
  showSuccessPopup.value = false;
  router.push("/tracking");
};

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

const handleFile1Change = async (e) => {
  console.log("Input changed:", e.target.files)
  const file = e.target.files[0];
  if (file) {
    const allowedExtensions = ["pdf"];
    const fileExtension = file.name.split(".").pop().toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      alert("กรุณาอัปโหลดไฟล์ PDF เท่านั้น");
      e.target.value = "";
      throw new Error("ไฟล์ที่อัปโหลดต้องเป็น .pdf เท่านั้น");
    }

    const base64 = await fileToBase64(file);
    attachmentFile1.value = base64
  }
}

const handleFile2Change = async (e) => {
  console.log("Input changed:", e.target.files)
  const file = e.target.files[0];
  if (file) {
    const allowedExtensions = ["pdf"];
    const fileExtension = file.name.split(".").pop().toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      alert("กรุณาอัปโหลดไฟล์ PDF เท่านั้น");
      e.target.value = "";
      throw new Error("ไฟล์ที่อัปโหลดต้องเป็น .pdf เท่านั้น");
    }

    const base64 = await fileToBase64(file);
    attachmentFile2.value = base64
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
        alert("กรุณาเลือกช่วงเวลาการลาวันเดียว");
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

    if (detail.value.trim().length === 0) {
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
      attachmentFile2: attachmentFile2.value,
      attachmentFile2Name: "File 2 name", // ชื่อไฟล์แนบ 2 (ถ้าต้องการแยกต่างหาก)
      studentFacultyID: studentFacultyID,
      studentDepartmentID: studentDepartmentID,
    };
    const res = await addDocument(dataToSend);
    if (res.status === 201) {
      showSuccess("add")
    }
  } catch (error) {
    console.error("Failed to add absence document:", error.message);
  }
};
</script>

<template>
  <div class="flex justify-center items-center min-h-screen bg-orange-100">
    <div class="bg-white p-6 rounded-lg shadow-lg w-[1000px] ">
      <h1 class="text-3xl font-extrabold mb-4 text-center text-orange-500">Add Absence Document</h1>

      <form @submit.prevent="addDoc">
        <div class="grid grid-cols-2 gap-4 lable ">
          <div class="w-full mt-7">
            <table class="w-[900px] border border-white border-spacing-2">
              <tbody>
                <!-- ที่ -->
                <tr class="border border-white">
                  <td class="p-3 border border-white w-1/2">
                    <label for="agencyCode" class="block item">ชื่อ</label>
                    <div class="flex items-center gap-2">
                      <input type="text" v-model="userData.name" class="form-input form-input-text " disabled />
                    </div>
                  </td>
                  <!-- ชื่อหน่วยงาน -->
                  <td class="p-3 border border-white">
                    <label for="agencyName" class="block item whitespace-nowrap">รหัสประจำตัวนักศึกษา</label>
                    <div class="flex items-center gap-2">
                      <input type="text" v-model="userData.studentId" class="form-input form-input-text" disabled />
                    </div>
                  </td>
                </tr>

                <!-- คณะ -->
                <tr class="border border-white">
                  <td class="p-3 border border-white w-1/2">
                    <label for="faculty" class="block item">คณะ </label>
                    <input type="text" v-model="userData.faculty" class="form-input form-input-text" disabled />
                  </td>

                  <td class="p-3 border border-white w-1/2">
                    <label for="department" class="block item">ภาควิชา/สาขาวิชา </label>
                    <input type="text" v-model="userData.department" class="form-input form-input-text" disabled />
                  </td>
                </tr>

                <!-- ชั้นปี -->
                <tr class="border border-white">
                  <td class="p-3 border border-white w-1/2">
                    <label for="classLevel" class="block item">ชั้นปีที่ </label>
                    <input type="text" v-model="userData.classLevel" class="form-input form-input-text" disabled />
                  </td>
                  <td class="p-3 border border-white w-1/2">
                    <label for="studyLevel" class="block item">ระดับการศึกษา </label>
                    <input type="text" v-model="userData.studyLevel" class="form-input form-input-text" disabled />
                  </td>
                </tr>

                <!-- ประเภทหลักสูตร -->
                <tr class="border border-white">
                  <td class="p-3 border border-white w-1/2">
                    <label for="programType" class="block item">ประเภทหลักสูตร </label>
                    <input type="text" v-model="userData.programType" class="form-input form-input-text" disabled />
                  </td>

                  <td class="p-3 border border-white w-1/2">
                    <label for="studentStatus" class="block item">สถานะนักศึกษา </label>
                    <input type="text" v-model="userData.studentStatus" class="form-input form-input-text" disabled />
                  </td>
                </tr>

                <!-- คะแนนเฉลี่ยประจำภาค -->
                <tr class="border border-white">
                  <td class="p-3 border border-white w-1/2">
                    <label for="currentGPA" class="block item">คะแนนเฉลี่ยประจำภาค </label>
                    <input type="text" v-model="userData.currentGPA" class="form-input form-input-text" disabled />
                  </td>

                  <td class="p-3 border border-white w-1/2">
                    <label for="cumulativeGPA" class="block item">คะแนนเฉลี่ยสะสม </label>
                    <input type="text" v-model="userData.cumulativeGPA" class="form-input form-input-text" disabled />
                  </td>
                </tr>

                <!-- ข้อมูลการติดต่อ -->
                <tr class="border border-white">
                  <td class="p-3 border border-white w-1/2">
                    <label for="contact" class="block item">ข้อมูลการติดต่อนักศึกษา </label>
                    <input type="text" v-model="userData.tel" class="form-input form-input-text" disabled />
                  </td>

                  <td class="p-3 border border-white w-1/2">
                    <label for="email" class="block item">อีเมล </label>
                    <input type="email" v-model="userData.email" class="form-input form-input-text w-full" disabled />
                  </td>
                </tr>

                <!-- ฟอร์มการกรอกข้อมูลการลา -->
                <tr class="border border-white">
                  <td class="p-3 border border-white">
                    <label for="type" class="block item">เรื่อง<span class="text-red-500 ml-1">*</span></label>
                    <select v-model="type" class="form-input form-input-text w-full" required>
                      <option value="" disabled>เลือกประเภทการลา</option>
                      <option value="ลากิจ">ขออนุญาตลากิจ</option>
                      <option value="ลาป่วย">ขออนุญาตลาป่วย</option>
                    </select>
                  </td>

                  <td class="p-3 border border-white">
                    <label for="advisor" class="block item">อาจารย์ที่ปรึกษา </label>
                    <input type="text" v-model="userData.advisor" class="form-input form-input-text w-full" disabled />
                  </td>
                </tr>

                <!-- ประเภทวันลา -->
                <tr class="border border-white">
                  <td class="p-3 border border-white">
                    <label for="leaveType" class="block item">ประเภทวันลา<span
                        class="text-red-500 ml-1">*</span></label>
                    <select v-model="leaveType" class="form-input form-input-text w-full" required>
                      <option value="" disabled>เลือกประเภทวันลา</option>
                      <option value="oneDay">การลา 1 วัน</option>
                      <option value="multipleDays">การลาหลายวัน</option>
                    </select>
                  </td>
                </tr>

                <!-- วันที่เลือกลา 1 วัน -->
                <tr v-if="leaveType === 'oneDay'" class="border border-white">
                  <td class="p-3 border border-white">
                    <label for="oneDayDate" class="block item">เลือกวันที่ <span
                        class="text-red-500 ml-1">*</span></label>
                    <input type="date" v-model="oneDayDate" class="form-input input-date" :min="today" required />
                  </td>

                  <td class="p-3 pl-4 border border-white">
                    <label for="oneDaySession" class="block item">ช่วงเวลา
                      <span class="text-red-500 ml-1">*</span></label>
                    <div class="flex pl-16 items-center space-x-4">
                      <label class="flex items-center">
                        <input type="checkbox" v-model="oneDaySession.morning" class="form-checkbox" />
                        <span class="ml-2">เช้า</span>
                      </label>
                      <label class="flex items-center">
                        <input type="checkbox" v-model="oneDaySession.afternoon" class="form-checkbox" />
                        <span class="ml-2">บ่าย</span>
                      </label>
                    </div>
                  </td>
                </tr>

                <!-- ถ้าเลือก ลาหลายวัน -->
                <tr v-if="leaveType === 'multipleDays'" class="border border-white">
                  <td class="p-3 border border-white" colspan="2">
                    <div class="grid grid-cols-2 gap-4 mb-4">
                      <!-- วันที่เริ่มต้น -->
                      <div class="my-2">
                        <label for="starttime">
                          <span class="item">ระหว่างวันที่</span><span class="text-red-500 ml-1">*</span></label>
                        <input type="date" id="starttime" v-model="starttime" class="form-input input-date" :min="today"
                          required />
                      </div>

                      <!-- วันที่สิ้นสุด -->
                      <div class="my-2">
                        <label for="endtime">
                          <span class="item">ถึงวันที่</span><span class="text-red-500 ml-1">*</span></label>
                        <input type="date" id="endtime" v-model="endtime" class="form-input input-date"
                          :min="getNextDay(starttime)" required />
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="lable col-span-2">
            <label for="detail" class="block item">โดยมีเหตุผลและรายละเอียด<span
                class="text-red-500 ml-1">*</span></label>
            <textarea id="detail" v-model="detail" class="form-input detail-input " minlength="5" maxlength="1000"
              placeholder="กรุณาระบุรายวิชา section ที่ต้องการลา พร้อมอธิบายเหตุผล" required
              @input="updateRemainingCharacters"></textarea>
            <div class="text-right text-sm text-gray-600">
              ตัวอักษรที่สามารถใส่ได้ {{ remainingCharacters }}
            </div>
          </div>

          <div class="lable">
            <label for="attachmentFile1" class="block item">หนังสือรับรองผู้ปกครอง/ใบรับรองแพทย์</label>
            <input type="file" id="attachmentFile1" @change="handleFile1Change" class="form-input form-input-text" />
          </div>

          <div class="lable">
            <label for="attachmentFile2" class="block item">หลักฐานอื่นๆ</label>
            <input type="file" id="attachmentFile2" @change="handleFile2Change" class="form-input form-input-text" />
          </div>
        </div>

        <div>
          <div class="parent-container">
            <button type="submit" class="form-button"> Sent Absence Document
            </button>
          </div>
        </div>

      </form>

      <div v-if="showSuccessPopup" class="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
        <div class="bg-white p-6 rounded shadow-md w-[400px]" style="border-radius: 20px;">
          <h2 class="text-lg font-bold mb-4 text-center text-black">{{ successMessage }}</h2>
          <div class="flex justify-center">
            <button class="bg-blue-500 text-white px-4 py-2 rounded-3xl" @click="redirectToTracking">
              OK
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.lable {
  /* mb-6 mx-2 */
  margin: 1rem 1.5rem 2rem;
}

.layer-left {
  margin: 0.5rem 0;
}

.layer-rt {
  margin: 0.5rem 0 0 1rem;
}

.item {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.form-textarea {
  border: 1px solid #ccc;
  padding: 0.5rem;
  border-radius: 4px;
  resize: vertical;
  margin: 0.5rem 1rem 0 1rem;
}

.inline-list {
  list-style: none;
  /* เอา bullet points ออก */
  padding: 0;
  margin: 0;
  display: flex;
  /* ใช้ flex เพื่อให้รายการอยู่ในบรรทัดเดียวกัน */
  gap: 0.5rem;
  /* ระยะห่างระหว่างแต่ละรายการ */
}

.inline-list li {
  display: inline;
  /* ทำให้ li แสดงผลแบบ inline */
}

.form-input {
  width: 100%;
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  outline: none;
  margin-left: 0.5rem;
  margin-bottom: 0.85rem;
  transition: border-color 0.2s ease-in-out;
}

.form-input-select {
  width: auto;
}

.form-input-text {
  width: 90%;
  border-radius: 20px;

}

.input-date {
  width: 70%;
  border-radius: 20px;
}

.form-input-role {
  width: 95%;
}

.detail-input {
  border-radius: 10px;
}

.parent-container {
  display: flex;
  justify-content: center;
  /* จัดตำแหน่งในแนวนอน */
  align-items: center;
  /* จัดตำแหน่งในแนวตั้ง */
  /* ตั้งค่าความสูงให้เป็น 100% ของหน้าจอ */
}

/* ปุ่ม .form-button */
.form-button {
  width: 100%;
  padding: 12px 0;
  border: none;
  border-radius: 100px;
  background-color: #fb923c;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  text-align: center;
  /* ทำให้ข้อความภายในปุ่มอยู่กลาง */
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