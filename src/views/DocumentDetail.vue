<script setup>
import { fetchDocumentDetail } from '../functions/documentDetail';
import { ref, onMounted, computed } from 'vue';
import { useRouter } from "vue-router";
import Navbar from '../components/Navbar.vue';
import { approveDocument } from '../functions/approve.js';
import { rejectDocument } from '../functions/reject.js';
import { deleteDocument } from '../functions/deleteDocument.js'

const router = useRouter();

// ดึง role และข้อมูล Document
const staffID = localStorage.getItem('staffID');
const role = localStorage.getItem('role');

// สร้างตัวแปร ref สำหรับเก็บ documentID และ progressID
const documentID = ref(null);
const progressID = ref(null);

const data = ref([]);
const rawData = ref(null)

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
  const progressMatch = data.value?.allProgress?.find(
    (progress) =>
      progress.staffID === parseInt(staffID) && progress.status === "Waiting for approve"
  ) ?? null;

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
    const data = { progressID: progressID.value, staffID: staffID, documentID: documentID.value }
    const res = await approveDocument(data);
    if (res.ok) {
      showSuccess("approve")
    }
    // alert('Document approved successfully');
    // router.push('/tracking');
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
    const data = { progressID: progressID.value, staffID: staffID, documentID: documentID.value, comment: comment.value }
    const res = await rejectDocument(data);
    if (res.ok) {
      showSuccess("reject")
    }
    // alert('Document rejected successfully');
    // router.push('/tracking');
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

const showApprovePopup = ref(false);
const openApprovePopup = () => {
  showApprovePopup.value = true;
};
const closeApprovePopup = () => {
  showApprovePopup.value = false;
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

    const res = await deleteDocument(studentID, documentID);
    if (res.ok) {
      showSuccess("delete")
    }
    // router.push('/tracking');
  } catch (error) {
    console.error('Delete failed:', error);
  }
};

const handleEdit = () => {
  const documentId = data.value ? data.value.DocumentID : null; // ใช้ documentID จาก data.value
  router.push(`/documentEdit/${documentId}`);
};

const formatDateTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const localOffset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - localOffset);
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return {
    date: localDate.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone
    }),
    time: localDate.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone
    }) + ' น.'
  };
};

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

const allApproved = () => {
  const allProgress = data.value?.allProgress;
  if (Array.isArray(allProgress) && allProgress.length > 0) {
    return allProgress[allProgress.length - 1].status === "Approve";
  }
  return false;
};

const hasRejectedStatus = () => {
  const allProgress = data.value?.allProgress;
  if (Array.isArray(allProgress) && allProgress.length > 0) {
    return allProgress.some(progress => progress.status === "Reject");
  }
  return false;
};

const showSuccessPopup = ref(false);
const successMessage = ref("");
const showSuccess = (type) => {
  if (type === "add") {
    successMessage.value = "Added Document Successfully!";
  } else if (type === "edit") {
    successMessage.value = "Edited Successfully!";
  } else if (type === "delete") {
    successMessage.value = "Deleted Successfully!";
  } else if (type === "approve") {
    successMessage.value = "Approve Successfully!";
  } else if (type === "reject") {
    showCommentPopup.value = false
    successMessage.value = "Reject Successfully!";
  }
  showDeletePopup.value = false
  showSuccessPopup.value = true;
};
const redirectToTracking = () => {
  showSuccessPopup.value = false;
  router.push("/tracking");
};

const sortedProgress = computed(() => {
  return data.value?.allProgress
    ? [...data.value.allProgress]
      .filter((step) => step.status !== 'Other advisor approve') // กรองออก
      .sort((a, b) => a.step - b.step) // เรียงตาม step
    : [];
});

onMounted(async () => {
  let userid = null
  const role = localStorage.getItem("role")

  if (role != "Student") {
    userid = localStorage.getItem("staffID")
  }
  else if (role === "Student") {
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
      file2: `data:image/jpeg;base64,${rawData.file2}`,
    };
  }
  // console.log(data.value)
  documentID.value = rawData.DocumentID;
  progressID.value = rawData.progressID;
});

</script>

