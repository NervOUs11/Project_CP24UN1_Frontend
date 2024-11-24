import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
const URL = import.meta.env.VITE_API_ROOT;
const documentDetail = ref(null);

const fetchDocumentDetail = async () => {
  const route = useRoute();
  const documentID = route.params.id;

  try {
    const response = await fetch(`${URL}/documentDetail/${documentID}`);
    if (!response.ok) {
      throw new Error('Failed to fetch document details');
    }
    const data = await response.json();
    return data
  } catch (error) {
    console.error(error);
  }
};

export { fetchDocumentDetail };
