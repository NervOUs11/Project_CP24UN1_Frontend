const URL = import.meta.env.VITE_API_ROOT

const editDocument = async (studentID, documentID, dataToUpdate) => {
    try {
        const res = await fetch(`${URL}/userID/${studentID}/document/absence/edit/${documentID}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dataToUpdate),
        });
        
        if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
        }

        return await res.json(); // คืนค่าผลลัพธ์ที่ได้รับจาก backend
    } catch (error) {
        console.error('Error updating document:', error);
    }
};

export { editDocument };
