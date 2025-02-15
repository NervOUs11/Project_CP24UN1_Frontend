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
const objectives = ref(['','','']);

const students = ref([]);
const selectedStudent = ref(''); // ตัวแปรสำหรับเก็บนักเรียนที่เลือก
const committee = ref([]); // รายการคณะกรรมการ

const goalData = ref([]);
const evaluationData = ref([]);

const selectedEvaluation = ref([]);

const participantData = ref([]);
// const participant = ref([]);
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

// กำหนดค่าตั้งต้นเป็นวันที่ปัจจุบันเมื่อโหลด
onMounted(async() => {
  writtenDate.value = new Date().toISOString().split('T')[0];
  try {
    studentQFList.value = await fetchAllStudentQF();
    // console.log("StudentQF:", studentQFList.value);
    rawStaffData.value = await fetchAllStaff();
    advisorList.value = rawStaffData.value.map((staff) => ({
      staffId: staff[0],
      fullName: `${staff[2]} ${staff[3]}`,
    }));
    presidentList.value = rawStaffData.value.map((staff) => ({
      staffId: staff[0],
      fullName: `${staff[2]} ${staff[3]}`,
    }));
    departmentPresidentList.value = rawStaffData.value
      .filter((staff) => staff[10].includes('ประธานฝ่าย')) // กรองเฉพาะที่ตำแหน่งมีคำว่า 'ประธานฝ่าย'
      .map((staff) => ({
        staffId: staff[0],
        fullName: `${staff[2]} ${staff[3]}`,
    }));
    // console.log("departmentPresidentList:", departmentPresidentList.value);
    // console.log("rawStaffData:", rawStaffData.value);
    // console.log("advisorList:", advisorList.value);

    const studentData = await fetchAllStudent();
    students.value = studentData.map(([id, name, department, year, phone]) => ({
      id,
      name,
      department: `${department} ปี${year}`,
      phone,
      position: "",
    }));
    // console.log(students.value)

    goalData.value = await fetchAllGoal();
    // console.log(goalData.value)

    evaluationData.value = await fetchAllEvaluation();
    // console.log(evaluationData.value)

    participantData.value = await fetchAllParticipant();
    // console.log(participantData.value)

    activityData.value = await fetchAllActivity();
    // console.log(activityData.value)
    activityData.value.forEach(activity => { 
      hoursCount.value[activity.activityID] = 0;  
    });

    entrepreneurialData.value = await fetchAllEntrepreneurial();
    // console.log(entrepreneurialData.value)

    sustainabilityData.value = await fetchAllSustainability();
    // console.log(sustainabilityData.value)

  } catch (error) {
    console.error('Error fetching staff:', error);
  }
});


