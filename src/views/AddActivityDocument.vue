<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { addActivityDocument } from '../functions/addActivityDocument'
import { fetchAllStaff } from '../functions/fetchAllStaff';
import { fetchAllStudent } from '../functions/fetchAllStudent';
import { fetchAllGoal } from '../functions/fetchAllGoal';
import { fetchAllStudentQF } from '../functions/fetchAllStudentQF';
import { fetchAllEvaluation } from '../functions/fetchAllEvaluation';
import { fetchAllParticipant } from '../functions/fetchAllParticipant';
import { fetchAllActivity } from '../functions/fetchAllActivity';
import { fetchAllEntrepreneurial } from '../functions/fetchAllEntrepreneurial';
import { fetchAllSustainability } from '../functions/fetchAllSustainability';
import { fetchAllFaculty } from '../functions/fetchAllFaculty';

import { useRouter } from "vue-router";
const router = useRouter()

const writtenDate = ref('');
const agencyName = ref('');
const reason = computed(() => agencyName.value);
// const organizeProject = computed(() => projectName.value);
const responsibleStudent = localStorage.getItem("firstName") + " " + localStorage.getItem("lastName")

const rawStaffData = ref([]);
const advisorList = ref([]);
const presidentList = ref([]);
const departmentPresidentList = ref([]);

const studentQFList = ref([]);
const objectives = ref(['','','']);

const students = ref([]);
const selectedStudent = ref(''); // ตัวแปรสำหรับเก็บนักเรียนที่เลือก
const committee = ref([]); // รายการคณะกรรมการ

const goalData = ref([]);
const evaluationData = ref([]);

const selectedEvaluation = ref([]);

const participantData = ref([]);
const participant = computed(() => {
  return participantData.value
    .filter(item => item.count > 0)
    .map(item => [item.participantID, item.count]);
});

// กำหนดตัวแปรเพื่อเก็บข้อมูลกิจกรรมที่ดึงจาก backend
const activityData = ref([]);
const hoursCount = ref({});
const isHourCount = ref(false);

const entrepreneurialData = ref([]);
const sustainabilityData = ref([]);

const facultyData = ref([]);

const filteredAgencies = computed(() => {
  const facultyFromAPI = facultyData.value
    .filter(fac => fac.facultyID === 6 || fac.facultyID === 5) // เลือกเฉพาะที่ facultyID = 6 หรือ 5
    .map(fac => fac.facultyName); // เอาเฉพาะ facultyName
  const facultyFromLocal = localStorage.getItem("faculty") || "";
  const clubFromLocal = localStorage.getItem("club") || "";

  return [...facultyFromAPI, facultyFromLocal, clubFromLocal].filter(Boolean);
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
  } else if (type === "approve") {
    successMessage.value = "Approve Successfully!";
  } else if (type === "reject") {
    showCommentPopup.value = false
    successMessage.value = "Reject Successfully!";
  }
  showSuccessPopup.value = true;
};
const redirectToTracking = () => {
  showSuccessPopup.value = false;
  router.push("/tracking");
};

