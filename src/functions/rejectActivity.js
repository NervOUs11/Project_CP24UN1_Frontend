const URL = import.meta.env.VITE_API_ROOT;

const rejectActivity = async (data) => {
  try {
    const res = await fetch(`${URL}/document/activity/reject`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error('Failed to reject document');
    }

    return res;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export { rejectActivity };