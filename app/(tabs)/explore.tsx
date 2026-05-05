/**
 * app/(tabs)/explore.tsx  — Explore / All species screen
 *
 * Checklist:
 * ✅ API data via getFishes()
 * ✅ FlatList (numColumns=2) — NO nested ScrollView
 * ✅ ListHeaderComponent (NatGeo bar + search + filters + section label)
 * ✅ ListFooterComponent (VIEW MORE button)
 * ✅ refreshControl
 * ✅ Skeleton loaders (Reanimated shimmer)
 * ✅ Reanimated FadeInDown per item
 * ✅ windowSize + maxToRenderPerBatch
 * ✅ Empty state + error state
 * ✅ API images from fishApi (img_src_set resolved)
 */

import { Fish, getFishes } from "@/src/services/fishApi";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const H_PAD = 16;
const CARD_GAP = 12;
const CARD_W = (width - H_PAD * 2 - CARD_GAP) / 2;
const PAGE_SIZE = 20;

const CATEGORIES = ["All", "Marine", "Freshwater", "Tropical", "Deep Sea"];

// ── Design tokens ─────────────────────────────────────────────────
const BG = "#111214";
const CARD_BG = "#30312D";
const BORDER = "#30312D";
const RADIUS = 18;
const ACCENT = "#C1F45A";

const imgUrl = (fish: Fish) =>
  fish.image?.startsWith("http")
    ? fish.image
    : `https://picsum.photos/seed/${fish.id}/400/500`;

// ─────────────────────────────────────────────────────────────────
// Skeleton shimmer card
// ─────────────────────────────────────────────────────────────────
function SkeletonCard() {
  const opacity = useSharedValue(0.35);
  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.9, { duration: 700 }),
        withTiming(0.35, { duration: 700 }),
      ),
      -1,
      false,
    );
  }, []);
  const anim = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        {
          width: CARD_W,
          borderRadius: RADIUS,
          overflow: "hidden",
          backgroundColor: CARD_BG,
        },
        anim,
      ]}
    >
      <View
        style={{
          width: "100%",
          height: CARD_W * 1.1,
          backgroundColor: "#3A3B37",
        }}
      />
      <View style={{ padding: 12, gap: 8 }}>
        <View
          style={{
            height: 10,
            backgroundColor: "#3A3B37",
            borderRadius: 6,
            width: "80%",
          }}
        />
        <View
          style={{
            height: 10,
            backgroundColor: "#3A3B37",
            borderRadius: 6,
            width: "55%",
          }}
        />
        <View
          style={{
            height: 8,
            backgroundColor: "#3A3B37",
            borderRadius: 6,
            width: "35%",
          }}
        />
      </View>
    </Animated.View>
  );
}

function SkeletonHeader() {
  const opacity = useSharedValue(0.35);
  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 700 }),
        withTiming(0.35, { duration: 700 }),
      ),
      -1,
      false,
    );
  }, []);
  const anim = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View
      style={[{ paddingHorizontal: H_PAD, gap: 14, paddingTop: 14 }, anim]}
    >
      {/* Brand bar skeleton */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
          <View
            style={{
              width: 8,
              height: 34,
              backgroundColor: CARD_BG,
              borderRadius: 2,
            }}
          />
          <View style={{ gap: 4 }}>
            <View
              style={{
                width: 90,
                height: 10,
                backgroundColor: CARD_BG,
                borderRadius: 4,
              }}
            />
            <View
              style={{
                width: 90,
                height: 10,
                backgroundColor: CARD_BG,
                borderRadius: 4,
              }}
            />
          </View>
        </View>
        <View
          style={{
            width: 40,
            height: 28,
            backgroundColor: CARD_BG,
            borderRadius: 6,
          }}
        />
      </View>
      {/* Search skeleton */}
      <View
        style={{ height: 46, backgroundColor: CARD_BG, borderRadius: 14 }}
      />
      {/* Filter skeleton */}
      <View
        style={{ height: 48, backgroundColor: CARD_BG, borderRadius: 16 }}
      />
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────────
// Fish card with Reanimated entering
// ─────────────────────────────────────────────────────────────────
function FishCard({
  item,
  onPress,
  index,
}: {
  item: Fish;
  onPress: () => void;
  index: number;
}) {
  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index, 10) * 50)
        .springify()
        .damping(14)}
    >
      <TouchableOpacity
        activeOpacity={0.88}
        style={styles.card}
        onPress={onPress}
      >
        <View style={styles.imgWrap}>
          <Image
            source={{ uri: imgUrl(item) }}
            style={styles.cardImg}
            contentFit="cover"
            transition={300}
          />
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardName} numberOfLines={2}>
            {item.name}
          </Text>
          <View style={styles.readRow}>
            <Ionicons name="reorder-three-outline" size={15} color="#AAA" />
            <Text style={styles.readText}>READ</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────────────────────────
