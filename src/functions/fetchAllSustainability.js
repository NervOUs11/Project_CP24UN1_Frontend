
const URL = import.meta.env.VITE_API_ROOT;

const fetchAllSustainability = async () => {
    try {
      const res = await fetch(`${URL}/document/activity/allSustainability`, {
        method: "GET"
        })
    if(res.ok){
      const allSustainability = await res.json()
      return allSustainability
    }
    else {
      throw new error("Error, can't get Sustainability data")
    }
  }
  catch (error){
    console.log(error)
  }
}
  
export { fetchAllSustainability };