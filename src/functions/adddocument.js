const URL = import.meta.env.VITE_API_ROOT 

const addDocument = async (
    // title, to, faculty, description, amount, 
    //     academicSkillDevelopment, sportsAndHealth, 
    //     volunteer, artAndCulturalPreservation, 
    //     characterDevelopment, universityCommitment, 
    //     location, startdate, enddate
        pdf
    ) => {
    try {
        const res = await fetch(`${URL}/add`, { //backend api path
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                // title: title,
                // to: to,
                // faculty: faculty,
                // description: description,
                // amount: amount,
                // academicSkillDevelopment: academicSkillDevelopment,
                // sportsAndHealth: sportsAndHealth,
                // volunteer: volunteer,
                // artAndCulturalPreservation: artAndCulturalPreservation,
                // characterDevelopment: characterDevelopment,
                // universityCommitment: universityCommitment,
                // location: location,
                // startdate: startdate,
                // enddate: enddate,
                pdf:pdf
            })
        })
        return res
    } 
    catch (error) {
      console.error(error)
    }
  }

export { addDocument }
  