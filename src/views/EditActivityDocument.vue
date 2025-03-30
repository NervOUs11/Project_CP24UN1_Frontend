<script setup>
import { ref, reactive, computed, onMounted, toRaw, watch } from 'vue';
import { editActivityDocument } from '../functions/editActivityDocument'
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
import { fetchActivityDocument } from '../functions/fetchActivityDocument.js';

import { useRouter } from "vue-router";
const router = useRouter();
import { useRoute } from "vue-router";
const route = useRoute();

const documentId = ref("")
const docId = route.params.id;
const writtenDate = ref('');
const agencyName = ref('');
const reason = computed(() => agencyName.value);

const organizeProject = computed(() => projectName.value);
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

const activityData = ref([]);
const hoursCount = ref({});
const isHourCount = ref(false);

const entrepreneurialData = ref([]);
const sustainabilityData = ref([]);

const facultyData = ref([]);

const filteredAgencies = computed(() => {
  const facultyFromAPI = facultyData.value
    .filter(fac => fac.facultyID === 6 || fac.facultyID === 5)
    .map(fac => fac.facultyName);
  const facultyFromLocal = localStorage.getItem("faculty") || "";
  const clubFromLocal = localStorage.getItem("club") || "";

  return [...facultyFromAPI, facultyFromLocal, clubFromLocal].filter(Boolean);
});

const formatDate = (datetime) => {
  return datetime ? new Date(datetime).toISOString().split("T")[0] : "";
};

const isBase64 = (str) => {
  return /^[A-Za-z0-9+/=]+$/.test(str);
};

