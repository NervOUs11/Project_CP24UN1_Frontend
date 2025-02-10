const URL = import.meta.env.VITE_API_ROOT;

const fetchAllStudentQF = async () => {
    try {
      const res = await fetch(`${URL}/document/activity/allStudentQF`, {
        method: "GET"
        })
    if(res.ok){
      const allStudentQF = await res.json()
      return allStudentQF
    }
    else {
      throw new error("Error, can't get StudentQF data")
    }
  }
  catch (error){
    console.log(error)
  }
}
  
export { fetchAllStudentQF };