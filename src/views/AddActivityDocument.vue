<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';

const activityHours = ref('')
const writtenDate = ref('');
const agencyName = ref('');
const reason = computed(() => agencyName.value);
const projectName = ref('');
const organizeProject = computed(() => projectName.value);
const responsibleStudent = localStorage.getItem("firstName") + " " + localStorage.getItem("lastName")


// กำหนดค่าตั้งต้นเป็นวันที่ปัจจุบันเมื่อโหลด
onMounted(() => {
  writtenDate.value = new Date().toISOString().split('T')[0];
});

// ข้อมูลที่ใช้ในฟอร์ม
const formData = ref({
  agencyName: '', // ชื่อหน่วยงาน
  projectName: '', // ชื่อโครงการ
  startDate: '', // วันที่เริ่ม
  endDate: '', // วันที่สิ้นสุด
  location: '', // สถานที่
  objective: '', // วัตถุประสงค์
  expenses: '', // ค่าใช้จ่าย (ตัวเลข)
  expensesText: '', // ค่าใช้จ่าย (ตัวอักษร)
  activityHours: '', // ชั่วโมงกิจกรรม (เลือก: นับหรือไม่นับ)
  activityCategory: '', // ด้านกิจกรรม
  hoursCount: '', // จำนวนชั่วโมง
});

// ฟังก์ชันตรวจสอบการเปลี่ยนแปลงของ activityHours
const handleActivityHoursChange = () => {
  if (formData.activityHours !== 'count') {
    formData.activityCategory = '';
    formData.hoursCount = '';
  }
};

// รายการทักษะทั้งหมด
const skillsList = [
  'Knowledge', 'Professional Skill', 'Thinking Skill', 'Learning Skill',
  'Communication Skill', 'Management Skill', 'Leadership', 'KMUTT’s Citizenship'
];

const expenses = ref(0); // ค่าใช้จ่ายที่กรอก
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

// ตรวจสอบว่าทักษะถูกเลือกครบ 3 รายการ
const isValidSelection = computed(() => selectedSkills.length === 3);

// ตรวจสอบว่าเปอร์เซ็นต์รวมเป็น 100%
const isPercentageValid = computed(() => {
  const total = selectedSkills.reduce((sum, skill) => {
    return sum + (percentages[skill] ? parseFloat(percentages[skill]) : 0);
  }, 0);
  return total === 100;
});

// ฟังก์ชันจัดการการเลือกทักษะ
function handleSkillSelection(skill) {
  if (!selectedSkills.includes(skill)) {
    percentages[skill] = 0; // ตั้งค่าเปอร์เซ็นต์เริ่มต้นเป็น 0
  } else {
    delete percentages[skill]; // ลบค่าทักษะที่ไม่ได้เลือกออกจาก percentages
  }
}

// รายการหัวข้อของ Entrepreneurial
const entrepreneurialOptions = [
  'Entrepreneurial Mindset',
  'Knowledge Sharing Society',
  'Research and Innovation Impact',
  'Financial Literacy'
];

// รายการที่ผู้ใช้เลือก
const selectedEntrepreneurialOptions = ref([]);

const sustainabilityOptions = [
  'SDGs Culture',
  'Sustainability Change Agents',
  'Green University and Smart Campus',
  'Carbon Neutrality'
];

// รายการ Goals สำหรับ SDGs Culture
const sdgsGoals = [
  { id: 'Goal 1', name: 'No Poverty' },
  { id: 'Goal 2', name: 'Zero Hunger' },
  { id: 'Goal 3', name: 'Good Health and Well-Being' },
  { id: 'Goal 4', name: 'Quality Education' },
  { id: 'Goal 5', name: 'Gender Equality' },
  { id: 'Goal 6', name: 'Clean Water and Sanitation' },
  { id: 'Goal 7', name: 'Affordable and Clean Energy' },
  { id: 'Goal 8', name: 'Decent Work and Economic Growth' },
  { id: 'Goal 9', name: 'Industry, Innovation, and Infrastructure' },
  { id: 'Goal 10', name: 'Reduced Inequalities' },
  { id: 'Goal 11', name: 'Sustainable Cities and Communities' },
  { id: 'Goal 12', name: 'Responsible Consumption and Production' },
  { id: 'Goal 13', name: 'Climate Action' },
  { id: 'Goal 14', name: 'Life Below Water' },
  { id: 'Goal 15', name: 'Life on Land' },
  { id: 'Goal 16', name: 'Peace, Justice and Strong Institutions' },
  { id: 'Goal 17', name: 'Partnerships' }
];