const openFileInNewTab = async (base64String, mimeType) => {
  // ตรวจสอบว่า base64String เป็น Promise หรือไม่
  if (base64String instanceof Promise) {
    base64String = await base64String;  // รอให้ Promise เสร็จ
  }
  console.log(base64String);  // ตรวจสอบค่าหลังจาก await

  if (!base64String) {
    return;
  }

  let base64Data = base64String;
  if (base64String.startsWith('data:')) {
    base64Data = base64String.split(',')[1];
  }

  if (!isBase64(base64Data)) {
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
    console.error('Error decoding Base64:', error);
  }
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
  showSuccessPopup.value = true;
};
const redirectToTracking = () => {
  showSuccessPopup.value = false;
  router.push("/tracking");
};
const projectNameThai = ref("");
const projectNameEng = ref("");
const prefix = ref("");
const suffix = ref("");

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

    const allParticipants = await fetchAllParticipant();

    activity.value = await fetchAllActivity();

    entrepreneurialData.value = await fetchAllEntrepreneurial();
    sustainabilityData.value = await fetchAllSustainability();
    facultyData.value = await fetchAllFaculty();
    activityData.value = await fetchActivityDocument(docId, userid, role)
    if (activityData.value) {
      documentId.value = activityData.value.DocumentID;
      agencyCode.value = activityData.value.code;
      const parts = agencyCode.value.split(".");
      if (parts.length === 3) {
        prefix.value = parts[0] + ".";
        suffix.value = parts[2];
      }
      writtenDate.value = formatDate(activityData.value.createDate);
      agencyName.value = activityData.value.departmentName;
      projectName.value = activityData.value.title;
      startDate.value = formatDate(activityData.value.startTime)
      endDate.value = formatDate(activityData.value.endTime)
      location.value = activityData.value.location;
      type.value = activityData.value.type;
      purpose.value = activityData.value.propose;
      expenses.value = activityData.value.payment;
      advisor.value = activityData.value.allProgress[0].staffID;
      president.value = activityData.value.allProgress[1].staffID;
      departmentPresident.value = activityData.value.allProgress[2].staffID;

      projectNameThai.value = activityData.value.title.replace(/\(.*?\)/g, "").trim();
      const match = activityData.value.title.match(/\((.*?)\)/);
      projectNameEng.value = match ? match[1] : "";

      // file base64
      scheduleDetails.value = activityData.value.scheduleDetails;
      budgetDetails.value = activityData.value.budgetDetails;
      evaluationFile.value = activityData.value.evaluationFile;
      prepareFile.value = activityData.value.prepareFile;

      console.log(activityData.value.activity);

      if (activityData.value.activity.length > 0) {
        isHourCount.value = true;
        hoursCount.value = activityData.value.activity.reduce((acc, activity) => {
          acc[activity.activityName] = activity.countHour ?? 0;
          return acc;
        }, {});
      }

      activity.value = activityData.value.activity.map(item => ({
        ...item,
        countHour: item.countHour ?? 0
      }));

      // ผู้เข้าร่วมโครงการ
      const activityParticipants = activityData.value.participant;
      participantData.value = allParticipants.map((participant) => {
        const matchedParticipant = activityParticipants.find(
          (p) => p.participantName === participant.participantName
        );
        return {
          ...participant,
          count: matchedParticipant ? matchedParticipant.count : 0,
        };
      });


      sustainabilityDetail.value = activityData.value.sustainabilityDetail;

      // วัตถุประสงค์
      const sustainabilityPropose = activityData.value.sustainabilityPropose;
      const objectiveArray = sustainabilityPropose.split(/\d+/).filter(Boolean);
      objectives.value = objectiveArray;

      // problem ผลการดำเนินงานที่ผ่านมา
      if (!pastEvaluations.value) { pastEvaluations.value = []; }
      const problemData = activityData.value.problem;
      if (problemData && problemData.length > 0) {
        problemData.forEach((item, index) => {
          pastEvaluations[index].problem = item.problemDetail;
          pastEvaluations[index].solution = item.solution;
        });
      }

      // ผลที่คาดว่าจะได้รับ, kpi, ค่าเป้าหมาย
      expectedResults.splice(0, expectedResults.length, ...activityData.value.result.map(item => ({
        result: item.detail,
        kpi: item.kpi,
        target: item.target
      })));

      // รูปแบบการประเมินผล
      selectedEvaluation.value = evaluationData.value
        .filter(opt => activityData.value.evaluation.some(e => e.evaluation === opt.evaluationName)) // เทียบชื่อ
        .map(opt => opt.evaluationID);

      // Entrepreneurial
      selectedEntrepreneurialOptions.value = entrepreneurialData.value
        .filter(opt => activityData.value.entrepreneurial[0].includes(opt.entrepreneurialName)) // เทียบชื่อ
        .map(opt => opt.entrepreneurialID);

      // StudentQF
      if (activityData.value.studentQF) {
        selectedSkills.value = studentQFList.value
          .filter(opt => activityData.value.studentQF.some(sqf => sqf.name === opt.studentQF_Name)) // เทียบชื่อ
          .map(opt => opt.studentQF_ID);

        activityData.value.studentQF.forEach(sqf => {
          const skill = studentQFList.value.find(opt => opt.studentQF_Name === sqf.name);
          if (skill) {
            percentages.value[skill.studentQF_ID] = sqf.percentage;
          }
        });
      }

      // Committee
      if (activityData.value.committee) {
        committee.value = activityData.value.committee.map(actMember => {
          const fullData = students.value.find(c => c.name === actMember.name);
          return {
            id: fullData?.id || "-",  // ถ้าไม่มีให้ใส่ "-"
            name: actMember.name,
            department: fullData?.department || "-",
            phone: fullData?.phone || "-",
            position: actMember.position || "", // ใช้ตำแหน่งที่เลือกไว้
          };
        });
      }

      // Sustainability
      if (activityData.value.sustainability) {
        selectedSustainabilityOptions.value = sustainabilityData.value
          .filter(opt => activityData.value.sustainability.some(act => act.sustainability === opt.sustainabilityName)) // เทียบชื่อ
          .map(opt => opt.sustainabilityID);

        activityData.value.sustainability.forEach(act => {
          if (act.sustainability === "SDGs Culture" && act.goal) {
            const goal = goalData.value.find(g => g.goalName === act.goal);
            if (goal) {
              selectedGoals.value.push(goal.goalID);
            }
          }
        });
      }

      prepareStart.value = formatDate(activityData.value.prepareStart)
      prepareEnd.value = formatDate(activityData.value.prepareEnd)
      activityCharacteristic.value = activityData.value.activityCharacteristic
      codeOfHonor.value = activityData.value.codeOfHonor;
      initializeHoursCount();
    }
  }
  catch (error) {
    console.log(error)
  }
});

const selectedActivity = ref(null);

// ฟังก์ชันตั้งค่า hoursCount ให้ตรงกับ activityData
const initializeHoursCount = () => {
  activityData.value.activity.forEach((item) => {
    hoursCount.value[item.activityName] = item.countHour || 0;
  });
};

const updateHours = (activityName, value) => {
  const hours = value ? parseInt(value, 10) : 0; // ถ้าค่าว่างให้เป็น 0

  if (hours > 0) {
    selectedActivity.value = activityName;
    Object.keys(hoursCount.value).forEach((key) => {
      if (key !== activityName) {
        hoursCount.value[key] = 0;
      }
    });
  } else {
    selectedActivity.value = null;
  }

  hoursCount.value[activityName] = hours;
};

// เมื่อ `isHourCount` เปลี่ยน → รีเซ็ตค่าทุกช่องเป็น `0`
watch(isHourCount, (newValue) => {
  if (!newValue) {
    Object.keys(hoursCount.value).forEach((key) => {
      hoursCount.value[key] = 0;
    });
    selectedActivity.value = null;
  }
});

