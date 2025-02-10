const URL = import.meta.env.VITE_API_ROOT;

const fetchAllStaff = async () => {
    try {
      const res = await fetch(`${URL}/document/activity/allStaff`, {
        method: "GET"
        })
    if(res.ok){
      const allStaff = await res.json()
      return allStaff
    }
    else {
      throw new error("Error, can't get Staff data")
    }
  }
  catch (error){
    console.log(error)
  }
}
  
export { fetchAllStaff };