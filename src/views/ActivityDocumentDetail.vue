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

const sustainabilityDescriptions = {
  "SDGs Culture":
    "ส่งเสริมให้เกิดวัฒนธรรมของความยั่งยืน คือ มีแนวคิดของความยั่งยืนตาม SDGs Goal 17 อยู่ในทุกกระบวนการของการทำกิจกรรม สอดคล้องกับด้าน",
  "Sustainability Change Agents":
    "ส่งเสริมให้เกิดผู้นำการเปลี่ยนแปลงที่ยั่งยืน สามารถนำความรู้ แนวทางปฏิบัติไปเผยแพร่และขยายผลต่อชุมชนและสังคมรอบข้างเพื่อให้เกิดความยั่งยืน และก่อให้เกิดผลดีต่อประเทศชาติสืบต่อไป",
  "Green University and Smart Campus":
    "ส่งเสริมให้เป็นมหาวิทยาลัยสีเขียว ปลูกจิตสำนึก สร้างความเข้าใจด้านการรักษาสิ่งแวดล้อม การอนุรักษ์พลังงาน และส่งเสริมให้เป็นมหาวิทยาลัยอัจฉริยะ มีการจัดการโดยใช้เทคโนโลยีที่ทันสมัย",
  "Carbon Neutrality ":
    "สนับสนุนให้มหาวิทยาลัยขับเคลื่อนเจตนารมณ์ลดการปล่อยคาร์บอนสุทธิเป็นศูนย์ และการลดการปล่อยคาร์บอนในกิจกรรมต่างๆ",
};


// ฟังก์ชัน Approve
const handleApprove = async () => {
  try {
    const data = { progressID: progressID.value, staffID: staffID, documentID: documentId.value }
    // console.log(data)
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
  return /^[A-Za-z0-9+/=]+$/.test(str);
};

const downloadFileFromBase64 = async (base64String, mimeType) => {
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
    console.log('Base64 Length:', base64Data.length);

    const byteCharacters = atob(base64Data);
    const byteNumbers = new Uint8Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const blob = new Blob([byteNumbers], { type: mimeType });
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;

    // ตั้งชื่อไฟล์อัตโนมัติ เช่น 'downloaded_file.pdf'
    const extension = mimeType.split('/')[1] || 'file'; // ถ้าไม่มี type ให้ default เป็น 'file'
    link.download = '';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 1000);
  } catch (error) {
    popupMessage.value = 'Error downloading the file.';
    showPopup.value = true;
    console.error('Error decoding Base64:', error);
  }
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
const totalHours = computed(() => {
  return (activityData.value.activity || []).reduce((sum, activity) => sum + (activity.countHour || 0), 0);
});

const activityStatus = computed(() => {
  return totalHours.value === 0 ? 'ไม่นับชั่วโมงกิจกรรม' : 'กิจกรรมเลือกเข้าร่วม';
});


const selectedOtherSustainability = computed(() => {
  return (activityData.value.sustainability || [])
    .filter(item => item.sustainability !== 'SDGs Culture')
    .map(item => ({
      sustainabilityName: item.sustainability,
      description: sustainabilityDescriptions[item.sustainability] || "",
    }));
});
const expenses = ref(0);

