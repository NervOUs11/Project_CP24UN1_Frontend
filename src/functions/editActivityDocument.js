const URL = import.meta.env.VITE_API_ROOT

const editActivityDocument = async (studentID, documentID, dataToUpdate) => {
    try {
        const res = await fetch(`${URL}/userID/${studentID}/document/activity/edit/${documentID}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dataToUpdate),
        });
        
        if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
        }

        return res;
    } catch (error) {
        console.error('Error updating document:', error);
    }
};

export { editActivityDocument };