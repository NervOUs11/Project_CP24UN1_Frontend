<script setup>
import { fetchDocumentDetail } from '../functions/documentDetail';
import { ref, onMounted, computed } from 'vue';
import { useRouter } from "vue-router";
import Navbar from '../components/Navbar.vue';
import { approveDocument } from '../functions/approve.js';
import { rejectDocument } from '../functions/reject.js';
import { deleteDocument } from '../functions/deleteDocument.js'

const data = ref(null);
const router = useRouter();

// ดึง role และข้อมูล Document
const staffID = localStorage.getItem('staffID');
const role = localStorage.getItem('role');

// สร้างตัวแปร ref สำหรับเก็บ documentID และ progressID
const documentID = ref(null);
const progressID = ref(null);

const comment = ref('');
const showCommentPopup = ref(false);
const showDeletePopup = ref(false);

const goBack = () => {
  router.push("/tracking");
};

// ใช้ computed ในการสร้าง canApprove ที่จะตรวจสอบสถานะ
const canApprove = computed(() => {
  if (!staffID) return false;

  // ตรวจสอบว่า progress ที่มี staffID ตรงกันและ status เป็น "Waiting for approve"
  const progressMatch = data.value.allProgress.find(
    (progress) =>
      progress.staffID === parseInt(staffID) && progress.status === "Waiting for approve"
  );

  return !!progressMatch; // ถ้ามี progress ที่ตรงตามเงื่อนไข จะคืนค่า true
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
    const data = { progressID: progressID.value, staffID: staffID, documentID: documentID.value}
    const result = await approveDocument(data);
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
    const data = { progressID: progressID.value, staffID: staffID, documentID: documentID.value, comment: comment.value}
    const result = await rejectDocument(data);
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

// เปิด Popup สำหรับ confirm delete
const openDeletePopup = () => {
  showDeletePopup.value = true;
};

// ปิด Popup สำหรับ confirm delete
const closeDeletePopup = () => {
  showDeletePopup.value = false;
};

// เรียกฟังก์ชันลบเอกสาร
const handleDelete = async () => {
  try {
    const documentID = data.value ? data.value.DocumentID : null; // ใช้ documentID จาก data.value
    const studentID = localStorage.getItem("studentID");

    // ตรวจสอบว่ามี documentID และ studentID หรือไม่
    if (!documentID || !studentID) {
      alert('Missing document ID or student ID');
      return;
    }

    await deleteDocument(studentID, documentID);
    router.push('/tracking');
  } catch (error) {
    console.error('Delete failed:', error);
  }
};

// ฟังก์ชัน handleEdit เมื่อคลิกปุ่ม Edit
const handleEdit = () => {
  const documentId = data.value ? data.value.DocumentID : null; // ใช้ documentID จาก data.value
  router.push(`/documentEdit/${documentId}`);
};

const formatDateTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return {
    date: date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    time: date.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }) + ' น.'
  };
};
const preview = ref({
  visible: false,
  title: '',
  data: '',
  type: ''
});

const openFileInNewTab = (base64String, mimeType) => {
  const byteCharacters = atob(base64String.split(',')[1]);
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
  const rawData = await fetchDocumentDetail(userid, role);
  if (rawData) {
    data.value = {
      ...rawData,
      startTime: formatDateTime(rawData.startTime),
      endTime: formatDateTime(rawData.endTime),
      createDate: formatDateTime(rawData.createDate),
      editDate: formatDateTime(rawData.editDate),
      file1: `data:image/jpeg;base64,${rawData.file1}`,
    };
  }
  documentID.value = rawData.DocumentID;
  progressID.value = rawData.progressID;
});

</script>

<template>
<Navbar class="fixed top-0 left-0 w-full z-50 h-[4vh] p-2 shadow-md"/>
  <!-- Show loading or skeleton while data is being fetched -->
  <div v-if="data === null" class="flex justify-center items-center min-h-screen">
    <span>Loading...</span>
  </div>

  <!-- Show the document details once data is fetched -->
  <div v-else class="flex justify-center items-center min-h-screen bg-orange-100">
    <div class="bg-white p-6 rounded-lg shadow-lg w-[900px]">
      <h1 class="text-2xl font-bold mb-4 text-center text-orange-500">Document Detail</h1>

      <div class="mb-6">
        <h2 class="text-lg font-semibold text-gray-700 mb-2">Document Information</h2>
        <div class="grid grid-cols-2 gap-4">
          <!-- <div>
            <span class="font-bold">Document ID:</span> {{ data.DocumentID }}
          </div> -->
          <div>
            <span class="font-bold">ประเภทการลา:</span> {{ data.DocumentType }}
          </div>
          <!-- <div class="col-span-2"> -->
          <div>  
            <span class="font-bold">เหตุผลและรายละเอียด:</span> {{ data.detail }}
          </div>

          <div>
            <span class="font-bold">วันที่เริ่มลา:</span> {{ data.startTime.date }} เวลา {{ data.startTime.time }}
          </div>
          <div>
            <span class="font-bold">ลาถึงวันที่:</span> {{ data.endTime.date }} เวลา {{ data.endTime.time }}
          </div>
          <div>
            <span class="font-bold">วันที่สร้างแบบฟอร์ม:</span> {{ data.createDate.date }} เวลา {{ data.createDate.time }}
          </div>
          <div>
            <span class="font-bold">วันที่แก้ไขแบบฟอร์ม:</span> {{ data.editDate.date }} เวลา {{ data.editDate.time }}
          </div>

        </div>
      </div>

      <div class="mb-6">
        <h2 class="text-lg font-semibold text-gray-700 mb-2">Files</h2>
        <div class="grid grid-cols-2 gap-4">
          <div v-if="data.file1">
            <span class="font-bold">File 1:</span>
            <a 
              href="javascript:void(0);" 
              @click="openFileInNewTab(data.file1, 'application/pdf')" 
              class="text-orange-500 underline">
              View File
            </a>
          </div>
          <div v-if="data.file2">
            <span class="font-bold">File 2:</span>
            <a :href="data.file2" target="_blank" class="text-orange-500 underline">
              {{ data.file2Name || "View File" }}
            </a>
          </div>
        </div>
      </div>

      <div class="mb-6">
        <h2 class="text-lg font-semibold text-gray-700 mb-2">Progress</h2>
        <ul class="list-disc pl-6 text-gray-700">
          <li v-for="(step, index) in data.allProgress" :key="index">
            {{ step.staffName }} - {{ step.staffRole }} - {{ step.status }}
            <span v-if="step.comment != null" class="text-red-600 mt-1">
              &nbsp; สาเหตุที่ยกเลิก: {{ step.comment }}
            </span>
          </li>
        </ul>
      </div>

    <div class="text-center">
      <div v-if="canShowButtons" class="mt-4 flex justify-center gap-4">
        <!-- ถ้าเป็น staff และสามารถ approve ได้ จะมีปุ่ม approve และ reject -->
        <template v-if="canApprove">
          <button class="button bg-green-500 text-white mx-2" @click="handleApprove">
            Approve
          </button>
          <button class="button bg-red-500 text-white mx-2" @click="openRejectPopup()">
            Reject
          </button>
        </template>
        
        <!-- ถ้าเป็น student จะมีปุ่ม edit และ delete -->
        <template v-else>
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
