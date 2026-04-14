import React, { useEffect, useState, useCallback } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getFishes, Fish } from '@/src/services/fishApi';

const { width } = Dimensions.get('window');
const CARD_GAP = 12;
const CARD_MARGIN = 16;
const CARD_WIDTH = (width - CARD_MARGIN * 2 - CARD_GAP) / 2;

// Resolve image with Unsplash fallback
const resolveImage = (fish: Fish): string => {
  if (fish.image && fish.image.startsWith('http')) return fish.image;
  return `https://source.unsplash.com/featured/400x500/?fish,${encodeURIComponent(fish.name || 'fish')},underwater`;
};

export default function HomeScreen() {
  const [fishes, setFishes] = useState<Fish[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(() => { loadData(); }, []);

  const loadData = async (force = false) => {
    try {
      const data = await getFishes(force);
      setFishes(data);
    } catch (err) {
      console.error('Load failed', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData(true);
  }, []);

  const filtered = fishes.filter(f =>
    f.name?.toLowerCase().includes(search.toLowerCase()) ||
    f.scientific_name?.toLowerCase().includes(search.toLowerCase()) ||
    f.family?.toLowerCase().includes(search.toLowerCase())
  );

  const renderHeader = () => (
    <View>
      {/* NatGeo Header bar */}
      <View style={styles.header}>
        <View style={styles.natGeoMark} />
        <View>
          <Text style={styles.headerBrand}>NATIONAL</Text>
          <Text style={styles.headerBrand}>GEOGRAPHIC</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.speciesCount}>{filtered.length}</Text>
          <Text style={styles.speciesLabel}>SPECIES</Text>
        </View>
      </View>

      {/* Section heading */}
      <View style={styles.sectionRow}>
        <View style={styles.sectionAccent} />
        <Text style={styles.sectionTitle}>FISH SPECIES ARCHIVE</Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={16} color="#555" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search species, family…"
          placeholderTextColor="#444"
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={16} color="#555" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        {renderHeader()}
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FEB204" />
          <Text style={styles.loadingLabel}>LOADING SPECIES…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <FlatList
        data={filtered}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
          <View style={styles.empty}>
            <Ionicons name="fish-outline" size={44} color="#222" />
            <Text style={styles.emptyTitle}>NO SPECIES FOUND</Text>
            <Text style={styles.emptySub}>Try a different search term</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: '/details/[id]',
                params: { id: item.id, fishData: JSON.stringify(item) },
              })
            }
          >
            {/* Image */}
            <View style={styles.imageWrap}>
              <Image
                source={{ uri: resolveImage(item) }}
                style={styles.image}
                contentFit="cover"
                transition={350}
              />
              {/* Index badge */}
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{String(index + 1).padStart(2, '0')}</Text>
              </View>
            </View>

            {/* Card body */}
            <View style={styles.cardBody}>
              <Text style={styles.scientificName} numberOfLines={1}>
                {item.scientific_name || item.family}
              </Text>
              <Text style={styles.commonName} numberOfLines={2}>
                {item.name}
              </Text>

              {/* Footer row */}
              <View style={styles.cardFooter}>
                <View style={styles.readBtn}>
                  <Ionicons name="book-outline" size={11} color="#000" />
                  <Text style={styles.readText}>READ</Text>
                </View>
                {item.family ? (
                  <Text style={styles.familyTag} numberOfLines={1}>{item.family}</Text>
                ) : null}
              </View>
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
    backgroundColor: '#080808',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  loadingLabel: {
    color: '#333',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 3,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: CARD_MARGIN,
    paddingTop: 18,
    marginBottom: 16,
    gap: 12,
  },
  natGeoMark: {
    width: 10,
    height: 40,
    backgroundColor: '#FEB204',
  },
  headerBrand: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
    lineHeight: 17,
  },
  headerRight: {
    marginLeft: 'auto',
    alignItems: 'flex-end',
  },
  speciesCount: {
    color: '#FEB204',
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 28,
  },
  speciesLabel: {
    color: '#444',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
  },

  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: CARD_MARGIN,
    marginBottom: 14,
  },
  sectionAccent: {
    width: 3,
    height: 14,
    backgroundColor: '#FEB204',
    borderRadius: 1,
  },
  sectionTitle: {
    color: '#555',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2.5,
  },

  // Search
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: CARD_MARGIN,
    marginBottom: 18,
    backgroundColor: '#111',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1E1E1E',
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 14,
    padding: 0,
  },

  // Grid
  listContent: {
    paddingHorizontal: CARD_MARGIN,
    paddingBottom: 30,
  },
  row: {
    gap: CARD_GAP,
    marginBottom: CARD_GAP,
  },

  // Card
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#0F0F0F',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  imageWrap: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: CARD_WIDTH * 1.15,
  },
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.72)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 3,
  },
  badgeText: {
    color: '#FEB204',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  cardBody: {
    padding: 12,
    gap: 4,
  },
  scientificName: {
    color: '#FEB204',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  commonName: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    lineHeight: 18,
    letterSpacing: 0.2,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  readBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEB204',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 3,
  },
  readText: {
    color: '#000',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  familyTag: {
    color: '#333',
    fontSize: 8,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    flexShrink: 1,
    marginLeft: 6,
    textAlign: 'right',
  },

  // Empty
  empty: {
    alignItems: 'center',
    paddingTop: 70,
    gap: 10,
  },
  emptyTitle: {
    color: '#2A2A2A',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 3,
  },
  emptySub: {
    color: '#1E1E1E',
    fontSize: 12,
  },
});