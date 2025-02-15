const URL = import.meta.env.VITE_API_ROOT;

const fetchAllActivity = async () => {
    try {
      const res = await fetch(`${URL}/document/activity/allActivity`, {
        method: "GET"
        })
    if(res.ok){
      const allActivity = await res.json()
      return allActivity
    }
    else {
      throw new error("Error, can't get Activity data")
    }
  }
  catch (error){
    console.log(error)
  }
}
  
export { fetchAllActivity };