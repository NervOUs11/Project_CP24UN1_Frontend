const URL = import.meta.env.VITE_API_ROOT;

const approveActivity = async (data) => {
  try {
    const response = await fetch(`${URL}/document/activity/approve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to approve document');
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export { approveActivity };