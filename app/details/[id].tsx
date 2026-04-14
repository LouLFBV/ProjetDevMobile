import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Fish } from '@/src/services/fishApi';

const { width, height } = Dimensions.get('window');

const TABS = ['Overview', 'Album', 'Discussion'] as const;
type Tab = typeof TABS[number];

const resolveImage = (fish: Fish): string => {
  if (fish.image && fish.image.startsWith('http')) return fish.image;
  return `https://source.unsplash.com/featured/800x1000/?fish,${encodeURIComponent(fish.name || 'fish')},underwater`;
};

const generateDescription = async (fish: Fish): Promise<string> => {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: `Write a short, vivid 2-3 sentence description about "${fish.name}" (${fish.scientific_name}). 
Focus on unique behaviors, habitat, and fascinating traits. 
Write in National Geographic style — authoritative and immersive. 
Return only plain text, no markdown or formatting.`,
        }],
      }),
    });
    const data = await res.json();
    return data?.content?.[0]?.text ?? '';
  } catch {
    return '';
  }
};

export default function FishDetails() {
  const { fishData } = useLocalSearchParams();
  const router = useRouter();
  const fish: Fish = fishData ? JSON.parse(fishData as string) : null;

  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [description, setDescription] = useState(fish?.description ?? '');
  const [loadingDesc, setLoadingDesc] = useState(false);
  const [descFetched, setDescFetched] = useState(!!fish?.description);
  const scrollY = useRef(new Animated.Value(0)).current;

  if (!fish) return null;

  const headerOpacity = scrollY.interpolate({
    inputRange: [height * 0.35, height * 0.48],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const imageParallax = scrollY.interpolate({
    inputRange: [-100, 0, height * 0.5],
    outputRange: [1.08, 1, 1.18],
    extrapolate: 'clamp',
  });

  const handleGenerateDesc = async () => {
    if (descFetched) return;
    setLoadingDesc(true);
    const text = await generateDescription(fish);
    setDescription(text);
    setDescFetched(true);
    setLoadingDesc(false);
  };

  // ─── Taxonomy helpers ──────────────────────────────────────────
  const taxRows = [
    { label: 'Scientific Name', value: fish.scientific_name },
    { label: 'Family', value: fish.family },
    { label: 'Order', value: fish.order },
    { label: 'Class', value: fish.class || 'Actinopterygii' },
    { label: 'Phylum', value: fish.phylum || 'Chordata' },
    { label: 'Kingdom', value: fish.kingdom || 'Animalia' },
  ].filter(r => r.value);

  // ─── Album image URLs (alternative angles) ────────────────────
  const albumImages = [
    `https://source.unsplash.com/featured/600x400/?${encodeURIComponent(fish.name || 'fish')},ocean`,
    `https://source.unsplash.com/featured/600x400/?${encodeURIComponent(fish.scientific_name || 'fish')},underwater`,
    `https://source.unsplash.com/featured/600x400/?fish,reef,${encodeURIComponent(fish.family || 'species')}`,
    `https://source.unsplash.com/featured/600x400/?aquarium,fish,${encodeURIComponent(fish.order || 'marine')}`,
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Animated sticky header */}
      <Animated.View style={[styles.stickyHeader, { opacity: headerOpacity }]}>
        <Text style={styles.stickyTitle} numberOfLines={1}>
          {fish.name?.toUpperCase()}
        </Text>
      </Animated.View>

      {/* Back button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.85}>
        <Ionicons name="chevron-back" size={20} color="#000" />
      </TouchableOpacity>

      {/* Favourite button */}
      <TouchableOpacity style={styles.favBtn} activeOpacity={0.85}>
        <Ionicons name="heart-outline" size={20} color="#FEB204" />
      </TouchableOpacity>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        bounces
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Hero image */}
        <Animated.View style={[styles.heroWrap, { transform: [{ scale: imageParallax }] }]}>
          <Image
            source={{ uri: resolveImage(fish) }}
            style={styles.heroImage}
            contentFit="cover"
            transition={300}
          />
        </Animated.View>

        {/* Yellow accent bar */}
        <View style={styles.accentBar} />

        {/* Title block */}
        <View style={styles.titleBlock}>
          <Text style={styles.scientificName}>{fish.scientific_name}</Text>
          <Text style={styles.commonName}>{fish.name}</Text>
          {/* Author / meta line */}
          <View style={styles.metaRow}>
            <View style={styles.authorDot} />
            <Text style={styles.authorText}>By Virginia Morell</Text>
            <Text style={styles.metaDivider}>·</Text>
            <Text style={styles.authorText}>Wildlife Archive</Text>
          </View>
        </View>

        {/* Quick stats */}
        <View style={styles.statsRow}>
          <StatPill label="FAMILY" value={fish.family || '—'} />
          <View style={styles.statSep} />
          <StatPill label="ORDER" value={fish.order || '—'} />
          <View style={styles.statSep} />
          <StatPill label="CLASS" value={fish.class || 'Actinopterygii'} />
        </View>

        {/* Internal tabs */}
        <View style={styles.tabBar}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab}
              style={styles.tabItem}
              activeOpacity={0.75}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>
                {tab}
              </Text>
              {activeTab === tab && <View style={styles.tabUnderline} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* ─── TAB: OVERVIEW ─── */}
        {activeTab === 'Overview' && (
          <View style={styles.tabContent}>
            {/* Description */}
            <View style={styles.section}>
              <SectionHeading title="ABOUT THIS SPECIES" />
              {description ? (
                <Text style={styles.descText}>{description}</Text>
              ) : loadingDesc ? (
                <View style={styles.descLoading}>
                  <ActivityIndicator color="#FEB204" size="small" />
                  <Text style={styles.descLoadingLabel}>GENERATING PROFILE…</Text>
                </View>
              ) : (
                <TouchableOpacity style={styles.generateBtn} onPress={handleGenerateDesc} activeOpacity={0.82}>
                  <Ionicons name="sparkles-outline" size={15} color="#000" />
                  <Text style={styles.generateBtnText}>GENERATE AI PROFILE</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Classification */}
            <View style={styles.section}>
              <SectionHeading title="CLASSIFICATION" />
              <View style={styles.taxGrid}>
                {taxRows.map(r => (
                  <View key={r.label} style={styles.taxRow}>
                    <Text style={styles.taxLabel}>{r.label}</Text>
                    <Text style={styles.taxValue}>{r.value}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Genera (if present) */}
            {fish.genera ? (
              <View style={[styles.section, { marginBottom: 0 }]}>
                <SectionHeading title="GENERA" />
                <Text style={styles.generaText}>{fish.genera}</Text>
              </View>
            ) : null}
          </View>
        )}

        {/* ─── TAB: ALBUM ─── */}
        {activeTab === 'Album' && (
          <View style={styles.tabContent}>
            <SectionHeading title="NATURAL HABITAT" />
            {albumImages.map((uri, i) => (
              <View key={i} style={styles.albumItem}>
                <Image
                  source={{ uri }}
                  style={styles.albumImage}
                  contentFit="cover"
                  transition={400}
                />
                <View style={styles.albumCaption}>
                  <Text style={styles.albumCaptionText}>
                    {fish.name?.toUpperCase()} · PHOTO {i + 1}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ─── TAB: DISCUSSION ─── */}
        {activeTab === 'Discussion' && (
          <View style={[styles.tabContent, styles.discussionPlaceholder]}>
            <Ionicons name="chatbubbles-outline" size={40} color="#222" />
            <Text style={styles.discussionTitle}>COMMUNITY DISCUSSION</Text>
            <Text style={styles.discussionSub}>No comments yet. Be the first to contribute.</Text>
          </View>
        )}

        <View style={{ height: 60 }} />
      </Animated.ScrollView>

      {/* Yellow footer accent */}
      <View style={styles.footerBar} />
    </View>
  );
}

// ─── Sub-components ──────────────────────────────────────────────

function SectionHeading({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeading}>
      <View style={styles.sectionAccent} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statPill}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080808' },

  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    backgroundColor: '#000',
    paddingTop: 52,
    paddingBottom: 14,
    paddingHorizontal: 70,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
    alignItems: 'center',
  },
  stickyTitle: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
  },

  backBtn: {
    position: 'absolute',
    top: 52,
    left: 18,
    zIndex: 30,
    backgroundColor: '#FEB204',
    padding: 9,
    borderRadius: 3,
  },
  favBtn: {
    position: 'absolute',
    top: 52,
    right: 18,
    zIndex: 30,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 9,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#333',
  },

  heroWrap: { overflow: 'hidden' },
  heroImage: {
    width,
    height: height * 0.5,
  },

  accentBar: {
    height: 5,
    backgroundColor: '#FEB204',
  },

  titleBlock: {
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 18,
  },
  scientificName: {
    color: '#FEB204',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  commonName: {
    color: '#FFF',
    fontSize: 36,
    fontWeight: '900',
    textTransform: 'uppercase',
    lineHeight: 40,
    letterSpacing: 0.3,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FEB204',
  },
  authorText: {
    color: '#555',
    fontSize: 12,
    fontWeight: '600',
  },
  metaDivider: {
    color: '#333',
    fontSize: 14,
  },

  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#161616',
    borderBottomWidth: 1,
    borderBottomColor: '#161616',
    paddingVertical: 16,
    paddingHorizontal: 22,
  },
  statPill: { flex: 1, gap: 4 },
  statSep: { width: 1, backgroundColor: '#1C1C1C', marginHorizontal: 14 },
  statLabel: { color: '#3A3A3A', fontSize: 9, fontWeight: '800', letterSpacing: 2 },
  statValue: { color: '#CCC', fontSize: 13, fontWeight: '700', textTransform: 'capitalize' },

  // Tabs
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#161616',
    paddingHorizontal: 22,
    marginTop: 4,
  },
  tabItem: {
    marginRight: 28,
    paddingBottom: 12,
    paddingTop: 14,
    position: 'relative',
  },
  tabLabel: {
    color: '#444',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  tabLabelActive: {
    color: '#FFF',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#FEB204',
    borderRadius: 1,
  },

  tabContent: {
    paddingHorizontal: 22,
    paddingTop: 24,
  },

  // Section
  section: { marginBottom: 28 },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  sectionAccent: { width: 4, height: 16, backgroundColor: '#FEB204', borderRadius: 1 },
  sectionTitle: { color: '#FEB204', fontSize: 11, fontWeight: '900', letterSpacing: 3 },

  // Description
  descText: { color: '#AAA', fontSize: 16, lineHeight: 28, fontStyle: 'italic' },
  descLoading: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  descLoadingLabel: { color: '#444', fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEB204',
    alignSelf: 'flex-start',
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius: 4,
  },
  generateBtnText: { color: '#000', fontSize: 11, fontWeight: '900', letterSpacing: 2 },

  // Taxonomy
  taxGrid: { gap: 0 },
  taxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#111',
  },
  taxLabel: { color: '#444', fontSize: 11, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  taxValue: { color: '#CCC', fontSize: 12, fontWeight: '700', textAlign: 'right', flex: 1, marginLeft: 20 },

  // Genera
  generaText: { color: '#555', fontSize: 13, lineHeight: 22 },

  // Album
  albumItem: { marginBottom: 14, borderRadius: 4, overflow: 'hidden' },
  albumImage: { width: '100%', height: 200 },
  albumCaption: {
    backgroundColor: '#0A0A0A',
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#FEB204',
  },
  albumCaptionText: { color: '#555', fontSize: 9, fontWeight: '700', letterSpacing: 1.5 },

  // Discussion
  discussionPlaceholder: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 14,
  },
  discussionTitle: { color: '#2A2A2A', fontSize: 13, fontWeight: '900', letterSpacing: 3 },
  discussionSub: { color: '#1E1E1E', fontSize: 13, textAlign: 'center' },

  footerBar: { height: 5, backgroundColor: '#FEB204' },
});