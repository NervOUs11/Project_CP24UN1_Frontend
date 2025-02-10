const URL = import.meta.env.VITE_API_ROOT;

const fetchAllStudent = async () => {
    try {
      const res = await fetch(`${URL}/document/activity/allStudent`, {
        method: "GET"
        })
    if(res.ok){
      const allStudent = await res.json()
      return allStudent
    }
    else {
      throw new error("Error, can't get Student data")
    }
  }
  catch (error){
    console.log(error)
  }
}
  
export { fetchAllStudent };