// เก็บค่าที่เลือก
const selectedSustainabilityOptions = ref([]);
const selectedGoals = ref([]);

const rationale = ref(''); // หลักการและเหตุผล
const objectives = ref(['', '', '']); // วัตถุประสงค์ 3 ช่อง
const participants = reactive({
  students: 0, // จำนวนผู้เข้าร่วมนักศึกษา
  teachers: 0, // จำนวนผู้เข้าร่วมอาจารย์
  staff: 0, // จำนวนผู้เข้าร่วมเจ้าหน้าที่
  community: 0, // จำนวนผู้เข้าร่วมบุคคลในชุมชน/นักเรียน
});
const activityDescription = ref(''); // ลักษณะกิจกรรม

const timeframes = ref({
      preparation: { start: '', end: '' },
      implementation: { start: '', end: '' }
    });

const addObjective = () => {
  objectives.value.push(''); // เพิ่มช่องวัตถุประสงค์
};

const operationFile = ref(null);

// รายชื่อ Student ที่ตั้งไว้
const students = ref([
  { id: '64130500001', name: 'Alice A', department: 'เทคโนโลยีสารสนเทศปี4', phone: '0812345678', position: '' },
  { id: '64130500002', name: 'Bob B', department: 'วิศวกรรมคอมพิวเตอร์ปี4', phone: '0812345679', position: '' },
  { id: '64130500003', name: 'Charlie C', department: 'วิทยาศาสตร์คอมพิวเตอร์ปี4', phone: '0812345680', position: '' },
]);
const selectedStudent = ref(''); // ตัวแปรสำหรับเก็บนักเรียนที่เลือก

// รายการคณะกรรมการ
const committee = ref([]);

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

const evaluationOptions = {
  observation: { label: 'การสังเกต (Observation)' },
  interview: { label: 'การสัมภาษณ์ (Interview)' },
  questionnaires: { label: 'การใช้แบบสอบถาม (Questionnaires)' },
  test: { label: 'การใช้แบบทดสอบ (Test)' },
  other: { label: 'อื่นๆ โปรดระบุ' },
};

// ติดตามตัวเลือกที่ถูกติ้ก
const selectedOptions = reactive({
  observation: false,
  interview: false,
  questionnaires: false,
  test: false,
  other: false,
});

// เก็บรายละเอียดของ "อื่นๆ"
const otherDescription = ref('');

// เก็บไฟล์ที่อัปโหลด
const uploadedFiles = reactive({});

// จัดการอัปโหลดไฟล์
const handleFileUpload = (key, event) => {
  const file = event.target.files[0];
  if (file) {
    uploadedFiles[key] = file;
  }
};

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

const budgetFileName = ref('');

// ฟังก์ชันส่งข้อมูล
const addActivityDocument = () => {
  console.log('Activity Document:', {
    ...formData,
    dueTo: dueTo.value,
    organizeBy: organizeBy.value,
  });
};

</script>