<template>
  <Navbar class="fixed top-0 left-0 w-full z-50 h-[3vh] p-2 shadow-md" />
  <!-- Show loading or skeleton while data is being fetched -->
  <div v-if="data === null" class="flex justify-center items-center min-h-screen">
    <span>Loading...</span>
  </div>

  <!-- Show the document details once data is fetched -->
  <div v-else class="flex justify-center items-center min-h-screen pt-[8vh] bg-orange-100">
    <div class="bg-white p-6 rounded-lg shadow-lg w-[1000px]">
      <h1 class="text-3xl font-extrabold mb-4 text-center text-orange-500">Absence Document Detail</h1>


      <div class="mb-6">
        <h2 class="subhead">Document Information</h2>
        <div class="grid grid-cols-2 gap-4 lable ">
          <div>
            <span class="items">ชื่อนักศึกษา:</span> {{ data.Owner?.name }}
          </div>
          <div>
            <span class="items">รหัสประจำตัวนักศึกษา:</span> {{ data.Owner?.studentID }}
          </div>
          <div>
            <span class="items">คณะ:</span> {{ data.Owner?.faculty }}
          </div>
          <div>
            <span class="items">ภาควิชา/สาขาวิชา:</span><span class="whitespace-nowrap"> {{ data.Owner?.department
            }}</span>
          </div>
          <div>
            <span class="items">ชั้นปีที่:</span> {{ data.Owner?.year }}
          </div>
          <div>
            <span class="items">ระดับการศึกษา:</span> ปริญญาตรี
          </div>
          <div>
            <span class="items">ประเภทหลักสูตร:</span> ปกติ
          </div>
          <div>
            <span class="items">สถานะนักศึกษา:</span> ปกติ
          </div>
          <div>
            <span class="items">คะแนนเฉลี่ยประจำภาค:</span>
            {{ (data.Owner?.currentGPA % 1 === 0) ? data.Owner?.currentGPA.toFixed(1) : data.Owner?.currentGPA }}
          </div>
          <div>
            <span class="items">คะแนนเฉลี่ยสะสม:</span>
            {{ (data.Owner?.cumulativeGPA % 1 === 0) ? data.Owner?.cumulativeGPA.toFixed(1) : data.Owner?.cumulativeGPA
            }}
          </div>
          <div>
            <span class="items">ข้อมูลการติดต่อนักศึกษา:</span> {{ data.Owner?.tel }}
          </div>
          <div>
            <span class="items">อีเมล:</span> {{ data.Owner?.email }}
          </div>

          <div>
            <span class="items">ประเภทการลา:</span> {{ data.DocumentType }}
          </div>
          <div>
            <span class="items">เหตุผลและรายละเอียด:</span> {{ data.detail }}
          </div>

          <div>
            <span class="items pr-2">วันที่เริ่มลา:</span> {{ data.startTime?.date }}<span class="items px-4">เวลา</span>{{ data.startTime?.time }}
          </div>
          <div>
            <span class="items pr-2">ลาถึงวันที่:</span> {{ data.endTime?.date }} <span class="items px-4">เวลา</span>  {{ data.endTime?.time }}
          </div>

          <div class="mb-8">
            <h2 class="items ">เอกสารแนบ:</h2>
            <table class="w-auto border-collapse border border-gray-300 mx-4">
              <tbody>
                <tr v-if="data.file1">
                  <td class="px-4 pt-2 pb-3 border border-white font-medium whitespace-nowrap">
                    หนังสือรับรองผู้ปกครอง/ใบรับรองแพทย์:</td>
                  <td class="py-2 border border-white">
                    <a v-if="data.file1.length > 30" href="#"
                      @click="openFileInNewTab(data.file1, 'application/pdf')"
                      class="text-orange-500 underline whitespace-nowrap">
                      หนังสือรับรองผู้ปกครอง/ใบรับรองแพทย์
                    </a>
                    <span v-else class="text-gray-500 whitespace-nowrap">No Attachment File </span>
                  </td>
                </tr>
                <tr v-if="data.file2">
                  <td class="px-4 py-2 border border-white font-medium">เอกสารแนบอื่น ๆ :</td>
                  <td class="py-2 border border-white">
                    <a v-if="data.file2.length > 30" href="#"
                      @click="openFileInNewTab(data.file2, 'application/pdf')" class="text-orange-500 underline">
                      เอกสารแนบอื่น ๆ
                    </a>
                    <span v-else class="text-gray-500 whitespace-nowrap">No Attachment File </span>
                  </td>
                </tr>
                <tr v-if="!data.file1 && !data.file2">
                  <td colspan="2" class="px-4 py-2 border border-white text-center text-gray-500">No Attachment Files
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="border-t border-gray-300 my-4"></div>

      <div class="mb-6">
        <h2 class="subhead mb-8">Progress</h2>
        <table class="w-auto border-collapse border border-gray-300 ml-2 mb-10">
          <thead>
            <tr class="bg-gray-200 text-center">
              <th class="border border-gray-300 px-4 py-2  w-[25%]">ชื่อเจ้าหน้าที่</th>
              <th class="border border-gray-300 px-4 py-2  w-[40%]">ตำแหน่ง</th>
              <th class="border border-gray-300 px-4 py-2  w-[25%]">สถานะ</th>
              <th class="border border-gray-300 px-4 py-2  w-[10%]">หมายเหตุ</th>
            </tr>
          </thead>
          <tbody class="text-center">
            <tr v-for="(step, index) in sortedProgress" :key="index">
              <td class="border border-gray-300 px-4 py-2 w-[25%] ">{{ step.staffName }}</td>
              <td class="border border-gray-300 px-4 py-2 w-[40%] ">{{ step.staffRole }}</td>
              <td class="border border-gray-300 px-4 py-2 w-[25%] ">{{ step.status }}</td>
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
          <!-- ถ้าเป็น staff และสามารถ approve ได้ จะมีปุ่ม approve และ reject -->
          <template v-if="canApprove">
            <button class=" button bg-green-500 hover:bg-green-300 text-white" @click="openApprovePopup()">
              Approve
            </button>
            <button class="button bg-red-500 hover:bg-red-400 text-white" @click="openRejectPopup()">
              Reject
            </button>
          </template>

          <!-- ถ้าเป็น student และ allProgress เป็น Approve ทั้งหมด ให้ซ่อนปุ่ม Edit และ Delete -->
          <template v-else-if="!allApproved()">
            <button v-if="hasRejectedStatus()" class="button bg-blue-500 text-white mx-2" @click="handleEdit">
              Edit
            </button>
            <button class="button bg-red-500 text-white mx-2" @click="openDeletePopup">
              Delete
            </button>
          </template>
        </div>
      </div>

      <!-- Popup สำหรับกรอก Comment -->
      <div v-if="showCommentPopup" class="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
        <div class="bg-white p-6 rounded shadow-md w-[400px]">
          <h2 class="text-lg font-bold mb-4">Provide a Comment</h2>
          <textarea v-model="comment"
            class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Enter your comment here..." rows="4" maxlength="400"></textarea>
          <div class="mt-4 flex justify-end gap-2">
            <button class="button bg-gray-500 text-white" @click="closeRejectPopup">
              Cancel
            </button>
            <button class="button bg-red-500 text-white" @click="handleReject">
              Reject
            </button>
          </div>
        </div>
      </div>

      <!-- Popup สำหรับ confirm การ delete document -->
      <div v-if="showDeletePopup" class="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
        <div class="bg-white p-6 rounded shadow-md w-[400px]" style="border-radius: 20px;">
          <h2 class="text-lg font-bold mb-4 text-center">Are you sure to delete?</h2>
          <div class="flex justify-end gap-2">
            <button class="button bg-gray-500 text-white" @click="closeDeletePopup">
              Cancel
            </button>
            <button class="button bg-red-500 text-white" @click="handleDelete">
              Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Popup สำหรับ confirm การ approve document -->
      <div v-if="showApprovePopup" class="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
        <div class="bg-white p-6 rounded shadow-md w-[400px]" style="border-radius: 20px;">
          <h2 class="text-lg font-bold mb-4 text-center">Are you sure to approve?</h2>
          <div class="flex justify-end gap-2">
            <button class="button bg-gray-500 text-white" @click="closeApprovePopup">
              Cancel
            </button>
            <button class="button bg-green-500 text-white" @click="handleApprove">
              Approve
            </button>
          </div>
        </div>
      </div>

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

      <div class="text-center">
        <button class="form-button" @click="goBack">
          Back to Tracking
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.subhead {
  font-size: 1.5rem;
  /* text-xl */
  font-weight: 700;
  /* font-bold */
  color: #ea580c;
  /* text-orange-600 */
  margin: 2.5rem 0 1.5rem 0;
  /* mb-4 */
}

.lable {
  /* mb-6 mx-2 */
  margin: 1rem 2rem 2rem;
}

.items {
  font-weight: 700;
  font-size: 1.125rem;
  margin-bottom: 0.5rem;
}

.form-button {
  width: 100%;
  padding: 0.7rem;
  border: none;
  border-radius: 100px;
  background-color: #fb923c;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}

.button {
  width: 60%;
  padding: 0.7rem;
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
  color: black;
}

.grid {
  display: grid;
}

.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
</style>
