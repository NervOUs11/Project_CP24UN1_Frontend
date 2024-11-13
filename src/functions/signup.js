const URL = import.meta.env.VITE_API_ROOT 

const signup = async (studentID, username, password, firstname, lastname,
                      phoneNumber, alterEmail, advisor1, advisor2,
                      faculty, department, signature) => {
    try {
        const res = await fetch(`${URL}/signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                studentID: studentID,
                username: username,
                password: password,
                firstname: firstname,
                lastname: lastname,
                phone_number: phoneNumber,
                alter_email: alterEmail,
                advisor1_fullname: advisor1,
                advisor2_fullname: advisor2,
                faculty: faculty,
                department: department,
                // signature: signature
            })
        })
        return res
    } 
    catch (error) {
      console.error(error)
    }
  }

export { signup }
  