import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
const URL = import.meta.env.VITE_API_ROOT;
// const documentDetail = ref(null);

const fetchDocumentDetail = async (userid) => {
  const route = useRoute();
  const documentID = route.params.id;
  try {
    const response = await fetch(`${URL}/documentDetail/${documentID}/userID/${userid}`);
    if (!response.ok) {
      throw new Error('Failed to fetch document details');
    }
    const data = await response.json();

    const minProgressID = data.allProgress
      .filter(progress => progress.status === 'Waiting for approve')
      .reduce((min, current) => (current.progressID < min ? current.progressID : min), Infinity);

      return {
        ...data,
        minProgressID,
      };
  } catch (error) {
    console.error(error);
  }
};

export { fetchDocumentDetail };