onMounted(async () => {
  let userid = null
  const role = localStorage.getItem("role")
  if (role != "Student") {
    userid = localStorage.getItem("staffID")
  }
  else if (role === "Student") {
    userid = localStorage.getItem("studentID")
  }

  try {
    activityData.value = await fetchActivityDocument(docId, userid, role)
    if (activityData.value) {
      documentId.value = activityData.value.DocumentID;
      progressID.value = activityData.value.progressID;
      entrepreneurialData.value = await fetchAllEntrepreneurial();
      sustainabilityData.value = await fetchAllSustainability();
      goalData.value = await fetchAllGoal();
      activity.value = await fetchAllActivity();
      // console.log(activityData.value);
      expenses.value = activityData.value.payment
      entrepreneurialData.value = activityData.value.entrepreneurial
      sustainabilityData.value = activityData.value.sustainability
      sustainabilityProposeArray.value = activityData.value.sustainabilityPropose.match(/\d[^0-9]+/g).map(item => item.replace(/^(\d)/, '$1. '));;
      activityData.value.startTime = activityData.value.startTime ? formatDate(activityData.value.startTime) : "N/A";
      activityData.value.endTime = activityData.value.endTime ? formatDate(activityData.value.endTime) : "N/A";
      activityData.value.prepareStart = activityData.value.prepareStart ? formatDate(activityData.value.prepareStart) : "N/A";
      activityData.value.prepareEnd = activityData.value.prepareEnd ? formatDate(activityData.value.prepareEnd) : "N/A";
      activityData.value.createDate = activityData.value.createDate ? formatDateTime(activityData.value.createDate) : "N/A";
    }
  }
  catch (error) {
    console.log(error)
  }

})

const expensesThaiText = computed(() => {
  return convertNumberToThaiText(expenses.value);
});
const convertNumberToThaiText = (num) => {
  const units = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน']
  const numbers = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า']

  if (isNaN(num) || parseFloat(num) === 0) return 'ศูนย์บาทถ้วน'

  const toText = (numberStr) => {
    let text = ''
    const len = numberStr.length
    for (let i = 0; i < len; i++) {
      const digit = parseInt(numberStr[i])
      const position = len - i - 1

      if (digit !== 0) {
        if (position === 1 && digit === 1) {
          text += 'สิบ'
        } else if (position === 1 && digit === 2) {
          text += 'ยี่สิบ'
        } else if (position === 0 && digit === 1 && len > 1) {
          text += 'เอ็ด'
        } else {
          text += numbers[digit] + units[position]
        }
      }
    }
    return text
  }

  const [bahtPart, satangPartRaw = ''] = parseFloat(num).toFixed(2).split('.')
  const satangPart = parseInt(satangPartRaw)

  const bahtText = toText(bahtPart) + 'บาท'
  const satangText = satangPart === 0 ? 'ถ้วน' : toText(satangPartRaw) + 'สตางค์'

  return bahtText + satangText
}

const thaiText = computed(() => {
  const num = parseFloat(expenses.value)
  return isNaN(num) ? '' : convertNumberToThaiText(num)
})

</script>

