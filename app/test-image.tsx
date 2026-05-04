import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, StyleSheet, Text, View } from 'react-native';
// On importe getFishes et l'interface Fish depuis ton fichier services
import { Fish, getFishes } from '@/src/services/fishApi';

const { width } = Dimensions.get('window');

export default function TestImageScreen() {
  const [fishes, setFishes] = useState<Fish[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadedCount, setLoadedCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);

  useEffect(() => {
    const loadTestData = async () => {
      try {
        setLoading(true);
        // On récupère les données (forceRefresh = false pour utiliser le cache si dispo)
        const data = await getFishes(false);
        // On prend les 50 premiers pour un test de charge significatif
        setFishes(data.slice(0, 50));
      } catch (err) {
        console.error("Erreur chargement test:", err);
      } finally {
        setLoading(false);
      }
    };
    loadTestData();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FEB204" />
        <Text style={styles.loadingText}>CHARGEMENT DES DONNÉES API...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Diagnostic de Charge (50 Images)</Text>
        <Text style={styles.counter}>
          ✅ {loadedCount} réussies | ❌ {errorCount} échecs
        </Text>
        <Text style={styles.subTitle}>Total à charger : {fishes.length}</Text>
      </View>

      <FlatList
        data={fishes}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image
            source={{ 
                uri: item.image,
                headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Referer': 'https://commons.wikimedia.org/',
                }
            }}
            style={styles.image}
            contentFit="cover"
            cachePolicy="disk" // On force le cache disque pour éviter de re-demander à Wikipedia
            onLoad={() => setLoadedCount(prev => prev + 1)}
            onError={(e) => {
                console.log(`❌ Échec final ID ${item.id}: ${item.image}`);
                setErrorCount(prev => prev + 1);
            }}
            />
            <Text style={styles.cardText} numberOfLines={1}>{item.name}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', paddingTop: 60 },
  center: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#222', marginBottom: 10 },
  title: { color: '#FEB204', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  subTitle: { color: '#555', fontSize: 12, marginTop: 4, fontWeight: '700' },
  counter: { color: '#FFF', marginTop: 10, fontSize: 15, fontWeight: '600' },
  loadingText: { color: '#FEB204', marginTop: 20, fontSize: 12, fontWeight: '800' },
  card: { width: width / 3 - 15, margin: 7, backgroundColor: '#0A0A0A', borderRadius: 4, overflow: 'hidden', borderWidth: 1, borderColor: '#1A1A1A' },
  image: { width: '100%', height: 100, backgroundColor: '#111' },
  cardText: { color: '#666', padding: 5, fontSize: 9, textAlign: 'center', fontWeight: '700' }
});