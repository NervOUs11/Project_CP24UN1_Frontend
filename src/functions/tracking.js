const URL = import.meta.env.VITE_API_ROOT;

const tracking = async (id) => {
    try {
        const res = await fetch(`${URL}/document/all/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
        }

        const data = await res.json();
        console.log(data)
        return data;  // Return the document data
    } catch (error) {
        console.error("Error fetching tracking data:", error);
        throw error;
    }
};

export { tracking };
