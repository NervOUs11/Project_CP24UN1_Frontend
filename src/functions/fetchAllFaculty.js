const URL = import.meta.env.VITE_API_ROOT;

const fetchAllFaculty = async () => {
    try {
      const res = await fetch(`${URL}/document/activity/allFaculty`, {
        method: "GET"
        })
    if(res.ok){
      const allFaculty = await res.json()
      return allFaculty
    }
    else {
      throw new error("Error, can't get Faculty data")
    }
  }
  catch (error){
    console.log(error)
  }
}
  
export { fetchAllFaculty };