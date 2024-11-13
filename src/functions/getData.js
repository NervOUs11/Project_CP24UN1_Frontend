const URL = import.meta.env.VITE_API_ROOT 
// import { getNewToken } from './token'
// import router from "../router"

const getAllStaff = async () => {
  try{
    const res = await fetch(`${URL}/allStaff`, {
      method: "GET"
    })
    if(res.ok){
      const allStaff = res.json()
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

const getAllFaculty = async () => {
    try{
      const res = await fetch(`${URL}/allFaculty`, {
        method: "GET"
      })
      if(res.ok){
        const allFaculty = res.json()
        return allFaculty
      }
      else {
        throw new error("Error, can't get faculty data")
      }
    }
    catch (error){
      console.log(error)
    }
}

  const getAllDepartment = async () => {
    try{
      const res = await fetch(`${URL}/allDepartment`, {
        method: "GET"
      })
      if(res.ok){
        const allDepartment = res.json()
        return allDepartment
      }
      else {
        throw new error("Error, can't get department data")
      }
    }
    catch (error){
      console.log(error)
    }
  }
export { getAllStaff, getAllFaculty, getAllDepartment }