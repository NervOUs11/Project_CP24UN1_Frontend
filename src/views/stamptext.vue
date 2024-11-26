<template>
  <div class="container">
    <h1>Stamp Text on PDF (ภาษาไทย)</h1>
    <input type="file" @change="handleFileUpload" accept="application/pdf" />
    <button @click="stampText" :disabled="!selectedFile">Stamp Text and Download</button>
    <p v-if="statusMessage">{{ statusMessage }}</p>
  </div>
</template>

<script>
import { PDFDocument, rgb } from "pdf-lib";
import * as fontkit from "fontkit";

export default {
  data() {
    return {
      selectedFile: null, // เก็บไฟล์ PDF ที่ผู้ใช้อัปโหลด
      statusMessage: "", // แสดงข้อความสถานะ
    };
  },
  methods: {
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.selectedFile = file;
        this.statusMessage = `Selected file: ${file.name}`;
      } else {
        this.selectedFile = null;
        this.statusMessage = "No file selected.";
      }
    },
    async stampText() {
      if (!this.selectedFile) {
        this.statusMessage = "Please upload a PDF file.";
        return;
      }

      this.statusMessage = "Processing...";

      try {
        // อ่านไฟล์ PDF ที่อัปโหลด
        const arrayBuffer = await this.selectedFile.arrayBuffer();

        // โหลดฟอนต์ภาษาไทย
        const fontUrl = "../../public/fonts/Sarabun-Regular.ttf";
        const response = await fetch(fontUrl);
          if (!response.ok) {
            throw new Error(`Failed to load font: ${response.status} ${response.statusText}`);
          }
          const fontBytes = await response.arrayBuffer();


        // const fontBytes = await fetch(fontUrl).then((res) => res.arrayBuffer());

        // สร้างข้อมูลตัวอย่าง
        const studentData = {
          studentID: 64130500051,
          firstName: "พงศธร",
          lastName: "จันทร์สงเคราะห์",
          faculty: "เทคโนโลยีสารสนเทศ",
          department: "เทคโนโลยีสารสนเทศ",
          year: 4,
          advisor: "ดร.สายชล ใจเย็น",
          tel:"0955573902",
          username: "phongsathon.chan@kmutt.ac.th",
          detail:"ติด covid-19 โดยแนบไฟล์เอกสารการตรวจ atk ใน attachment file",
          currentGPA: 3.0,
          cumulativeGPA: 3.2
        };

        // Stamp ข้อมูลใน PDF
        const stampedPdfBytes = await this.stampStudentData(arrayBuffer, studentData, fontBytes);

        // ดาวน์โหลด PDF
        const blob = new Blob([stampedPdfBytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "stamped_RO-01.pdf";
        link.click();
        URL.revokeObjectURL(url);

        this.statusMessage = "PDF successfully stamped and downloaded!";
      } catch (error) {
        console.error(error);
        this.statusMessage = "An error occurred while processing the PDF.";
      }
    },
    async stampStudentData(pdfBytes, studentData, fontBytes) {
      const pdfDoc = await PDFDocument.load(pdfBytes);

      // ลงทะเบียน fontkit
      pdfDoc.registerFontkit(fontkit);
      console.log("Font Bytes Loaded:", fontBytes.byteLength);

      const thaiFont = await pdfDoc.embedFont(fontBytes); // ต้องแน่ใจว่าประกาศตัวแปรนี้
      console.log("Font embedded successfully:", thaiFont.name);

      const pages = pdfDoc.getPages();
      const firstPage = pages[0];

      const fields = [
        { text: `${studentData.firstName} ${studentData.lastName}`, x: 210, y: 168 },
        { text: `${studentData.faculty}`, x: 75, y: 193 },
        { text: `${studentData.department}`, x: 320, y: 193 },
        { text: `${studentData.year}`, x: 526, y: 193 },
        { text: `${studentData.currentGPA}`, x: 410, y: 265 },
        { text: `${studentData.cumulativeGPA}`, x: 527, y: 265 },    
        { text: `${studentData.advisor}`, x: 118, y: 290 },
        { text: `${studentData.tel}`, x: 245, y: 313 },
        { text: `${studentData.username}`, x: 375, y: 313 },
        { text: `${studentData.detail}`, x: 200, y: 337 },

      ];

      const fields2 = [
        { text: `/`, x: 148, y: 223 },
        { text: `/`, x: 148, y: 247 },
        { text: `/`, x: 148, y: 272 }
      ]

      async function drawTextWithSpacing(page, text, startX, startY, font, size, color, letterSpacing) {
        let currentX = startX; // ตำแหน่งเริ่มต้นสำหรับวาดข้อความ

        for (const char of text) {
          page.drawText(char, {
            x: currentX,
            y: startY,
            size: size,
            font: font,
            color: color,
          });

          // เลื่อนตำแหน่ง x ตามขนาดตัวอักษรและ letterSpacing
          currentX += font.widthOfTextAtSize(char, size) + letterSpacing;
        }
      }

      const studentID = `${studentData.studentID}`;
      const startX = 438;
      const startY = 668;
      const letterSpacing = 4;

      await drawTextWithSpacing(firstPage, studentID, startX, startY, thaiFont, 12, rgb(0, 0, 0), letterSpacing);

      fields.forEach(({ text, x, y }) => {
        firstPage.drawText(text, {
          x,
          y: firstPage.getHeight() - y,
          size: 10,
          font: thaiFont, // ใช้ฟอนต์ภาษาไทย
          color: rgb(0, 0, 0),
        });


      });

      fields2.forEach(({ text, x, y }) => {
        firstPage.drawText(text, {
          x,
          y: firstPage.getHeight() - y,
          size: 16,
          font: thaiFont, // ใช้ฟอนต์ภาษาไทย
          color: rgb(0, 0, 0),
        });


      });

      const stampedPdfBytes = await pdfDoc.save();
      return stampedPdfBytes;
    },
  },
};
</script>

<style>
.container {
  text-align: center;
  margin-top: 50px;
}
input,
button {
  margin: 10px;
  padding: 10px;
  font-size: 16px;
}
</style>
