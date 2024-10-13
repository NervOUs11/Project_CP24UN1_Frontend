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
      return res
    } 
    catch (error) {
      console.error(error)
    }
  }

export { login }
  