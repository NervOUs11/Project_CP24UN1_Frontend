const URL = import.meta.env.VITE_API_ROOT 

const addDocument = async (dataToSend) => {
    try {
        const res = await fetch(`${URL}/add`, { //backend api path
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dataToSend),
        })
        if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return await res.json();
    } 
    catch (error) {
      console.error(error)
    }
  }

export { addDocument }
  