export default function ExploreScreen() {
  const [allFishes, setAllFishes] = useState<Fish[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [page, setPage] = useState(1);
  const router = useRouter();

  useEffect(() => {
    load();
  }, []);

  const load = async (force = false) => {
    setError(false);
    try {
      const data = await getFishes(force);
      if (!data || data.length === 0) setError(true);
      else setAllFishes(data);
    } catch (e) {
      console.error("[Explore] load error:", e);
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    load(true);
  }, []);

  const filtered = allFishes.filter(
    (f) =>
      !search ||
      f.name?.toLowerCase().includes(search.toLowerCase()) ||
      f.scientific_name?.toLowerCase().includes(search.toLowerCase()) ||
      f.family?.toLowerCase().includes(search.toLowerCase()),
  );

  const visible = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < filtered.length;

  const go = (item: Fish) =>
    router.push({
      pathname: "/details/[id]",
      params: { id: item.id, fishData: JSON.stringify(item) },
    });

  // ── ListHeaderComponent ────────────────────────────────────────
  const ListHeader = (
    <View>
      {/* NatGeo top bar */}
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <View style={styles.natGeoBar} />
          <View>
            <Text style={styles.brandText}>NATIONAL</Text>
            <Text style={styles.brandText}>GEOGRAPHIC</Text>
          </View>
        </View>
        <View>
          <Text style={styles.speciesNum}>{filtered.length}</Text>
          <Text style={styles.speciesLbl}>SPECIES</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={16} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search species, family…"
          placeholderTextColor="#555"
          value={search}
          onChangeText={(t) => {
            setSearch(t);
            setPage(1);
          }}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setSearch("");
              setPage(1);
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={16} color="#555" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter pill — fixed height, underline flush at bottom */}
      <View style={styles.filterPill}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterInner}
        >
          {CATEGORIES.map((cat) => {
            const active = activeCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={styles.filterItem}
                onPress={() => {
                  setActiveCategory(cat);
                  setPage(1);
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.filterText, active && styles.filterTextActive]}
                >
                  {cat}
                </Text>
                {active && <View style={styles.filterUnderline} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Section label */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>All Species</Text>
        <Text style={styles.countBadge}>
          {visible.length} / {filtered.length}
        </Text>
      </View>
    </View>
  );

  // ── ListFooterComponent ────────────────────────────────────────
  const ListFooter = !hasMore ? (
    <View style={{ height: 32 }} />
  ) : (
    <TouchableOpacity
      style={styles.viewMoreBtn}
      activeOpacity={0.82}
      onPress={() => setPage((p) => p + 1)}
    >
      <Text style={styles.viewMoreText}>VIEW MORE</Text>
      <Ionicons name="chevron-down" size={14} color="#000" />
    </TouchableOpacity>
  );

  // ── Loading skeletons ──────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar barStyle="light-content" />
        <SkeletonHeader />
        <View style={{ marginTop: 20, paddingHorizontal: H_PAD }}>
          <View
            style={{
              flexDirection: "row",
              gap: CARD_GAP,
              flexWrap: "wrap",
              rowGap: CARD_GAP,
            }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <View
                key={i}
                style={
                  i % 2 === 0
                    ? { marginRight: CARD_GAP / 2 }
                    : { marginLeft: CARD_GAP / 2 }
                }
              >
                <SkeletonCard />
              </View>
            ))}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ── Error state ────────────────────────────────────────────────
  if (error) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { alignItems: "center", justifyContent: "center", gap: 16 },
        ]}
        edges={["top"]}
      >
        <Ionicons name="cloud-offline-outline" size={52} color="#333" />
        <Text
          style={{
            color: "#444",
            fontSize: 14,
            fontWeight: "700",
            letterSpacing: 1,
          }}
        >
          FAILED TO LOAD
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: ACCENT,
            paddingVertical: 12,
            paddingHorizontal: 28,
            borderRadius: 30,
          }}
          onPress={() => {
            setLoading(true);
            load(true);
          }}
        >
          <Text
            style={{ color: "#000", fontWeight: "900", letterSpacing: 1.5 }}
          >
            RETRY
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ── Empty state ────────────────────────────────────────────────
  const ListEmpty = (
    <View style={styles.empty}>
      <Ionicons name="fish-outline" size={44} color="#222" />
      <Text style={styles.emptyTitle}>NO SPECIES FOUND</Text>
      <Text style={styles.emptySub}>Try a different search term</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" />
      <FlatList
        data={visible}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        // ✅ Performance optimisations
        windowSize={8}
        maxToRenderPerBatch={10}
        initialNumToRender={10}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={ACCENT}
            colors={[ACCENT]}
            progressBackgroundColor="#161616"
          />
        }
        renderItem={({ item, index }) => (
          <FishCard item={item} index={index} onPress={() => go(item)} />
        )}
      />
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  listContent: { paddingHorizontal: H_PAD, paddingBottom: 16 },
  row: { gap: CARD_GAP, marginBottom: CARD_GAP },

  // NatGeo top bar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: H_PAD,
    paddingTop: 14,
    marginBottom: 14,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  natGeoBar: { width: 8, height: 34, backgroundColor: ACCENT, borderRadius: 2 },
  brandText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2,
    lineHeight: 15,
  },
  speciesNum: {
    color: ACCENT,
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 24,
    textAlign: "right",
  },
  speciesLbl: {
    color: "#444",
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 2,
    textAlign: "right",
  },

  // Search
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: H_PAD,
    marginBottom: 14,
    backgroundColor: CARD_BG,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 10,
  },
  searchInput: { flex: 1, color: "#FFF", fontSize: 14, padding: 0 },

  // Filter pill
  filterPill: {
    marginHorizontal: H_PAD,
    marginBottom: 20,
    backgroundColor: CARD_BG,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: "hidden",
    height: 48,
  },
  filterInner: {
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "stretch",
    height: 48,
  },
  filterItem: {
    paddingHorizontal: 14,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  filterText: { color: "#666", fontSize: 14, fontWeight: "600" },
  filterTextActive: { color: "#FFF", fontWeight: "700" },
  filterUnderline: {
    position: "absolute",
    bottom: 0,
    left: 8,
    right: 8,
    height: 3,
    backgroundColor: ACCENT,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },

  // Section header
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: H_PAD,
    marginBottom: 14,
  },
  sectionTitle: { color: "#FFF", fontSize: 15, fontWeight: "800" },
  countBadge: { color: "#555", fontSize: 11, fontWeight: "600" },

  // Card
  card: {
    width: CARD_W,
    borderRadius: RADIUS,
    overflow: "hidden",
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER,
  },
  imgWrap: {
    width: "100%",
    height: CARD_W * 1.1,
    borderTopLeftRadius: RADIUS,
    borderTopRightRadius: RADIUS,
    overflow: "hidden",
  },
  cardImg: { width: "100%", height: "100%" },
  cardBody: { padding: 12, gap: 10 },
  cardName: { color: "#FFF", fontSize: 13, fontWeight: "700", lineHeight: 18 },
  readRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  readText: {
    color: "#AAA",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
  },

  // View more
  viewMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: ACCENT,
    alignSelf: "center",
    paddingVertical: 13,
    paddingHorizontal: 28,
    borderRadius: 30,
    marginTop: 20,
    marginBottom: 16,
  },
  viewMoreText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.5,
  },

  // Empty
  empty: { alignItems: "center", paddingTop: 60, gap: 10 },
  emptyTitle: {
    color: "#2A2A2A",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 3,
  },
  emptySub: { color: "#1E1E1E", fontSize: 12 },
});
