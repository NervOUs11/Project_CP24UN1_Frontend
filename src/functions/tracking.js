const URL = import.meta.env.VITE_API_ROOT;

const tracking = async () => {
    try {
        const studentID = localStorage.getItem("studentID");
        if (!studentID) {
            throw new Error("Student ID not found in localStorage");
        }

        const res = await fetch(`${URL}/allDocument/${studentID}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
        }

        const data = await res.json();
        return data;  // Return the document data
    } catch (error) {
        console.error("Error fetching tracking data:", error);
        throw error;
    }
};

export { tracking };
