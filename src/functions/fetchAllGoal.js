const URL = import.meta.env.VITE_API_ROOT;

const fetchAllGoal = async () => {
    try {
      const res = await fetch(`${URL}/document/activity/allGoal`, {
        method: "GET"
        })
    if(res.ok){
      const allGoal = await res.json()
      return allGoal
    }
    else {
      throw new error("Error, can't get Goal data")
    }
  }
  catch (error){
    console.log(error)
  }
}
  
export { fetchAllGoal };