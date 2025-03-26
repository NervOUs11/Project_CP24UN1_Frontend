<script setup>
import { ref, onMounted, computed } from 'vue';
import { fetchActivityDocument } from '../functions/fetchActivityDocument.js';
import { deleteActivityDocument } from '../functions/deleteActivityDocument.js';
import { approveActivity } from '../functions/approveActivity.js';
import { rejectActivity } from '../functions/rejectActivity.js';
import { fetchAllEntrepreneurial } from '../functions/fetchAllEntrepreneurial';
import { fetchAllSustainability } from '../functions/fetchAllSustainability';
import { fetchAllGoal } from '../functions/fetchAllGoal';
import { fetchAllActivity } from '../functions/fetchAllActivity';
<<<<<<< HEAD
=======

>>>>>>> eab2ecdb6e2f1b27ace88e56209a83331accac30
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

const sortedProgress = computed(() => {
  return [...(activityData.value?.allProgress || [])].sort((a, b) => a.step - b.step);
});

const showSuccessPopup = ref(false);
const successMessage = ref("");
const showSuccess = (type) => {
  if (type === "add") {
    successMessage.value = "Added Document Successfully!";
  } else if (type === "edit") {
    successMessage.value = "Edited Successfully!";
  } else if (type === "delete") {
    showDeletePopup.value = false
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
    if (!documentID || !studentID) {
      alert('Missing document ID or student ID');
      return;
    }

    const res = await deleteActivityDocument(studentID, documentID);
    if (res.ok) {
      showSuccess("delete")
    }
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
const entrepreneurialDescriptions = {
  "Entrepreneurial Mindset":
    "ส่งเสริมให้นักศึกษามีจิตสำนักของความเป็นผู้ประกอบการ ได้แก่ คิด สร้างสรรค์ ลงมือทำจริง สู้จนสำเร็จ และสร้างผลกระทบที่มีความหมาย",
  "Knowledge Sharing Society":
    "ส่งเสริมให้เกิดสังคมแห่งการสร้างสรรค์ความรู้ ทั้งด้านการจัดกิจกรรมเสริมสร้างความรู้ และการสร้างสภาพแวดล้อมให้เอื้อต่อการเรียนรู้",
  "Research and Innovation Impact":
    "สร้างงานวิจัยและนวัตกรรมที่ทรงคุณค่า และเกิดประโยชน์กับสังคมอย่างกว้างขวาง",
  "Financial Literacy":
    "กิจกรรมการส่งเสริมให้มีความเข้าใจที่เกี่ยวข้องกับการเงิน เพื่อความยั่งยืน การสร้างสภาพแวดล้อมที่จะเอื้อให้นักศึกษาสามารถใช้ประโยชน์จากเครื่องมือทางการเงินที่ตอบโจทย์ด้านความยั่งยืน สร้างนักศึกษาให้มีองค์ความรู้ในการผลักดันงานด้านการเงินเพื่อความยั่งยืนให้เห็นผลเป็นรูปธรรม",
};

<<<<<<< HEAD
=======
const entrepreneurialDescriptions = {
  "Entrepreneurial Mindset":
    "ส่งเสริมให้นักศึกษามีจิตสำนักของความเป็นผู้ประกอบการ ได้แก่ คิด สร้างสรรค์ ลงมือทำจริง สู้จนสำเร็จ และสร้างผลกระทบที่มีความหมาย",
  "Knowledge Sharing Society":
    "ส่งเสริมให้เกิดสังคมแห่งการสร้างสรรค์ความรู้ ทั้งด้านการจัดกิจกรรมเสริมสร้างความรู้ และการสร้างสภาพแวดล้อมให้เอื้อต่อการเรียนรู้",
  "Research and Innovation Impact":
    "สร้างงานวิจัยและนวัตกรรมที่ทรงคุณค่า และเกิดประโยชน์กับสังคมอย่างกว้างขวาง",
  "Financial Literacy":
    "กิจกรรมการส่งเสริมให้มีความเข้าใจที่เกี่ยวข้องกับการเงิน เพื่อความยั่งยืน การสร้างสภาพแวดล้อมที่จะเอื้อให้นักศึกษาสามารถใช้ประโยชน์จากเครื่องมือทางการเงินที่ตอบโจทย์ด้านความยั่งยืน สร้างนักศึกษาให้มีองค์ความรู้ในการผลักดันงานด้านการเงินเพื่อความยั่งยืนให้เห็นผลเป็นรูปธรรม",
};

>>>>>>> eab2ecdb6e2f1b27ace88e56209a83331accac30
const sustainabilityDescriptions = {
  "SDGs Culture":
    "ส่งเสริมให้เกิดวัฒนธรรมของความยั่งยืน คือ มีแนวคิดของความยั่งยืนตาม SDGs Goal 17 อยู่ในทุกกระบวนการของการทำกิจกรรม สอดคล้องกับด้านใด โปรดระบุอย่างน้อย 1 ด้าน",
  "Sustainability Change Agents":
    "ส่งเสริมให้เกิดผู้นำการเปลี่ยนแปลงที่ยั่งยืน สามารถนำความรู้ แนวทางปฏิบัติไปเผยแพร่และขยายผลต่อชุมชนและสังคมรอบข้างเพื่อให้เกิดความยั่งยืน และก่อให้เกิดผลดีต่อประเทศชาติสืบต่อไป",
  "Green University and Smart Campus":
    "ส่งเสริมให้เป็นมหาวิทยาลัยสีเขียว ปลูกจิตสำนึก สร้างความเข้าใจด้านการรักษาสิ่งแวดล้อม การอนุรักษ์พลังงาน และส่งเสริมให้เป็นมหาวิทยาลัยอัจฉริยะ มีการจัดการโดยใช้เทคโนโลยีที่ทันสมัย",
  "Carbon Neutrality ":
    "สนับสนุนให้มหาวิทยาลัยขับเคลื่อนเจตนารมณ์ลดการปล่อยคาร์บอนสุทธิเป็นศูนย์ และการลดการปล่อยคาร์บอนในกิจกรรมต่างๆ",
};
<<<<<<< HEAD
=======


>>>>>>> eab2ecdb6e2f1b27ace88e56209a83331accac30
// ฟังก์ชัน Approve
const handleApprove = async () => {
  try {
    const data = { progressID: progressID.value, staffID: staffID, documentID: documentId.value }
    console.log(data)
    const res = await approveActivity(data);
    if (res.ok) {
      showSuccess("approve")
    }
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
    const data = { progressID: progressID.value, staffID: staffID, documentID: documentId.value, comment: comment.value }
    const res = await rejectActivity(data);
    if (res.ok) {
      showSuccess("reject")
    }
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

const allApproved = () => {
  const allProgress = activityData.value?.allProgress;
  if (Array.isArray(allProgress)) {
    return allProgress.every(progress => progress.status === "Approve");
  }
  return false;
}

const hasRejectedStatus = () => {
  const allProgress = activityData.value?.allProgress;
  if (Array.isArray(allProgress) && allProgress.length > 0) {
    return allProgress.some(progress => progress.status === "Reject");
  }
  return false;
};

const handleEdit = () => {
  const documentId = activityData.value ? activityData.value.DocumentID : null;
  router.push(`/editActivityDocument/${documentId}`);
};

const showApprovePopup = ref(false);
const openApprovePopup = () => {
  showApprovePopup.value = true;
};
const closeApprovePopup = () => {
  showApprovePopup.value = false;
};

const sustainabilityProposeArray = ref([]);
const entrepreneurialData = ref([]);
const sustainabilityData = ref([]);
const goalData = ref([]);
const activity = ref([]);
<<<<<<< HEAD
=======

const selectedEntrepreneurial = computed(() => {
  return (activityData.value.entrepreneurial || []).map(name => ({
    entrepreneurialName: name,
    description: entrepreneurialDescriptions[name] || ""
  }));
});

const selectedSDGsCulture = computed(() => {
  const sdgs = (activityData.value.sustainability || []).filter(item => item.sustainability === 'SDGs Culture');
  return sdgs.length
    ? {
        sustainabilityName: 'SDGs Culture',
        description: sustainabilityDescriptions['SDGs Culture'] || "",
        goals: sdgs.map(item => item.goal).filter(Boolean), // เอาเฉพาะที่ไม่เป็น null
      }
    : null;
});

const selectedOtherSustainability = computed(() => {
  return (activityData.value.sustainability || [])
    .filter(item => item.sustainability !== 'SDGs Culture')
    .map(item => ({
      sustainabilityName: item.sustainability,
      description: sustainabilityDescriptions[item.sustainability] || "",
    }));
});
>>>>>>> eab2ecdb6e2f1b27ace88e56209a83331accac30

const selectedEntrepreneurial = computed(() => {
  return (activityData.value.entrepreneurial || []).map(name => ({
    entrepreneurialName: name,
    description: entrepreneurialDescriptions[name] || ""
  }));
});

const selectedSDGsCulture = computed(() => {
  const sdgs = (activityData.value.sustainability || []).filter(item => item.sustainability === 'SDGs Culture');
  return sdgs.length
    ? {
        sustainabilityName: 'SDGs Culture',
        description: sustainabilityDescriptions['SDGs Culture'] || "",
        goals: sdgs.map(item => item.goal).filter(Boolean), // เอาเฉพาะที่ไม่เป็น null
      }
    : null;
});

const selectedOtherSustainability = computed(() => {
  return (activityData.value.sustainability || [])
    .filter(item => item.sustainability !== 'SDGs Culture')
    .map(item => ({
      sustainabilityName: item.sustainability,
      description: sustainabilityDescriptions[item.sustainability] || "",
    }));
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

<<<<<<< HEAD
  try {
    activityData.value = await fetchActivityDocument(docId, userid, role)
    if (activityData.value) {
      documentId.value = activityData.value.DocumentID;
      progressID.value = activityData.value.progressID;
=======
  try{
      activityData.value = await fetchActivityDocument(docId, userid, role)
      if (activityData.value) {
          documentId.value = activityData.value.DocumentID;
          progressID.value = activityData.value.progressID;
>>>>>>> eab2ecdb6e2f1b27ace88e56209a83331accac30
          entrepreneurialData.value = await fetchAllEntrepreneurial();
          sustainabilityData.value = await fetchAllSustainability();
          goalData.value = await fetchAllGoal();
          activity.value = await fetchAllActivity();
          console.log(activityData.value.activity);
          console.log(activity.value);
          // console.log(activityData.value.activity.length);
          entrepreneurialData.value = activityData.value.entrepreneurial
          sustainabilityData.value =  activityData.value.sustainability
<<<<<<< HEAD
      sustainabilityProposeArray.value = activityData.value.sustainabilityPropose.match(/\d[^0-9]+/g).map(item => item.replace(/^(\d)/, '$1. '));;
      // console.log(sustainabilityProposeArray.value);
      activityData.value.startTime = activityData.value.startTime ? formatDateTime(activityData.value.startTime) : "N/A";
      activityData.value.endTime = activityData.value.endTime ? formatDateTime(activityData.value.endTime) : "N/A";
      activityData.value.prepareStart = activityData.value.prepareStart ? formatDate(activityData.value.prepareStart) : "N/A";
      activityData.value.prepareEnd = activityData.value.prepareEnd ? formatDate(activityData.value.prepareEnd) : "N/A";
      activityData.value.createDate = activityData.value.createDate ? formatDateTime(activityData.value.createDate) : "N/A";

    }
=======
          sustainabilityProposeArray.value = activityData.value.sustainabilityPropose.match(/\d[^0-9]+/g).map(item => item.replace(/^(\d)/, '$1. '));;
          activityData.value.startTime = activityData.value.startTime ? formatDateTime(activityData.value.startTime) : "N/A";
          activityData.value.endTime = activityData.value.endTime ? formatDateTime(activityData.value.endTime) : "N/A";
          activityData.value.prepareStart = activityData.value.prepareStart ? formatDate(activityData.value.prepareStart) : "N/A";
          activityData.value.prepareEnd = activityData.value.prepareEnd ? formatDate(activityData.value.prepareEnd) : "N/A";
          activityData.value.createDate = activityData.value.createDate ? formatDateTime(activityData.value.createDate) : "N/A";
      }
>>>>>>> eab2ecdb6e2f1b27ace88e56209a83331accac30
  }
  catch (error) {
    console.log(error)
  }

})
</script>

<template>
<<<<<<< HEAD
  <Navbar class="fixed top-0 left-0 w-full z-50 h-[3vh] p-2 shadow-md" />
  <!-- Show loading or skeleton while data is being fetched -->
  <div v-if="activityData === null" class="flex justify-center items-center min-h-screen">    <span>Loading...</span>
=======
<Navbar class="fixed top-0 left-0 w-full z-50 h-[3vh] p-2 shadow-md" />
  <!-- Show loading or skeleton while data is being fetched -->
  <div v-if="activityData === null" class="flex justify-center items-center min-h-screen">
    <span>Loading...</span>
>>>>>>> eab2ecdb6e2f1b27ace88e56209a83331accac30
  </div>

  <!-- Show the document details once data is fetched -->
  <div v-else class="flex justify-center items-center min-h-screen pt-[8vh] bg-orange-100">
    <div class="bg-white p-6 rounded-lg shadow-lg w-[900px]">
      <h1 class="text-3xl font-bold mb-4 text-center text-blue-500">Activity Document Detail</h1>
<<<<<<< HEAD


      <div class="mb-6">
        <h2 class="subhead">Document Information</h2>
        <div class="grid grid-cols-2 gap-4 lable">
=======

      <div class="mb-6">
        <h2 class="text-xl font-bold text-blue-600 mb-4">Document Information</h2>
        <div class="grid grid-cols-2 gap-4  mx-2">
>>>>>>> eab2ecdb6e2f1b27ace88e56209a83331accac30
          <div>
            <span class="items">ที่:</span> {{ activityData.code }}
          </div>
          <div>
<<<<<<< HEAD
            <span class="items">วันที่เขียน:</span> {{ activityData.createDate }}
=======
            <span class="font-bold">วันที่เขียน:</span> {{ activityData.createDate }}
>>>>>>> eab2ecdb6e2f1b27ace88e56209a83331accac30
          </div>

          <div>
            <span class="items">ชื่อหน่วยงาน:</span> {{ activityData.departmentName }}
          </div>
          <div>
            <span class="items">ชื่อโครงการ:</span> {{ activityData.title }}
          </div>
          <div>
            <span class="items">ระหว่างวันที่:</span> {{ activityData.startTime }}
          </div>
          <div>
            <span class="items">ถึงวันที่:</span> {{ activityData.endTime }}
          </div>
          <div>
            <span class="items">ณ สถานที่:</span> {{ activityData.location }}
          </div>
          <div>
            <span class="items">รูปแบบกิจกรรม:</span> {{ activityData.type }}
          </div>
          <div>
            <span class="items mr-2">วัตถุประสงค์:</span><span class="whitespace-nowrap"> {{ activityData.propose }}</span>
          </div>
          <!-- ฝากขึ้นบรรทัดใหม่ -->
          <div>
          <span class="items">ค่าใช้จ่ายในโครงการ:</span> {{ activityData.payment }}<span class="pl-1">บาท</span>
          </div>
<<<<<<< HEAD
        </div>

        

        <div class="lable">
          <span class="items whitespace-nowrap mr-2">การเทียบค่าชั่วโมงกิจกรรม:</span>
          <template v-if="!activityData.activity || activityData.activity.length === 0">
            <a class="whitespace-nowrap">กิจกรรมที่ไม่นับหน่วยชั่วโมง</a>
          </template>
          <template v-else>
            <a class="whitespace-nowrap">กิจกรรมเลือกเข้าร่วม (นับชั่วโมงกิจกรรม)</a>
          </template>
          <!-- แสดงตารางเฉพาะเมื่อ activityData.activity มีค่า -->
          <template v-if="activityData.activity && activityData.activity.length > 0">
            <table class="table-sub">
              <tbody>
                <tr v-for="(activity, index) in activityData.activity" :key="index" class="hover:bg-gray-100">
                  <td class="border border-white py-2 px-2 whitespace-nowrap">
                    {{ index + 1 }}<span>.</span>
                  </td>
                  <td class="border border-white py-2 whitespace-nowrap">
                    {{ activity.activityName }}
                  </td>
                  <td class="border border-white px-7"> จำนวน</td>
                  <td class="border border-white px-2">{{ activity.countHour }}</td>
                  <td class="border border-white px-6 whitespace-nowrap"> หน่วยชั่วโมง</td>
                </tr>
              </tbody>
            </table>
          </template>
        </div>




        <div class=" mx-2">
          <table class="table">
            <thead>
              <tr class="bg-gray-500 text-white">
                <th class="px-8  border-gray-50 py-5 whitespace-nowrap">อาจารย์ที่ปรึกษา/รองคณบดี</th>
                <th class="px-4 border py-5">นายก/ประธานชมรม</th>
                <th class="px-4 py-5">นักศึกษาผู้รับผิดชอบโครงการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="activityData.allProgress && activityData.allProgress.length > 0" class="hover:bg-gray-100">
                <td class="px-4 py-5 text-center bg-gray-50">{{ activityData.allProgress[0]?.staffName }}</td>
                <td class="px-4 py-5 border text-center bg-gray-50">{{ activityData.allProgress[1]?.staffName }}</td>
                <td class="px-4 py-5 text-center bg-gray-50 text-red-400"> เจ้าของโครงการ </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class=" mx-2 mt-10">
          <section>
          <div class="lable">
            <span class="items">ประเภทโครงการกิจกรรม:</span>
            <table class="table-sub">
              <tbody>
                <tr v-for="(activity, index) in activityData.activity" :key="index" class="hover:bg-gray-100">
                  <td class="border border-white py-2 px-2 whitespace-nowrap">
                    {{ index + 1 }}<span>.</span></td>
                  <td class="border border-white  py-2 whitespace-nowrap"> {{ activity.activityName }}</td>
                  <td class="border border-white px-7 "> จำนวน</td>
                  <td class="border  border-white px-2">{{ activity.countHour }}</td>
                  <td class="border border-white px-6 whitespace-nowrap"> หน่วยชั่วโมง</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="lable">
            <span class="items">KMUTT Student QF:</span>
            <table class="table-sub">
              <tbody>
                <tr v-for="(studentQF, index) in activityData.studentQF" :key="index" class="hover:bg-gray-100">
                  <td class="border border-white  py-2 pr-2 whitespace-nowrap"> {{ index + 1 }}<span>.</span></td>
                  <td class="border border-white  py-2 whitespace-nowrap"> {{ studentQF.name }}</td>
                  <td class="border border-white px-7 "> จำนวน</td>
                  <td class="border  border-white px-2">{{ studentQF.percentage }}</td>
                  <td class="border border-white px-6 "> %</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="lable">
            <span class="items">Entrepreneurial:</span>
            <ul class="list-disc pl-6 text-gray-700">
              <li v-if="selectedEntrepreneurial.length">
                <span class="font-semibold">{{ selectedEntrepreneurial.map(e => e.entrepreneurialName).join(', ') }}: </span>
                <span>{{ selectedEntrepreneurial.map(e => e.description).join(' ') }}</span>              </li>
            </ul>
          </div>

            <!-- Sustainability and Goals -->
        <div class="lable">
          <span class="items">Sustainability:</span>
          <ul class="list-disc pl-6 text-gray-700">
            <li v-if="selectedSDGsCulture">
              <span class="font-semibold">{{ selectedSDGsCulture.sustainabilityName }}:</span>
              <span>{{ selectedSDGsCulture.description }}</span>
              <ul v-if="selectedSDGsCulture.goals.length" class="list-disc pl-6 text-gray-700">
                <li v-for="(goal, index) in selectedSDGsCulture.goals" :key="index">
                  {{ goal }}
                </li>
              </ul>
            </li>
            <li v-for="(sustainability, index) in selectedOtherSustainability" :key="index">
              <span class="font-semibold">{{ sustainability.sustainabilityName }}:</span>
              <span>{{ sustainability.description }}</span>
            </li>
          </ul>
        </div>







          <div class="lable">
            <span class="items">หลักการและเหตุผล:</span> {{ activityData.sustainabilityDetail }}
          </div>

          <div class="lable">
            <span class="items">วัตถุประสงค์:</span> {{ activityData.sustainabilityPropose }}
          </div>

          <div class="lable">
            <span class="items">ผู้เข้าร่วมโครงการ:</span>
            <table class="table-sub">
              <tbody>
                <tr v-for="(participant, index) in activityData.participant" :key="index" class="hover:bg-gray-100">
                  <td class="border border-white  py-2 whitespace-nowrap"> {{ participant.participantName }}</td>
                  <td class="border border-white px-7 "> จำนวน</td>
                  <td class="border  border-white px-2">{{ participant.count }}</td>
                  <td class="border border-white px-6 "> คน</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="lable">
            <span class="items">ลักษณะกิจกรรม:</span>
            <span class="ml-4"> {{ activityData.activityCharacteristic }}</span>
          </div>

          <div class="lable">
            <span class="items">ลักษณะกิจกรรมที่จัดขึ้นสอดคล้องกับหลักเกียรติและศักดิ์ของนักศึกษา(Code of Honor)
              ดังนี้:</span>
            <div class="ml-4 my-1">{{ activityData.codeOfHonor }}</div>
          </div>

        </section>
          <div class="lable">
            <span class="items">ระยะเวลาเตรียมงาน:</span> {{ activityData.prepareStart }} ถึงวันที่ {{
              activityData.prepareEnd }}
          </div>
          <div class="lable">
            <span class="items">ระยะเวลาปฏิบัติงาน:</span> {{ activityData.startTime }} ถึงวันที่ {{ activityData.endTime }}
          </div>


          <div class="lable">
            <h2 class="items">ขั้นตอนการดำเนินงาน</h2>
            <table class="w-auto border-collapse border border-white mx-4">
              <tbody>
                <tr v-for="(file, index) in [activityData.scheduleDetails]" :key="index">
                  <td class="px-4 py-2">ไฟล์ขั้นตอนการดำเนินงาน:</td>
                  <td class="px-4 py-2">
                    <a href="javascript:void(0);"
                      @click="openFileInNewTab(activityData.scheduleDetails, 'application/pdf')"
                      class="text-orange-500 underline">
                      Click to open file in new tab.
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="lable">
            <span class="font-bold ">คณะกรรมการจัดโครงการ:</span>
            <table class="table">
              <thead class="bg-gray-200">
                <tr>
                  <th class="border border-gray-300 px-4 py-2 text-center">ลำดับที่</th>
                  <th class="border border-gray-300 px-4 py-2 text-center">ชื่อ - นามสกุล</th>
                  <th class="border border-gray-300 px-4 py-2 text-center">ตำแหน่ง</th>
                </tr>
=======

          <div class="mb-6">
            <span class="font-bold">ชั่วโมงกิจกรรม:</span>
            <ul class="list-disc pl-6 text-gray-700">
              <li v-for="(activity, index) in activityData.activity" :key="index">
                {{ activity.activityName }} จำนวน {{ activity.countHour }} ชั่วโมง
              </li>
            </ul>
          </div>

        </div>

        <div class=" mx-2">
          <div class="mb-6">
            <span class="font-bold">อาจารย์ที่ปรึกษา/รองคณบดี:</span>
            <span class="mx-2" v-if="activityData.allProgress">{{ activityData.allProgress[0]?.staffName }}</span>
          </div>
          <div class="mb-6">
            <span class="font-bold">นายก/ประธานชมรม:</span>
            <span class="mx-2" v-if="activityData.allProgress">{{ activityData.allProgress[1]?.staffName }}</span>
          </div>
          <div class="mb-6">
            <span class="font-bold">ประธานฝ่าย:</span>
            <span class="mx-2" v-if="activityData.allProgress">{{ activityData.allProgress[2]?.staffName }}</span>
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
              <li v-if="selectedEntrepreneurial.length">
                <span class="font-semibold">{{ selectedEntrepreneurial.map(e => e.entrepreneurialName).join(', ') }}: </span>
                <span>{{ selectedEntrepreneurial.map(e => e.description).join(' ') }}</span>
              </li>
            </ul>
          </div>

        <!-- Sustainability and Goals -->
        <div class="mb-6">
          <span class="font-bold">Sustainability:</span>
          <ul class="list-disc pl-6 text-gray-700">
            <li v-if="selectedSDGsCulture">
              <span class="font-semibold">{{ selectedSDGsCulture.sustainabilityName }}:</span>
              <span>{{ selectedSDGsCulture.description }}</span>
              <ul v-if="selectedSDGsCulture.goals.length" class="list-disc pl-6 text-gray-700">
                <li v-for="(goal, index) in selectedSDGsCulture.goals" :key="index">
                  {{ goal }}
                </li>
              </ul>
            </li>
            <li v-for="(sustainability, index) in selectedOtherSustainability" :key="index">
              <span class="font-semibold">{{ sustainability.sustainabilityName }}:</span>
              <span>{{ sustainability.description }}</span>
            </li>
          </ul>
        </div>

          <div class="mb-6">
            <span class="font-bold">หลักการและเหตุผล:</span> {{ activityData.sustainabilityDetail }}
          </div>

          <div class="mb-6">
            <span class="font-bold">วัตถุประสงค์:</span>
            <ul class="list-disc pl-6 text-gray-700">
              <li v-for="(item, index) in sustainabilityProposeArray" :key="index">
                {{ item }}
              </li>
            </ul>
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
            <span class="font-bold">ลักษณะกิจกรรมที่จัดขึ้นสอดคล้องกับหลักเกียรติและศักดิ์ของนักศึกษา(Code of Honor)
              ดังนี้:</span><br>{{ activityData.codeOfHonor }}
          </div>

          <div class="mb-6">
            <span class="font-bold">ระยะเวลาเตรียมงาน:</span> {{ activityData.prepareStart }} ถึงวันที่ {{
              activityData.prepareEnd }}
          </div>

          <div class="mb-6">
            <h2 class="text-lg font-semibold text-gray-700 mb-2">ขั้นตอนการดำเนินงาน</h2>
            <div class="grid grid-cols-2 gap-4">
              <div v-if="activityData.scheduleDetails">
                <span class="font-bold ml-3">ไฟล์ขั้นตอนการดำเนินงาน:</span>
                <a href="javascript:void(0);" @click="openFileInNewTab(activityData.scheduleDetails, 'application/pdf')"
                  class="text-orange-500 underline">
                  Click to open file in new tab.
                </a>
              </div>
            </div>
          </div>

          <div class="mb-6">
            <span class="font-bold ">คณะกรรมการจัดโครงการ:</span>
            <table class="w-full border-collapse border mx-3 my-3 border-gray-300 text-gray-700">
              <thead class="bg-gray-200">
                <tr>
                  <th class="border border-gray-300 px-4 py-2 text-center">ลำดับที่</th>
                  <th class="border border-gray-300 px-4 py-2 text-left">ชื่อ - นามสกุล</th>
                  <th class="border border-gray-300 px-4 py-2 text-left">ตำแหน่ง</th>
                </tr>
>>>>>>> eab2ecdb6e2f1b27ace88e56209a83331accac30
              </thead>
              <tbody>
                <tr v-for="(committee, index) in activityData.committee" :key="index" class="hover:bg-gray-100">
                  <td class="border border-gray-300 px-4 py-2 text-center">{{ index + 1 }}</td>
                  <td class="border border-gray-300 px-4 py-2">{{ committee.name }}</td>
                  <td class="border border-gray-300 px-4 py-2">{{ committee.position }}</td>
                </tr>
              </tbody>
            </table>
<<<<<<< HEAD
          </div>

          <div class="lable">
            <span class="items">รูปแบบการประเมินผล:</span>
            <ul class="list-none pl-6 text-gray-700 ml-4 my-2">
              <li
                v-for="(evaluation, index) in (activityData.evaluation)" :key="index" class="py-1">
                <span class="px-2">&#x2611;</span> {{  evaluation.evaluation == "Other" ? evaluation.otherEvaluation : evaluation.evaluation }}
              </li>
              
            </ul>
          </div>

          <div class="lable">
            <h2 class="items">รายละเอียดรูปแบบการประเมินผล</h2>
            <table class="w-auto border-collapse border border-white mx-4">
              <tbody>
                <tr v-for="(file, index) in [activityData.evaluationFile]" :key="index">
                  <td class="px-4 py-2">ไฟล์รูปแบบการประเมินผล:</td>
                  <td class="px-4 py-2">
                    <a href="javascript:void(0);"
                      @click="openFileInNewTab(activityData.evaluationFile, 'application/pdf')"
                      class="text-orange-500 underline">
                      Click to open file in new tab.
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>

          </div>

          <div class="lable">
            <span class="items">ผลที่คาดว่าจะได้รับ:</span>
            <table class="table">
              <thead class="bg-gray-200">
                <tr>
                  <th class="border border-gray-300 px-4 py-2 text-center">ข้อที่</th>
                  <th class="border border-gray-300 px-4 py-2 text-center">ผลที่คาดว่าจะได้รับ</th>
                  <th class="border border-gray-300 px-4 py-2 text-center">ตัวชี้วัด (KPI)</th>
                  <th class="border border-gray-300 px-4 py-2 text-center">ค่าเป้าหมาย (%)</th>
=======
            <!-- <ul class="list-disc pl-6 text-gray-700">
              <li v-for="(committee, index) in activityData.committee" :key="index">
                <b>Name:</b> {{ committee.name }} <b>Position:</b> {{ committee.position }}
              </li>
            </ul> -->
          </div>

          <div class="mb-6">
            <span class="font-bold">รูปแบบการประเมินผล:</span>
            <ul class="list-disc pl-6 text-gray-700 ml-4 my-2">
              <li class="my-1" v-for="(evaluation, index) in activityData.evaluation" :key="index">
                {{ evaluation.evaluation == "Other" ? evaluation.otherEvaluation : evaluation.evaluation }}
              </li>
            </ul>
          </div>

          <div class="mb-6">
            <h2 class="text-lg font-semibold text-gray-700 mb-2">รูปแบบการประเมินผล</h2>
            <div class="grid grid-cols-2 gap-4 ml-3">
              <div v-if="activityData.evaluationFile">
                <span class="font-bold">ไฟล์รูปแบบการประเมินผล:</span>
                <a href="javascript:void(0);" @click="openFileInNewTab(activityData.evaluationFile, 'application/pdf')"
                  class="text-orange-500 underline">
                  Click to open file in new tab.
                </a>
              </div>
            </div>
          </div>

          <div class="mb-6">
            <span class="font-bold">ผลที่คาดว่าจะได้รับ:</span>
            <table class="w-full border-collapse border mx-3 my-3 border-gray-300 text-gray-700">
              <thead class="bg-gray-200">
                <tr>
                  <th class="border border-gray-300 px-4 py-2 text-center">ข้อที่</th>
                  <th class="border border-gray-300 px-4 py-2 text-left">ผลที่คาดว่าจะได้รับ</th>
                  <th class="border border-gray-300 px-4 py-2 text-left">ตัวชี้วัด (KPI)</th>
                  <th class="border border-gray-300 px-4 py-2 text-left">ค่าเป้าหมาย (%)</th>
>>>>>>> eab2ecdb6e2f1b27ace88e56209a83331accac30

                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in activityData.result" :key="index" class="hover:bg-gray-100">
                  <td class="border border-gray-300 px-4 py-2 text-center">{{ index + 1 }}</td>
                  <td class="border border-gray-300 px-4 py-2">{{ item.detail }}</td>
                  <td class="border border-gray-300 px-4 py-2">{{ item.kpi }}</td>
                  <td class="border border-gray-300 px-4 py-2">{{ item.target }}</td>
                </tr>
              </tbody>
            </table>
<<<<<<< HEAD

          </div>

          <div class="lable">
            <h2 class="items mb-2">รายละเอียดงบประมาณ</h2>
            <table class="w-auto border-collapse border border-white mx-4">
              <tbody>
                <tr v-for="(file, index) in [activityData.evaluationFile]" :key="index">
                  <td class="px-4 py-2">ไฟล์รายละเอียดงบประมาณ:</td>
                  <td class="px-4 py-2">
                    <a href="javascript:void(0);"
                      @click="openFileInNewTab(activityData.budgetDetails, 'application/pdf')"
                      class="text-orange-500 underline">
                      Click to open file in new tab.
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="lable">
            <h2 class="items mb-2">ไฟล์เพิ่มเติม</h2>
            <table class="w-auto border-collapse border border-white mx-4">
              <tbody>
                <tr v-for="(file, index) in [activityData.prepareFile]" :key="index">
                  <td class="px-4 py-2">ไฟล์เพิ่มเติม:</td>
                  <td class="px-4 py-2">
                    <a href="javascript:void(0);" @click="openFileInNewTab(activityData.prepareFile, 'application/pdf')"
                      class="text-orange-500 underline">
                      Click to open file in new tab.
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
=======
            <!-- <ul class="list-disc pl-6 text-gray-700">
              <li class="mb-3" v-for="(item, index) in activityData.result" :key="index">
                <b>ผลที่คาดว่าจะได้รับข้อที่ {{ index + 1 }}:</b> {{ item.detail }} <b class="mx-5">ตัวชี้วัด (KPI):</b>
                {{ item.kpi }} <b class="mx-5">ค่าเป้าหมาย:</b> {{ item.target }}
              </li>
            </ul>
          </div>

          <div v-if="activityData.problem?.some(p => p.problemDetail || p.solution)" class="mb-6">
            <span
              class="font-bold">ผลการดำเนินงานที่ผ่านมาและการนำผลการประเมินโครงการ/กิจกรรมมาปรับปรุงในการจัดโครงการครั้งนี้:</span>
            <ul class="list-disc pl-6 text-gray-700">
              <li class="mb-3" v-for="(problem, index) in activityData.problem" :key="index">
                <b>ปัญหาข้อที่ {{ index + 1 }}:</b> {{ problem.problemDetail }} <b>แนวทางการแก้ไขข้อที่ {{ index + 1
                }}:</b> {{ problem.solution }}
              </li>
            </ul> -->
          </div>

          <div class="mb-6">
            <h2 class="text-lg font-semibold text-gray-700 mb-2">รายละเอียดงบประมาณ</h2>
            <div class="grid grid-cols-1 gap-4 mx-3">
              <div v-if="activityData.evaluationFile">
                <span class="font-bold">ไฟล์รายละเอียดงบประมาณ:</span>
                <a href="javascript:void(0);" @click="openFileInNewTab(activityData.budgetDetails, 'application/pdf')"
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
                <span class="font-bold ml-3">ไฟล์เพิ่มเติม:</span>
                <a href="javascript:void(0);" @click="openFileInNewTab(activityData.prepareFile, 'application/pdf')"
                  class="text-orange-500 underline">
                  Click to open file in new tab.
                </a>
              </div>
            </div>
>>>>>>> eab2ecdb6e2f1b27ace88e56209a83331accac30
          </div>
        </div>
      </div>

      <div class="border-t border-gray-300 my-9"></div>

      <div class="mb-6">
<<<<<<< HEAD
        <h2 class="subhead">Progress</h2>
        <table class="table ">
          <thead>
            <tr class="bg-gray-200">
              <th class="border border-gray-300 px-4 py-2 text-center w-[25%]">ชื่อเจ้าหน้าที่</th>
              <th class="border border-gray-300 px-4 py-2 text-center w-[40%]">ตำแหน่ง</th>
              <th class="border border-gray-300 px-4 py-2 text-center w-[25%]">สถานะ</th>
              <th class="border border-gray-300 px-4 py-2 text-center w-[10%]">หมายเหตุ</th>
=======
        <h2 class="text-xl font-bold text-orange-600 mb-6">Progress</h2>
        <table class="w-full border-collapse border border-gray-300 mb-10">
          <thead>
            <tr class="bg-gray-200">
              <th class="border border-gray-300 px-4 py-2 text-left w-[25%]">ชื่อเจ้าหน้าที่</th>
              <th class="border border-gray-300 px-4 py-2 text-left w-[40%]">ตำแหน่ง</th>
              <th class="border border-gray-300 px-4 py-2 text-left w-[25%]">สถานะ</th>
              <th class="border border-gray-300 px-4 py-2 text-left w-[10%]">หมายเหตุ</th>
>>>>>>> eab2ecdb6e2f1b27ace88e56209a83331accac30
            </tr>
          </thead>
          <tbody>
            <tr v-for="(step, index) in sortedProgress" :key="index">
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

<<<<<<< HEAD

=======
>>>>>>> eab2ecdb6e2f1b27ace88e56209a83331accac30
      <div class="text-center">
        <div v-if="canShowButtons" class="mt-4 flex justify-center gap-4">
          <template v-if="canApprove">
            <button class="button bg-green-500 text-white mx-2" @click="openApprovePopup()">
              Approve
            </button>
            <button class="button bg-red-500 text-white mx-2" @click="openRejectPopup()">
              Reject
            </button>
          </template>

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
  font-size: 1.25rem;
  /* text-xl */
  font-weight: bold;
  /* font-bold */
  color:  #2196F3;
  /* text-orange-600 */
  margin: 1rem 0;
  /* mb-4 */
}
.lable{
  /* mb-6 mx-2 */
  margin: 1rem 2rem 2rem ;
}
.items {
  font-weight: bold;
  font-size: medium;
  margin-bottom: 0.5rem;
}

.table {
  border-collapse: collapse;
  border: 1px solid #d1d5db;
  /* #d1d5db คือสีเทาอ่อน */
  margin: 0.5rem 1.25rem;
  margin-left: auto;
  margin-right: auto;
  width: auto;
}

.table-sub {
  border-collapse: collapse;
  border: 1px solid #d1d5db;
  /* #d1d5db คือสีเทาอ่อน */
  margin: 0.5rem 1.25rem;
  width: auto;
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
  width: 50%;
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
  background-color: #f97316;
}

.grid {
  display: grid;
}

.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
</style>

