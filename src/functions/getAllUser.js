const URL = import.meta.env.VITE_API_ROOT 

const getAllUser = async () => {
  try{
    const res = await fetch(`${URL}/admin/allUser`, {
      method: "GET"
    })
    if(res.ok){
      const allUser = res.json()
      return allUser
    }
    else {
      throw new error("Error, can't get User data")
    }
  }
  catch (error){
    console.log(error)
  }
}

export { getAllUser }