<template>
  <div class="flex justify-center items-center min-h-screen bg-blue-50">
    <div class="bg-white p-6 rounded-lg shadow-lg w-[1100px]">
      <h1 class="text-2xl font-bold mb-4 text-center text-blue-500">Add Activity Document</h1>

      <form @submit.prevent="addActivityDocument">
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
            <div class="col-span-1">
                <label for="location" class="block text-gray-700 mb-1">ณ สถานที่</label>
                <input 
                type="text" 
                id="location" 
                v-model="location" 
                class="form-input" 
                required
                />
            </div>

            <!-- วัตถุประสงค์ -->
            <div class="col-span-2">
                <label for="objective" class="block text-gray-700 mb-1">วัตถุประสงค์</label>
                <textarea 
                id="objective" 
                v-model="objective" 
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



          <!-- ชั่วโมงกิจกรรม -->
          <div class="mb-3">
            <label for="activityHours" class="block text-gray-700 mb-1">ชั่วโมงกิจกรรม</label>
            <select 
              id="activityHours" 
              v-model="activityHours" 
              class="form-input"
              @change="handleActivityHoursChange"
              required
            >
              <option value="">เลือกชั่วโมงกิจกรรม</option>
              <option value="noCount">ไม่นับชั่วโมง</option>
              <option value="count">นับชั่วโมง</option>
            </select>
          </div>

          <!-- ถ้านับชั่วโมง -->
          <div v-if="activityHours === 'count'" class="mb-3">
            <label for="activityCategory" class="block text-gray-700 mb-1">เลือกด้านกิจกรรม</label>
            <select 
              id="activityCategory" 
              v-model="activityCategory" 
              class="form-input" 
              required
            >
              <option value="">เลือกด้าน</option>
              <option value="academic">ด้านพัฒนาทักษะทางวิชาการและวิชาชีพ</option>
              <option value="sports">ด้านกีฬาและการส่งเสริมสุขภาพ</option>
              <option value="volunteer">ด้านกิจกรรมจิตอาสาและบำเพ็ญประโยชน์</option>
              <option value="arts">ด้านทำนุบำรุงศิลปะและวัฒนธรรม</option>
              <option value="character">ด้านการพัฒนาคุณลักษณะ</option>
              <option value="pride">ด้านความภูมิใจ ความรัก ความผูกพันหาวิทยาลัย</option>
            </select>
          </div>    
          <div v-if="activityHours === 'count'" class="mb-3"></div> <!-- เอาไว้ให้ field จำนวนชั่วโมงอยู่ทางขวา -->
          <div v-if="activityHours === 'count'" class="mb-3">
            <label for="hoursCount" class="block text-gray-700 mb-1 ">จำนวนชั่วโมง</label>
            <input 
              type="number" 
              id="hoursCount" 
              v-model="hoursCount" 
              class="form-input" 
              required
            />
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
            >
                <option value="" disabled>เลือกชื่อ</option>
                <option v-for="name in advisorList" :key="name" :value="name">
                {{ name }}
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
            >
                <option value="" disabled>เลือกชื่อ</option>
                <option v-for="name in presidentList" :key="name" :value="name">
                {{ name }}
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
        </div>

        <!-- เลือกทักษะ (checkbox) -->
        <div>
          <h1>KMUTT Student QF</h1>
          <label class="block mb-2">เลือกทักษะ (สูงสุด 3 ทักษะ):</label>
          <div v-for="skill in skillsList" :key="skill" class="mb-2">
            <input 
              type="checkbox" 
              :id="skill" 
              :value="skill" 
              v-model="selectedSkills" 
              :disabled="selectedSkills.length >= 3 && !selectedSkills.includes(skill)"
            />
              <label :for="skill">{{ skill }}</label>
          </div>
          <p v-if="selectedSkills.length >= 3" class="text-red-500 mt-2">
            คุณเลือกทักษะครบแล้ว (สูงสุด 3 ทักษะ)
          </p>
        </div>

        <!-- แสดงทักษะที่เลือก -->
        <!-- <div v-if="selectedSkills.length > 0" class="mt-4">
          <h3>ทักษะที่เลือก:</h3>
          <ul class="inline-list">
            <li v-for="(skill, index) in selectedSkills" :key="skill">
              {{ skill }}<span v-if="index < selectedSkills.length - 1">,</span>
            </li>
          </ul>
        </div> -->

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
            <div v-for="option in entrepreneurialOptions" :key="option" class="mb-2">
              <input 
                type="checkbox" 
                :id="option" 
                :value="option" 
                v-model="selectedEntrepreneurialOptions" 
              />
              <label :for="option">{{ option }}</label>
            </div>
          </div>
      </div>

      <!-- Sustainability -->
      <div>
        <h1>Sustainability</h1>
        <div>
          <label class="block mb-2">กรุณาเลือกหัวข้อที่เกี่ยวข้อง:</label>
          <div v-for="option in sustainabilityOptions" :key="option" class="mb-2">
            <input 
              type="checkbox" 
              :id="option" 
              :value="option" 
              v-model="selectedSustainabilityOptions" 
            />
            <label :for="option">{{ option }}</label>
          </div>
        </div>

        <!-- แสดงผลตัวเลือก Goal เมื่อเลือก SDGs Culture -->
        <div v-if="selectedSustainabilityOptions.includes('SDGs Culture')" class="mt-4">
          <label class="block mb-2">เลือก Goals ที่เกี่ยวข้อง (สูงสุด 3 Goals):</label>
          <div v-for="goal in sdgsGoals" :key="goal.id" class="mb-2">
            <input 
              type="checkbox" 
              :id="goal.id" 
              :value="goal" 
              v-model="selectedGoals" 
              :disabled="selectedGoals.length >= 3 && !selectedGoals.includes(goal)"/>
            <label :for="goal.id">{{ goal.id }}: {{ goal.name }}</label>
          </div>
          <!-- <p v-if="selectedGoals.length >= 3" class="text-red-500 mt-2">
            คุณเลือก Goals ครบแล้ว (สูงสุด 3 Goals)
          </p> -->
        </div>

        <!-- แสดงผลรายการที่เลือก -->
        <div v-if="selectedGoals.length > 0" class="mt-4">
          <h3>คุณเลือก Goals:</h3>
          <ul>
            <li v-for="goal in selectedGoals" :key="goal.id">
              {{ goal.id }}: {{ goal.name }}
            </li>
          </ul>
        </div> 
      </div>

      <!-- หลักการและเหตุผล -->
    <div class="mb-6">
      <label for="rationale" class="block text-gray-700 mb-2">หลักการและเหตุผล</label>
      <textarea 
        id="rationale" 
        v-model="rationale" 
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
      <div class="flex items-center mb-2">
        <label class="w-48">นักศึกษา จำนวน:</label>
        <input 
          type="number" 
          v-model="participants.students" 
          class="form-input w-20 mr-2"
        /> 
        <span>คน</span>
      </div>
      <div class="flex items-center mb-2">
        <label class="w-48">อาจารย์ จำนวน:</label>
        <input 
          type="number" 
          v-model="participants.teachers" 
          class="form-input w-20 mr-2"
        /> 
        <span>คน</span>
      </div>
      <div class="flex items-center mb-2">
        <label class="w-48">เจ้าหน้าที่ จำนวน:</label>
        <input 
          type="number" 
          v-model="participants.staff" 
          class="form-input w-20 mr-2"
        /> 
        <span>คน</span>
      </div>
      <div class="flex items-center mb-2">
        <label class="w-48">บุคคลในชุมชน/นักเรียน จำนวน:</label>
        <input 
          type="number" 
          v-model="participants.community" 
          class="form-input w-20 mr-2"
        /> 
        <span>คน</span>
      </div>
    </div>

    <!-- ลักษณะกิจกรรม -->
    <div class="mb-6">
      <label for="activityDescription" class="block text-gray-700 mb-2">ลักษณะกิจกรรม</label>
      <textarea 
        id="activityDescription" 
        v-model="activityDescription" 
        class="form-textarea w-full h-32" 
        placeholder="เขียนบรรยายรูปแบบการจัดกิจกรรม"
      ></textarea>
    </div>

    <!-- ระยะเวลาดำเนินงาน -->
    <div class="mb-6">
      <label class="block text-gray-700 mb-2">ระยะเวลาดำเนินงาน</label>

      <!-- ระยะเวลาเตรียมงาน -->
      <div class="mb-4">
        <label class="block text-gray-700 mb-2">ระยะเวลาเตรียมงาน:</label>
        <div class="flex items-center">
          <label class="mr-2">เริ่มต้น:</label>
          <input 
            type="date" 
            v-model="timeframes.preparation.start" 
            class="form-input w-40 mr-4"
            style="width: 80%;"
          />
          <label class="mr-2">สิ้นสุด:</label>
          <input 
            type="date" 
            v-model="timeframes.preparation.end" 
            class="form-input w-40"
            style="width: 80%;" 
          />
        </div>
      </div>

      <!-- ระยะเวลาปฏิบัติงาน -->
      <div>
        <label class="block text-gray-700 mb-2">ระยะเวลาปฏิบัติงาน:</label>
        <div class="flex items-center">
          <label class="mr-2">เริ่มต้น:</label>
          <input 
            type="date" 
            v-model="timeframes.implementation.start" 
            class="form-input w-40 mr-4"
            style="width: 80%;"
          />
          <label class="mr-2">สิ้นสุด:</label>
          <input 
            type="date" 
            v-model="timeframes.implementation.end" 
            class="form-input w-40"
            style="width: 80%;"
          />
        </div>
      </div>
    </div>

    <!-- ขั้นตอนการดำเนินงาน -->
    <div class="mb-6">
      <label for="operation-steps" class="block text-gray-700 mb-2">ขั้นตอนการดำเนินงาน</label>
      
      <div class="mb-2">
        <label for="operation-steps">ตัวอย่างการประเมินผล:</label>
        <input 
          id="operation-steps" 
          type="file" 
          @change="handleOperationFileUpload" 
          class="form-input mt-2"
        />
      </div>
    </div>

    <!-- คณะกรรมการจัดโครงการ -->
    <div class="mb-6">
    <label class="block text-gray-700 mb-2">คณะกรรมการจัดโครงการ</label>

    <!-- Dropdown สำหรับเลือกชื่อ -->
    <!-- <div class="mb-4">
      <label for="select-student" class="block mb-1">เลือกชื่อจากรายการ:</label>
      <select 
        id="select-student" 
        v-model="selectedStudent" 
        class="form-select w-60"
      >
        <option value="" disabled>รายชื่อ</option>
        <option v-for="student in students" :key="student.id" :value="student">
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
    </div> -->

    <!-- แสดงรายการคณะกรรมการ -->
    <!-- <div v-for="(member, index) in students" :key="member.id" class="mb-4 flex items-center justify-between border-b pb-2">
      <div class="flex space-x-4 w-full">
        <span class="w-10">{{ index + 1 }}</span>
        <span class="w-32">{{ member.id }}</span>
        <span class="w-48">{{ member.name }}</span>
        <span class="w-48">{{ member.department }}</span>
        <span class="w-40">{{ member.phone }}</span> -->
        
        <!-- ช่องกรอกตำแหน่ง -->
        <!-- <input 
          type="text" 
          v-model="member.position" 
          placeholder="กรอกตำแหน่ง" 
          class="form-input w-36"
        />
      </div> -->

      <!-- ปุ่มลบ -->
      <!-- <button 
        type="button" 
        @click="removeCommitteeMember(index)" 
        class="bg-red-500 text-white px-4 py-2 rounded mt-2 sm:mt-0"
      >
        ลบ
      </button>
    </div> -->

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
    <div v-for="(option, key) in evaluationOptions" :key="key" class="mb-4">
      <input 
        type="checkbox" 
        :id="key" 
        v-model="selectedOptions[key]" 
        class="mr-2"
      />
      <label :for="key">{{ option.label }}</label>

      <!-- ช่องอัพโหลดไฟล์ -->
      <div v-if="selectedOptions[key]" class="mt-2 ml-6">
        <label :for="'upload-' + key" class="block mb-1">
          อัพโหลดไฟล์สำหรับ {{ option.label }}
        </label>
        <input 
          :id="'upload-' + key" 
          type="file" 
          @change="handleFileUpload(key, $event)" 
          class="form-input"
        />
      </div>
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
      @change="handleBudgetFileUpload" 
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