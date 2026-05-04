import { getFishes } from '@/src/services/fishApi';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar, StyleSheet, Text,
  TouchableOpacity,
  View
} from 'react-native';

// --- SYSTÈME DE FILE D'ATTENTE GLOBAL ---
let imageQueue: (() => void)[] = [];
let isProcessing = false;

const processQueue = () => {
  if (isProcessing || imageQueue.length === 0) return;
  
  isProcessing = true;
  const nextLoad = imageQueue.shift();
  
  if (nextLoad) {
    // On déclenche le chargement
    nextLoad();
  }
};

// Composant Image qui attend son tour
const SafeImage = (props: any) => {
  const [visible, setVisible] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    const addToQueue = () => {
      if (isMounted.current) setVisible(true);
    };

    imageQueue.push(addToQueue);
    processQueue();

    return () => { isMounted.current = false; };
  }, []);

  const handleNext = () => {
    isProcessing = false;
    // On passe à 500ms (0.5s) pour être totalement invisible aux yeux des radars de Wikipedia
    setTimeout(processQueue, 500); 
  };

  if (!visible) {
    return <View style={[props.style, { backgroundColor: '#111' }]} />;
  }

  return (
    <Image
      {...props}
      onLoadEnd={handleNext} // Qu'il y ait succès ou erreur, on passe au suivant
    />
  );
};
// ------------------------------------------

interface Fish {
  id: number;
  name: string;
  scientific_name: string;
  image: string;
  family?: string;
  habitat?: string;
}

const getFishImageUrl = (fish: Fish): string => {
  if (!fish?.image) return "https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=800";

  let url = fish.image.trim();
  if (url.startsWith('//')) url = `https:${url}`;

  // On nettoie les espaces qui sont les ennemis n°1
  url = url.replace(/\s/g, '%20');

  // Pour Wikipedia, on s'assure que les parenthèses sont encodées correctement
  // sans utiliser encodeURI global qui peut casser d'autres parties
  if (url.includes('wikimedia.org')) {
    url = url.replace(/\(/g, '%28').replace(/\)/g, '%29');
    
    // On force une version de cache pour bypass les erreurs précédentes
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}v=10`; // On monte à v=10 pour être sûr
  }

  return url;
};

export default function HomeScreen() {
  const [fishes, setFishes] = useState<Fish[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    const resetApp = async () => {
      await Image.clearDiskCache(); // Vide le cache physique
      await Image.clearMemoryCache(); // Vide la RAM
      loadData(true);
    };
    resetApp();
  }, []);

  const loadData = async (force = false) => {
    try {
      const data = await getFishes(force);
      setFishes(data);
    } catch (error) {
      console.error('Erreur', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    imageQueue = []; // On vide la file au refresh
    isProcessing = false;
    loadData();
  }, []);

  const filteredFishes = fishes.filter(
    f => f.name?.toLowerCase().includes(search.toLowerCase()) ||
         f.scientific_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FEB204" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <FlatList
        data={filteredFishes}
        keyExtractor={item => item.id.toString()}
        // Propriétés de performance :
        windowSize={11} // Augmente la zone de rendu hors écran (défaut: 21, on peut monter si besoin)
        removeClippedSubviews={false} // Désactiver si les images disparaissent trop vite au scroll
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FEB204" />
        }
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push({
              pathname: '/details/[id]',
              params: { id: item.id, fishData: JSON.stringify(item) },
            })}
          >
            <Image
              key={`img-${item.id}-${search}`}
              source={{ 
                uri: item.image, // On utilise l'URL déjà traitée par fishApi.ts[cite: 1, 2]
                headers: { 
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
                  'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                  'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
                  'Referer': 'https://commons.wikimedia.org/', // Crucial pour Wikipedia
                }
              }}
              // Affiche un poisson générique pendant le chargement ou si l'image est absente
              placeholder={require('@/assets/images/placeholder-fish.png')} 
              placeholderContentFit="contain"
              priority="high" 
              cachePolicy="disk"
              style={styles.image}
              contentFit="cover"
              transition={400}
              onError={() => {
                console.log(`[ImageError] ID ${item.id} - Lien cassé ou inexistant.`);
              }}
            />

            <View style={styles.content}>
              <Text style={styles.scientific}>{item.scientific_name}</Text>
              <Text style={styles.name}>{item.name}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#444',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 18,
    marginBottom: 14,
    gap: 14,
  },
  natGeoLogo: {
    width: 12,
    height: 45,
    backgroundColor: '#FEB204',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 1.5,
    lineHeight: 20,
  },
  headerCount: {
    marginLeft: 'auto',
    color: '#FEB204',
    fontSize: 24,
    fontWeight: '900',
  },
  headerCountSub: {
    fontSize: 11,
    letterSpacing: 2,
    color: '#555',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 22,
    marginBottom: 20,
    backgroundColor: '#111',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#222',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  searchIcon: {
    flexShrink: 0,
  },
  searchBar: {
    flex: 1,
    color: '#FFF',
    fontSize: 15,
    padding: 0,
  },
  listContent: {
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#0D0D0D',
    marginBottom: 22,
    marginHorizontal: 22,
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  indexBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 2,
  },
  indexText: {
    color: '#FEB204',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  image: {
    width: '100%',
    height: 200, // Une valeur fixe pour tester
    backgroundColor: '#222', // Pour voir si le carré s'affiche au moins
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    // React Native doesn't support gradient here, use a semi-transparent view
    backgroundColor: 'rgba(0,0,0,0)',
  },
  content: {
    padding: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  yellowLabel: {
    width: 4,
    height: 12,
    backgroundColor: '#FEB204',
    borderRadius: 1,
  },
  name: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    lineHeight: 26,
  },
  scientific: {
    color: '#FEB204',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    flexShrink: 1,
  },
  family: {
    color: '#444',
    fontSize: 12,
    marginTop: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  arrowBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#FEB204',
    padding: 6,
    borderRadius: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 3,
  },
  emptySubText: {
    color: '#2A2A2A',
    fontSize: 13,
  },
});