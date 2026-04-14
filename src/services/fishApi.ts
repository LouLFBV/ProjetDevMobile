import AsyncStorage from '@react-native-async-storage/async-storage';

const API_KEY = 'e325dba369msh6f2258c940ad510p135e21jsnc8e2736c1c0a';
const STORAGE_KEY = '@fish_data_cache_v2';
const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours

interface CacheEntry {
  timestamp: number;
  data: Fish[];
}

export interface Fish {
  id: number;
  name: string;
  scientific_name: string;
  image: string;
  family?: string;
  habitat?: string;
  description?: string;
  order?: string;
  class?: string;
}

const isCacheValid = (entry: CacheEntry): boolean => {
  return Date.now() - entry.timestamp < CACHE_TTL_MS;
};

export const getFishes = async (forceRefresh = false): Promise<Fish[]> => {
  try {
    // Check cache first
    if (!forceRefresh) {
      const cached = await AsyncStorage.getItem(STORAGE_KEY);
      if (cached) {
        const entry: CacheEntry = JSON.parse(cached);
        if (isCacheValid(entry)) {
          console.log('[FishAPI] Serving from cache');
          return entry.data;
        }
      }
    }

    console.log('[FishAPI] Fetching from network...');
    const response = await fetch(
      'https://fish-species.p.rapidapi.com/fish_api/group?meta_property=scientific_classification&property_value=actinopterygii&meta_property_attribute=class',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-rapidapi-key': API_KEY,
          'x-rapidapi-host': 'fish-species.p.rapidapi.com',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const json = await response.json();
    console.log('[FishAPI] Response keys:', Object.keys(json));

    // Handle various response shapes
    let rawData: any[] = [];
    if (Array.isArray(json)) {
      rawData = json;
    } else if (Array.isArray(json.results)) {
      rawData = json.results;
    } else if (Array.isArray(json.data)) {
      rawData = json.data;
    } else {
      // Try to find the first array value
      const firstArray = Object.values(json).find(v => Array.isArray(v));
      rawData = (firstArray as any[]) || [];
    }

    // Normalize data
    const normalized: Fish[] = rawData.map((item: any, i: number) => ({
      id: item.id ?? item.fish_id ?? i,
      name: item.name ?? item.common_name ?? item.fish_name ?? 'Unknown Species',
      scientific_name: item.scientific_name ?? item.latin_name ?? '',
      image: item.image ?? item.img ?? item.picture ?? '',
      family: item.family ?? item.fish_family ?? '',
      habitat: item.habitat ?? '',
      description: item.description ?? item.bio ?? '',
      order: item.order ?? '',
      class: item.class ?? 'Actinopterygii',
    }));

    // Persist to cache
    const entry: CacheEntry = { timestamp: Date.now(), data: normalized };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entry));

    return normalized;
  } catch (error) {
    console.error('[FishAPI] Fetch failed:', error);

    // Fallback to stale cache
    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEY);
      if (cached) {
        const entry: CacheEntry = JSON.parse(cached);
        console.log('[FishAPI] Serving stale cache as fallback');
        return entry.data;
      }
    } catch {
      // ignore
    }

    return [];
  }
};

export const clearFishCache = async (): Promise<void> => {
  await AsyncStorage.removeItem(STORAGE_KEY);
};