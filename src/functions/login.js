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
      localStorage.setItem("studentID", data.user.studentID);
      localStorage.setItem("username", data.user.username);
      localStorage.setItem("firstName", data.user.firstName);
      localStorage.setItem("lastName", data.user.lastName);
      localStorage.setItem("tel", data.user.tel);
      localStorage.setItem("alterEmail", data.user.alterEmail);
      localStorage.setItem("signature", data.user.signature);
      localStorage.setItem("department", data.user.department);
      localStorage.setItem("faculty", data.user.faculty);
      if (!data.role) {
        localStorage.setItem("role", "student")
      } 
      // else {
      //   localStorage.setItem("role", data.roleID)
      // }
      console.log(localStorage.getItem("role"))
      return res
    } 
    catch (error) {
      console.error(error)
    }
  }

export { login }
  