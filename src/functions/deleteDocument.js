const URL = import.meta.env.VITE_API_ROOT 

const deleteDocument = async (studentID, documentID) => {
    try {
      const res = await fetch(`${URL}/userID/${studentID}/document/absence/delete/${documentID}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || 'Failed to delete document');
      }
      console.log(res.status)
      return res
    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
    }
}

export { deleteDocument }  