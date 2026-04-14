import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getFishes } from '@/src/services/fishApi';

interface Fish {
  id: number;
  name: string;
  scientific_name: string;
  image: string;
  family?: string;
  habitat?: string;
}

// Dynamic Unsplash fallback using the fish's name
const getFishImageUrl = (fish: Fish): string => {
  if (fish.image && fish.image.startsWith('http')) return fish.image;
  const slug = encodeURIComponent(fish.name || 'fish');
  return `https://source.unsplash.com/featured/800x600/?fish,${slug},underwater`;
};

export default function HomeScreen() {
  const [fishes, setFishes] = useState<Fish[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
      console.error('Erreur de chargement', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  const filteredFishes = fishes.filter(
    f =>
      f.name?.toLowerCase().includes(search.toLowerCase()) ||
      f.scientific_name?.toLowerCase().includes(search.toLowerCase())
  );

  const renderHeader = () => (
    <>
      {/* NatGeo Header */}
      <View style={styles.header}>
        <View style={styles.natGeoLogo} />
        <View>
          <Text style={styles.headerTitle}>NATIONAL</Text>
          <Text style={styles.headerTitle}>GEOGRAPHIC</Text>
        </View>
        <Text style={styles.headerCount}>
          {filteredFishes.length} <Text style={styles.headerCountSub}>SPECIES</Text>
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color="#555" style={styles.searchIcon} />
        <TextInput
          style={styles.searchBar}
          placeholder="Search species..."
          placeholderTextColor="#555"
          onChangeText={setSearch}
          value={search}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color="#555" />
          </TouchableOpacity>
        )}
      </View>
    </>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        {renderHeader()}
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FEB204" />
          <Text style={styles.loadingText}>LOADING SPECIES...</Text>
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
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FEB204"
            colors={['#FEB204']}
            progressBackgroundColor="#111"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="fish-outline" size={48} color="#333" />
            <Text style={styles.emptyText}>NO SPECIES FOUND</Text>
            <Text style={styles.emptySubText}>Try a different search term</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: '/details/[id]',
                params: { id: item.id, fishData: JSON.stringify(item) },
              })
            }
          >
            {/* Index badge */}
            <View style={styles.indexBadge}>
              <Text style={styles.indexText}>{String(index + 1).padStart(2, '0')}</Text>
            </View>

            <Image
              source={{ uri: getFishImageUrl(item) }}
              style={styles.image}
              contentFit="cover"
              transition={400}
            />

            {/* Bottom gradient overlay */}
            <View style={styles.imageOverlay} />

            <View style={styles.content}>
              <View style={styles.labelRow}>
                <View style={styles.yellowLabel} />
                <Text style={styles.scientific} numberOfLines={1}>
                  {item.scientific_name}
                </Text>
              </View>
              <Text style={styles.name} numberOfLines={2}>
                {item.name}
              </Text>
              {item.family && (
                <Text style={styles.family}>{item.family}</Text>
              )}
            </View>

            {/* Arrow indicator */}
            <View style={styles.arrowBadge}>
              <Ionicons name="arrow-forward" size={14} color="#000" />
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
    height: 230,
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