const handleActivityHoursChange = () => {
  console.log(isHourCount.value); // จะได้เป็น "true" หรือ "false"
  if (isHourCount.value) {
    console.log('เลือกนับชั่วโมง');
  } else {
    console.log('เลือกไม่นับชั่วโมง');
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

// เปอร์เซ็นต์สำหรับแต่ละทักษะ
const percentages = reactive({});

const isPercentageValid = computed(() => {
  const total = selectedSkills.reduce((sum, skill) => {
    return sum + (percentages[skill] ? parseFloat(percentages[skill]) : 0);
  }, 0);
  return total === 100;
});

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

// ติดตามตัวเลือกที่ถูกติ้ก
// const selectedOptions = reactive({
//   observation: false,
//   interview: false,
//   questionnaires: false,
//   test: false,
//   other: false,
// });

// เก็บรายละเอียดของ "อื่นๆ"
const otherDescription = ref('');

// เก็บไฟล์ที่อัปโหลด
const uploadedFiles = reactive({});

// จัดการอัปโหลดไฟล์
// const handleFileUpload = (key, event) => {
//   const file = event.target.files[0];
//   if (file) {
//     uploadedFiles[key] = file;
//   }
// };

// ฟังก์ชันจัดการการอัพโหลดไฟล์
const handleFileChange = async (e, fileType) => {
  console.log("Input changed:", e.target.files);
  const file = e.target.files[0];
  if (file) {
    const base64 = await fileToBase64(file);
    // เก็บ base64 ไฟล์ที่เลือกไว้ในตัวแปรที่กำหนดตาม fileType
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

// ฟังก์ชันแปลงไฟล์เป็น Base64
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
    console.log(`Advisor ที่เลือก: ${selectedAdvisor.fullName} (ID: ${selectedAdvisor.staffId})`);
  }
};
const selectPresident = () => {
  const selectPresident = presidentList.value.find(a => a.staffId === president.value);
  if (selectPresident) {
    console.log(`President ที่เลือก: ${selectPresident.fullName} (ID: ${selectPresident.staffId})`);
  }
};
const addDoc = async () => {
  try {
    const studentID = parseInt(localStorage.getItem("studentID"))
    const departmentName = localStorage.getItem("department")

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

    const dataToSend = {
      studentID: studentID,
      type: type.value,
      startTime: startDate.value,
      endTime: endDate.value,
      code: agencyCode.value,
      departmentName: departmentName,
      title: projectName.value,
      location: location.value,
      propose: purpose.value,
      payment: expenses.value,
      staffID: advisor.value,
      sustainabilityDetail: sustainabilityDetail.value,
      sustainabilityPropose: sustainabilityPropose.value,
      activityCharacteristic: activityCharacteristic.value,
      codeOfHonor: codeOfHonor.value,
      prepareStart: prepareStart.value,
      prepareEnd: prepareEnd.value,
      prepareFile: prepareFile.value,
      evaluationFile: evaluationFile.value,
      budgetDetails: budgetDetails.value,
      scheduleDetails: scheduleDetails.value,
      participant: participant.value,
      activity: activity.value,
      problem: pastEvaluations.map(item => [item.problem, item.solution]),
      studentQF: studentQF.value,
      entrepreneurial: selectedEntrepreneurialOptions.value,
      evaluation: selectedEvaluation.value.map(id => [id, null]),
      result: expectedResults.map(item => [item.kpi, item.result, item.target]),
      sustainability: sustainability.value,
      committee: committee.value.map(member => [member.id, member.position]),
      staffIDProgress2: president.value,
      staffIDProgress3: departmentPresident.value,
    }
    console.log("Data to send:", dataToSend);
    const res = await addActivityDocument(dataToSend);
    console.log("API response:", res[1]);
  } catch (error) {
    console.error("Failed to add activity document:", error.message);
  }
};

</script>


<template>
  <div class="flex justify-center items-center min-h-screen bg-blue-50">
    <div class="bg-white p-6 rounded-lg shadow-lg w-[1100px]">
      <h1 class="text-2xl font-bold mb-4 text-center text-blue-500">Add Activity Document</h1>

      <form @submit.prevent="addDoc">
        <div class="grid grid-cols-2 gap-4 mb-4">
          <!-- ที่ (รหัสหน่วยงาน) -->
          <div class="mb-3">
            <label for="agencyCode" class="block text-gray-700 mb-1">ที่</label>
            <input 
              type="text" 
              id="agencyCode" 
              v-model="agencyCode" 
              class="form-input" 
              placeholder="รหัสหน่วยงาน"
              required
            />
          </div>

          <!-- วันที่เขียน -->
          <div class="mb-3">
            <label for="writtenDate" class="block text-gray-700 mb-1">วันที่เขียน</label>
            <input 
              type="date" 
              value="currentDate" 
              id="writtenDate" 
              v-model="writtenDate" 
              class="form-input" 
              disabled
            />
          </div>

          <!-- ชื่อหน่วยงาน -->
          <div class="mb-3">
            <label for="agencyName" class="block text-gray-700 mb-1">ชื่อหน่วยงาน</label>
            <input 
              type="text" 
              id="agencyName" 
              v-model="agencyName" 
              class="form-input" 
              required
            />
          </div>

          <!-- ชื่อโครงการ -->
          <div class="mb-3">
            <label for="projectName" class="block text-gray-700 mb-1">ชื่อโครงการ</label>
            <input 
              type="text" 
              id="projectName" 
              v-model="projectName" 
              class="form-input" 
              required
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
              :value="organizeProject"  
              class="form-input" 
              disabled
            />
          </div>

          <!-- วันที่จัดกิจกรรม -->
          <div class="mb-3">
            <label for="startDate" class="block text-gray-700 mb-1">ระหว่างวันที่</label>
            <input 
              type="date" 
              id="startDate" 
              v-model="startDate" 
              class="form-input" 
              required
            />
          </div>

          <div class="mb-3">
            <label for="endDate" class="block text-gray-700 mb-1">ถึงวันที่</label>
            <input 
              type="date" 
              id="endDate" 
              v-model="endDate" 
              class="form-input" 
              required
            />
          </div>

          <!-- ณ สถานที่ -->
          <div class="mb-3">
              <label for="location" class="block text-gray-700 mb-1">ณ สถานที่</label>
              <input 
              type="text" 
              id="location" 
              v-model="location" 
              class="form-input" 
              required
              />
          </div>

          <!-- ประเภทกิจกรรม -->
          <div class="mb-3">
            <label for="type" class="block text-gray-700 mb-1">ประเภทกิจกรรม</label>
            <select id="type" v-model="type" class="form-input" style="margin-top: 10px;" required>
              <option value="">-- เลือกประเภท --</option>
              <option v-for="option in typeOptions" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
          </div>

            <!-- วัตถุประสงค์ -->
            <div class="col-span-2">
                <label for="purpose" class="block text-gray-700 mb-1">วัตถุประสงค์</label>
                <textarea 
                id="purpose" 
                v-model="purpose"
                class="form-input detail-input w-full" 
                rows="4" 
                required
                ></textarea>
            </div>

          <!-- ค่าใช้จ่าย -->
          <div class="mb-3 flex items-center">
            <label for="expenses" class="text-gray-700 mr-2" style="width: 85px;">ค่าใช้จ่าย</label>
            <input 
              type="number" 
              id="expenses" 
              v-model.number="expenses" 
              class="form-input w-40 mr-2" 
              required
              :max="9999999" 
              maxlength="7"
              @input="limitExpensesLength"
            />
          </div>
          <div class="mb-3 mt-4">
            <span class="text-gray-500">
              ( {{ expensesThaiText }} )
            </span>
          </div>

          <!-- เลือกชั่วโมงกิจกรรม -->
          <div class="mb-3">
            <label for="activityHours" class="block text-gray-700 mb-1">ชั่วโมงกิจกรรม</label>
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
              <input
                type="number"
                :id="'hours-' + activity.activityID"
                v-model="hoursCount[activity.activityID]"
                class="form-input w-24"
              />
            </div>
          </div>


        </div>

        <div class="grid grid-cols-3 gap-4 items-center mb-4">
            <!-- อาจารย์ที่ปรึกษา/รองคณบดี -->
            <div>
              <label for="advisor" class="block text-gray-700 mb-1">อาจารย์ที่ปรึกษา/รองคณบดี</label>
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
              <label for="president" class="block text-gray-700 mb-1">นายก/ประธานชมรม</label>
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
              <label for="departmentPresident" class="block text-gray-700 mb-1">ประธานฝ่าย</label>
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
        <div>
          <h1>KMUTT Student QF</h1>
          <label class="block mb-2">เลือกทักษะ (สูงสุด 3 ทักษะ):</label>
          <div v-for="skill in studentQFList" :key="skill.studentQF_ID" class="mb-2">
            <input 
              type="checkbox" 
              :id="'skill-' + skill.studentQF_ID"
              :value="skill.studentQF_ID" 
              v-model="studentQF"
              :disabled="studentQF.length >= 3 && !studentQF.includes(skill.studentQF_ID)"
            />
            <label :for="'skill-' + skill.studentQF_ID">{{ skill.studentQF_Name }}</label>
          </div>
          <p v-if="studentQF.length >= 3" class="text-red-500 mt-2">
            คุณเลือกทักษะครบแล้ว (สูงสุด 3 ทักษะ)
          </p>
        </div>


        <!-- แสดงทักษะที่เลือก -->
        <div v-if="selectedSkills.length > 0" class="mt-4">
          <h3>ทักษะที่เลือกและกำหนดเปอร์เซ็นต์:</h3>
          <ul class="inline-list">
            <li 
              v-for="(skill, index) in selectedSkills" 
              :key="skill" 
              class="flex items-center mb-2"
            >
              <!-- แสดงชื่อทักษะ -->
              <span>{{ skill }}<span v-if="index < selectedSkills.length - 1">,</span></span>

              <!-- ช่องกรอกเปอร์เซ็นต์ -->
              <input 
                type="number" 
                v-model="percentages[skill]" 
                min="0" 
                max="100" 
                class="form-input ml-2 w-20"
                placeholder="%"
              />
            </li>
          </ul>

          <!-- ข้อความเตือนถ้าเปอร์เซ็นต์รวมไม่เท่ากับ 100% -->
          <p v-if="!isPercentageValid" class="text-red-500 mt-2">
            เปอร์เซ็นต์ทั้งหมดต้องรวมกันเป็น 100%
          </p>
        </div>


        <!-- Entrepreneurial -->
        <div>
          <h1>Entrepreneurial</h1>
          <div>
            <label class="block mb-2 text-red">เลือกอย่างน้อย 1 ด้าน</label>
            <div v-for="option in entrepreneurialData" :key="option.entrepreneurialID" class="mb-2">
              <input 
                type="checkbox" 
                :id="'entrepreneurial-' + option.entrepreneurialID"
                :value="option.entrepreneurialID"
                v-model="selectedEntrepreneurialOptions" 
              />
              <label :for="'entrepreneurial-' + option.entrepreneurialID">
                {{ option.entrepreneurialName }}
              </label>
            </div>
          </div>
        </div>


      <!-- Sustainability -->
      <div>
        <h1>Sustainability</h1>
        <div>
          <label class="block mb-2">กรุณาเลือกหัวข้อที่เกี่ยวข้อง:</label>
          <div v-for="option in sustainabilityData" :key="option.sustainabilityID" class="mb-2">
            <input 
              type="checkbox" 
              :id="'sustainability-' + option.sustainabilityID"
              :value="option.sustainabilityID"
              v-model="selectedSustainabilityOptions" 
            />
            <label :for="'sustainability-' + option.sustainabilityID">
              {{ option.sustainabilityName }}
            </label>
          </div>
        </div>

        <!-- แสดงผลตัวเลือก Goal เมื่อเลือก SDGs Culture -->
        <div v-if="selectedSustainabilityOptions.includes(1)" class="mt-4">
          <label class="block mb-2">เลือก Goals ที่เกี่ยวข้อง</label>
          <div v-for="goal in goalData" :key="goal.goalID" class="mb-2">
            <input 
              type="checkbox" 
              :id="'goal-' + goal.goalID" 
              :value="goal.goalID" 
              v-model="selectedGoals"
            />
            <label :for="'goal-' + goal.goalID">{{ goal.goalID }}: {{ goal.goalName }}</label>
          </div>
        </div>

        <!-- แสดงผลรายการที่เลือก -->
        <!-- <div v-if="selectedGoals.length > 0" class="mt-4">
          <h3>คุณเลือก Goals:</h3>
          <ul>
            <li v-for="goal in selectedGoals" :key="goal.id">
              {{ goal.id }}: {{ goal.name }}
            </li>
          </ul>
        </div>  -->
      </div>

      <!-- หลักการและเหตุผล -->
    <div class="mb-6">
      <label for="sustainabilityDetail" class="block text-gray-700 mb-2">หลักการและเหตุผล</label>
      <textarea 
        id="sustainabilityDetail" 
        v-model="sustainabilityDetail" 
        class="form-textarea w-full h-32" 
        placeholder="กรอกหลักการและเหตุผล"
      ></textarea>
    </div>

    <!-- วัตถุประสงค์ -->
    <div class="mb-6">
      <label class="block text-gray-700 mb-2">วัตถุประสงค์</label>
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
      <label class="block text-gray-700 mb-2">ผู้เข้าร่วมโครงการ</label>

      <div v-for="participant in participantData" :key="participant.participantID" class="flex items-center mb-2">
        <label class="w-48">{{ participant.participantName }} จำนวน:</label>
        <input 
          type="number" 
          v-model="participant.count"
          class="form-input w-20 mr-2"
        />
        <span>คน</span>
      </div>
    </div>
    
    <!-- ลักษณะกิจกรรม (activityCharacteristic) -->
    <div class="mb-6">
      <label for="activityCharacteristic" class="block text-gray-700 mb-2">ลักษณะกิจกรรม</label>
      <textarea 
        id="activityCharacteristic" 
        v-model="activityCharacteristic" 
        class="form-textarea w-full h-32" 
        placeholder="เขียนบรรยายรูปแบบการจัดกิจกรรม ให้เห็นภาพการจัดกิจกรรม"
      ></textarea>
    </div>

    <!-- Code of Honor -->
    <div class="mb-6">
      <label for="codeOfHonor" class="block text-gray-700 mb-2">ลักษณะกิจกรรมที่จัดขึ้นสอดคล้องกับหลักเกียรติและศักดิ์ของนักศึกษา(Code of Honor) ดังนี้</label>
      <textarea 
        id="codeOfHonor" 
        v-model="codeOfHonor" 
        class="form-textarea w-full h-22" 
        placeholder="อธิบายความสอดคล้องของลักษณะกิจกรรมกับ Code of Honor"
      ></textarea>
    </div>

    <!-- ระยะเวลาดำเนินงาน -->
    <div class="mb-6">
      <!-- <label class="block text-gray-700 mb-2">ระยะเวลาดำเนินงาน</label> -->
      <!-- ระยะเวลาเตรียมงาน -->
      <div class="mb-4">
        <label class="block text-gray-700 mb-2">ระยะเวลาเตรียมงาน:</label>
        <div class="flex items-center">
          <label class="mr-2">เริ่มต้น:</label>
          <input 
            type="date" 
            v-model="prepareStart" 
            class="form-input w-40 mr-4"
            style="width: 80%;"
          />
          <label class="mr-2">สิ้นสุด:</label>
          <input 
            type="date" 
            v-model="prepareEnd" 
            class="form-input w-40"
            style="width: 80%;" 
          />
        </div>
      </div>
    </div>

    <!-- ขั้นตอนการดำเนินงาน -->
    <div class="mb-6">
      <label for="scheduleDetails" class="block text-gray-700 mb-2">ขั้นตอนการดำเนินงาน</label>
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
    <label class="block text-gray-700 mb-2">คณะกรรมการจัดโครงการ</label>

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
        
        <!-- ช่องกรอกตำแหน่ง -->
        <input 
          type="text" 
          v-model="member.position" 
          placeholder="กรอกตำแหน่ง" 
          class="form-input w-36"
        />
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
    <label class="block text-gray-700 mb-2">รูปแบบการประเมินผล</label>

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

    <!-- ช่องอัพโหลดไฟล์รูปแบบการประเมินผล -->
    <div class="mb-6">
      <label for="evaluationFile" class="block text-gray-700 mb-2">อัพโหลดไฟล์สำหรับรูปแบบการประเมินผล</label>
      <input 
        id="evaluationFile" 
        type="file" 
        @change="handleFileChange($event, 'evaluationFile')" 
        class="form-input"
      />
    </div>

  <!-- ผลที่คาดว่าจะได้รับ -->
  <div class="mb-6">
    <label class="block text-gray-700 mb-2">ผลที่คาดว่าจะได้รับ</label>

    <div v-for="(expectedResult, index) in expectedResults" :key="index" class="flex items-center gap-4 mb-4">
      <!-- ผลที่คาดว่าจะได้รับ -->
      <div class="flex-1">
        <label :for="'expected-' + index" class="block mb-1">ผลที่คาดว่าจะได้รับข้อที่ {{ index + 1 }}</label>
        <input 
          type="text" 
          :id="'expected-' + index" 
          v-model="expectedResults[index].result" 
          class="form-input w-full"
          placeholder="ผลที่คาดว่าจะได้รับ"
        />
      </div>

      <!-- ตัวชี้วัด (KPI) -->
      <div class="flex-1">
        <label :for="'kpi-' + index" class="block mb-1">ตัวชี้วัด (KPI)</label>
        <input 
          type="text" 
          :id="'kpi-' + index" 
          v-model="expectedResults[index].kpi" 
          class="form-input w-full"
          placeholder="KPI"
        />
      </div>

      <!-- ค่าเป้าหมาย -->
      <div class="flex-1">
        <label :for="'target-' + index" class="block mb-1">ค่าเป้าหมาย</label>
        <input 
          type="text" 
          :id="'target-' + index" 
          v-model="expectedResults[index].target" 
          class="form-input w-full"
          placeholder="ค่าเป้าหมาย"
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
        <label :for="'solution-' + index" class="w-40">แนวทางข้อที่ {{ index + 1 }}:</label>
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
    <label for="budgetDetails" class="block text-gray-700 mb-2">รายละเอียดงบประมาณ</label>
    <input 
      id="budgetDetails" 
      type="file" 
      @change="handleFileChange($event, 'budgetDetails')" 
      class="form-input"
    />
  </div>

  <!-- อัพโหลดไฟล์เพิ่มเติม -->
  <div class="mb-6">
    <label for="prepareFile" class="block text-gray-700 mb-2">อัพโหลดไฟล์เพิ่มเติม</label>
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
    Add Activity Document
  </button>
</form>
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