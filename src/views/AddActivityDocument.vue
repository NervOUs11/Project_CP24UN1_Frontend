<script setup>
import { ref, reactive, computed, onMounted } from 'vue';

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
          <div class="mb-3">
            <label for="expenses" class="block text-gray-700 mb-1">ค่าใช้จ่าย (ตัวเลข)</label>
            <input 
              type="number" 
              id="expenses" 
              v-model="expenses" 
              class="form-input" 
              required
            />
          </div>

          <div class="mb-3">
            <label for="expensesText" class="block text-gray-700 mb-1">ค่าใช้จ่าย (ตัวอักษร)</label>
            <input 
              type="text" 
              id="expensesText" 
              v-model="expensesText" 
              class="form-input" 
              required
            />
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

        <h1>Page 2</h1>
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
        <div v-if="selectedSkills.length > 0" class="mt-4">
          <h3>ทักษะที่เลือก:</h3>
          <ul class="inline-list">
            <li v-for="(skill, index) in selectedSkills" :key="skill">
              {{ skill }}<span v-if="index < selectedSkills.length - 1">,</span>
            </li>
          </ul>
        </div>


        <!-- แสดงช่องกรอกเปอร์เซ็นต์หากเลือกครบ 3 ทักษะ -->
        <!-- <div v-if="isValidSelection" class="mt-4">
          <label class="block mb-2">กรอกเปอร์เซ็นต์ (รวมกัน 100%):</label>
          <div v-for="skill in selectedSkills" :key="skill" class="mb-2">
            <label :for="skill">{{ skill }}:</label>
            <input 
              type="number" 
              v-model="percentages[skill]" 
              class="form-input" 
              min="0" 
              max="100" 
            />
          </div>
        </div> -->

        <!-- ข้อความแสดงผลการตรวจสอบเปอร์เซ็นต์ -->
        <!-- <div v-if="!isPercentageValid && isValidSelection" class="text-red-500 mt-2">
          <p>เปอร์เซ็นต์ทั้งหมดต้องรวมกันเป็น 100%</p>
        </div> -->

        <!-- แสดงผลข้อมูลที่กรอก -->
        <!-- <div v-if="isValidSelection && isPercentageValid" class="mt-4">
          <h3>ข้อมูลที่เลือก:</h3>
          <ul>
            <li v-for="skill in selectedSkills" :key="skill">
              {{ skill }}: {{ percentages[skill] }}%
            </li>
          </ul>
        </div> -->

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