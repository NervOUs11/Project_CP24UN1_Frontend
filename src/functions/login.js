const URL = import.meta.env.VITE_API_ROOT 

const login = async (username, password) => {
    try {
      const res = await fetch(`${URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
      })
      const data = await res.json()
      
      localStorage.setItem("firstName", data.firstName);
      localStorage.setItem("lastName", data.lastName);
      localStorage.setItem("username", data.username);
      localStorage.setItem("tel", data.tel);
      localStorage.setItem("alterEmail", data.alterEmail);
      localStorage.setItem("faculty", data.faculty);
      localStorage.setItem("department", data.department);

      // เงื่อนไขแยกสำหรับ Student และ Staff
      if (data.studentID !== undefined) {
        localStorage.setItem("role", "Student");
        localStorage.setItem("studentID", data.studentID);
        localStorage.setItem("facultyId", data.facultyID);
        localStorage.setItem("departmentId", data.departmentID);
        localStorage.setItem("currentGPA", data.currentGPA);
        localStorage.setItem("cumulativeGPA", data.cumulativeGPA);
        localStorage.setItem("signature", data.signature);
        localStorage.setItem("advisor", data.advisor);
        localStorage.setItem("year", data.year);
      } else if (data.studentID === undefined) {
        localStorage.setItem("role", data.role);
        localStorage.setItem("staffID", data.staffID);
        localStorage.setItem("facultyID", data.facultyID);
        localStorage.setItem("departmentID", data.departmentID);
      }

      return res
    } 
    catch (error) {
      console.error(error)
    }
  }

export { login }
  