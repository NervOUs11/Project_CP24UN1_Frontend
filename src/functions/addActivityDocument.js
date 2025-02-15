const URL = import.meta.env.VITE_API_ROOT;

const addActivityDocument = async (dataToSend) => {
    console.log(dataToSend)
    try {
        const res = await fetch(`${URL}/document/activity/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dataToSend),
        });
        if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
        }
        console.log(dataToSend)
        return await res.json();
    } catch (error) {
        console.error(error)
    }
};

export { addActivityDocument };