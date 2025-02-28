<script setup>
import { ref, onMounted, computed } from 'vue';
import { fetchActivityDocument } from '../functions/fetchActivityDocument.js';
import { deleteActivityDocument } from '../functions/deleteActivityDocument.js';
import { approveActivity } from '../functions/approveActivity.js';
import { rejectActivity } from '../functions/rejectActivity.js';
import Navbar from '../components/Navbar.vue';
import { useRouter } from "vue-router";
const router = useRouter();
import { useRoute } from "vue-router";
const route = useRoute();
const docId = route.params.id;

const activityData = ref([])
const showCommentPopup = ref(false);
const showDeletePopup = ref(false);
const role = localStorage.getItem('role');
const staffID = localStorage.getItem('staffID');
const documentId = ref("")
const progressID = ref("");
const comment = ref('');
const showPopup = ref(false);
const popupMessage = ref('');

const formatDateTime = (isoString) => {
  const date = new Date(isoString);
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const localOffset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - localOffset); 

  const options = { day: '2-digit', month: 'long', year: 'numeric', timeZone };

  const formattedDate = localDate.toLocaleDateString('en-GB', options);

  const formattedTime = localDate
    .toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone })
    .replace(':', '.');

  return `${formattedDate} ${formattedTime}`;
};

const formatDate = (isoString) => {
  const date = new Date(isoString);
  const options = { day: '2-digit', month: 'long', year: 'numeric' };
  return date.toLocaleDateString('en-GB', options);
};;

const goBack = () => {
  router.push("/tracking");
};

const openDeletePopup = () => {
  showDeletePopup.value = true;
};

const closeDeletePopup = () => {
  showDeletePopup.value = false;
};

const handleDelete = async () => {
  try {
    const documentID = documentId.value
    const studentID = localStorage.getItem("studentID");
    console.log(documentID + " " + studentID)
    if (!documentID || !studentID) {
      alert('Missing document ID or student ID');
      return;
    }

    await deleteActivityDocument(studentID, documentID);

    router.push('/tracking');
  } catch (error) {
    console.error('Delete failed:', error);
  }
};

// ใช้ computed ในการสร้าง canApprove ที่จะตรวจสอบสถานะ
const canApprove = computed(() => {
  if (!staffID || !activityData.value?.allProgress) return false;

  return activityData.value.allProgress.some((progress) =>
    progress.staffID === parseInt(staffID) && progress.status === "Waiting for approve"
  );
});

const canShowButtons = computed(() => {
  if (role === 'Student') {
    return true; // ถ้าเป็น student ให้แสดงปุ่ม edit กับ delete
  }
  return canApprove.value; // ถ้าไม่ใช่ student ให้แสดงปุ่ม approve กับ reject ถ้า canApprove เป็น true
});

// ฟังก์ชัน Approve
const handleApprove = async () => {
  try {
    const data = { progressID: progressID.value, staffID: staffID, documentID: documentId.value}
    console.log(data)
    const result = await approveActivity(data);
    alert('Document approved successfully');
    router.push('/tracking');
  } catch (error) {
    alert('Failed to approve document');
  }
};

// ฟังก์ชัน Reject
const handleReject = async () => {
  if (!comment.value) {
    alert('Please provide a comment before rejecting the document.');
    return;
  }
  try {
    const data = { progressID: progressID.value, staffID: staffID, documentID: documentId.value, comment: comment.value}
    const result = await rejectActivity(data);
    alert('Document rejected successfully');
    router.push('/tracking');
  } catch (error) {
    alert('Failed to reject document');
  }
};

// เปิด popup สำหรับกรอกคอมเมนต์
const openRejectPopup = () => {
  showCommentPopup.value = true;
};

// ปิด popup สำหรับกรอกคอมเมนต์
const closeRejectPopup = () => {
  showCommentPopup.value = false;
  comment.value = ''; // เคลียร์คอมเมนต์
};

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

const allApproved = () =>{
  const allProgress = activityData.value?.allProgress;
  if (Array.isArray(allProgress)) {
    return allProgress.every(progress => progress.status === "Approve");
  }
  return false;
}

const handleEdit = () => {
  const documentId = activityData.value ? activityData.value.DocumentID : null;
  router.push(`/editActivityDocument/${documentId}`);
};

