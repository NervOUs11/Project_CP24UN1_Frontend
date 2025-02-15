const URL = import.meta.env.VITE_API_ROOT;

const fetchAllEntrepreneurial = async () => {
    try {
      const res = await fetch(`${URL}/document/activity/allEntrepreneurial`, {
        method: "GET"
        })
    if(res.ok){
      const allEntrepreneurial = await res.json()
      return allEntrepreneurial
    }
    else {
      throw new error("Error, can't get Entrepreneurial data")
    }
  }
  catch (error){
    console.log(error)
  }
}
  
export { fetchAllEntrepreneurial };