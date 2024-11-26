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
      console.log(data.user)
      localStorage.setItem("studentID", data.studentID);
      localStorage.setItem("username", data.username);
      localStorage.setItem("firstName", data.firstName);
      localStorage.setItem("lastName", data.lastName);
      localStorage.setItem("tel", data.tel);
      localStorage.setItem("alterEmail", data.alterEmail);
      localStorage.setItem("signature", data.signature);
      localStorage.setItem("department", data.department);
      localStorage.setItem("faculty", data.faculty);
      localStorage.setItem("facultyId", data.facultyID);
      localStorage.setItem("departmentId", data.departmentID);
      localStorage.setItem("currentGPA", data.currentGPA);
      localStorage.setItem("cumulativeGPA", data.cumulativeGPA);
      if (!data.role) {
        localStorage.setItem("role", "student")
      }
      //console.log(localStorage.getItem("role"))
      return res
    } 
    catch (error) {
      console.error(error)
    }
  }

export { login }
  