onMounted(async () => {
  let userid = null
  const role = localStorage.getItem("role")
  if(role != "Student"){
    userid = localStorage.getItem("staffID")
  } 
  else if (role === "Student"){
    userid = localStorage.getItem("studentID")
  }

  try{
      activityData.value = await fetchActivityDocument(docId, userid, role)
      console.log(activityData.value)
      if (activityData.value) {
          documentId.value = activityData.value.DocumentID;
          progressID.value = activityData.value.progressID;
          activityData.value.startTime = activityData.value.startTime ? formatDateTime(activityData.value.startTime) : "N/A";
          activityData.value.endTime = activityData.value.endTime ? formatDateTime(activityData.value.endTime) : "N/A";
          activityData.value.prepareStart = activityData.value.prepareStart ? formatDate(activityData.value.prepareStart) : "N/A";
          activityData.value.prepareEnd = activityData.value.prepareEnd ? formatDate(activityData.value.prepareEnd) : "N/A";
          activityData.value.createDate = activityData.value.createDate ? formatDateTime(activityData.value.createDate) : "N/A";
      }
  }
  catch(error){
    console.log(error)
  }

})
</script>

<template>
<Navbar class="fixed top-0 left-0 w-full z-50 h-[4vh] p-2 shadow-md"/>
  <div class="flex justify-center items-center min-h-screen bg-blue-50">
    <div class="bg-white p-6 rounded-lg shadow-lg w-[900px]">
      <h1 class="text-2xl font-bold mb-4 text-center text-blue-500 mt-100">Activity Document Detail</h1>

      <div class="mb-6">
        <h2 class="text-lg font-semibold text-gray-700 mb-2">Document Information</h2>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <span class="font-bold">ที่:</span> {{ activityData.code }}
          </div>
          <div>  
            <span class="font-bold">วันที่เขียน:</span> {{ activityData.createDate }}
          </div>

          <div>
            <span class="font-bold">ชื่อหน่วยงาน:</span> {{ activityData.departmentName }}
          </div>
          <div>
            <span class="font-bold">ชื่อโครงการ:</span> {{ activityData.title }}
          </div>
          <div>
            <span class="font-bold">ระหว่างวันที่:</span> {{ activityData.startTime }}
          </div>
          <div>
            <span class="font-bold">ถึงวันที่:</span> {{ activityData.endTime }}
          </div>
          <div>
            <span class="font-bold">ณ สถานที่:</span> {{ activityData.location }}
          </div>
          <div>
            <span class="font-bold">ประเภทกิจกรรม:</span> {{ activityData.type }}
          </div>
          <div>
            <span class="font-bold">วัตถุประสงค์:</span> {{ activityData.propose }}
          </div>
          <div>
            <span class="font-bold">ค่าใช้จ่าย:</span> {{ activityData.payment }}
          </div>

          <div class="mb-6">
            <span class="font-bold">ชั่วโมงกิจกรรม:</span>
            <ul class="list-disc pl-6 text-gray-700">
              <li v-for="(activity, index) in activityData.activity" :key="index">
                {{ activity.activityName }} จำนวน {{ activity.countHour }} ชั่วโมง
              </li>
            </ul>
          </div>
 
        </div>


      <div class="mb-6">
        <span class="font-bold">อาจารย์ที่ปรึกษา/รองคณบดี:</span> 
        <span class="ml-2" v-if="activityData.allProgress">{{ activityData.allProgress[0]?.staffName }}</span>
      </div>
      <div class="mb-6">
        <span class="font-bold">นายก/ประธานชมรม:</span>
        <span class="ml-2" v-if="activityData.allProgress">{{ activityData.allProgress[1]?.staffName }}</span>
      </div>
      <div class="mb-6">
        <span class="font-bold">ประธานฝ่าย:</span>
        <span class="ml-2" v-if="activityData.allProgress">{{ activityData.allProgress[2]?.staffName }}</span>
      </div>
      
      <div class="mb-6">
        <span class="font-bold">KMUTT Student QF:</span>
        <ul class="list-disc pl-6 text-gray-700">
          <li v-for="(studentQF, index) in activityData.studentQF" :key="index">
            {{ studentQF.name }} {{ studentQF.percentage }}%
          </li>
        </ul>
      </div>

      <div class="mb-6">
        <span class="font-bold">Entrepreneurial:</span>
        <ul class="list-disc pl-6 text-gray-700">
          <li v-for="(entrepreneurial, index) in activityData.entrepreneurial" :key="index">
            {{ entrepreneurial.join(', ') }} 
          </li>
        </ul>
      </div>

      <!-- Sustainability และ Goal ยังไม่ได้ทำ -->

      <div class="mb-6">
        <span class="font-bold">หลักการและเหตุผล:</span> {{ activityData.sustainabilityDetail }}
      </div>

      <div class="mb-6">
        <span class="font-bold">วัตถุประสงค์:</span> {{ activityData.sustainabilityPropose }}
      </div>
      
      <div class="mb-6">
        <span class="font-bold">ผู้เข้าร่วมโครงการ:</span>
        <ul class="list-disc pl-6 text-gray-700">
          <li v-for="(participant, index) in activityData.participant" :key="index">
            {{ participant.participantName }} จำนวน {{ participant.count }} คน
          </li>
        </ul>
      </div>

      <div class="mb-6">
        <span class="font-bold">ลักษณะกิจกรรม:</span> {{ activityData.activityCharacteristic }}
      </div> 
      
      <div class="mb-6">
        <span class="font-bold">ลักษณะกิจกรรมที่จัดขึ้นสอดคล้องกับหลักเกียรติและศักดิ์ของนักศึกษา(Code of Honor) ดังนี้:</span><br>{{ activityData.codeOfHonor }}
      </div>

      <div class="mb-6">
        <span class="font-bold">ระยะเวลาเตรียมงาน:</span> {{ activityData.prepareStart }} ถึงวันที่ {{ activityData.prepareEnd }}
      </div>

      <div class="mb-6">
        <h2 class="text-lg font-semibold text-gray-700 mb-2">ขั้นตอนการดำเนินงาน</h2>
        <div class="grid grid-cols-2 gap-4">
          <div v-if="activityData.scheduleDetails">
            <span class="font-bold">ไฟล์ขั้นตอนการดำเนินงาน:</span>
            <a 
              href="javascript:void(0);" 
              @click="openFileInNewTab(activityData.scheduleDetails, 'application/pdf')" 
              class="text-orange-500 underline">
              Click to open file in new tab.
            </a>
          </div>
        </div>
      </div>

      <div class="mb-6">
        <span class="font-bold">คณะกรรมการจัดโครงการ:</span>
        <ul class="list-disc pl-6 text-gray-700">
          <li v-for="(committee, index) in activityData.committee" :key="index">
            <b>Name:</b> {{ committee.name }} <b>Position:</b> {{ committee.position }}
          </li>
        </ul>
      </div>

      <div class="mb-6">
        <span class="font-bold">รูปแบบการประเมินผล:</span>
        <ul class="list-disc pl-6 text-gray-700">
          <li v-for="(evaluation, index) in activityData.evaluation" :key="index">
            {{ evaluation.evaluation=="Other"?evaluation.otherEvaluation:evaluation.evaluation }}
          </li>
        </ul>
      </div>

      <div class="mb-6">
        <h2 class="text-lg font-semibold text-gray-700 mb-2">รูปแบบการประเมินผล</h2>
        <div class="grid grid-cols-2 gap-4">
          <div v-if="activityData.evaluationFile">
            <span class="font-bold">ไฟล์รูปแบบการประเมินผล:</span>
            <a 
              href="javascript:void(0);" 
              @click="openFileInNewTab(activityData.evaluationFile, 'application/pdf')" 
              class="text-orange-500 underline">
              Click to open file in new tab.
            </a>
          </div>
        </div>
      </div>

      <div class="mb-6">
        <span class="font-bold">ผลที่คาดว่าจะได้รับ:</span>
        <ul class="list-disc pl-6 text-gray-700">
          <li class="mb-3" v-for="(item, index) in activityData.result" :key="index">
            <b>ผลที่คาดว่าจะได้รับข้อที่ {{ index+1 }}:</b> {{ item.detail }} <b class="ml-5">ตัวชี้วัด (KPI):</b> {{ item.kpi }} <b class="ml-5">ค่าเป้าหมาย:</b> {{ item.target }}
          </li>
        </ul>
      </div>

      <div class="mb-6">
        <span class="font-bold">ผลการดำเนินงานที่ผ่านมาและการนำผลการประเมินโครงการ/กิจกรรมมาปรับปรุงในการจัดโครงการครั้งนี้:</span>
        <ul class="list-disc pl-6 text-gray-700">
          <li class="mb-3" v-for="(problem, index) in activityData.problem" :key="index">
            <b>ปัญหาข้อที่ {{ index + 1 }}:</b> {{ problem.problemDetail }} <b>แนวทางการแก้ไขข้อที่ {{ index + 1 }}:</b> {{ problem.solution }}
          </li>
        </ul>
      </div>

      <div class="mb-6">
        <h2 class="text-lg font-semibold text-gray-700 mb-2">รายละเอียดงบประมาณ</h2>
        <div class="grid grid-cols-1 gap-4">
          <div v-if="activityData.evaluationFile">
            <span class="font-bold">ไฟล์รายละเอียดงบประมาณ:</span>
            <a 
              href="javascript:void(0);" 
              @click="openFileInNewTab(activityData.budgetDetails, 'application/pdf')" 
              class="text-orange-500 underline">
              Click to open file in new tab.
            </a>
          </div>
        </div>
      </div>

      <div class="mb-6">
        <h2 class="text-lg font-semibold text-gray-700 mb-2">ไฟล์เพิ่มเติม</h2>
        <div class="grid grid-cols-2 gap-4">
          <div v-if="activityData.evaluationFile">
            <span class="font-bold">ไฟล์เพิ่มเติม:</span>
            <a 
              href="javascript:void(0);" 
              @click="openFileInNewTab(activityData.prepareFile, 'application/pdf')" 
              class="text-orange-500 underline">
              Click to open file in new tab.
            </a>
          </div>
        </div>
      </div>

      </div>

      <div class="mb-6">
        <h2 class="text-lg font-semibold text-gray-700 mb-2">Progress</h2>
        <table class="w-full border-collapse border border-gray-300">
            <thead>
                <tr class="bg-gray-200">
                    <th class="border border-gray-300 px-4 py-2 text-left w-[25%]">ชื่อเจ้าหน้าที่</th>
                    <th class="border border-gray-300 px-4 py-2 text-left w-[40%]">ตำแหน่ง</th>
                    <th class="border border-gray-300 px-4 py-2 text-left w-[25%]">สถานะ</th>
                    <th class="border border-gray-300 px-4 py-2 text-left w-[10%]">หมายเหตุ</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(step, index) in activityData.allProgress" :key="index">
                    <td class="border border-gray-300 px-4 py-2 w-[25%]">{{ step.staffName }}</td>
                    <td class="border border-gray-300 px-4 py-2 w-[40%]">{{ step.staffRole }}</td>
                    <td class="border border-gray-300 px-4 py-2 w-[25%]">{{ step.status }}</td>
                    <td class="border border-gray-300 px-4 py-2 text-red-600 w-[10%]" v-if="step.comment">
                        {{ step.comment }}
                    </td>
                    <td class="border border-gray-300 px-4 py-2" v-else>-</td>
                </tr>
            </tbody>
        </table>
      </div>


    <div class="text-center">
      <div v-if="canShowButtons" class="mt-4 flex justify-center gap-4">
        <template v-if="canApprove">
          <button class="button bg-green-500 text-white mx-2" @click="handleApprove()">
            Approve
          </button>
          <button class="button bg-red-500 text-white mx-2" @click="openRejectPopup()">
            Reject
          </button> 
        </template>
        
        <template v-else-if="!allApproved()">
          <button class="button bg-blue-500 text-white mx-2" @click="handleEdit">
            Edit
          </button>
          <button class="button bg-red-500 text-white mx-2" @click="openDeletePopup">
            Delete
          </button>
        </template>
      </div>
    </div>

    <!-- Popup สำหรับกรอก Comment -->
    <div 
      v-if="showCommentPopup"
      class="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
      <div class="bg-white p-6 rounded shadow-md w-[400px]">
        <h2 class="text-lg font-bold mb-4">Provide a Comment</h2>
        <textarea
          v-model="comment"
          class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="Enter your comment here..."
          rows="4"
          maxlength="400"
        ></textarea>
        <div class="mt-4 flex justify-end gap-2">
          <button 
            class="button bg-gray-500 text-white"
            @click="closeRejectPopup">
            Cancel
          </button>
          <button 
            class="button bg-red-500 text-white"
            @click="handleReject">
            Reject
          </button>
        </div>
      </div>
    </div>

    <!-- Popup สำหรับ confirm การ delete document -->
    <div 
      v-if="showDeletePopup"
      class="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
      <div class="bg-white p-6 rounded shadow-md w-[400px]" style="border-radius: 20px;">
          <h2 class="text-lg font-bold mb-4 text-center">Are you sure to delete?</h2>
          <div class="flex justify-end gap-2">
            <button 
              class="button bg-gray-500 text-white"
              @click="closeDeletePopup">
              Cancel
            </button>
            <button 
              class="button bg-red-500 text-white"
              @click="handleDelete">
              Delete
            </button>
        </div>    
      </div>
    </div>

    <!-- Popup no file -->
    <div v-if="showPopup" class="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
      <div class="bg-white p-6 rounded shadow-md w-[300px]">
        <h2 class="text-lg font-bold mb-4 text-center">Error</h2>
        <p class="text-center">{{ popupMessage }}</p>
        <div class="flex justify-center mt-4">
          <button class="bg-blue-500 text-white px-4 py-2 rounded" @click="closePopup">
            OK
          </button>
        </div>
      </div>
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

.button {
  width: 50%;
  padding: 10px 0;
  border: none;
  border-radius: 100px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}
.button:hover {
  opacity: 0.9;
}

textarea {
  resize: none;
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