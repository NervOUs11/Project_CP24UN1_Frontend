import { useRoute } from 'vue-router';
const URL = import.meta.env.VITE_API_ROOT;

const fetchActivityDocument = async (userId, role) => {
  const route = useRoute();
  const documentID = route.params.id;
  console.log(`Fetching data for User: ${userId}, Document: ${documentID}, Role: ${role}`);

  try {
    const res = await fetch(`${URL}/userID/${userId}/document/activity/detail/${documentID}`, {
      method: "GET",
    });

    if (!res.ok) {
      throw new Error("Error, can't get activityDocument data");
    }

    const data = await res.json();

    if (role === "Student") {
      return { ...data };
    } else {
      const progress = data.allProgress?.filter((progress) => progress.staffID == userId) || [];

      return {
        ...data,
        progressID: progress.length > 0 ? progress[0].progressID : null, // ป้องกันกรณีไม่มี progress
      };
    }
  } catch (error) {
    console.log(error);
  }
};

export { fetchActivityDocument };
