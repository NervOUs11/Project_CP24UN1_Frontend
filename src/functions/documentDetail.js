import { useRoute, useRouter } from 'vue-router';
const URL = import.meta.env.VITE_API_ROOT;

const fetchDocumentDetail = async (userid, role) => {
  const route = useRoute();
  const router = useRouter();
  const documentID = route.params.id;
  try {
    if(role === "Student"){
      const response = await fetch(`${URL}/userID/${userid}/document/absence/detail/${documentID}`);

      if (!response.ok) {
        if (response.status === 403) {
          router.push("/accessDenied");
          return;
        }
        throw new Error('Failed to fetch document details');
      }
      
      const data = await response.json();

        return {
          ...data,
        };
    }

    else{
      const response = await fetch(`${URL}/userID/${userid}/document/absence/detail/${documentID}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch document details');
      }
      const data = await response.json();

      const progress = data.allProgress
        .filter(progress => (progress.staffID == userid))
 
      const progressID = progress[0].progressID

      return {
        ...data,
        progressID,
      };
    }

  } catch (error) {
    console.error(error);
  }
};

export { fetchDocumentDetail };