onMounted(async() => {
  writtenDate.value = new Date().toISOString().split('T')[0];
  try {
    studentQFList.value = await fetchAllStudentQF();
    rawStaffData.value = await fetchAllStaff();
    advisorList.value = rawStaffData.value
      .filter(staff => ['Advisor', 'Deputy Dean'].includes(staff[10])) // กรองเฉพาะ Advisor และ Deputy Dean
      .map(staff => ({
        staffId: staff[0],
        fullName: `${staff[2]} ${staff[3]}`,
    }));

    presidentList.value = rawStaffData.value
      .filter(staff => staff[10] === 'Prime Minister') // กรองเฉพาะ Prime Minister
      .map(staff => ({
        staffId: staff[0],
        fullName: `${staff[2]} ${staff[3]}`,
    }));

    departmentPresidentList.value = rawStaffData.value
      .filter((staff) => staff[10].includes('ประธานฝ่าย'))
      .map((staff) => ({
        staffId: staff[0],
        fullName: `${staff[2]} ${staff[3]}`,
    }));

    const studentData = await fetchAllStudent();
    students.value = studentData.map(([id, name, department, year, phone]) => ({
      id,
      name,
      department: `${department} ปี${year}`,
      phone,
      position: "",
    }));
    goalData.value = await fetchAllGoal();
    evaluationData.value = await fetchAllEvaluation();
    participantData.value = await fetchAllParticipant();
    participantData.value.map(item => ({...item, count: 0 }));
    activityData.value = await fetchAllActivity();
    activityData.value.forEach(activity => { 
      hoursCount.value[activity.activityID] = 0;  
    });
    entrepreneurialData.value = await fetchAllEntrepreneurial();
    sustainabilityData.value = await fetchAllSustainability();
    facultyData.value = await fetchAllFaculty();


  } catch (error) {
    console.error('Error fetching staff:', error);
  }
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

// ใช้ computed เพื่อเพิ่มคำอธิบายให้ entrepreneurialData
const entrepreneurialWithDescriptions = computed(() => {
  return entrepreneurialData.value.map((item) => ({
    ...item,
    description: entrepreneurialDescriptions[item.entrepreneurialName] || "",
  }));
});

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

// ใช้ computed เพื่อเพิ่มคำอธิบายให้ sustainabilityData
const sustainabilityWithDescriptions = computed(() => {
  return sustainabilityData.value.map((item) => ({
    ...item,
    description: sustainabilityDescriptions[item.sustainabilityName] || "",
  }));
});

const handleActivityHoursChange = () => {
  if (isHourCount.value) {
  } else {
  }
};

// ฟังก์ชันจำกัดจำนวนหลักของตัวเลข
const limitExpensesLength = () => {
  if (expenses.value.toString().length > 7) {
    expenses.value = parseInt(expenses.value.toString().slice(0, 7));
  }
};
// ฟังก์ชันแปลงตัวเลขเป็นข้อความภาษาไทย
const convertNumberToThaiText = (num) => {
  const units = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];
  const numbers = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  
  if (isNaN(num) || num === 0) return 'ศูนย์บาท';

  let bahtText = '';
  const numStr = num.toString();
  const len = numStr.length;

  for (let i = 0; i < len; i++) {
    const digit = parseInt(numStr[i]);
    const position = len - i - 1;

    if (digit !== 0) {
      if (position === 1 && digit === 1) {
        bahtText += 'สิบ';
      } else if (position === 1 && digit === 2) {
        bahtText += 'ยี่สิบ';
      } else if (position === 0 && digit === 1 && len > 1) {
        bahtText += 'เอ็ด';
      } else {
        bahtText += numbers[digit] + units[position];
      }
    }
  }

  return bahtText + 'บาท';
};

// คำนวณข้อความภาษาไทยของค่าใช้จ่าย
const expensesThaiText = computed(() => {
  return convertNumberToThaiText(expenses.value);
});

const selectedSkills = ref([]);
const selectedEntrepreneurialOptions = ref([]);
const selectedSustainabilityOptions = ref([]);
const selectedGoals = ref([]);

const addCommitteeMember = () => {
  const studentToAdd = students.value.find(student => student.id === selectedStudent.value);
  if (studentToAdd) {
    committee.value.push({ id: studentToAdd.id, name: studentToAdd.name, department: studentToAdd.department, phone: studentToAdd.phone, position: '' });
    selectedStudent.value = '';
  }
};

const removeCommitteeMember = (index) => {
  committee.value.splice(index, 1);
};

const otherDescription = ref('');

const uploadedFiles = reactive({});

const handleFileChange = async (e, fileType) => {
  const file = e.target.files[0];
  if (file) {
    const base64 = await fileToBase64(file);
    switch (fileType) {
      case 'prepareFile':
        prepareFile.value = base64;
        break;
      case 'evaluationFile':
        evaluationFile.value = base64;
        break;
      case 'budgetDetails':
        budgetDetails.value = base64;
        break;
      case 'scheduleDetails':
        scheduleDetails.value = base64;
        break;
      default:
        console.error('Unknown file type');
    }
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

const expectedResults = reactive([
  { result: '', kpi: '', target: '' },
  { result: '', kpi: '', target: '' },
  { result: '', kpi: '', target: '' },
]);


const pastEvaluations = reactive([
  { problem: '', solution: '' },
  { problem: '', solution: '' },
  { problem: '', solution: '' },
]);

// const budgetFileName = ref('');

const agencyCode = ref("");
const type = ref("");
const typeOptions = ["Workshop", "Volunteer", "Seminar"];
const startDate = ref("");
const endDate = ref("");
const projectName = ref("");
const location = ref("");
const purpose = ref("");
const expenses = ref(0);
const advisor = ref(""); // StaffID
const sustainabilityDetail = ref("")
const sustainabilityPropose = ref("")
const activityCharacteristic = ref("");
const codeOfHonor = ref("");
const prepareStart = ref("");
const prepareEnd = ref("");
const prepareFile = ref(null)
const evaluationFile = ref(null);
const budgetDetails = ref(null);
const scheduleDetails= ref(null);
const sustainability = ref([]);
const studentQF = ref([]);
const activity = ref([]);
const president = ref(""); // StaffIDProgress2
const departmentPresident = ref(""); //staffIDProgress3

const selectAdvisor = () => {
  const selectedAdvisor = advisorList.value.find(a => a.staffId === advisor.value);
  if (selectedAdvisor) {
    // console.log(`Advisor ที่เลือก: ${selectedAdvisor.fullName} (ID: ${selectedAdvisor.staffId})`);
  }
};

const selectPresident = () => {
  const selectPresident = presidentList.value.find(a => a.staffId === president.value);
  if (selectPresident) {
    // console.log(`President ที่เลือก: ${selectPresident.fullName} (ID: ${selectPresident.staffId})`);
  }
};

function convertToISOWithTimezone(dateString, time = "00:00:00") {
  try {
    let date;

    // Check if dateString is in the correct format (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      // If the dateString only contains the date, add the specified time
      date = new Date(`${dateString}T${time}`);
    } else {
      // Otherwise, parse the full date string and time
      date = new Date(dateString);
      if (isNaN(date)) {
        throw new Error(`Invalid dateString: "${dateString}".`);
      }

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      dateString = `${year}-${month}-${day}`;
      // Add the default time (09:00:00) to the date
      date = new Date(`${dateString}T${time}`);
    }

    if (isNaN(date)) {
      throw new Error("Invalid date or time value.");
    }

    // Return ISO string and manually remove milliseconds
    const isoString = date.toISOString();
    return isoString.replace(/\.\d{3}Z$/, ''); // Remove milliseconds and 'Z'
  } catch (error) {
    return `Error: ${error.message}`;
  }
}

const percentages = ref({}); // เก็บเปอร์เซ็นต์ของแต่ละทักษะ

// ฟังก์ชันเพื่อดึงชื่อทักษะจาก ID
const getSkillName = (id) => {
  const skill = studentQFList.value.find((s) => s.studentQF_ID === id);
  return skill ? skill.studentQF_Name : '';
};

// คำนวณว่าเปอร์เซ็นต์รวมกันได้ 100% หรือไม่
const isPercentageValid = computed(() => {
  const total = Object.values(percentages.value).reduce((sum, val) => sum + (val || 0), 0);
  return total === 100;
});

// ตรวจสอบและปรับค่าของเปอร์เซ็นต์
const validatePercentage = () => {
  let total = Object.values(percentages.value).reduce((sum, val) => sum + (val || 0), 0);
  if (total > 100) {
    alert('เปอร์เซ็นต์รวมกันต้องไม่เกิน 100%');
    Object.keys(percentages.value).forEach(skillID => {
      percentages.value[skillID] = 0;
    });
  }
};

const validateTarget = (event, index) => {
  let value = Number(event.target.value);
    if (value > 100) {
      expectedResults[index].target = 100;
    } else if (value < 0) {
      expectedResults[index].target = 0;
    }
};

const projectNameThai = ref("");
const projectNameEng = ref("");
const getProjectName = computed(() => 
  projectNameEng.value ? `${projectNameThai.value} (${projectNameEng.value})` : projectNameThai.value
);
const prefix = ref("");
const suffix = ref("");

const addDoc = async () => {
  try {
    const studentID = parseInt(localStorage.getItem("studentID"))
    projectName.value = `${projectNameThai.value} (${projectNameEng.value})`;
    sustainability.value = sustainabilityData.value
      .filter(item => selectedSustainabilityOptions.value.includes(item.sustainabilityID))
      .flatMap(item => {
        if (item.sustainabilityID === 1) {
          return selectedGoals.value.map(goalID => [item.sustainabilityID, goalID]);
        } else {
          return [[item.sustainabilityID, null]];
        }
      });

    activity.value = activityData.value.map(activity => {
        const hour = hoursCount.value[activity.activityID] || 0;
        return hour > 0 ? [activity.activityID, hour] : null;
      }).filter(Boolean);

    sustainabilityPropose.value = objectives.value.map((objective, index) => `${index + 1}${objective}`).join('');
    const startTime = convertToISOWithTimezone(startDate.value)
    const endTime = convertToISOWithTimezone(endDate.value)
    const prepareStart1 = convertToISOWithTimezone(prepareStart.value)
    const prepareEnd1 = convertToISOWithTimezone(prepareEnd.value)
    agencyCode.value = `${prefix.value}มจธ.${suffix.value}`;

    if (agencyCode.value.trim().length === 0){
      alert("กรุณากรอกรหัสหน่วยงาน");
      throw new Error("กรุณากรอกรหัสหน่วยงาน");
    } 
    else if (projectNameThai.value.trim().length === 0) {
      alert("กรุณากรอกชื่อโครงการภาษาไทย");
      throw new Error("กรุณากรอกชื่อโครงการภาษาไทย");
    } 
    else if (projectNameEng.value.trim().length === 0) {
      alert("กรุณากรอกชื่อโครงการภาษาอังกฤษ");
      throw new Error("กรุณากรอกชื่อโครงการภาษาอังกฤษ");
    }
    else if (location.value.trim().length === 0) {
      alert("กรุณากรอกสถานที่");
      throw new Error("กรุณากรอกสถานที่");
    }
    else if (purpose.value.trim().length === 0) {
      alert("กรุณากรอกวัตถุประสงค์");
      throw new Error("กรุณากรอกวัตถุประสงค์");
    }
    else if (sustainabilityDetail.value.trim().length === 0) {
      alert("กรุณากรอกหลักการและเหตุผล");
      throw new Error("กรุณากรอกหลักการและเหตุผล");
    }
    else if (activityCharacteristic.value.trim().length === 0) {
      alert("กรุณาเขียนบรรยายรูปแบบการจัดกิจกรรม");
      throw new Error("กรุณาเขียนบรรยายรูปแบบการจัดกิจกรรม");
    }
    else if (codeOfHonor.value.trim().length === 0) {
      alert("กรุณากรอกความสอดคล้องของลักษณะกิจกรรมกับ Code of Honor");
      throw new Error("กรุณากรอกความสอดคล้องของลักษณะกิจกรรมกับ Code of Honor");
    }



    const dataToSend = {
      studentID: studentID,
      type: type.value,
      startTime: startTime,
      endTime: endTime,
      code: agencyCode.value,
      departmentName: agencyName.value,
      title: projectName.value,
      location: location.value,
      propose: purpose.value,
      payment: expenses.value,
      staffID: advisor.value,
      sustainabilityDetail: sustainabilityDetail.value,
      sustainabilityPropose: sustainabilityPropose.value,
      activityCharacteristic: activityCharacteristic.value,
      codeOfHonor: codeOfHonor.value,
      prepareStart: prepareStart1,
      prepareEnd: prepareEnd1,
      prepareFile: prepareFile.value,
      evaluationFile: evaluationFile.value,
      budgetDetails: budgetDetails.value,
      scheduleDetails: scheduleDetails.value,
      participant: participant.value,
      activity: activity.value,
      problem: pastEvaluations.map(item => [item.problem, item.solution]),
      studentQF: selectedSkills.value.map((id) => [id, percentages.value[id] || 0]),
      entrepreneurial: selectedEntrepreneurialOptions.value,
      evaluation: selectedEvaluation.value.map(id => [id, null]),
      result: expectedResults.map(item => [item.kpi, item.result, String(item.target)]),
      sustainability: sustainability.value,
      committee: committee.value.map(member => [member.id, member.position]),
      staffIDProgress2: president.value,
      staffIDProgress3: departmentPresident.value,
    }
    console.log("Data to send:", dataToSend);
    const res = await addActivityDocument(dataToSend);
    if (res.status === 201) {
      showSuccess("add")
    }
  } catch (error) {
    console.error("Failed to add activity document:", error.message);
  }
};

const today = new Date().toISOString().split('T')[0];
// ป้องกัน endDate < startDate
watch(startDate, (newStart) => {
  if (endDate.value && newStart > endDate.value) {
    endDate.value > newStart;
  }
});

const positions = ref([
  "ประธานโครงการ",
  "รองประธานโครงการ",
  "เลขา",
  "เหรัญญิก",
  "ประชาสัมพันธ์",
  "คณะกรรมการ"
]);

</script>


<template>
  <div class="flex justify-center items-center min-h-screen bg-blue-50">
    <div class="bg-white p-6 rounded-lg shadow-lg w-[1100px]">
      <h1 class="text-2xl font-bold mb-4 text-center text-blue-500">Add Activity Document</h1>

      <form @submit.prevent="addDoc">
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div class="mb-3 flex items-center gap-4 mt-7">
            <div class="flex items-center gap-2">
              <label for="agencyCode" class="text-gray-700">ที่<span class="text-red-500 ml-1">*</span></label>
              <input 
                type="text" 
                v-model="prefix" 
                class="form-input w-24 text-left" 
                placeholder="รหัสหน่วยงาน"
                required
              />
              <span class="text-gray-700 font-bold">มจธ.</span>
              <input 
                type="text" 
                v-model="suffix" 
                class="form-input w-24 text-left" 
                placeholder="ปีที่เบิกงบ"
                required
              />
            </div>
            <p class="text-gray-500 text-sm mt-1">ตัวอย่าง: สนทศ.มจธ.1/2567</p>
          </div>

          <!-- กลุ่ม ชื่อหน่วยงาน + วันที่เขียน -->
          <div class="mb-3 flex items-center justify-between gap-4">
            <div class="flex-1">
              <label for="agencyName" class="block text-gray-700 mb-1">ชื่อหน่วยงาน<span class="text-red-500 ml-1">*</span></label>
              <select id="agencyName" v-model="agencyName" class="form-input w-full" required>
                <option value="">-- เลือกหน่วยงาน --</option>
                <option v-for="(agency, index) in filteredAgencies" :key="index" :value="agency">
                  {{ agency }}
                </option>
              </select>
            </div>

            <!-- วันที่เขียน -->
            <div class="flex items-center">
              <input 
                type="date" 
                id="writtenDate" 
                v-model="writtenDate" 
                class="form-input w-40 mt-9"
                width="100%"
                disabled
              />
            </div>
          </div>


          <!-- ชื่อโครงการ -->
          <div class="mb-3">
            <label class="block text-gray-700 mb-1">ชื่อโครงการ (ภาษาไทย)<span class="text-red-500 ml-1">*</span></label>
            <input 
              type="text" 
              v-model="projectNameThai" 
              class="form-input w-full" 
              required
              minlength="5"
            />
          </div>

          <div class="mb-3">
            <label class="block text-gray-700 mb-1">ชื่อโครงการ (ภาษาอังกฤษ)<span class="text-red-500 ml-1">*</span></label>
            <input 
              type="text" 
              v-model="projectNameEng" 
              class="form-input w-full" 
              required
              minlength="5"
            />
          </div>

          <!-- เนื่องด้วย -->
            <div class="mb-3">
                <label for="reason" class="block text-gray-700 mb-1">เนื่องด้วย</label>
                <input 
                type="text" 
                id="reason" 
                :value="reason" 
                class="form-input" 
                disabled
                />
            </div>

          <!-- จัดโครงการ -->
          <div class="mb-3">
            <label for="organizeProject" class="block text-gray-700 mb-1">จัดโครงการ</label>
            <input 
              type="text" 
              id="organizeProject" 
              :value="getProjectName"  
              class="form-input" 
              disabled
            />
          </div>

          <!-- วันที่จัดกิจกรรม -->
          <div class="mb-3 flex items-center">
            <label for="startDate" class="text-gray-700 mr-2">ระหว่างวันที่<span class="text-red-500 ml-1">*</span></label>
            <input 
              type="date" 
              id="startDate" 
              v-model="startDate" 
              class="form-input" 
              :min="today" 
              required
            />
          </div>

          <div class="mb-3 flex items-center">
            <label for="endDate" class="text-gray-700 mr-2">ถึงวันที่<span class="text-red-500 ml-1">*</span></label>
            <input 
              type="date" 
              id="endDate" 
              v-model="endDate" 
              class="form-input" 
              :min="startDate" 
              required
            />
          </div>

          <!-- ณ สถานที่ -->
          <div class="mb-3">
              <label for="location" class="block text-gray-700 mb-1">ณ สถานที่<span class="text-red-500 ml-1">*</span></label>
              <input 
              type="text" 
              id="location" 
              v-model="location" 
              class="form-input" 
              minlength="10"
              required
              />
          </div>

          <!-- ประเภทกิจกรรม -->
          <div class="mb-3">
            <label for="type" class="block text-gray-700 mb-1">ประเภทโครงการกิจกรรม<span class="text-red-500 ml-1">*</span></label>
            <select id="type" v-model="type" class="form-input" style="margin-top: 10px;" required>
              <option value="">เลือกประเภทที่ตรงกับกิจกรรม</option>
              <option v-for="option in typeOptions" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
          </div>

          <!-- วัตถุประสงค์ -->
          <div class="col-span-2">
              <label for="purpose" class="block text-gray-700 mb-1">วัตถุประสงค์<span class="text-red-500 ml-1">*</span></label>
              <textarea 
              id="purpose" 
              v-model="purpose"
              class="form-input detail-input w-full" 
              rows="4" 
              required
              minlength="20"
              ></textarea>
          </div>

          <!-- ค่าใช้จ่าย -->
          <div class="mb-3 flex items-center">
            <label for="expenses" class="text-gray-700 mr-2" style="width: 85px;">ค่าใช้จ่าย<span class="text-red-500">*</span></label>
            
            <div class="flex items-center">
              <input 
                type="number" 
                id="expenses" 
                v-model.number="expenses" 
                class="form-input w-40 mr-2 text-right" 
                required
                :max="9999999" 
                maxlength="7"
                @input="limitExpensesLength"
                style="width: 30%;"
              />
              <span class="text-gray-700 ml-2">บาท</span>
              <span class="text-gray-500">( {{ expensesThaiText }} )</span>
            </div>
          </div>

          <div class="mb-3 mt-4">
            
          </div>

          <!-- เลือกชั่วโมงกิจกรรม -->
          <div class="mb-3">
            <label for="activityHours" class="block text-gray-700 mb-1">ชั่วโมงกิจกรรม<span class="text-red-500 ml-1">*</span></label>
            <select
              id="activityHours"
              v-model="isHourCount"
              class="form-input"
              @change="handleActivityHoursChange"
              required
            >
              <option :value="false">ไม่นับชั่วโมง</option>
              <option :value="true">นับชั่วโมง</option>
            </select>
          </div>

          <!-- แสดงรายการกิจกรรม และช่องกรอกชั่วโมง ถ้า isHourCount เป็น true -->
          <div v-if="isHourCount === true">
            <div v-for="activity in activityData" :key="activity.activityID" class="mb-3 flex items-center gap-3">
              <label :for="'hours-' + activity.activityID" class="text-gray-700 w-60" style="width: 200%;">
                {{ activity.activityName }}
              </label> 
              <label class="text-gray-700">จำนวน</label>
              <input
                type="number"
                :id="'hours-' + activity.activityID"
                v-model="hoursCount[activity.activityID]"
                class="form-input w-24 text-right"
                style="width: 30%;"
              /> 
              <label class="text-gray-700">ชั่วโมง</label>
            </div>
          </div>


        </div>

        <div class="grid grid-cols-3 gap-4 items-center mb-10">
            <!-- อาจารย์ที่ปรึกษา/รองคณบดี -->
            <div>
              <label for="advisor" class="block text-gray-700 mb-1">อาจารย์ที่ปรึกษา/รองคณบดี<span class="text-red-500 ml-1">*</span></label>
              <select 
                  id="advisor" 
                  v-model="advisor" 
                  class="form-input" 
                  required
                  @change="selectAdvisor"
              >
                  <option value="" disabled>เลือกอาจารย์ที่ปรึกษา/รองคณบดี</option>
                  <option v-for="advisor in advisorList" :key="advisor.staffId" :value="advisor.staffId">
                    {{ advisor.fullName }}
                  </option>
              </select>
            </div>

            <!-- นายก/ประธานชมรม -->
            <div>
              <label for="president" class="block text-gray-700 mb-1">นายก/ประธานชมรม<span class="text-red-500 ml-1">*</span></label>
              <select 
                  id="president" 
                  v-model="president" 
                  class="form-input" 
                  required
                  @change="selectPresident"
              >
                  <option value="" disabled>เลือกนายก/ประธานชมรม</option>
                  <option v-for="president in presidentList" :key="president.staffId" :value="president.staffId">
                  {{ president.fullName }}
                  </option>
              </select>
            </div>

            <!-- นักศึกษาผู้รับผิดชอบ -->
            <div>
              <label for="responsibleStudent" class="block text-gray-700 mb-1">นักศึกษาผู้รับผิดชอบ</label>
              <input 
                  type="text" 
                  id="responsibleStudent" 
                  :value="responsibleStudent" 
                  class="form-input" 
                  disabled
              />
            </div>

            <!-- ประธานฝ่าย -->
            <div>
              <label for="departmentPresident" class="block text-gray-700 mb-1">ประธานฝ่าย<span class="text-red-500 ml-1">*</span></label>
              <select 
                  id="departmentPresident" 
                  v-model="departmentPresident" 
                  class="form-input" 
                  required
              >
                  <option value="" disabled>เลือกประธานฝ่าย</option>
                  <option v-for="departmentPresident in departmentPresidentList" :key="departmentPresident.staffId" :value="departmentPresident.staffId">
                  {{ departmentPresident.fullName }}
                  </option>
              </select>
            </div>

        </div>

        <!-- เลือกทักษะ StudentQF (checkbox) -->
        <div  class="mb-10">
          <h1>KMUTT Student QF<span class="text-red-500 ml-1">*</span></h1>
          <label class="block mb-2">เลือกทักษะ (สูงสุด 3 ทักษะ):</label>
          <div v-for="skill in studentQFList" :key="skill.studentQF_ID" class="mb-2">
            <input 
              type="checkbox" 
              :id="'skill-' + skill.studentQF_ID"
              :value="skill.studentQF_ID" 
              v-model="selectedSkills"
              :disabled="selectedSkills.length >= 3 && !selectedSkills.includes(skill.studentQF_ID)"
            />
            <label :for="'skill-' + skill.studentQF_ID">{{ skill.studentQF_Name }}</label>
          </div>
          <p v-if="selectedSkills.length >= 3" class="text-red-500 mt-2">
            คุณเลือกทักษะครบแล้ว (สูงสุด 3 ทักษะ)
          </p>
        </div>

        <!-- แสดงทักษะที่เลือก และกำหนดเปอร์เซ็นต์ -->
        <div v-if="selectedSkills.length > 0" class="mt-4">
          <h3>ทักษะที่เลือกและกำหนดเปอร์เซ็นต์:<span class="text-red-500 ml-1">*</span></h3>
          <ul class="inline-list">
            <li 
              v-for="(skillID, index) in selectedSkills" 
              :key="skillID" 
              class="flex items-center mb-2"
            >
              <span class="mr-2">{{ getSkillName(skillID) }}</span>

              <input 
                type="number" 
                v-model.number="percentages[skillID]" 
                min="0" 
                max="100" 
                class="form-input ml-2 w-20 border p-1 rounded"
                placeholder="%"
                @input="validatePercentage"
              />
            </li>
          </ul>
          <p v-if="!isPercentageValid" class="text-red-500 mt-2">
            เปอร์เซ็นต์ทั้งหมดต้องรวมกันเป็น 100%
          </p>
        </div>

        <!-- Entrepreneurial -->
        <div class="mb-10">
          <h1>Entrepreneurial<span class="text-red-500 ml-1">*</span></h1>
          <div>
            <label class="block mb-2 text-red">เลือกอย่างน้อย 1 ด้าน</label>
            <div v-for="option in entrepreneurialWithDescriptions" :key="option.entrepreneurialID" class="mb-2">
              <input 
                type="checkbox" 
                :id="'entrepreneurial-' + option.entrepreneurialID"
                :value="option.entrepreneurialID"
                v-model="selectedEntrepreneurialOptions" 
              />
              <label :for="'entrepreneurial-' + option.entrepreneurialID">
                {{ option.entrepreneurialName }}
              </label>
              <p class="text-gray-600 text-sm mt-1">{{ option.description }}</p>
            </div>
          </div>
        </div>

      <!-- Sustainability -->
      <div class="mb-10">
        <h1>Sustainability<span class="text-red-500 ml-1">*</span></h1>
        <div>
          <label class="block mb-2">กรุณาเลือกหัวข้อที่เกี่ยวข้องกับกิจกรรม:</label>

          <!-- SDGs Culture (ตัวเลือกที่ 1) -->
          <div class="mb-2">
            <input 
              type="checkbox" 
              id="sustainability-1"
              :value="1"
              v-model="selectedSustainabilityOptions" 
            />
            <label for="sustainability-1">SDGs Culture</label>
            <p class="text-gray-600 text-sm mt-1">
              ส่งเสริมให้เกิดวัฒนธรรมของความยั่งยืน คือ มีแนวคิดของความยั่งยืนตาม SDGs Goal 17 อยู่ในทุกกระบวนการของการทำกิจกรรม สอดคล้องกับด้านใด โปรดระบุอย่างน้อย 1 ด้าน
            </p>
            
            <!-- แสดง Goals ที่เกี่ยวข้อง ถ้าเลือก SDGs Culture -->
            <div v-if="selectedSustainabilityOptions.includes(1)" class="mt-2">
              <label class="block mb-2">เลือก Goals ที่เกี่ยวข้อง<span class="text-red-500 ml-1">*</span></label>
              
              <!-- Grid 4 คอลัมน์ -->
              <div class="grid grid-cols-4 gap-4">
                <div v-for="goal in goalData" :key="goal.goalID" class="flex items-center">
                  <input 
                    type="checkbox" 
                    :id="'goal-' + goal.goalID" 
                    :value="goal.goalID" 
                    v-model="selectedGoals"
                    class="mr-2"
                  />
                  <p class="text-sm">{{ goal.goalID }}. {{ goal.goalName }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- ตัวเลือกที่ 2-4 -->
          <div v-for="option in sustainabilityWithDescriptions.filter(opt => opt.sustainabilityID !== 1)" :key="option.sustainabilityID" class="mb-2">
            <input 
              type="checkbox" 
              :id="'sustainability-' + option.sustainabilityID"
              :value="option.sustainabilityID"
              v-model="selectedSustainabilityOptions" 
            />
            <label :for="'sustainability-' + option.sustainabilityID">
              {{ option.sustainabilityName }}
            </label>
            <p class="text-gray-600 text-sm mt-1">{{ option.description }}</p>
          </div>
        </div>
      </div>


      <!-- หลักการและเหตุผล -->
    <div class="mb-6">
      <label for="sustainabilityDetail" class="block text-gray-700 mb-2">หลักการและเหตุผล<span class="text-red-500 ml-1">*</span></label>
      <textarea 
        id="sustainabilityDetail" 
        v-model="sustainabilityDetail" 
        class="form-textarea w-full h-32" 
        placeholder="กรอกหลักการและเหตุผล"
        :minlength="10"
      ></textarea>
    </div>

    <!-- วัตถุประสงค์ -->
    <div class="mb-6">
      <label class="block text-gray-700 mb-2">วัตถุประสงค์<span class="text-red-500 ml-1">*</span></label>
      <div v-for="(objective, index) in objectives" :key="index" class="flex items-center mb-2">
        <span class="mr-2 w-6 text-right">{{ index + 1 }}.</span>
        <input 
          type="text" 
          v-model="objectives[index]" 
          class="form-input flex-1" 
          placeholder="กรอกวัตถุประสงค์"
        />
      </div>
    </div>

    <!-- ผู้เข้าร่วมโครงการ -->
    <div class="mb-6">
      <label class="block text-gray-700 mb-2">ผู้เข้าร่วมโครงการ<span class="text-red-500 ml-1">*</span></label>

      <div v-for="participant in participantData" :key="participant.participantID" class="flex items-center mb-2">
        <label class="w-48">{{ participant.participantName }} จำนวน:</label>
        <input 
          type="number" 
          v-model="participant.count"
          class="form-input w-20 mr-2 text-right"
          style="width: 10%;"
          min="0"
          :value="participant.count || 0"
        />
        <span>คน</span>
      </div>
    </div>
    
    <!-- ลักษณะกิจกรรม (activityCharacteristic) -->
    <div class="mb-6">
      <label for="activityCharacteristic" class="block text-gray-700 mb-2">ลักษณะกิจกรรม<span class="text-red-500 ml-1">*</span></label>
      <textarea 
        id="activityCharacteristic" 
        v-model="activityCharacteristic" 
        class="form-textarea w-full h-32" 
        placeholder="เขียนบรรยายรูปแบบการจัดกิจกรรม ให้เห็นภาพการจัดกิจกรรม"
        :minlength="10"
      ></textarea>
    </div>

    <!-- Code of Honor -->
    <div class="mb-6">
      <label for="codeOfHonor" class="block text-gray-700 mb-2">ลักษณะกิจกรรมที่จัดขึ้นสอดคล้องกับหลักเกียรติและศักดิ์ของนักศึกษา(Code of Honor) ดังนี้<span class="text-red-500 ml-1">*</span></label>
      <textarea 
        id="codeOfHonor" 
        v-model="codeOfHonor" 
        class="form-textarea w-full h-22" 
        placeholder="อธิบายความสอดคล้องของลักษณะกิจกรรมกับ Code of Honor"
        :minlength="10"
      ></textarea>
    </div>

    <!-- ระยะเวลาดำเนินงาน -->
    <div class="mb-6">
      <!-- ระยะเวลาเตรียมงาน -->
      <div class="mb-4">
        <label class="block text-gray-700 mb-2">ระยะเวลาเตรียมงาน:</label>
        <div class="flex items-center">
          <label class="w-40">เริ่มต้น:<span class="text-red-500 ml-1">*</span></label>
          <input 
            type="date" 
            v-model="prepareStart" 
            class="form-input w-20"
            style="width: 80%;"
          />
          <label class="w-40">สิ้นสุด:<span class="text-red-500 ml-1">*</span></label>
          <input 
            type="date" 
            v-model="prepareEnd" 
            class="form-input w-20"
            style="width: 80%;" 
          />
        </div>
      </div>
    </div>

    <!-- ขั้นตอนการดำเนินงาน -->
    <div class="mb-6">
      <label for="scheduleDetails" class="block text-gray-700 mb-2">ขั้นตอนการดำเนินงาน<span class="text-red-500 ml-1">*</span></label>
      <div class="mb-2">
        <label for="scheduleDetails">อัพโหลดไฟล์ขั้นตอนการดำเนินงาน:</label>
        <input 
          id="scheduleDetails" 
          type="file" 
          @change="handleFileChange($event, 'scheduleDetails')" 
          class="form-input mt-2"
        />
      </div>
    </div>

    <!-- คณะกรรมการจัดโครงการ -->
    <div class="mb-6">
    <label class="block text-gray-700 mb-2">คณะกรรมการจัดโครงการ<span class="text-red-500 ml-1">*</span></label>

    <!-- Dropdown สำหรับเลือกชื่อ -->
    <div class="mb-4">
      <label for="select-student" class="block mb-1">เลือกชื่อจากรายการ:</label>
      <select 
        id="select-student" 
        v-model="selectedStudent" 
        class="form-select w-60"
      >
        <option value="" disabled>รายชื่อ</option>
        <option v-for="student in students" :key="student.id" :value="student.id">
          {{ student.name }}
        </option>
      </select>
      <button 
        @click="addCommitteeMember" 
        :disabled="!selectedStudent" 
        class="bg-green-500 text-white px-4 py-2 ml-2 rounded"
      >
        เพิ่มคณะกรรมการ
      </button>
    </div>

    <!-- แสดงรายการคณะกรรมการ -->
    <div v-for="(member, index) in committee" :key="member.id" class="mb-4 flex items-center justify-between border-b pb-2">
      <div class="flex space-x-4 w-full">
        <span class="w-10">{{ index + 1 }}</span>
        <span class="w-32">{{ member.id }}</span>
        <span class="w-48">{{ member.name }}</span>
        <span class="w-48">{{ member.department }}</span>
        <span class="w-40">{{ member.phone }}</span>
  
        <!-- Dropdown ตำแหน่ง -->
        <select v-model="member.position" class="form-input w-36" style="width: 30%;">
          <option value="" disabled selected>เลือกตำแหน่ง</option>
          <option v-for="position in positions" :key="position" :value="position">
            {{ position }}
          </option>
        </select>
        
      </div>

      <!-- ปุ่มลบ -->
      <button 
        type="button" 
        @click="removeCommitteeMember(index)" 
        class="bg-red-500 text-white px-4 py-2 rounded mt-2 sm:mt-0"
      >
        ลบ
      </button>
    </div>


    <!-- รูปแบบการประเมินผล -->
    <div class="mb-6">
    <label class="block text-gray-700 mb-2">รูปแบบการประเมินผล<span class="text-red-500 ml-1">*</span></label>

    <!-- รายการตัวเลือก -->
    <div v-for="(option, key) in evaluationData" :key="key" class="mb-4">
      <input 
        type="checkbox" 
        :id="option.evaluationID" 
        :value="option.evaluationID" 
        v-model="selectedEvaluation" 
        class="mr-2"
      />
      <label :for="option.evaluationID">{{ option.evaluationName }}</label>
    </div>

    <!-- ช่องอัพโหลดไฟล์ตัวอย่างการประเมินผล -->
    <div class="mb-6">
      <label for="evaluationFile" class="block text-gray-700 mb-2">อัพโหลดไฟล์ตัวอย่างการประเมินผล<span class="text-red-500 ml-1">*</span></label>
      <input 
        id="evaluationFile" 
        type="file" 
        @change="handleFileChange($event, 'evaluationFile')" 
        class="form-input"
      />
    </div>

  <!-- ผลที่คาดว่าจะได้รับ -->
  <div class="mb-6">
    <label class="block text-gray-700 mb-2">ผลที่คาดว่าจะได้รับที่สอดคล้องกับวัตถุประสงค์</label>

    <div v-for="(expectedResult, index) in expectedResults" :key="index" class="flex items-center gap-4 mb-4">
      <!-- ผลที่คาดว่าจะได้รับ -->
      <div class="flex-1">
        <label :for="'expected-' + index" class="block mb-1">ผลที่คาดว่าจะได้รับข้อที่ {{ index + 1 }}<span class="text-red-500 ml-1">*</span></label>
        <input 
          type="text" 
          :id="'expected-' + index" 
          v-model="expectedResults[index].result" 
          class="form-input w-full"
          placeholder="ผลที่คาดว่าจะได้รับ"
          :minlength="10"
        />
      </div>

      <!-- ตัวชี้วัด (KPI) -->
      <div class="flex-1">
        <label :for="'kpi-' + index" class="block mb-1">ตัวชี้วัด (KPI)<span class="text-red-500 ml-1">*</span></label>
        <input 
          type="text" 
          :id="'kpi-' + index" 
          v-model="expectedResults[index].kpi" 
          class="form-input w-full"
          placeholder="KPI"
          :minlength="10"
        />
      </div>

      <!-- ค่าเป้าหมาย -->
      <div class="flex-1">
        <label :for="'target-' + index" class="block mb-1 whitespace-nowrap">ค่าเป้าหมาย (%)<span class="text-red-500 ml-1">*</span></label>
        <input 
          type="number" 
          min="0"
          max="100"
          :id="'target-' + index" 
          v-model="expectedResults[index].target"
          class="form-input w-full"
          placeholder="ค่าเป้าหมาย"
          @input="validateTarget($event, index)"
        />
      </div>
    </div>
  </div>

  <!-- ผลการดำเนินงานที่ผ่านมา -->
  <div class="mb-6">
    <label class="block text-gray-700 mb-2">
      ผลการดำเนินงานที่ผ่านมาและการนำผลการประเมินโครงการ/กิจกรรมมาปรับปรุงในการจัดโครงการครั้งนี้
    </label>

    <div v-for="(item, index) in pastEvaluations" :key="index" class="flex items-center gap-4 mb-4">
      <!-- ปัญหาอุปสรรค -->
      <div class="flex items-center gap-2">
        <label :for="'problem-' + index" class="w-40">ปัญหาข้อที่ {{ index + 1 }}:</label>
        <input 
          :id="'problem-' + index" 
          v-model="item.problem" 
          type="text" 
          class="form-input w-90" 
          placeholder="กรอกปัญหาอุปสรรค"
        />
      </div>

      <!-- แนวทางการแก้ไข -->
      <div class="flex items-center gap-2">
        <label :for="'solution-' + index" class="w-60">แนวทางข้อที่ {{ index + 1 }}:</label>
        <input 
          :id="'solution-' + index" 
          v-model="item.solution" 
          type="text" 
          class="form-input w-90" 
          placeholder="กรอกแนวทางการแก้ไข"
        />
      </div>
    </div>
  </div>

  <!-- รายละเอียดงบประมาณ -->
  <div class="mb-6">
    <label for="budgetDetails" class="block text-gray-700 mb-2">รายละเอียดงบประมาณ<span class="text-red-500 ml-1">*</span></label>
    <input 
      id="budgetDetails" 
      type="file" 
      @change="handleFileChange($event, 'budgetDetails')" 
      class="form-input"
    />
  </div>

  <!-- อัพโหลดไฟล์เพิ่มเติม -->
  <div class="mb-6">
    <label for="prepareFile" class="block text-gray-700 mb-2">อัปโหลดไฟล์เพิ่มเติม (เช่น ตารางกำหนดการจัดกิจกรรม ฯลฯ)<span class="text-red-500 ml-1">*</span></label>
    <input 
      id="prepareFile" 
      type="file" 
      @change="handleFileChange($event, 'prepareFile')" 
      class="form-input"
    />
  </div>
    
  </div>
  </div>

  <button 
    type="submit" 
    class="form-button"
  >
    Sent Activity Document
  </button>
</form>

<div 
  v-if="showSuccessPopup"
  class="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
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
.form-input {
  border: 1px solid #ccc;
  padding: 0.5rem;
  border-radius: 4px;
}

.form-textarea {
  border: 1px solid #ccc;
  padding: 0.5rem;
  border-radius: 4px;
  resize: vertical;
}

.inline-list {
  list-style: none; /* เอา bullet points ออก */
  padding: 0;
  margin: 0;
  display: flex; /* ใช้ flex เพื่อให้รายการอยู่ในบรรทัดเดียวกัน */
  gap: 0.5rem; /* ระยะห่างระหว่างแต่ละรายการ */
}

.inline-list li {
  display: inline; /* ทำให้ li แสดงผลแบบ inline */
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