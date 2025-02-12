const URL = import.meta.env.VITE_API_ROOT;

const fetchAllEvaluation = async () => {
    try {
      const res = await fetch(`${URL}/document/activity/allEvaluation`, {
        method: "GET"
        })
    if(res.ok){
      const allEvaluation = await res.json()
      return allEvaluation
    }
    else {
      throw new error("Error, can't get Evaluation data")
    }
  }
  catch (error){
    console.log(error)
  }
}
  
export { fetchAllEvaluation };