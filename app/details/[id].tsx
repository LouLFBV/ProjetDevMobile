import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface Fish {
  id: number;
  name: string;
  scientific_name: string;
  image: string;
  family?: string;
  habitat?: string;
  description?: string;
  order?: string;
  class?: string;
  species?: string;
}

const getFishImageUrl = (fish: Fish): string => {
  if (fish.image && fish.image.startsWith('http')) return fish.image;
  const slug = encodeURIComponent(fish.name || 'fish');
  return `https://source.unsplash.com/featured/800x1000/?fish,${slug},underwater`;
};

// Generate a dynamic description via Anthropic API
const generateFishDescription = async (fish: Fish): Promise<string> => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: `Write a short, fascinating 2-3 sentence description (in English) about the fish species "${fish.name}" (scientific name: ${fish.scientific_name}). 
            Focus on behavior, habitat, unique traits. 
            Write in the style of National Geographic — vivid, authoritative, engaging.
            Return only the description text, no extra formatting.`,
          },
        ],
      }),
    });
    const data = await response.json();
    return data?.content?.[0]?.text || '';
  } catch {
    return '';
  }
};

export default function FishDetails() {
  const { fishData } = useLocalSearchParams();
  const router = useRouter();
  const fish: Fish = fishData ? JSON.parse(fishData as string) : null;

  const [description, setDescription] = useState<string>(fish?.description || '');
  const [loadingDesc, setLoadingDesc] = useState(false);
  const [descFetched, setDescFetched] = useState(!!fish?.description);
  const scrollY = useRef(new Animated.Value(0)).current;

  if (!fish) return null;

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 300],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const imageScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.1, 1],
    extrapolate: 'clamp',
  });

  const handleGenerateDescription = async () => {
    if (descFetched) return;
    setLoadingDesc(true);
    const text = await generateFishDescription(fish);
    setDescription(text);
    setDescFetched(true);
    setLoadingDesc(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Sticky header that appears on scroll */}
      <Animated.View style={[styles.stickyHeader, { opacity: headerOpacity }]}>
        <Text style={styles.stickyHeaderText} numberOfLines={1}>
          {fish.name?.toUpperCase()}
        </Text>
      </Animated.View>

      {/* Back button */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Ionicons name="chevron-back" size={22} color="#000" />
      </TouchableOpacity>

      <Animated.ScrollView
        bounces={true}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Hero Image */}
        <Animated.View style={{ transform: [{ scale: imageScale }] }}>
          <Image
            source={{ uri: getFishImageUrl(fish) }}
            style={styles.mainImage}
            contentFit="cover"
            transition={300}
          />
        </Animated.View>

        {/* Yellow accent bar */}
        <View style={styles.accentBar} />

        {/* Title block */}
        <View style={styles.headerInfo}>
          <Text style={styles.scientificName}>{fish.scientific_name}</Text>
          <Text style={styles.mainTitle}>{fish.name}</Text>
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          <StatItem label="FAMILY" value={fish.family || '—'} />
          <View style={styles.statDivider} />
          <StatItem label="HABITAT" value={fish.habitat || 'Marine'} />
          <View style={styles.statDivider} />
          <StatItem label="CLASS" value={fish.class || 'Actinopterygii'} />
        </View>

        {/* Description Section */}
        <View style={styles.descriptionSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>ABOUT THIS SPECIES</Text>
          </View>

          {description ? (
            <Text style={styles.descriptionText}>{description}</Text>
          ) : loadingDesc ? (
            <View style={styles.descLoading}>
              <ActivityIndicator color="#FEB204" size="small" />
              <Text style={styles.descLoadingText}>GENERATING PROFILE...</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.generateBtn} onPress={handleGenerateDescription}>
              <Ionicons name="sparkles-outline" size={16} color="#000" />
              <Text style={styles.generateBtnText}>GENERATE AI PROFILE</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Taxonomy Section */}
        <View style={styles.taxonomySection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>TAXONOMY</Text>
          </View>
          <View style={styles.taxonomyGrid}>
            <TaxRow label="Scientific Name" value={fish.scientific_name} />
            {fish.order && <TaxRow label="Order" value={fish.order} />}
            {fish.family && <TaxRow label="Family" value={fish.family} />}
            <TaxRow label="Class" value={fish.class || 'Actinopterygii'} />
          </View>
        </View>

        {/* Second image (alternative angle) */}
        <View style={styles.secondImageContainer}>
          <Image
            source={{
              uri: `https://source.unsplash.com/featured/800x500/?${encodeURIComponent(fish.scientific_name || 'fish')},ocean`,
            }}
            style={styles.secondImage}
            contentFit="cover"
            transition={600}
          />
          <View style={styles.imageCaption}>
            <Text style={styles.imageCaptionText}>
              {fish.name?.toUpperCase()} IN ITS NATURAL HABITAT
            </Text>
          </View>
        </View>

        <View style={{ height: 50 }} />
      </Animated.ScrollView>

      {/* Yellow footer bar */}
      <View style={styles.footerBar} />
    </View>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

function TaxRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.taxRow}>
      <Text style={styles.taxLabel}>{label}</Text>
      <Text style={styles.taxValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },

  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    backgroundColor: '#000',
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 70,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1C',
    alignItems: 'center',
  },
  stickyHeaderText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 2,
  },

  backBtn: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 30,
    backgroundColor: '#FEB204',
    padding: 9,
    borderRadius: 2,
  },

  mainImage: {
    width,
    height: height * 0.52,
  },

  accentBar: {
    height: 5,
    backgroundColor: '#FEB204',
    width: '100%',
  },

  headerInfo: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
  },
  scientificName: {
    color: '#FEB204',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  mainTitle: {
    color: '#FFF',
    fontSize: 38,
    fontWeight: '900',
    textTransform: 'uppercase',
    lineHeight: 42,
    letterSpacing: 0.5,
  },

  statsGrid: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#1C1C1C',
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1C',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  statItem: {
    flex: 1,
    gap: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#1C1C1C',
    marginHorizontal: 16,
  },
  statLabel: {
    color: '#444',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
  },
  statValue: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'capitalize',
  },

  descriptionSection: {
    paddingHorizontal: 24,
    paddingVertical: 28,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1C',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
  },
  sectionAccent: {
    width: 4,
    height: 16,
    backgroundColor: '#FEB204',
    borderRadius: 1,
  },
  sectionTitle: {
    color: '#FEB204',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 3,
  },
  descriptionText: {
    color: '#CCC',
    fontSize: 16,
    lineHeight: 28,
    fontStyle: 'italic',
  },
  descLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  descLoadingText: {
    color: '#555',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FEB204',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 3,
    alignSelf: 'flex-start',
  },
  generateBtnText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
  },

  taxonomySection: {
    paddingHorizontal: 24,
    paddingVertical: 28,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1C',
  },
  taxonomyGrid: {
    gap: 0,
  },
  taxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#111',
  },
  taxLabel: {
    color: '#555',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  taxValue: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
    flex: 1,
    marginLeft: 20,
  },

  secondImageContainer: {
    marginHorizontal: 24,
    marginTop: 28,
    borderRadius: 2,
    overflow: 'hidden',
  },
  secondImage: {
    width: '100%',
    height: 200,
  },
  imageCaption: {
    backgroundColor: '#0A0A0A',
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#FEB204',
  },
  imageCaptionText: {
    color: '#666',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  footerBar: {
    height: 6,
    backgroundColor: '#FEB204',
  },
});