<script setup>
import { ref, onMounted, reactive } from 'vue';
import { editDocument } from '../functions/editDocument.js'; // นำเข้า editDocument
import { useRouter } from 'vue-router';
import { fetchDocumentDetail } from '../functions/documentDetail.js'

const router = useRouter();

const type = ref('');
const detail = ref('');
const remainingCharacters = ref(500);

const updateRemainingCharacters = () => {
  remainingCharacters.value = 500 - detail.value.length;
};

const attachmentFile1 = ref('');
const attachmentFile2 = ref('');

const today = ref(new Date().toISOString().split("T")[0]);
const getNextDay = (date) => {
  if (!date) return today.value; // ถ้ายังไม่มี starttime ให้ใช้ today
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  return nextDay.toISOString().split("T")[0];
};

// ตัวแปรการเลือกประเภทการลาและช่วงเวลา
const leaveType = ref('');
const oneDayDate = ref('');
const oneDaySession = reactive({
  morning: false,
  afternoon: false
});

const starttime = ref('');
const endtime = ref('');

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
});

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

const documentID = ref(null);
const file1 = ref("");
onMounted(async () => {
  userData.value = {
    name: localStorage.getItem("firstName") + " " + localStorage.getItem("lastName"),
    studentId: localStorage.getItem("studentID"),
    faculty: localStorage.getItem("faculty"),
    department: localStorage.getItem("department"),
    classLevel: "ชั้นปีที่ 4",
    studyLevel: "ปริญญาตรี",
    programType: "ปกติ",
    studentStatus: "ปกติ",
    currentGPA: localStorage.getItem("currentGPA"),
    cumulativeGPA: localStorage.getItem("cumulativeGPA"),
    advisor: localStorage.getItem("advisor"),
    tel: localStorage.getItem("tel"),
    email: localStorage.getItem("email")
  }

  const studentID = localStorage.getItem("studentID");
  const role = "Student";
  const documentData = await fetchDocumentDetail(studentID, role);

  if (documentData) {
    console.log(documentData)
    type.value = documentData.DocumentType || '';
    detail.value = documentData.detail || '';

    attachmentFile1.value = documentData.file1 || null;
    attachmentFile2.value = documentData.file2 || null;

    starttime.value = documentData.startTime || '';
    endtime.value = documentData.endTime || '';

    // ตรวจสอบว่า starttime และ endtime เป็นวันเดียวกันหรือไม่
    const startDate = new Date(starttime.value).toDateString();
    const endDate = new Date(endtime.value).toDateString();

    // ถ้า startDate และ endDate เป็นวันเดียวกัน ให้เลือก leaveType = "oneDay"
    if (startDate === endDate) {
      leaveType.value = 'oneDay';
      oneDayDate.value = starttime.value.split('T')[0]; // ตั้งค่า oneDayDate ให้เป็นวันที่ของ starttime
      const startTimeHour = new Date(starttime.value).getHours();
      const endTimeHour = new Date(endtime.value).getHours();

      // เช็คช่วงเวลา
      if ((startTimeHour === 2 && endTimeHour === 5) || (startTimeHour === 9 && endTimeHour === 12)) {
        oneDaySession.morning = true;
        oneDaySession.afternoon = false;
      } else if ((startTimeHour === 6 && endTimeHour === 10) || (startTimeHour === 13 && endTimeHour === 17)) {
        oneDaySession.morning = false;
        oneDaySession.afternoon = true;
      } else if ((startTimeHour === 2 && endTimeHour === 10) || (startTimeHour === 9 && endTimeHour === 17)) {
        oneDaySession.morning = true;
        oneDaySession.afternoon = true;
      } else {
        oneDaySession.morning = false;
        oneDaySession.afternoon = false;
      }
    } else {
      leaveType.value = 'multipleDays';
      starttime.value = documentData.startTime.split('T')[0]; // ตั้งค่า starttime เป็นวันที่ของ startTime
      endtime.value = documentData.endTime.split('T')[0]; // ตั้งค่า endtime เป็นวันที่ของ endTime

    }
  }

  documentID.value = documentData.DocumentID
});

// function convertToISOWithTimezone(dateString, time) {
//   if (!dateString || typeof dateString !== "string" || !dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
//     throw new Error(`Invalid dateString: ${dateString}`);
//   }

//   if (!time || typeof time !== "string" || !time.match(/^\d{2}:\d{2}:\d{2}$/)) {
//     throw new Error(`Invalid time: ${time}`);
//   }

//   const date = new Date(`${dateString}T${time}`);

//   if (isNaN(date.getTime())) {
//     throw new Error(`Invalid combined date/time: ${dateString}T${time}`);
//   }

//   const timezoneOffset = date.getTimezoneOffset(); // offset เป็นนาที
//   date.setMinutes(date.getMinutes() - timezoneOffset); // ปรับเวลาให้ตรงกับ timezone ของระบบ
//   return date.toISOString();
// }

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

const isBase64 = (str) => {
  // ใช้ regex เพื่อตรวจสอบรูปแบบ base64 ที่ถูกต้อง
  return /^[A-Za-z0-9+/=]+$/.test(str);
};