<template>
  <Navbar class="fixed top-0 left-0 w-full z-50 h-[3vh] p-2 shadow-md" />
  <!-- Show loading or skeleton while data is being fetched -->
  <div v-if="activityData.value === null" class="flex justify-center items-center min-h-screen">
    <span>Loading...</span>
  </div>

  <!-- Show the document details once data is fetched -->
  <div v-else class="w-full flex justify-center items-center min-h-screen pt-[8vh] bg-orange-100">
    <div class="bg-white p-6 rounded-lg shadow-lg w-[1100px]">
      <h1 class="text-3xl font-extrabold mb-4 text-center text-blue-500">Activity Document Detail</h1>


      <div class="lable">
        <div class="subhead ">Document Information</div>
        <div class="grid grid-cols-2 gap-4 lable ">
          <div>
            <span class="items">ที่:</span> {{ activityData.code }}
          </div>
          <div>
            <span class="items">วันที่เขียน:</span> {{ activityData.createDate }}
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
            <span class="items">รูปแบบการจัดกิจกรรม:</span> {{ activityData.type }}
          </div>
          <div class="col-span-2">
            <label class="block items">วัตถุประสงค์โดยภาพรวม:</label>
            <span class=" w-full ml-10 underline" rows="4" readonly>{{ activityData.propose }}</span>
          </div>

          <!-- ค่าใช้จ่าย -->
          <div class="col-span-2 flex items-center">
            <table class="  whitespace-nowrap ">
              <tbody>
                <tr>
                  <td class="items whitespace-nowrap" style="width: 85px;">ค่าใช้จ่าย:</td>
                  <td class=" border border-white">เป็นจำนวนเงิน</td>
                  <td class="p-2 border border-white  w-auto mx-1 text-right">
                    {{ parseFloat(activityData.payment).toFixed(2) }}
                  </td>
                  <td class="border border-white">บาท</td>
                  <td class="border border-white">
                    ( {{ thaiText }} )
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <div class="flex items-center whitespace-nowrap w-full mb-4">
              <span class="items">การเทียบค่าชั่วโมงกิจกรรม:&nbsp;
                <span class="no-style">{{ activityStatus }}</span>
              </span>
            </div>

            <div>
              <label for="activityHours" class="block items">
                ประเภทโครงการกิจกรรม<span class="text-red-500 ml-1">*</span>
              </label>

              <table class="table-auto w-full border-collapse border border-white whitespace-nowrap ml-10">
                <tbody>
                  <tr v-for="(activity, index) in activityData.activity" :key="index" class="hover:bg-gray-50">
                    <td class="border border-white pl-4 py-2"> {{ index + 1 }}. </td>
                    <td class="border border-white px-4 py-2">{{ activity.activityName }}</td>
                    <td class="border border-white px-4 py-2 text-center">จำนวน</td>
                    <td class="border border-white px-4 py-2 text-center">{{ activity.countHour }}</td>
                    <td class="border border-white px-4 py-2 text-center">หน่วยชั่วโมง</td>
                  </tr>
                </tbody>
              </table>

            </div>
          </div>
        </div>

        <div class="lable">
          <table class="table-auto w-auto mb-4">

            <tbody>
              <tr>
                <td class="items">นักศึกษาผู้รับผิดชอบโครงการ:</td>
                <td class="p-4" v-if="activityData.Owner">{{ activityData.Owner?.name }}</td>
              </tr>
              <tr>
                <td class="items">นายก/ประธานชมรม:</td>
                <td class="p-4" v-if="activityData.allProgress">{{ activityData.allProgress[1]?.staffName }}</td>
              </tr>
              <tr>
                <td class="items">อาจารย์ที่ปรึกษา/รองคณบดี:</td>
                <td class="p-4" v-if="activityData.allProgress">{{ activityData.allProgress[0]?.staffName }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="lable">
          <div class="items whitespace-nowrap">
            การเทียบค่ากิจกรรมตามคุณลักษณะที่พึงประสงค์ของมหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี (KMUTT Student
            QF)<span class="text-red-500 ml-1">*</span></div>
          <table class="table-auto w-auto border-collapse border border-white whitespace-nowrap mx-10 my-3">
            <tbody>
              <tr v-for="(studentQF, index) in activityData.studentQF" :key="index" class="hover:bg-gray-50">
                <td class="border border-white pl-4 py-3"> {{ index + 1 }}. </td>
                <td class="border border-white px-4 "> {{ studentQF.name }} </td>
                <td class="border border-white pl-14 "> จำนวน </td>
                <td class="border border-white px-6 text-center">{{ studentQF.percentage }}</td>
                <td class="border border-white px-2 text-center">%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="py-3 lable">
          <div class="items pb-1">ความสอดคล้องกับเป้าหมายของมหาวิทยาลัย</div>
          <div class="lable">
            <span class="items">Entrepreneurial:</span>
            <table class="table-auto border-collapse border w-20%  border-gray-300 mb-3 ml-3">
              <tbody>
                <tr v-for="(entrepreneurial, index) in selectedEntrepreneurial" :key="index">
                  <td class="border border-white px-4 py-3">&#x2611; {{ entrepreneurial.entrepreneurialName.join(', ')
                  }} <br>
                    <div class="pt-2 pl-7 text-sm">{{selectedEntrepreneurial.map(e => e.description).join(' ')}}</div>
                  </td>
                </tr>
              </tbody>
            </table>

          </div>

          <!-- Sustainability and Goals -->
          <div class="lable">
            <span class="items">Sustainability:</span>
            <ul class="list-disc pl-6 text-gray-700">
              <!-- SDGs Culture -->
              <table class="table-auto border-collapse border w-80% border-white mb-8 ml-2">
                <tbody>
                  <!-- SDGs Culture -->
                  <tr v-if="(activityData.sustainability || []).some(item => item.sustainability === 'SDGs Culture')">
                    <td class="border border-white pt-3" colspan="2">
                      &#x2611;<span class="font-bold"> SDGs Culture</span>
                      <div class="mt-2 ml-7">
                        <!-- แสดงคำอธิบายของ SDGs Culture -->
                        {{ sustainabilityDescriptions['SDGs Culture'] }}
                      </div>
                      <div v-for="(goal, index) in (activityData.sustainability || [])
                        .filter(item => item.sustainability === 'SDGs Culture')
                        .map(item => item.goal)" :key="index">
                        <div class="border border-white px-16 py-3">&#x2611; {{ goal }}</div>
                      </div>
                    </td>
                  </tr>

                  <!-- Other Sustainability Items -->
                  <tr v-for="(item, index) in (activityData.sustainability || [])
                    .filter(item => item.sustainability !== 'SDGs Culture')" :key="index">
                    <td class="border border-white pt-3">
                      &#x2611; <span class="font-bold"> {{ item.sustainability }}</span>
                      <div class="mt-2 ml-7">
                        <!-- แสดงคำอธิบายของ Other Sustainability -->
                        {{ sustainabilityDescriptions[item.sustainability] || 'ไม่มีคำอธิบาย' }}
                      </div>
                    </td>
                    <td class="border border-white px-4 py-3"></td>
                  </tr>
                </tbody>
              </table>
            </ul>
          </div>
        </div>


        <div class="lable pb-4 col-span-2">
          <label class="block items">หลักการและเหตุผล:</label>
          <div class=" w-full ml-8 underline underline-offset-2 mt-2" rows="4" readonly>{{ activityData.sustainabilityDetail }}</div>
        </div>

        <div class="lable pb-4">
          <span class="items">วัตถุประสงค์:</span>
          <ul>
            <li v-for="(item, index) in sustainabilityProposeArray" :key="index" class="ml-10 my-3">
              {{ item }}
            </li>
          </ul>
        </div>


        <div class="lable  pb-4">
          <span class="items">ผู้เข้าร่วมโครงการ:</span>
          <table class="table-sub ml-4">
            <tbody>
              <tr v-for="(participant, index) in activityData.participant" :key="index" class="hover:bg-gray-100">
                <td class="border font-medium border-white pl-6 pr-2 py-3"> {{ index + 1 }}. </td>
                <td class="border font-medium border-white  py-2 whitespace-nowrap"> {{ participant.participantName }}
                </td>
                <td class="border border-white px-7 "> จำนวน</td>
                <td class="border  border-white px-2">{{ participant.count }}</td>
                <td class="border border-white px-6 "> คน</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="lable col-span-2  pb-4">
          <label class="items">ลักษณะกิจกรรม:</label>
          <div class=" w-full ml-8 mt-2 underline underline-offset-2" rows="4" readonly>{{ activityData.activityCharacteristic }}</div>
        </div>

        <div class="lable  pb-4 col-span-2">
          <label class="items whitespace-nowrap ">ลักษณะกิจกรรมที่จัดขึ้นสอดคล้องกับหลักเกียรติและศักดิ์ของนักศึกษา(Code
            of Honor)
            ดังนี้:</label>
          <div class=" w-full ml-8 mt-2 underline underline-offset-2" rows="4" readonly>{{ activityData.codeOfHonor }}</div>
        </div>

        <div class="lable  pb-4">
          <span class="items  pr-2">ระยะเวลาเตรียมงาน:</span> {{ activityData.prepareStart }}<span class="items px-4">ถึงวันที่</span>  {{
            activityData.prepareEnd }}
        </div>
        <div class="lable  pb-4">
          <span class="items pr-2">ระยะเวลาปฏิบัติงาน:</span> {{ activityData.startTime }}<span class="items px-4"> ถึงวันที่ </span>{{ activityData.endTime
          }}
        </div>

        <div class="lable  pb-4">
          <h2 class="items">ขั้นตอนการดำเนินงาน:</h2>
          <table class="w-auto border-collapse border border-white mx-4">
            <tbody>
              <tr v-for="(file, index) in [activityData.scheduleDetails]" :key="index">
                <td class="px-4 py-2">ไฟล์ขั้นตอนการดำเนินงาน:</td>
                <td class="px-4 py-2">
                  <a href="#"
                    @click="downloadFileFromBase64(activityData.scheduleDetails, 'application/pdf')"
                    class="text-orange-500 underline underline-offset-2">
                    Click to open file in new tab.
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="lable  pb-4">
          <label class="font-bold ">คณะกรรมการจัดโครงการ:</label>
          <table class="table mx-4 my-4 w-90% text-sm">
            <thead class="bg-gray-100  whitespace-nowrap">
              <tr>
                <th class="border border-gray-300 px-4 py-2 text-center">ที่</th>
                <th class="px-4 py-2 text-center border border-gray-300">รหัสนักศึกษา</th>
                <th class="border border-gray-300 px-4 py-2 text-center ">ชื่อ - นามสกุล</th>
                <th class="px-4 py-2 text-center border border-gray-300">ภาควิชา/ชั้นปี</th>
                <th class="px-4 pt-2 text-center whitespace-nowrap border border-gray-300">หมายเลขโทรศัพท์
                </th>
                <th class="px-4 py-2 text-center whitespace-nowrap border border-gray-300">ตำแหน่ง</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(committee, index) in activityData.committee" :key="index" class="hover:bg-gray-100 text-sm">
                <td class="border border-gray-300 px-4 py-2 text-center">{{ index + 1 }}</td>
                <td class="border border-gray-300 px-4 py-2">{{ committee.studentID }}</td>
                <td class="border border-gray-300 px-4 py-2 whitespace-nowrap">{{ committee.name }}</td>
                <td class="border border-gray-300 px-4 py-2 whitespace-nowrap">{{ committee.departmentName }} ชั้นปีที่
                  {{ committee.year }}</td>
                <td class="border border-gray-300 px-4 py-2">{{ committee.tel }}</td>
                <td class="border border-gray-300 px-4 py-2 whitespace-nowrap">{{ committee.position }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="lable  ">
          <span class="items">รูปแบบการประเมินผล:</span>
          <ul class="list-none pl-6 text-gray-700 ml-4 my-2">
            <li v-for="(evaluation, index) in (activityData.evaluation)" :key="index" class="py-1">
              <span class="px-2">&#x2611;</span> {{ evaluation.evaluation == "Other" ? evaluation.otherEvaluation :
                evaluation.evaluation }}
            </li>

          </ul>
        </div>

        <div class="lable  pb-4">
          <h2 class="items">รายละเอียดรูปแบบการประเมินผล:</h2>
          <table class="w-auto border-collapse border border-white mx-4">
            <tbody>
              <tr v-for="(file, index) in [activityData.evaluationFile]" :key="index">
                <td class="px-4 py-2">ไฟล์รูปแบบการประเมินผล:</td>
                <td class="px-4 py-2">
                  <a href="#"
                    @click="downloadFileFromBase64(activityData.evaluationFile, 'application/pdf')"
                    class="text-orange-500 underline">
                    Click to open file in new tab.
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="lable  pb-4">
          <span class="items">ผลที่คาดว่าจะได้รับ:</span>
          <table class="table mx-8 my-4">
            <thead class="bg-gray-100">
              <tr>
                <th class="border border-gray-300 px-4 py-2 text-center">ข้อที่</th>
                <th class="border border-gray-300 px-4 py-2 text-center">ผลที่คาดว่าจะได้รับ</th>
                <th class="border border-gray-300 px-4 py-2 text-center">ตัวชี้วัด (KPI)</th>
                <th class="border border-gray-300 px-4 py-2 text-center">ค่าเป้าหมาย (%)</th>

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

        </div>
        <div class="lable">
          <div v-if="activityData.problem?.some(p => p.problemDetail || p.solution)" class="mb-6">
            <label
              class="items whitespace-nowrap ">ผลการดำเนินงานที่ผ่านมาและการนำผลการประเมินโครงการ/กิจกรรมมาปรับปรุงในการจัดโครงการครั้งนี้:</label>
            <table class="table mx-8 my-4">
              <thead class="bg-gray-100">
                <tr>
                  <th class="border border-gray-300 px-4 py-2 text-center">ข้อที่</th>
                  <th class="border border-gray-300 px-4 py-2 text-center">ปัญหาอุปสรรค</th>
                  <th class="border border-gray-300 px-4 py-2 text-center">แนวทางการแก้ไข</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(problem, index) in activityData.problem" :key="index" class="hover:bg-gray-100">
                  <td class="border border-gray-300 px-4 py-2 text-center">{{ index + 1 }}</td>
                  <td class="border border-gray-300 px-4 py-2">{{ problem.problemDetail }}</td>
                  <td class="border border-gray-300 px-4 py-2">{{ problem.solution }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="lable  pb-4">
          <h2 class="items mb-2">รายละเอียดงบประมาณ</h2>
          <table class="w-auto border-collapse border border-white mx-4">
            <tbody>
              <tr v-for="(file, index) in [activityData.evaluationFile]" :key="index">
                <td class="px-4 py-2">ไฟล์รายละเอียดงบประมาณ:</td>
                <td class="px-4 py-2">
                  <a href="#" @click="downloadFileFromBase64(activityData.budgetDetails, 'application/pdf')"
                    class="text-orange-500 underline">
                    Click to open file in new tab.
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="lable  pb-10">
          <h2 class="items mb-4">ไฟล์เพิ่มเติม</h2>
          <table class="w-auto border-collapse border border-white mx-4">
            <tbody>
              <tr v-for="(file, index) in [activityData.prepareFile]" :key="index">
                <td class="px-4 py-2">ไฟล์เพิ่มเติม:</td>
                <td class="px-4 py-2">
                  <a href="#" @click="downloadFileFromBase64(activityData.prepareFile, 'application/pdf')"
                    class="text-orange-500 underline">
                    Click to open file in new tab.
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="border-t border-gray-300 my-9"></div>

      <div class="lable">
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
              <td class="border border-gray-300 px-4 py-2 w-[25%]">{{ step.staffName }}</td>
              <td class="border border-gray-300 px-4 py-2 text-left w-[40%]">{{ step.staffRole }}</td>
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
  font-size: 1.5rem;
  /* text-xl */
  font-weight: 700;
  /* font-bold */
  color: #0c82ea;
  /* text-orange-600 */
  margin: 2.5rem 0 1.5rem 0;
  /* mb-4 */
}

.lable {
  /* mb-6 mx-2 */
  margin: 1rem 2rem 2rem;
}
.sublable {
  /* mb-6 mx-2 */
  margin: 1rem 2rem 2rem;
}

.items {
  font-weight: 700;
  font-size: 1.1rem;
  margin-right: 0.15rem;
  margin-bottom: 0.5rem;
}

.no-style {
  all: unset;
  /* เอาทุกๆ สไตล์ออก */
  font-weight: 500;
  /* สามารถเพิ่มสไตล์ที่ต้องการที่นี่ */
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
