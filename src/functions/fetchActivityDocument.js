import { useRouter } from 'vue-router';
const URL = import.meta.env.VITE_API_ROOT;

const fetchActivityDocument = async (docId, userid, role) => {
  const router = useRouter();
  // const route = useRoute();
  // const documentID = route.params.id;
  const documentID = docId
  // console.log(`Fetching data for User: ${userid}, Document: ${documentID}, Role: ${role}`);

  try {
    const res = await fetch(`${URL}/userID/${userid}/document/activity/detail/${documentID}`, {
      method: "GET",
    });

    if (!res.ok) {
      if (res.status === 403) {
        router.push("/accessDenied");
        return;
      }
      throw new Error("Error, can't get activityDocument data");
    }

    const data = await res.json();

    if (role === "Student") {
      return { ...data };
    } else {
      const progress = data.allProgress?.filter((progress) => progress.staffID == userid) || [];

      return {
        ...data,
        progressID: progress.length > 0 ? progress[0].progressID : null,
      };
    }
  } catch (error) {
    console.log(error);
  }
};

export { fetchActivityDocument };
