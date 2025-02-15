const URL = import.meta.env.VITE_API_ROOT;

const fetchAllParticipant = async () => {
    try {
      const res = await fetch(`${URL}/document/activity/allParticipant`, {
        method: "GET"
        })
    if(res.ok){
      const allParticipant = await res.json()
      return allParticipant
    }
    else {
      throw new error("Error, can't get Participant data")
    }
  }
  catch (error){
    console.log(error)
  }
}
  
export { fetchAllParticipant };