// ใช้ watch เพื่อตรวจสอบการเปลี่ยนแปลงของ activityData
watch(activityData, initializeHoursCount, { deep: true });

const positions = ref([
  "ประธานโครงการ",
  "รองประธานโครงการ",
  "เลขา",
  "เหรัญญิก",
  "ประชาสัมพันธ์",
  "คณะกรรมการ"
]);

const handleActivityHoursChange = () => {
  // console.log(isHourCount.value); // จะได้เป็น "true" หรือ "false"
  if (isHourCount.value) {
    // console.log('เลือกนับชั่วโมง');
  } else {
    // console.log('เลือกไม่นับชั่วโมง');
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


// ทักษะที่เลือก
const selectedSkills = ref([]);

// รายการที่ผู้ใช้เลือก
const selectedEntrepreneurialOptions = ref([]);
const selectedSustainabilityOptions = ref([]);
const selectedGoals = ref([]);

// เพิ่มชื่อเข้าในคณะกรรมการ
const addCommitteeMember = () => {
  // ค้นหานักเรียนที่เลือกจาก students
  const studentToAdd = students.value.find(student => student.id === selectedStudent.value);
  if (studentToAdd) {
    // เพิ่มสมาชิกเข้าในคณะกรรมการ
    committee.value.push({ id: studentToAdd.id, name: studentToAdd.name, department: studentToAdd.department, phone: studentToAdd.phone, position: '' });
    selectedStudent.value = ''; // รีเซ็ตค่า dropdown
  }
};

// ลบสมาชิกจากคณะกรรมการ
const removeCommitteeMember = (index) => {
  committee.value.splice(index, 1); // ลบสมาชิกจากคณะกรรมการ
};

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

    const maxSize = 1024 * 1024;
    if (file && file.size > maxSize) {
      alert("ไฟล์ PDF ต้องไม่เกิน 1MB");
      e.target.value = "";
      throw new Error("ไฟล์ PDF ต้องไม่เกิน 1MB");
    }

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
    reader.onload = () => resolve(reader.result.split(',')[1]);  // เก็บเฉพาะ base64 string
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

const handleEditDocument = async () => {
  try {
    const studentID = localStorage.getItem("studentID");
    sustainability.value = sustainabilityData.value
      .filter(item => selectedSustainabilityOptions.value.includes(item.sustainabilityID))
      .flatMap(item => {
        if (item.sustainabilityID === 1) {
          return selectedGoals.value.map(goalID => [item.sustainabilityID, goalID]);
        } else {
          return [[item.sustainabilityID, null]];
        }
      });

    const formattedActivity = activity.value.map(a => {
      const hour = hoursCount.value[a.activityName] || 0; // ดึงค่าตามชื่อ activity
      return hour > 0 ? [a.activityID, hour] : null;
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
      payment: expenses.value.toString(),
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
      activity: formattedActivity,
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
    const res = await editActivityDocument(studentID, documentId.value.toString(), dataToSend);
    if (res.ok) {
      showSuccess("edit")
    }
  } catch (error) {
    console.error("Failed to update document:", error);
  }
};
const today = new Date().toISOString().split('T')[0];

const getNextDay = (date) => {
  if (!date) return today.value; // ถ้ายังไม่มี starttime ให้ใช้ today
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  return nextDay.toISOString().split("T")[0];
};

const getProjectName = computed(() =>
  projectNameEng.value ? `${projectNameThai.value} (${projectNameEng.value})` : projectNameThai.value
);

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

</script>


<template>
  <div class="flex justify-center items-center min-h-screen bg-blue-50">
    <div class="bg-white p-6 rounded-lg shadow-lg w-[1000px] ">
      <h1 class="text-3xl font-extrabold mb-4 underline text-center text-red-500">Edit Activity Document</h1>


      <form @submit.prevent="handleEditDocument">
        <div class="grid grid-cols-2 gap-4 lable ">
          <!-- รหัสหน่วยงาน + ลำดับที่เอกสาร -->
          <div class="items-center gap-2">
            <label for="agencyCode" class="item">ที่<span class="text-red-500 ml-1">*</span>
              <a class="text-gray-400 text-sm ml-3 mt-1">ตัวอย่าง: สนทศ.มจธ.1/2567</a>
            </label>
            <div class="flex">
              <input type="text" v-model="prefix" class="form-input w-24 text-left" placeholder="รหัสหน่วยงาน" />
              <p class="text-gray-700 " style="margin-top: 17px;">มจธ.</p>
              <input type="text" v-model="suffix" class="form-input w-24 text-left" placeholder="ลำดับที่เอกสาร" />
            </div>
          </div>

          <!-- ชื่อหน่วยงาน + วันที่ -->
          <div class="flex-1">
            <label for="agencyName" class="block item mb-1">ชื่อหน่วยงาน<span class="text-red-500 ml-1">*</span></label>
            <select id="agencyName" v-model="agencyName" class="ml-3 form-input form-input-select" required>
              <option value="">-- เลือกหน่วยงาน --</option>
              <option v-for="(agency, index) in filteredAgencies" :key="index" :value="agency">
                {{ agency }}
              </option>
            </select>
          </div>

          <!-- ชื่อโครงการ (ภาษาไทย) -->
          <div class="layer-left">
            <label class="block item mb-1">ชื่อโครงการ (ภาษาไทย)<span class="text-red-500 ml-1">*</span></label>
            <input type="text" v-model="projectNameThai" class="form-input form-input-text" required minlength="5"
              placeholder="ชื่อโครงการ" />
            <p v-if="!isThaiValid" class="text-red-500 text-sm">ต้องเป็นภาษาไทยเท่านั้น</p>
          </div>

          <!-- ชื่อโครงการ (ภาษาอังกฤษ) -->
          <div class="layer-rt">
            <label class="block item mb-1">ชื่อโครงการ (ภาษาอังกฤษ)<span class="text-red-500 ml-1">*</span></label>
            <input type="text" v-model="projectNameEng" class="form-input form-input-text" required minlength="5"
              placeholder="Project name" />
            <p v-if="!isEngValid" class="text-red-500 text-sm">ต้องเป็นภาษาอังกฤษเท่านั้น</p>
          </div>

          <!-- เนื่องด้วย -->
          <div class="layer-left">
            <label for="reason" class="block item">เนื่องด้วย</label>
            <input type="text" id="reason" v-model="reason" class="form-input form-input-text" disabled />
          </div>

          <!-- จัดโครงการ -->
          <div class="layer-rt">
            <label for="organizeProject" class="block item">จัดโครงการ</label>
            <input type="text" id="organizeProject" v-model="getProjectName" class="form-input form-input-text"
              disabled />
          </div>

          <!-- วันที่จัดกิจกรรม -->
          <div class="layer-left flex items-center">
            <label for="startDate" class="item whitespace-nowrap">ระหว่างวันที่<span
                class="text-red-500 ml-1">*</span></label>
            <input type="date" id="startDate" v-model="startDate" class="form-input form-input-date" :min="today"
              required />
          </div>

          <div class="layer-rt flex items-center">
            <label for="endDate" class="item whitespace-nowrap">ถึงวันที่<span
                class="text-red-500 ml-1">*</span></label>
            <input type="date" id="endDate" v-model="endDate" class="form-input form-input-date" :min="startDate"
              required />
          </div>

          <!-- ณ สถานที่ -->
          <div class="layer-left">
            <label for="location" class="block item">ณ สถานที่<span class="text-red-500 ml-1">*</span></label>
            <input type="text" id="location" v-model="location" class="form-input form-input-text" minlength="10"
              placeholder="ชื่ออาคาร/สถานที่ ชั้นที่/ห้องที่" required />
          </div>

          <!-- ประเภทกิจกรรม -->
          <div class="layer-rt">
            <label for="type" class="block item">ประเภทโครงการกิจกรรม<span class="text-red-500 ml-1">*</span></label>
            <select id="type" v-model="type" class="form-input form-input-select" style="margin-top: 10px;" required>
              <option value="">เลือกประเภทที่ตรงกับกิจกรรม</option>
              <option v-for="option in typeOptions" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
          </div>

          <!-- วัตถุประสงค์ -->
          <div class="col-span-2 my-10">
            <label for="purpose" class="block item">วัตถุประสงค์<span class="text-red-500 ml-1">*</span></label>
            <textarea id="purpose" v-model="purpose" class="form-input detail-input w-full" rows="4" required
              placeholder="วัตถุประสงค์โดยภาพรวมของโครงการที่จัด" minlength="20"></textarea>
          </div>

        </div>

        <!-- ค่าใช้จ่าย -->
        <div class="mb-8">
          <label for="expenses" class="item whitespace-nowrap mr-2" style="width: 85px;">ค่าใช้จ่ายในโครงการ<span
              class="text-red-500">*</span></label>
          <div class="text-left text-sm text-gray-600 my-2 ml-4">จำนวนต้องมากกว่า 1 บาท</div>
          <hr>
          <table class="w-full border border-white rounded-lg whitespace-nowrap ml-5">
            <tbody>
              <tr>
                <td class="p-2 border  border-white">เป็นจำนวนเงิน</td>
                <td class="p-2 border  border-white">
                  <input type="number" id="expenses" v-model.number="expenses"
                    class="input-field my-4 py-2 ml-6 w-60 border border-gray-300 text-right rounded-3xl" required
                    :max="9999999" maxlength="7" @input="limitExpensesLength" />
                </td>
                <td class="p-2 border  border-white">บาท</td>
                <td class="p-2 border w-auto 0  border-white">( {{ expensesThaiText }}<span>ถ้วน )</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- เลือกชั่วโมงกิจกรรม -->
        <div class="mb-12">
          <label for="activityHours" class="block item">การเทียบค่าชั่วโมงกิจกรรม<span
              class="text-red-500 ml-1">*</span></label>
          <select id="activityHours" style="width: 35%;" v-model="isHourCount" class="form-input"
            @change="handleActivityHoursChange" required>
            <option :value="false">ไม่นับชั่วโมง</option>
            <option :value="true">นับชั่วโมง</option>
          </select>
        </div>

        <!-- แสดงรายการกิจกรรม -->
        <div class="mb-12">
          <label for="activityHours" class="block item">
            ประเภทโครงการกิจกรรม<span class="text-red-500 ml-1">*</span>
          </label>
          <div>
            <div class="text-left text-sm text-gray-600 mt-4 ml-3">
              เลือกประเภทที่ตรงกับกิจกรรมที่จัด เพียง 1 ด้าน
            </div>
            <hr />
            <table class="table-auto w-full border-collapse border border-gray-300 my-3">
              <tbody>
                <tr v-for="item in activity" :key="item.activityID" class="hover:bg-gray-50">
                  <td class="border border-white pl-8 px-4 pb-1 whitespace-nowrap">
                    {{ item.activityName }}
                  </td>
                  <td class="border border-white px-4 py-2 text-center">จำนวน</td>
                  <td class="border border-white px-4 py-1">
                    <input type="number" :id="'hours-' + item.activityID" v-model="hoursCount[item.activityName]"
                      @input="updateHours(item.activityName, $event.target.value)"
                      class="form-input px-10 w-24 text-right" style="width: 70px;"
                      :disabled="!isHourCount || (selectedActivity && selectedActivity !== item.activityName)" />
                  </td>
                  <td class="border border-white whitespace-nowrap px-4 py-2">หน่วยชั่วโมง</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>


        <div class="grid grid-cols-3 gap-4 lable pb-8 text-center">
          <!-- อาจารย์ที่ปรึกษา/รองคณบดี -->
          <div>
            <label for="advisor" class="block pb-2 item">อาจารย์ที่ปรึกษา/รองคณบดี<span
                class="text-red-500 ml-1">*</span></label>
            <select id="advisor" v-model="advisor" class="form-input form-input-role" required @change="selectAdvisor">
              <option value="" disabled>เลือกอาจารย์ที่ปรึกษา/รองคณบดี</option>
              <option v-for="advisor in advisorList" :key="advisor.staffId" :value="advisor.staffId">
                {{ advisor.fullName }}
              </option>
            </select>
          </div>

          <!-- นายก/ประธานชมรม -->
          <div>
            <label for="president" class="block pb-2 item">นายก/ประธานชมรม<span
                class="text-red-500 ml-1">*</span></label>
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
            <label for="responsibleStudent" class=" item pb-2">นักศึกษาผู้รับผิดชอบ</label>
            <input type="text" id="responsibleStudent" :value="responsibleStudent" class="form-input" disabled />
          </div>

          <!-- ประธานฝ่าย -->
          <div>
            <label for="departmentPresident" class="block item">ประธานฝ่าย<span
                class="text-red-500 ml-1">*</span></label>
            <select id="departmentPresident" v-model="departmentPresident" class="form-input form-input-role" required>
              <option value="" disabled>เลือกประธานฝ่าย</option>
              <option v-for="departmentPresident in departmentPresidentList" :key="departmentPresident.staffId"
                :value="departmentPresident.staffId">
                {{ departmentPresident.fullName }}
              </option>
            </select>
          </div>
        </div>

        <div class="lable">
          <!-- เลือกทักษะ StudentQF (checkbox) -->
          <div class="mb-10 ">
            <div class="item whitespace-nowrap">
              การเทียบค่ากิจกรรมตามคุณลักษณะที่พึงประสงค์ของมหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี (KMUTT Student
              QF)<span class="text-red-500 ml-1">*</span></div>
            <span class="text-right text-sm text-gray-600 ml-2">
              ทักษะที่พัฒนาจากการเข้าร่วม เลือกได้สูงสุดเพียง 3 ด้าน ในสัดส่วนที่ต่างกัน</span>
            <hr>
            <div v-for="skill in studentQFList" :key="skill.studentQF_ID" class="my-3 mx-7 px-4 pb-1">
              <input type="checkbox" :id="'skill-' + skill.studentQF_ID" :value="skill.studentQF_ID"
                v-model="selectedSkills"
                :disabled="selectedSkills.length >= 3 && !selectedSkills.includes(skill.studentQF_ID)" />
              <label :for="'skill-' + skill.studentQF_ID">{{ skill.studentQF_Name }}</label>
            </div>
            <p v-if="selectedSkills.length >= 3" class="text-red-500 mt-2">
              คุณเลือกทักษะครบแล้ว (สูงสุด 3 ทักษะ)
            </p>
          </div>

          <!-- แสดงทักษะที่เลือก และกำหนดเปอร์เซ็นต์ -->
          <div v-if="selectedSkills.length > 0" class="pb-8 lable">
            <div class="item pb-6">ทักษะที่เลือกและกำหนดเปอร์เซ็นต์:
              <span class="text-red-500 ml-1 ">*</span>
            </div>
            <ul class="inline-list">
              <li v-for="(skillID, index) in selectedSkills" :key="skillID" class="flex items-center mx-4 mb-2">
                <span class="mr-2 text-center">{{ getSkillName(skillID) }}</span>

                <input type="number" v-model.number="percentages[skillID]" min="0" max="100"
                  class="form-input form-input-text ml-2 w-20 border p-1 rounded" placeholder="%"
                  @input="validatePercentage" />
              </li>
            </ul>
            <p v-if="!isPercentageValid" class="text-red-500 mt-2">
              เปอร์เซ็นต์ทั้งหมดต้องรวมกันเป็น 100%
            </p>
          </div>

          <!-- Entrepreneurial -->
          <div class="pb-4 lable">
            <div class="item pb-1">ความสอดคล้องกับเป้าหมายของมหาวิทยาลัย</div>
            <div class="lable">
              <div class="item">Entrepreneurial<span class="text-red-500 ml-1">*</span></div>
              <div>
                <div class="text-left text-sm text-gray-600 ml-3">
                  เลือกเฉพาะหัวข้อที่เกี่ยวข้องกับกิจกรรมอย่างน้อย 1 ด้าน
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


              <!-- Sustainability -->
              <div class=" mb-10">
                <div class="item">Sustainability<span class="text-red-500 ml-1">*</span></div>
                <div>
                  <div class="text-left text-sm text-gray-600 ml-3"> เลือกเฉพาะหัวข้อที่เกี่ยวข้องกับกิจกรรม
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
                          <input type="checkbox" :id="'goal-' + goal.goalID" :value="goal.goalID"
                            v-model="selectedGoals" class="mr-2 " />
                          <p class="text-sm whitespace-nowrap">{{ goal.goalID }}. {{ goal.goalName }}</p>
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
              </div>
            </div>
          </div>

          <!-- หลักการและเหตุผล -->
          <div class="lable">
            <div class=" mb-10">
              <label for="sustainabilityDetail" class="block item">หลักการและเหตุผล<span
                  class="text-red-500 ml-1">*</span></label>
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
            <div class=" mb-12">
              <label for="activityCharacteristic" class="block item">ลักษณะกิจกรรม<span
                  class="text-red-500 ml-1">*</span></label>
              <textarea id="activityCharacteristic" v-model="activityCharacteristic" class="form-textarea w-full h-32"
                placeholder="เขียนบรรยายรูปแบบการจัดกิจกรรม ให้เห็นภาพการจัดกิจกรรม" :minlength="10"></textarea>
            </div>

            <!-- Code of Honor -->
            <div class=" mb-12">
              <label for="codeOfHonor"
                class="block item">ลักษณะกิจกรรมที่จัดขึ้นสอดคล้องกับหลักเกียรติและศักดิ์ของนักศึกษา(Code
                of
                Honor) ดังนี้<span class="text-red-500 ml-1">*</span></label>
              <textarea id="codeOfHonor" v-model="codeOfHonor" class="form-textarea w-full h-22"
                placeholder="อธิบายความสอดคล้องของลักษณะกิจกรรมกับ Code of Honor" :minlength="10"></textarea>
            </div>

            <!-- ระยะเวลาดำเนินงาน -->
            <div class=" mb-10">
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
            <div class="mb-12">
              <label for="scheduleDetails" class="block item">ขั้นตอนการดำเนินงาน<span
                  class="text-red-500 ml-1">*</span></label>
              <div class="my-4 p-4 bg-gray-50 rounded-lg shadow-sm">
                <p class="text-sm text-gray-600 mb-2">📂 อัปโหลดไฟล์ขั้นตอนการดำเนินงาน</p>
                <hr class="border-gray-300 mb-3">

                <div v-if="scheduleDetails" class="mb-3">
                  <a @click="openFileInNewTab(scheduleDetails, 'application/pdf')" target="_blank"
                    class="text-blue-600 hover:text-blue-800 underline">
                    🔗 ดูไฟล์ขั้นตอนการดำเนินงานที่อัปโหลดแล้ว
                  </a>
                </div>

                <input id="scheduleDetails" type="file" @change="handleFileChange($event, 'scheduleDetails')"
                  class="form-input form-input-text w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-300" />
              </div>
            </div>

            <!-- คณะกรรมการจัดโครงการ -->
            <div class="mb-8">
              <label class="block item">คณะกรรมการจัดโครงการ<span class="text-red-500 ml-1">*</span></label>

              <!-- Dropdown สำหรับเลือกชื่อ -->
              <div class="mb-4 ml-4">
                <div class="text-left text-sm text-gray-600 ml-3"> เลือกชื่อสมาชิกจากรายการ</div>
                <hr>
                <select id="select-student" v-model="selectedStudent" class="form-input form-input-select">
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
            <div class="pb-6">
              <table v-if="committee && committee.length > 0"
                class="min-w-50% table-auto border-collapse border border-gray-400 text-sm mb-8">
                <thead class="border border-gray-400">
                  <tr>
                    <th class="px-4 pt-2 text-center">ที่</th>
                    <th class="px-4 py-2 text-center border border-gray-400">รหัสนักศึกษา</th>
                    <th class="px-4 py-2 border-gray-400">ชื่อ - นามสกุล</th>
                    <th class="px-4 py-2 text-center border border-gray-400">ภาควิชา/ชั้นปี</th>
                    <th class="px-4 pt-2 text-center whitespace-nowrap border border-gray-400">หมายเลขโทรศัพท์</th>
                    <th class="px-4 py-2 text-center whitespace-nowrap">ตำแหน่ง(ในโครงการ)</th>
                  </tr>
                </thead>
                <tbody class="text-sm">
                  <tr v-for="(member, index) in committee" :key="member.id" class="hover:bg-gray-50">
                    <td class="px-4 text-center">{{ index + 1 }}</td>
                    <td class="px-4 text-center border border-gray-400">{{ member.id }}</td>
                    <td class="px-4 text-center whitespace-nowrap border-gray-400">{{ member.name }}</td>
                    <td class="px-4 text-center whitespace-nowrap border border-gray-400">{{ member.department }}</td>
                    <td class="px-4 text-center border border-gray-400">{{ member.phone }}</td>
                    <td class="px-4 pt-3">
                      <select v-model="member.position" class="form-input text-xs w-36" style="margin-bottom: 10px;">
                        <option value="" disabled selected>เลือกตำแหน่ง</option>
                        <option v-for="position in positions" :key="position" :value="position">
                          {{ position }}
                        </option>
                      </select>
                    </td>
                    <td class="px-4 text-center">
                      <button type="button" @click="removeCommitteeMember(index)"
                        class="bg-red-500 text-white px-3 py-1 rounded text-md">
                        ลบ
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>


            <!-- รูปแบบการประเมินผล -->
            <div class="mb-10">
              <label class="block item">รูปแบบการประเมินผล<span class="text-red-500 ml-1">*</span></label>
              <div class="mt-4 ml-4">
                <div class="text-left text-sm text-gray-600 ml-3"> เลือกได้สูงสุดเพียง 1 รูปแบบ
                </div>
              </div>

              <hr>
              <!-- รายการตัวเลือก -->
              <div v-for="(option, key) in evaluationData" :key="key" class="my-4 mx-7 px-4 pb-1">
                <input type="checkbox" :id="option.evaluationID" :value="option.evaluationID"
                  v-model="selectedEvaluation"
                  :disabled="selectedEvaluation.length >= 1 && !selectedEvaluation.includes(option.evaluationID)" />
                <label :for="option.evaluationID">{{ option.evaluationName }}</label>
              </div>
            </div>
            <p v-if="selectedSkills.length >= 1" class="text-red-500 ">
              คุณได้เลือกรูปแบบการประเมินแล้ว
            </p>

            <!-- ตัวอย่างการประเมินผล -->
             <div class="my-12">
            <label for="evaluationFile" class="item ">ตัวอย่างการประเมินผล
              <span class="text-red-500 pb-6 ml-1">*</span>
            </label>

            <div class="my-4 pb-6 bg-gray-50 rounded-lg shadow-sm">
              <p class="text-sm text-gray-600 mb-2">📂 อัปโหลดไฟล์ตัวอย่างการประเมินผล</p>
              <hr class="border-gray-300 mb-3">

              <div v-if="evaluationFile" class="mb-3">
                <a @click="openFileInNewTab(evaluationFile, 'application/pdf')" target="_blank"
                  class="text-blue-600 hover:text-blue-800 underline">
                  🔗 ดูไฟล์ตัวอย่างการประเมินผลที่อัปโหลดแล้ว
                </a>
              </div>

              <input id="evaluationFile" type="file" @change="handleFileChange($event, 'evaluationFile')"
                class="form-input form-input-text  w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-300" />
            </div>
          </div>


            <!-- ผลที่คาดว่าจะได้รับ -->
            <div class="mb-12">
              <label class="block item">ผลที่คาดว่าจะได้รับที่สอดคล้องกับวัตถุประสงค์</label>

              <div v-for="(expectedResult, index) in expectedResults" :key="index"
                class="flex items-center gap-4 ml-4 mt-4 my-2 ">
                <!-- ผลที่คาดว่าจะได้รับ -->
                <div class="flex-1">
                  <label :for="'expected-' + index" class="block mb-1">ผลที่คาดว่าจะได้รับข้อที่ {{ index + 1
                  }}<span class="text-red-500 ml-1">*</span></label>
                  <input type="text" :id="'expected-' + index" v-model="expectedResults[index].result"
                    class="form-input form-input-text w-full" placeholder="ผลที่คาดว่าจะได้รับ" :minlength="10" />
                </div>

                <!-- ตัวชี้วัด (KPI) -->
                <div class="flex-1">
                  <label :for="'kpi-' + index" class="block mb-1">ตัวชี้วัด (KPI)<span
                      class="text-red-500 ml-1">*</span></label>
                  <input type="text" :id="'kpi-' + index" v-model="expectedResults[index].kpi"
                    class="form-input form-input-text w-full" placeholder="KPI" :minlength="10" />
                </div>

                <!-- ค่าเป้าหมาย -->
                <div class="flex-1">
                  <label :for="'target-' + index" class="block mb-1 whitespace-nowrap">ค่าเป้าหมาย (%)<span
                      class="text-red-500 ml-1">*</span></label>
                  <input type="number" min="0" max="100" :id="'target-' + index" v-model="expectedResults[index].target"
                    class="form-input form-input-text w-full" placeholder="ค่าเป้าหมาย"
                    @input="validateTarget($event, index)" />
                </div>
              </div>
            </div>

            <!-- ผลการดำเนินงานที่ผ่านมา -->
            <div class="mb-12">
              <label class="block item">
                ผลการดำเนินงานที่ผ่านมาและการนำผลการประเมินโครงการ/กิจกรรมมาปรับปรุงในการจัดโครงการครั้งนี้
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
           <label for="budgetDetails" class="item ">รายละเอียดงบประมาณ
              <span class="text-red-500 pb-6 ml-1">*</span>
            </label>

            <div class="my-4 pb-6 bg-gray-50 rounded-lg shadow-sm">
              <p class="text-sm text-gray-600 mb-2">📂 อัปโหลดไฟล์รายละเอียดงบประมาณ</p>
              <hr class="border-gray-300 mb-3">

              <div v-if="budgetDetails" class="mb-3">
                <a @click="openFileInNewTab(budgetDetails, 'application/pdf')" target="_blank"
                  class="text-blue-600 hover:text-blue-800 underline">
                  🔗 ดูไฟล์รายละเอียดงบประมาณที่อัปโหลดแล้ว
                </a>
              </div>

              <input id="budgetDetails" type="file" @change="handleFileChange($event, 'budgetDetails')"
                class="form-input form-input-text w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-300" />
            </div>


            <!-- อัพโหลดไฟล์เพิ่มเติม -->
            <div class="mt-12 mb-14">
              <label for="prepareFile" class="item ">ไฟล์เพิ่มเติม
                <span class="text-red-500 pb-6 ml-1">*</span>
              </label>

              <div class="my-4 pb-6 bg-gray-50 rounded-lg shadow-sm">
                <p class="text-sm text-gray-600 mt-4">📂 อัปโหลดไฟล์เพิ่มเติม</p>
                <hr class="border-gray-300 mb-3">

                <div v-if="prepareFile" class="mb-3">
                  <a @click="openFileInNewTab(prepareFile, 'application/pdf')" target="_blank"
                    class="text-blue-600 hover:text-blue-800 underline">
                    🔗 ดูไฟล์อัปโหลดไฟล์เพิ่มเติมที่อัปโหลดแล้ว
                  </a>
                </div>

                <input id="prepareFile" type="file" @change="handleFileChange($event, 'prepareFile')"
                  class="form-input form-input-text w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-300" />
              </div>
            </div>


          </div>
        </div>
        <div class="parent-container">
          <button type="submit" class="form-button"> Update Activity Document
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
  margin: 1rem 1.5rem 2rem;
}

.layer-left {
  margin: 0.25rem 0;
}

.layer-rt {
  margin: 0.25rem 0 0 1rem;
}

.item {
  font-weight: 600;
  font-size: bold;
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
  border-radius: 100px;
  outline: none;
  margin-left: 0.25rem;
  transition: border-color 0.2s ease-in-out;
}

.form-input-select {
  margin-left: 0.5rem;
  width: auto;
  border-radius: 20px;
}

.form-input-text {
  width: 90%;
  border-radius: 20px;

}

.form-input-date {
  width: 70%;
  border-radius: 20px;
}

.form-input-role {
  width: 95%;
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