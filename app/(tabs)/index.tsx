import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TextInput, 
  SafeAreaView, 
  ActivityIndicator, 
  TouchableOpacity 
} from 'react-native';
import { Image } from 'expo-image'; 
import { useRouter } from 'expo-router';
import { getFishes } from '@/src/services/fishApi';

interface Fish {
  id: number;
  name: string;
  scientific_name: string;
  image: string;
}

export default function HomeScreen() {
  const [fishes, setFishes] = useState<Fish[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await getFishes();
      setFishes(data);
    } catch (error) {
      console.error("Erreur de chargement", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFishes = fishes.filter(f => 
    f.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.natGeoLogo} />
        <View>
          <Text style={styles.headerTitle}>NATIONAL</Text>
          <Text style={styles.headerTitle}>GEOGRAPHIC</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <TextInput 
          style={styles.searchBar}
          placeholder="Search species..."
          placeholderTextColor="#666"
          onChangeText={setSearch}
          value={search}
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FEB204" />
        </View>
      ) : (
        <FlatList
          data={filteredFishes}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity 
              activeOpacity={0.8}
              style={styles.card}
              onPress={() => router.push({
                pathname: "/details/[id]",
                params: {
                  id: item.id,
                  fishData: JSON.stringify(item)
                }
              })}
            >
              <Image
              source={{ 
              uri: item.image || 'https://images.unsplash.com/photo-1551244072-5d12893278ab?q=80&w=500' 
              }}
              style={styles.image}
              contentFit="cover"
              transition={400}
              />
              <View style={styles.content}>
                <View style={styles.labelRow}>
                  <View style={styles.yellowLabel} />
                  <Text style={styles.scientific}>{item.scientific_name}</Text>
                </View>
                <Text style={styles.name}>{item.name}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

// ON VERIFIE BIEN QUE TOUT EST LA :
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000' 
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingTop: 20,
    marginBottom: 10
  },
  natGeoLogo: { 
    width: 12, 
    height: 45, 
    backgroundColor: '#FEB204', 
    marginRight: 15 
  },
  headerTitle: { 
    color: '#FFF', 
    fontSize: 18, 
    fontWeight: '900', 
    letterSpacing: 1,
    lineHeight: 20
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginVertical: 15,
  },
  searchBar: { 
    backgroundColor: '#1A1A1A', 
    color: '#FFF', 
    padding: 15, 
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333'
  },
  listContent: { // Ajouté pour corriger l'erreur
    paddingBottom: 20
  },
  card: { // Ajouté pour corriger l'erreur
    backgroundColor: '#111', 
    marginBottom: 25, 
    marginHorizontal: 20, 
    borderRadius: 2, 
    overflow: 'hidden',
  },
  image: { 
    width: '100%', 
    height: 220 
  },
  content: { 
    padding: 15,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5
  },
  yellowLabel: {
    width: 4,
    height: 12,
    backgroundColor: '#FEB204',
    marginRight: 8
  },
  name: { 
    color: '#FFF', 
    fontSize: 22, 
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  scientific: { 
    color: '#FEB204', 
    fontSize: 12, 
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase'
  }
});