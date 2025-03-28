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
const objectives = ref(['', '', '']);

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

onMounted(async () => {
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
    participantData.value.map(item => ({ ...item, count: 0 }));
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
    const allowedExtensions = ["pdf"];
    const fileExtension = file.name.split(".").pop().toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      alert("กรุณาอัปโหลดไฟล์ PDF เท่านั้น");
      e.target.value = "";
      throw new Error("ไฟล์ที่อัปโหลดต้องเป็น .pdf เท่านั้น");
    }

    const base64 = await fileToBase64(file);
    switch (fileType) {
      case "prepareFile":
        prepareFile.value = base64;
        break;
      case "evaluationFile":
        evaluationFile.value = base64;
        break;
      case "budgetDetails":
        budgetDetails.value = base64;
        break;
      case "scheduleDetails":
        scheduleDetails.value = base64;
        break;
      default:
        console.error("Unknown file type");
    }
  }
};

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
const scheduleDetails = ref(null);
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

    let totalPercentage = Object.values(percentages.value).reduce((sum, val) => sum + (val || 0), 0);
    if (totalPercentage !== 100) {
      alert("StudentQF เปอร์เซ็นต์รวมกันต้องครบ 100%");
      throw new Error("StudentQF เปอร์เซ็นต์รวมกันต้องครบ 100%");
    }

    const hasPresident = committee.value.some(member => member.position === "ประธานโครงการ");
    if (!hasPresident) {
      alert("คณะกรรมการจัดโครงการต้องมีประธานโครงการอย่างน้อย 1 คน");
      throw new Error("คณะกรรมการจัดโครงการต้องมีประธานโครงการอย่างน้อย 1 คน");
    }

    if (objectives.value.some(obj => obj.trim() === '')) {
      alert("กรุณากรอกวัตถุประสงค์ให้ครบทุกข้อ");
      throw new Error("กรุณากรอกวัตถุประสงค์ให้ครบทุกข้อ");
    }

    const uniqueObjectives = new Set(objectives.value.map(obj => obj.trim()));
    if (uniqueObjectives.size !== objectives.value.length) {
      alert("วัตถุประสงค์ต้องไม่ซ้ำกัน");
      throw new Error("วัตถุประสงค์ต้องไม่ซ้ำกัน");
    }

    if (!validateProjectNames()) {
      alert("กรอกชื่อโครงการให้ถูกต้อง");
      throw new Error("กรอกชื่อโครงการให้ถูกต้อง");
    }

    if (agencyCode.value.trim().length === 0) {
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

const thaiRegex = /^[\u0E00-\u0E7F\s]+$/;
const engRegex = /^[A-Za-z\s]+$/;

const isThaiValid = computed(() => projectNameThai.value === "" || thaiRegex.test(projectNameThai.value));
const isEngValid = computed(() => projectNameEng.value === "" || engRegex.test(projectNameEng.value));

const validateProjectNames = () => {
  const thaiRegex = /^[\u0E00-\u0E7F\s]+$/;
  const engRegex = /^[A-Za-z\s]+$/;

  const cleanThaiName = projectNameThai.value ? projectNameThai.value.trim() : "";
  const cleanEngName = projectNameEng.value ? projectNameEng.value.trim() : "";

  if (!thaiRegex.test(cleanThaiName)) {
    alert("ชื่อโครงการ (ภาษาไทย) ต้องเป็นภาษาไทยเท่านั้น");
    return false;
  }

  if (!engRegex.test(cleanEngName)) {
    alert("ชื่อโครงการ (ภาษาอังกฤษ) ต้องเป็นภาษาอังกฤษเท่านั้น");
    return false;
  }

  return true;
};

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
    <div class="bg-white p-6 rounded-lg shadow-lg w-[1000px] ">
      <h1 class="text-3xl font-extrabold mb-4 text-center text-blue-500">Add Activity Document</h1>

      <form @submit.prevent="addDoc">
        <div class="grid grid-cols-2 gap-4 lable ">
          <!-- <div class="flex items-center gap-2">
            <label for="agencyCode" class="text-gray-700">ที่<span class="text-red-500 ml-1">*</span></label>
            <input type="text" v-model="prefix" class="form-input w-24 text-left" placeholder="รหัสหน่วยงาน" required />
            <span class="text-gray-700 font-bold">มจธ.</span>
            <input type="text" v-model="suffix" class="form-input w-24 text-left" placeholder="ปีที่เบิกงบ" required />
          </div> -->
          <div class="w-full mt-6">
            <table class="w-[900px] border border-white border-spacing-2">
              <tbody>
                <!-- ที่ -->
                <tr class="border border-white">
                  <td class="p-3 border border-white w-1/2">
                    <label for="agencyCode" class="block item">
                      ที่<span class="text-red-500 ml-1">*</span>
                      <a class="text-gray-400 text-sm ml-3 whitespace-nowrap">ตัวอย่าง: สนทศ.มจธ. 1/2567</a>
                    </label>
                    <div class="flex items-center gap-2">
                      <input type="text" v-model="prefix" class="form-input form-input-text text-left"
                        placeholder="รหัสหน่วยงาน" required />
                      <span class="text-gray-700 font-bold">มจธ.</span>
                      <input type="text" v-model="suffix" class="form-input form-input-text text-left"
                        placeholder="ลำดับเอกสาร" required />
                    </div>
                  </td>
                  <!-- ชื่อหน่วยงาน -->
                  <td class="p-3 border border-white">
                    <label for="agencyName" class="block item">ชื่อหน่วยงาน<span
                        class="text-red-500 ml-1">*</span></label>

                    <select id="agencyName" v-model="agencyName" class="form-input form-input-text w-full" required>
                      <option value=""> เลือกหน่วยงาน </option>
                      <option v-for="(agency, index) in filteredAgencies" :key="index" :value="agency">
                        {{ agency }}
                      </option>
                    </select>
                  </td>
                </tr>


                <!-- ชื่อโครงการ (ไทย) -->
                <tr class="border border-white">
                  <td class="p-3 border border-white">
                    <label class="block item">ชื่อโครงการ (ภาษาไทย)<span class="text-red-500 ml-1">*</span></label>

                    <input type="text" v-model="projectNameThai" class="form-input form-input-text w-full" required
                      minlength="5" placeholder="ชื่อโครงการ" />
                    <p v-if="!isThaiValid" class="text-red-500 text-sm">ต้องเป็นภาษาไทยเท่านั้น</p>
                  </td>
                  <!-- ชื่อโครงการ (อังกฤษ) -->
                  <td class="p-3 border border-white">
                    <label class="block item">ชื่อโครงการ (ภาษาอังกฤษ)<span class="text-red-500 ml-1">*</span></label>

                    <input type="text" v-model="projectNameEng" class="form-input form-input-text w-full" required
                      minlength="5" placeholder="Project Name" />
                    <p v-if="!isEngValid" class="text-red-500 text-sm">ต้องเป็นภาษาอังกฤษเท่านั้น</p>
                  </td>
                </tr>

                <!-- เนื่องด้วย -->
                <tr class="border border-white">
                  <td class="p-3 border border-white">
                    <label for="reason" class="block item">เนื่องด้วย</label>
                    <input type="text" id="reason" :value="reason" class="form-input form-input-text w-full" disabled />
                  </td>
                  <td class="p-3 border border-white">
                    <label for="reason" class="block item">จัดโครงการ</label>
                    <input type="text" id="organizeProject" :value="getProjectName"
                      class="form-input form-input-text w-full" disabled />
                  </td>
                </tr>

                <!-- วันที่จัดกิจกรรม -->
                <tr class="border border-white">
                  <td class="p-3 border border-white">
                    <label for="startDate" class="block item">ระหว่างวันที่<span
                        class="text-red-500 ml-1">*</span></label>

                    <input type="date" id="startDate" v-model="startDate" class="form-input input-date w-full"
                      :min="today" required />
                  </td>

                  <td class="p-3 border border-white">
                    <label for="endDate" class="block item">ถึงวันที่<span class="text-red-500 ml-1">*</span></label>

                    <input type="date" id="endDate" v-model="endDate" class="form-input input-date w-full"
                      :min="startDate" required />
                  </td>
                </tr>

                <!-- ณ สถานที่ -->
                <tr class="border border-white">
                  <td class="p-3 border border-white">
                    <label for="location" class="block item">ณ สถานที่<span class="text-red-500 ml-1">*</span></label>
                    <input type="text" id="location" v-model="location" class="form-input form-input-text w-full"
                      minlength="10" placeholder="ชื่อสถานที่/อาคาร, ชั้น/ห้อง" required />
                  </td>

                  <td class="p-3 border border-white">
                    <label for="type" class="block item">รูปแบบการจัดกิจกรรม<span
                        class="text-red-500 ml-1">*</span></label>
                    <select id="type" v-model="type" class="form-input form-input-text w-full mt-2" required>
                      <option value="">เลือกรูปแบบที่ตรงกับกิจกรรม</option>
                      <option v-for="option in typeOptions" :key="option" :value="option">
                        {{ option }}
                      </option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>


          <!-- วัตถุประสงค์ -->
          <div class="col-span-2 lable">
            <label for="purpose" class="block item">วัตถุประสงค์โดยภาพรวม<span
                class="text-red-500 ml-1">*</span></label>
            <textarea id="purpose" v-model="purpose" class="form-input  w-80%" rows="4" required minlength="20"
              placeholder="ภาพรวมของวัตถุประสงค์ในการดำเนินโครงการ"></textarea>
          </div>

          <!-- ค่าใช้จ่าย -->
          <div class=" flex gr-col text-left lable">
            <label for="expenses" class="item whitespace-nowrap" style="width: 85px;">ค่าใช้จ่าย<span
                class=" text-red-500">*</span></label>

            <table class="w-full border border-white rounded-lg whitespace-nowrap ml-5">
              <tbody> <!-- Wrap the <tr> inside <tbody> -->
                <tr>
                  <td class="p-2 border  border-white">เป็นจำนวนเงิน</td>
                  <td class="p-2 border border-white">
                    <input type="number" id="expenses" v-model.number="expenses" class="form-input w-40 mr-1 text-right"
                      required :max="9999999" maxlength="7" @input="limitExpensesLength"
                      style="width: auto; min-width: 150px; max-width: 100px;" />
                  </td>

                  <td class="p-2 border  border-white">บาท</td>
                  <td class="p-2 border w-auto 0  border-white">( {{ expensesThaiText }}<span>ถ้วน )</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mb-3 mt-4">

          </div>

          <!-- เลือกชั่วโมงกิจกรรม -->
          <div class="lable">
            <label for="activityHours" class="block item">การเทียบค่าชั่วโมงกิจกรรม<span
                class="text-red-500 ml-1">*</span></label>
            <select id="activityHours" v-model="isHourCount" class="form-input form-input-text ml-3"
              @change="handleActivityHoursChange" required>
              <option value="">รูปแบบการนับชั่วโมงกิจกรรม</option>
              <option :value="false">ไม่นับชั่วโมง</option>
              <option :value="true">นับชั่วโมง</option>
            </select>
          </div>
          <br>
          <!-- แสดงรายการกิจกรรม และช่องกรอกชั่วโมง ถ้า isHourCount เป็น true -->
        </div>

        <div class="lable ">
          <div class="grid grid-cols-3 gap-4 text-center ">
            <!-- อาจารย์ที่ปรึกษา/รองคณบดี -->
            <div>
              <label for="advisor" class="block item ">อาจารย์ที่ปรึกษา/รองคณบดี<span
                  class="text-red-500 ml-1">*</span></label>
              <select id="advisor" v-model="advisor" class="form-input form-input-role" required
                @change="selectAdvisor">
                <option value="" disabled>เลือกอาจารย์ที่ปรึกษา/รองคณบดี</option>
                <option v-for="advisor in advisorList" :key="advisor.staffId" :value="advisor.staffId">
                  {{ advisor.fullName }}
                </option>
              </select>
            </div>

            <!-- นายก/ประธานชมรม -->
            <div>
              <label for="president" class="block item">นายก/ประธานชมรม<span class="text-red-500 ml-1">*</span></label>
              <select id="president" v-model="president" class="form-input form-input-role" required
                @change="selectPresident">
                <option value="" disabled>เลือกนายก/ประธานชมรม</option>
                <option v-for="president in presidentList" :key="president.staffId" :value="president.staffId">
                  {{ president.fullName }}
                </option>
              </select>
            </div>

            <!-- นักศึกษาผู้รับผิดชอบ -->
            <div>
              <label for="responsibleStudent" class=" item">นักศึกษาผู้รับผิดชอบ</label>
              <input type="text" id="responsibleStudent" :value="responsibleStudent" class="form-input" disabled />
            </div>

            <!-- ประธานฝ่าย -->
            <div>
              <label for="departmentPresident" class="block item">ประธานฝ่าย<span
                  class="text-red-500 ml-1">*</span></label>
              <select id="departmentPresident" v-model="departmentPresident" class="form-input form-input-role"
                required>
                <option value="" disabled>เลือกประธานฝ่าย</option>
                <option v-for="departmentPresident in departmentPresidentList" :key="departmentPresident.staffId"
                  :value="departmentPresident.staffId">
                  {{ departmentPresident.fullName }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <div class="lable">
          <div class="ml-10 mb-10">
            <div class="mb-8">
              <label for="activityHours" class="block item">ประเภทโครงการกิจกรรม</label>
              <div v-if="isHourCount === true">
                <div class="text-left text-sm text-gray-600 mt-3 ml-3">เลือกประเภทโครงการกิจกรรมที่สอดคล้องกับโครงการ
                  เพียง 1 ด้าน</div>
                <hr>
                <table class="table-auto w-auto border-collapse border border-gray-300 my-3">
                  <tbody>
                    <tr v-for="activity in activityData" :key="activity.activityID" class="hover:bg-gray-50">
                      <td class="border border-white pl-8 px-4 pb-1 whitespace-nowrap">{{ activity.activityName }}</td>
                      <td class="border border-white whitespace-nowrap ">จำนวน</td>
                      <td class="border border-white text-right py-1">
                        <input type="number" :id="'hours-' + activity.activityID"
                          v-model="hoursCount[activity.activityID]" class="form-input px-10 w-24 text-right"
                          style="width: 70px;" />
                      </td>
                      <td class="border border-white whitespace-nowrap px-4 py-2">หน่วยชั่วโมง</td>
                    </tr>
                  </tbody>
                </table>

              </div>

              <div v-if="isHourCount === false">
                <hr>
                <table class="table-auto w-auto border-collapse border border-gray-300 my-3">
                  <tbody>
                    <tr v-for="activity in activityData" :key="activity.activityID" class="hover:bg-gray-50">
                      <td class="border border-white pl-8 px-4  whitespace-nowrap">{{ activity.activityName }}</td>
                      <td class="border border-white whitespace-nowrap ">จำนวน</td>

                      <td class="border border-white px-4">
                        <input type="text" :id="'hours-' + activity.activityID"
                          v-model="hoursCount[activity.activityID]" class="form-input px-10 w-24 text-right"
                          style="width: 70px;" disabled />
                      </td>
                      <td class="border border-white whitespace-nowrap px-4 py-2">หน่วยชั่วโมง</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- เลือกทักษะ StudentQF (checkbox) -->
            <div class="mb-8">
              <div class="mb-8">
                <div class="item">KMUTT Student QF<span class="text-red-500 ml-1">*</span></div>
                <div class=" text-sm text-gray-600 ml-2">
                  ทักษะที่ต้องการส่งเสริมในการจัดโครงการ เลือกได้สูงสุดเพียง 3 ด้าน และในสัดส่วนที่ต่างกัน</div>
                <hr>
                <div v-for="skill in studentQFList" :key="skill.studentQF_ID" class="my-3 mx-7 px-4 pb-1">
                  <input type="checkbox" :id="'skill-' + skill.studentQF_ID" :value="skill.studentQF_ID"
                    v-model="selectedSkills"
                    :disabled="selectedSkills.length >= 3 && !selectedSkills.includes(skill.studentQF_ID)" />
                  <label :for="'skill-' + skill.studentQF_ID">{{ skill.studentQF_Name }}</label>
                </div>
                <p v-if="selectedSkills.length >= 3" class="text-red-500 mt-1">
                  คุณเลือกทักษะครบแล้ว (สูงสุด 3 ทักษะ)
                </p>
              </div>

              <!-- แสดงทักษะที่เลือก และกำหนดเปอร์เซ็นต์ -->
              <div v-if="selectedSkills.length > 0" class="mt-4">
                <div class="item">ทักษะที่เลือกและกำหนดเปอร์เซ็นต์:<span class="text-red-500 ml-1">*</span></div>
                <ul class="inline-list">
                  <li v-for="(skillID, index) in selectedSkills" :key="skillID" class="flex  pl-4  items-center mb-2">
                    <span class="mr-2 whitespace-nowrap">{{ getSkillName(skillID) }} :</span>

                    <input type="number" v-model.number="percentages[skillID]" min="1" max="100"
                      class="form-input form-input-text ml-2 w-20 border p-1 rounded" placeholder="%"
                      @input="validatePercentage" />
                  </li>
                </ul>
                <p v-if="!isPercentageValid" class="text-red-500 mt-1">
                  เปอร์เซ็นต์ทั้งหมดต้องรวมกันเป็น 100%
                </p>
              </div>
            </div>
            <!-- Entrepreneurial -->
            <div class=" mb-10">
              <div class="item">Entrepreneurial<span class="text-red-500 ml-1">*</span></div>
              <div>
                <div class="text-left text-sm text-gray-600 mt-3 ml-3">
                  เลือกเฉพาะหัวข้อที่เกี่ยวข้องกับกิจกรรมอย่างน้อย
                  1 ด้าน
                </div>
                <hr>
                <div v-for="option in entrepreneurialWithDescriptions" :key="option.entrepreneurialID"
                  class="my-3 mx-7 px-4 pb-1">
                  <input type="checkbox" :id="'entrepreneurial-' + option.entrepreneurialID"
                    :value="option.entrepreneurialID" v-model="selectedEntrepreneurialOptions" />
                  <label :for="'entrepreneurial-' + option.entrepreneurialID">
                    {{ option.entrepreneurialName }}
                  </label>
                  <p class="text-gray-600 text-sm mt-1 ml-8">{{ option.description }}</p>
                </div>
              </div>
            </div>

            <!-- Sustainability -->
            <div class=" mb-10">
              <div class="item">Sustainability<span class="text-red-500 ml-1">*</span></div>
              <div>
                <div class="text-left text-sm text-gray-600 mt-3 ml-3"> เลือกเฉพาะหัวข้อที่เกี่ยวข้องกับกิจกรรม
                </div>
                <hr>
                <!-- SDGs Culture (ตัวเลือกที่ 1) -->
                <div class="my-4 mx-7 px-4 pb-1">
                  <input type="checkbox" id="sustainability-1" :value="1" v-model="selectedSustainabilityOptions" />
                  <label for="sustainability-1">SDGs Culture</label>
                  <p class="text-gray-600 text-base mt-1 ml-20 mr-5">
                    ส่งเสริมให้เกิดวัฒนธรรมของความยั่งยืน คือ มีแนวคิดของความยั่งยืนตาม SDGs Goal 17
                    อยู่ในทุกกระบวนการของการทำกิจกรรม สอดคล้องกับด้านใด โปรดระบุอย่างน้อย 1 ด้าน
                  </p>

                  <!-- แสดง Goals ที่เกี่ยวข้อง ถ้าเลือก SDGs Culture -->

                  <div v-if="selectedSustainabilityOptions.includes(1)" class="mt-2">
                    <div class="text-left text-sm text-cyan-600 my-4 ml-12"> เลือก Goals
                      ที่เกี่ยวข้องกับกิจกรรม<span class="text-red-500 ml-1">*</span>
                    </div>
                    <!-- Grid 4 คอลัมน์ -->
                    <div class="grid grid-cols-2 gap-4 ml-14">
                      <div v-for="goal in goalData" :key="goal.goalID" class="flex items-center">
                        <input type="checkbox" :id="'goal-' + goal.goalID" :value="goal.goalID" v-model="selectedGoals"
                          class="mr-2 " />
                        <p class="text-sm whitespace-nowrap">{{ goal.goalID }}. {{ goal.goalName }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- ตัวเลือกที่ 2-4 -->
              <div v-for="option in sustainabilityWithDescriptions.filter(opt => opt.sustainabilityID !== 1)"
                :key="option.sustainabilityID" class="my-4 mx-7 px-4 pb-1">
                <input type="checkbox" :id="'sustainability-' + option.sustainabilityID"
                  :value="option.sustainabilityID" v-model="selectedSustainabilityOptions" />
                <label :for="'sustainability-' + option.sustainabilityID">
                  {{ option.sustainabilityName }}
                </label>
                <p class="text-gray-600 text-base mt-1 ml-20 mr-5">{{ option.description }}</p>
              </div>
            </div>

            <!-- หลักการและเหตุผล -->
            <div class=" mb-10">

              <label for="sustainabilityDetail" class="block item">หลักการและเหตุผล<span
                  class="text-red-500 ml-1">*</span>
                <span class="text-left text-sm text-gray-600 ml-3"> (เขียนไม่น้อยกว่า ½ หน้ากระดาษ A4)
                </span>
              </label>
              <textarea id="sustainabilityDetail" v-model="sustainabilityDetail" class="form-textarea w-full h-32"
                placeholder="กรอกหลักการและเหตุผล" :minlength="10"></textarea>
            </div>

            <!-- วัตถุประสงค์ -->
            <div class=" mb-10">
              <label class="block item">วัตถุประสงค์</label>
              <div v-for="(objective, index) in objectives" :key="index" class="flex items-center ml-14 mb-2">
                <span class="mr-2 w-6 text-right">{{ index + 1 }}.<span class="text-red-500 ml-1">*</span></span>
                <input type="text" v-model="objectives[index]" class="form-input flex-1"
                  placeholder="กรอกวัตถุประสงค์" />
              </div>
            </div>

            <!-- ผู้เข้าร่วมโครงการ -->
            <div class=" mb-10">
              <label class="block item">ผู้เข้าร่วมโครงการ</label>
              <div v-for="participant in participantData" :key="participant.participantID"
                class="flex items-center ml-14 mb-2">
                <label
                  v-if="participant.participantName === 'Student' || participant.participantName === 'Staff' || participant.participantName === 'Teacher'"
                  class="w-48">
                  {{ participant.participantName }} จำนวน:<span class="text-red-500 ml-1">*</span></label>
                <label v-else class="w-48">{{ participant.participantName }} จำนวน:</label>
                <input type="number" v-model="participant.count" class="form-input w-20 mr-6 text-right"
                  style="width: 10%;" min="0" :value="participant.count || 0" />
                <span>คน</span>
              </div>
            </div>

            <!-- ลักษณะกิจกรรม (activityCharacteristic) -->
            <div class=" mb-6">
              <label for="activityCharacteristic" class="block item">ลักษณะกิจกรรม<span
                  class="text-red-500 ml-1">*</span>
                <div class="text-left text-sm text-gray-600 mt-3 ml-3">เขียนบรรยายรูปแบบการจัดกิจกรรม
                  ให้เห็นภาพการจัดกิจกรรม
                </div>
                <hr>
              </label>
              <textarea id="activityCharacteristic" v-model="activityCharacteristic" class="form-textarea w-full h-32"
                placeholder="เขียนบรรยายรูปแบบการจัดกิจกรรม ให้เห็นภาพการจัดกิจกรรม" :minlength="10"></textarea>
            </div>

            <!-- Code of Honor -->
            <div class=" mb-6">
              <label for="codeOfHonor"
                class="block item">ลักษณะกิจกรรมที่จัดขึ้นสอดคล้องกับหลักเกียรติและศักดิ์ของนักศึกษา
                (Code
                of
                Honor) ดังนี้<span class="text-red-500 ml-1">*</span>
                <span class="text-left text-sm text-gray-600 ml-3">(อธิบาย)
                </span>

              </label>
              <textarea id="codeOfHonor" v-model="codeOfHonor" class="form-textarea w-full h-22"
                placeholder="อธิบายความสอดคล้องของลักษณะกิจกรรมกับ Code of Honor" :minlength="10"></textarea>
            </div>

            <!-- ระยะเวลาดำเนินงาน -->
            <div class=" mb-6">
              <!-- ระยะเวลาเตรียมงาน -->
              <div class="my-4">
                <label class="block item">ระยะเวลาเตรียมงาน:</label>
                <div class="flex items-center ml-4">
                  <label class="w-40">เริ่มต้น:<span class="text-red-500 ml-1">*</span></label>
                  <input type="date" v-model="prepareStart" class="form-input w-20" style="width: 60%;" />
                  <label class="w-40 ml-4">สิ้นสุด:<span class="text-red-500 ml-1">*</span></label>
                  <input type="date" v-model="prepareEnd" class="form-input w-20" style="width: 60%;" />
                </div>
                <!-- ใส่ระยะเวลาปฏิบัติงาน แบบที่ดึงตรงวันที่ด้านบนมาแสดงด้วยน่าจะดีกว่า -->
              </div>
            </div>

            <!-- ขั้นตอนการดำเนินงาน -->
            <div class="mb-8">
              <label for="scheduleDetails" class="block item">ขั้นตอนการดำเนินงาน<span
                  class="text-red-500 ml-1">*</span></label>
              <div class="my-2 ml-4">
                <div class="text-left text-sm text-gray-600 mt-3 ml-3"> อัปโหลดไฟล์ขั้นตอนการดำเนินงาน
                </div>
                <hr>
                <input id="scheduleDetails" type="file" @change="handleFileChange($event, 'scheduleDetails')"
                  class="form-input mt-4" />
              </div>
            </div>

            <!-- คณะกรรมการจัดโครงการ -->
            <div class="mb-8">
              <div class=" mb-4">
                <label class="block item">คณะกรรมการจัดโครงการ<span class="text-red-500 ml-1">*</span></label>

                <!-- Dropdown สำหรับเลือกชื่อ -->
                <div class="mb-4 ml-4">
                  <div class="text-left text-sm text-gray-600 mt-3 ml-3"> เลือกชื่อสมาชิกจากรายการ
                  </div>
                  <hr>
                  <!--  -->
                  <select id="select-student" v-model="selectedStudent" class=" form-input form-input-select">
                    <option value="" disabled>รายชื่อ</option>
                    <option v-for="student in students" :key="student.id" :value="student.id">
                      {{ student.name }}
                    </option>
                  </select>
                  <button @click="addCommitteeMember" :disabled="!selectedStudent"
                    class="bg-green-500 text-white px-6 py-2 my-4 mx-4 rounded">
                    เพิ่มคณะกรรมการ
                  </button>
                </div>
              </div>
              <!-- แสดงรายการคณะกรรมการ -->
              <div v-for="(member, index) in committee" :key="member.id"
                class="mx-2 mb-4 flex items-center justify-between border-b pb-6">
                <table class="min-w-full table-auto border-collapse border  border-gray-400 ">
                  <thead class="text-sm border border-gray-400 ">
                    <tr>
                      <th class="px-4 pt-2 text-center">ที่</th>
                      <th class="px-4 py-2 text-center border border-gray-400">รหัสนักศึกษา</th>
                      <th class="px-4 py-2 text-center">ชื่อ - นามสกุล</th>
                      <th class="px-4 py-2 text-center border border-gray-400">ภาควิชา/ชั้นปี</th>
                      <th class="px-4 pt-2 text-center whitespace-nowrap border border-gray-400">หมายเลขโทรศัพท์ </th>
                      <th class="px-4 py-2 text-center whitespace-nowrap">ตำแหน่ง(ในโครงการ)</th>
                    </tr>
                  </thead>
                  <tbody class="text-sm">
                    <tr v-for="(member, index) in committee" :key="member.id">
                      <td class="px-4 ">{{ index + 1 }}</td>
                      <td class="px-4  text-center border border-gray-400">{{ member.id }}</td>
                      <td class="px-4  text-center whitespace-nowrap">{{ member.name }}</td>
                      <td class="px-4 text-center whitespace-nowrap border border-gray-400">{{ member.department }}</td>
                      <td class="px-4 text-center border border-gray-400">{{ member.phone }}</td>

                      <!-- Dropdown ตำแหน่ง -->
                      <td class="px-4 pt-3">
                        <select v-model="member.position" class="form-input text-xs w-36">
                          <option value="" disabled selected>เลือกตำแหน่ง</option>
                          <option v-for="position in positions" :key="position" :value="position">
                            {{ position }}
                          </option>
                        </select>
                      </td>

                      <!-- ปุ่มลบ -->
                      <td class=" ">
                        <button type="button" @click="removeCommitteeMember(index)"
                          class="bg-red-500 text-white px-3 py-1 rounded text-md">
                          ลบ
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <!-- รูปแบบการประเมินผล -->
            <div class="mb-10">
              <label class="block item">รูปแบบการประเมินผล<span class="text-red-500 ml-1">*</span></label>
              <!-- <div class="my-2 ml-4">
                <div class="text-left text-sm text-gray-600 mt-3 ml-3"> เลือกได้สูงสุดเพียง 1 รูปแบบ
                </div>
              </div>

              <hr> -->
              <!-- รายการตัวเลือก -->
              <div v-for="(option, key) in evaluationData" :key="key" class="my-3 mx-7 px-4 pb-1">
                <input type="checkbox" :id="option.evaluationID" :value="option.evaluationID"
                  v-model="selectedEvaluation" :disabled="selectedSkills.length >= 1" />
                <label :for="option.evaluationID">{{ option.evaluationName }}</label>
              </div>
            </div>
            <p v-if="selectedSkills.length >= 1" class="text-red-500 mt-2">
              คุณได้เลือกรูปแบบการประเมินแล้ว
            </p>
            <!-- ช่องอัพโหลดไฟล์ตัวอย่างการประเมินผล -->
            <div class="mb-8">
              <label for="evaluationFile" class="block item">อัปโหลดไฟล์ตัวอย่างการประเมินผล<span
                  class="text-red-500 ml-1">*</span></label>
              <input id="evaluationFile" type="file" @change="handleFileChange($event, 'evaluationFile')"
                class="form-input" />
            </div>

            <!-- ผลที่คาดว่าจะได้รับ -->
            <div class="mb-8">
              <label class="block item">ผลที่คาดว่าจะได้รับ<span class="text-red-500 ml-1">*</span>
                <div class="text-left text-sm text-gray-600 mt-3 ml-3">
                  (การกำหนดผลที่คาดว่าจะได้รับหลังจากการดำเนินกิจกรรมต้องสอดคล้องกับวัตถุประสงค์ของโครงการ
                  และต้องมีการกำหนดตัวชี้วัดด้วย)</div>
                <hr>
              </label>

              <div v-for="(expectedResult, index) in expectedResults" :key="index"
                class="flex items-center gap-4 ml-4 mt-4 my-2 ">
                <!-- ผลที่คาดว่าจะได้รับ -->
                <div class="flex-1">
                  <label :for="'expected-' + index" class="block mb-1 text-center">ผลที่คาดว่าจะได้รับข้อที่ {{ index +
                    1
                  }}<span class="text-red-500 ml-1">*</span></label>
                  <input type="text" :id="'expected-' + index" v-model="expectedResults[index].result"
                    class="form-input form-input-text w-full" placeholder="ผลที่คาดว่าจะได้รับ" :minlength="10" />
                </div>

                <!-- ตัวชี้วัด (KPI) -->
                <div class="flex-1">
                  <label :for="'kpi-' + index" class="block mb-1 text-center">ตัวชี้วัด (KPI)<span
                      class="text-red-500 ml-1">*</span></label>
                  <input type="text" :id="'kpi-' + index" v-model="expectedResults[index].kpi"
                    class="form-input form-input-text w-full" placeholder="KPI" :minlength="10" />
                </div>

                <!-- ค่าเป้าหมาย -->
                <div class="flex-1">
                  <label :for="'target-' + index" class="block mb-1 whitespace-nowrap text-center">ค่าเป้าหมาย (%)<span
                      class="text-red-500 ml-1">*</span></label>
                  <input type="number" min="0" max="100" :id="'target-' + index" v-model="expectedResults[index].target"
                    class="form-input form-input-text w-full" placeholder="ค่าเป้าหมาย"
                    @input="validateTarget($event, index)" />
                </div>
              </div>
            </div>

            <!-- ผลการดำเนินงานที่ผ่านมา -->
            <div class="mb-8">
              <label class="block item">
                ผลการดำเนินงานที่ผ่านมาและการนำผลการประเมินโครงการ/กิจกรรมมาปรับปรุงในการจัดโครงการครั้งนี้
                <div class="text-left text-sm text-gray-600 mt-3 ml-3">(กรณีเป็นโครงการต่อเนื่อง)
                </div>
                <hr>
              </label>

              <div v-for="(item, index) in pastEvaluations" :key="index" class="flex items-center gap-4 ml-4 mb-4">
                <!-- ปัญหาอุปสรรค -->
                <div class="flex items-center gap-2  ml-4 mt-3 my-2 ">
                  <label :for="'problem-' + index" class="w-40">ปัญหาข้อที่ {{ index + 1 }}:</label>
                  <input :id="'problem-' + index" v-model="item.problem" type="text"
                    class="form-input form-input-text w-90" placeholder="กรอกปัญหาอุปสรรค" />
                </div>

                <!-- แนวทางการแก้ไข -->
                <div class="flex items-center gap-2">
                  <label :for="'solution-' + index" class="w-60">แนวทางข้อที่ {{ index + 1 }}:</label>
                  <input :id="'solution-' + index" v-model="item.solution" type="text"
                    class="form-input form-input-text w-90" placeholder="กรอกแนวทางการแก้ไข" />
                </div>
              </div>
            </div>

            <!-- รายละเอียดงบประมาณ -->
            <div class="mb-6">
              <label for="budgetDetails" class="block item">รายละเอียดงบประมาณ<span
                  class="text-red-500 ml-1">*</span></label>
              <input id="budgetDetails" type="file" @change="handleFileChange($event, 'budgetDetails')"
                class="form-input form-input-text" />
            </div>

            <!-- อัพโหลดไฟล์เพิ่มเติม -->
            <div class="mb-6">
              <label for="prepareFile" class="block item">อัปโหลดไฟล์เพิ่มเติม<span class="text-red-500 ml-1">*</span>
                <span class="text-left text-sm text-gray-600 ml-3">(เช่น
                  ตารางกำหนดการจัดกิจกรรม ฯลฯ)
                </span>
              </label>


              <input id="prepareFile" type="file" @change="handleFileChange($event, 'prepareFile')"
                class="form-input form-input-text" />
            </div>
          </div>
        </div>

        <div class="parent-container">
          <button type="submit" class="form-button"> Sent Activity Document
          </button>
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
  margin: 1.5rem 1.5rem 2rem;
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

/* ทำให้ parent container เป็น flex เพื่อจัดกลางปุ่ม */
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