const openFileInNewTab = async (base64String, mimeType) => {
  if (!base64String) {
    popupMessage.value = 'No file available.';
    showPopup.value = true;
    return;
  }

  let base64Data = base64String;
  if (base64String.startsWith('data:')) {
    base64Data = base64String.split(',')[1];
  }

  if (!isBase64(base64Data)) {
    popupMessage.value = 'Invalid Base64 string.';
    showPopup.value = true;
    return;
  }

  try {
    const byteCharacters = atob(base64Data);
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
  } catch (error) {
    popupMessage.value = 'Error opening the file.';
    showPopup.value = true;
    console.error('Error decoding Base64:', error);
  }
};

// ฟังก์ชันสำหรับการอัพเดตเอกสาร
const handleEditDocument = async () => {
  try {
    const studentID = localStorage.getItem("studentID");

    // ตรวจสอบวันที่วันนี้
    const today = new Date();
    today.setHours(0, 0, 0, 0); // รีเซ็ตเวลาเป็น 00:00:00

    // กำหนดเวลา startTime และ endTime ตามประเภทการลา
    let startTime = null;
    let endTime = null;

    if (leaveType.value === "oneDay") {
      // ลาวันเดียว
      const date = new Date(oneDayDate.value);
      const dateString = date.toISOString().split("T")[0];

      if (date < today) {
        alert("วันลาต้องเป็นวันนี้หรือหลังจากวันนี้");
        throw new Error("Leave date must be today or in the future");
      }

      const isMorning = oneDaySession.morning
      const isAfternoon = oneDaySession.afternoon


      // ตรวจสอบช่วงเวลาที่เลือก
      if (isMorning && isAfternoon) {
        startTime = convertToISOWithTimezone(dateString, "09:00:00");
        endTime = convertToISOWithTimezone(dateString, "17:00:00");
      } else if (isMorning) {
        startTime = convertToISOWithTimezone(dateString, "09:00:00");
        endTime = convertToISOWithTimezone(dateString, "12:00:00");
      } else if (isAfternoon) {
        startTime = convertToISOWithTimezone(dateString, "13:00:00");
        endTime = convertToISOWithTimezone(dateString, "17:00:00");
      } else {
        alert("กรุณาเลือกช่วงเวลาการลาวันเดียว")
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
        alert("วันที่สิ้นสุดต้องมากกว่าวันที่เริ่มต้น");
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

    // อัปเดตข้อมูล
    const dataToUpdate = {
      type: type.value,
      startTime: startTime,
      endTime: endTime,
      detail: detail.value,
      attachmentFile1: attachmentFile1.value,
      attachmentFile2: attachmentFile2.value,
      attachmentFile2Name: "File2Name",

    };
    const res = await editDocument(studentID, documentID.value, dataToUpdate);

    if (res.ok) {
      showSuccess("edit")
      // alert("Document updated successfully");
      // router.push("/tracking"); // ไปยังหน้า tracking เมื่ออัพเดตสำเร็จ
    }
  } catch (error) {
    console.error("Failed to update document:", error);
  }
};
</script>

<template>
  <div class="flex justify-center items-center min-h-screen bg-blue-50">
    <div class="bg-white p-6 rounded-lg shadow-lg w-[1000px] ">
      <h1 class="text-3xl font-extrabold mb-4 underline text-center text-red-500">Edit Absence Document</h1>

      <form @submit.prevent="handleEditDocument">
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
          <!-- รายละเอียดงบประมาณ -->
          <div class="my-3">
            <label for="attachmentFile1" class="item ">หนังสือรับรองผู้ปกครอง/ใบรับรองแพทย์
            </label>
            <div class="my-4 pb-6 bg-gray-50 rounded-lg shadow-sm">
              <p class="text-sm text-gray-600 mb-2">📂 อัปโหลดไฟล์หนังสือรับรองผู้ปกครอง/ใบรับรองแพทย์</p>
              <hr class="border-gray-300 mb-3">

              <div v-if="attachmentFile1" class="mb-3">
                <a @click="openFileInNewTab(attachmentFile1, 'application/pdf')" target="_blank"
                  class="text-blue-600 hover:text-blue-800 underline">
                  🔗 ดูไฟล์หนังสือรับรองผู้ปกครอง/ใบรับรองแพทย์ที่อัปโหลดแล้ว
                </a>
              </div>

              <input id="attachmentFile1" type="file" @change="handleFile1Change($event, 'attachmentFile1')"
                class="form-input form-input-text w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-300" />
            </div>
          </div>

          <!-- อัพโหลดไฟล์เพิ่มเติม -->
          <div class="my-3 ">
            <label for="attachmentFile2" class="item ">หลักฐานอื่น ๆ
              <span class="text-red-500 pb-6 ml-1">*</span>
            </label>

            <div class="my-4 pb-6 bg-gray-50 rounded-lg shadow-sm">
              <p class="text-sm text-gray-600 mt-4">📂 อัปโหลดไฟล์หลักฐานอื่น ๆ</p>
              <hr class="border-gray-300 mb-3">

              <div v-if="attachmentFile2" class="mb-3">
                <a @click="openFileInNewTab(attachmentFile2, 'application/pdf')" target="_blank"
                  class="text-blue-600 hover:text-blue-800 underline">
                  🔗 ดูไฟล์หลักฐานอื่น ๆ ที่อัปโหลดแล้ว
                </a>
              </div>

              <input id="attachmentFile2" type="file" @change="handleFile2Change($event, 'attachmentFile2')"
                class="form-input form-input-text w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-300" />
            </div>
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