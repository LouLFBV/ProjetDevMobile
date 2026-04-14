import AsyncStorage from '@react-native-async-storage/async-storage';

const API_KEY = 'e325dba369msh6f2258c940ad510p135e21jsnc8e2736c1c0a';
const STORAGE_KEY = '@fish_data_cache';

export const getFishes = async () => {
  try {
    // 1. Appel API avec tes paramètres exacts
    const response = await fetch(
      'https://fish-species.p.rapidapi.com/fish_api/group?meta_property=scientific_classification&property_value=actinopterygii&meta_property_attribute=class', 
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-rapidapi-key': API_KEY,
          'x-rapidapi-host': 'fish-species.p.rapidapi.com'
        }
      }
    );

    if (response.ok) {
      const json = await response.json();
      
      // NOTE IMPORTANTE : 
      // Si l'API renvoie un objet du style { results: [...] }, 
      // il faudra peut-être retourner json.results au lieu de json.
      // On fait un petit log pour vérifier dans ton terminal VS Code :
      console.log("Structure API reçue:", Object.keys(json));
      
      const dataToStore = Array.isArray(json) ? json : (json.results || []);
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
      return dataToStore;
    }

    // Backup cache si l'API échoue
    const cachedData = await AsyncStorage.getItem(STORAGE_KEY);
    return cachedData ? JSON.parse(cachedData) : [];

  } catch (error) {
    console.error("Erreur Fetch:", error);
    const cachedData = await AsyncStorage.getItem(STORAGE_KEY);
    return cachedData ? JSON.parse(cachedData) : [];
  }
};