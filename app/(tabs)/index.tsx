import { Fish, getFishes } from "@/src/services/fishApi";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  RefreshControl,
  Animated as RNAnimated,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
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

const { width } = Dimensions.get("window");
const H_PAD = 16;
const CARD_GAP = 12;
const GRID_W = (width - H_PAD * 2 - CARD_GAP) / 2;
const HERO_W = width - H_PAD * 2;
const HERO_H = Math.round(HERO_W * (141 / 305));
const HERO_RADIUS = 24;

const CATEGORIES = ["All", "Marine", "Freshwater", "Tropical", "Deep Sea"];
const PLACEHOLDER = [
  "https://picsum.photos/seed/fish1/800/400",
  "https://picsum.photos/seed/fish2/800/400",
  "https://picsum.photos/seed/fish3/800/400",
];

// Design tokens
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
// Skeleton shimmer
// ─────────────────────────────────────────────────────────────────
function SkeletonCard({ width: w }: { width: number }) {
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
          width: w,
          borderRadius: RADIUS,
          overflow: "hidden",
          backgroundColor: CARD_BG,
        },
        anim,
      ]}
    >
      <View
        style={{ width: "100%", height: w * 1.1, backgroundColor: "#3A3B37" }}
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

function SkeletonHero() {
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
          marginHorizontal: H_PAD,
          marginTop: 52,
          height: HERO_H,
          borderRadius: HERO_RADIUS,
          backgroundColor: CARD_BG,
          marginBottom: 16,
        },
        anim,
      ]}
    />
  );
}

function SkeletonRow() {
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
          flexDirection: "row",
          marginHorizontal: H_PAD,
          marginBottom: 12,
          height: 120,
          borderRadius: RADIUS,
          backgroundColor: CARD_BG,
        },
        anim,
      ]}
    >
      <View
        style={{
          width: 120,
          height: "100%",
          backgroundColor: "#3A3B37",
          borderTopLeftRadius: RADIUS,
          borderBottomLeftRadius: RADIUS,
        }}
      />
      <View style={{ flex: 1, padding: 14, gap: 8 }}>
        <View
          style={{
            height: 10,
            backgroundColor: "#3A3B37",
            borderRadius: 6,
            width: "85%",
          }}
        />
        <View
          style={{
            height: 10,
            backgroundColor: "#3A3B37",
            borderRadius: 6,
            width: "60%",
          }}
        />
      </View>
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────────
// Grid card: image top, text below
// ─────────────────────────────────────────────────────────────────
function GridCard({
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
      entering={FadeInDown.delay(index * 60)
        .springify()
        .damping(14)}
    >
      <TouchableOpacity
        activeOpacity={0.88}
        style={[styles.gridCard]}
        onPress={onPress}
      >
        <View style={styles.gridImgWrap}>
          <Image
            source={{ uri: imgUrl(item) }}
            style={styles.gridImg}
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
// Horizontal row card
// ─────────────────────────────────────────────────────────────────
function RowCard({
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
      entering={FadeInDown.delay(index * 80)
        .springify()
        .damping(14)}
    >
      <TouchableOpacity
        activeOpacity={0.88}
        style={styles.rowCard}
        onPress={onPress}
      >
        <View style={styles.rowImgWrap}>
          <Image
            source={{ uri: imgUrl(item) }}
            style={styles.rowImg}
            contentFit="cover"
            transition={300}
          />
        </View>
        <View style={styles.rowBody}>
          <Text style={styles.rowName} numberOfLines={3}>
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
export default function HomeScreen() {
  const [fishes, setFishes] = useState<Fish[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [heroSlide, setHeroSlide] = useState(1);
  const fadeAnim = useRef(new RNAnimated.Value(1)).current;
  const router = useRouter();

  useEffect(() => {
    load();
  }, []);

  // Auto-cycle hero
  useEffect(() => {
    const t = setInterval(() => {
      RNAnimated.sequence([
        RNAnimated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
        RNAnimated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
      setHeroSlide((p) => (p + 1) % 3);
    }, 4500);
    return () => clearInterval(t);
  }, []);

  const load = async (force = false) => {
    setError(false);
    try {
      const data = await getFishes(force);
      if (!data || data.length === 0) setError(true);
      else setFishes(data);
    } catch (e) {
      console.error("[Home] load error:", e);
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load(true);
  }, []);

  const go = (item: Fish) =>
    router.push({
      pathname: "/details/[id]",
      params: { id: item.id, fishData: JSON.stringify(item) },
    });

  // Slice data for sections
  const hero = fishes[0];
  const gridFish = fishes.slice(1, 5); // 4 items for 2×2 grid
  const rowFish = fishes.slice(5, 8); // 3 items for horizontal section

  // ── Loading skeletons ──────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.root}>
        <StatusBar
          barStyle="light-content"
          translucent
          backgroundColor="transparent"
        />
        <SkeletonHero />
        {/* Filter pill skeleton */}
        <View style={[styles.filterPill, { marginBottom: 22 }]}>
          <View style={{ height: 48 }} />
        </View>
        <View style={[styles.sectionRow, { marginBottom: 14 }]}>
          <View
            style={{
              height: 14,
              width: 160,
              backgroundColor: CARD_BG,
              borderRadius: 6,
            }}
          />
        </View>
        {/* Grid skeletons */}
        <View style={styles.grid}>
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={
                i % 2 === 0
                  ? { marginRight: CARD_GAP / 2 }
                  : { marginLeft: CARD_GAP / 2 }
              }
            >
              <SkeletonCard width={GRID_W} />
            </View>
          ))}
        </View>
        <View style={[styles.sectionRow, { marginTop: 28, marginBottom: 14 }]}>
          <View
            style={{
              height: 14,
              width: 160,
              backgroundColor: CARD_BG,
              borderRadius: 6,
            }}
          />
        </View>
        {[0, 1, 2].map((i) => (
          <SkeletonRow key={i} />
        ))}
      </View>
    );
  }

  // ── Error state ────────────────────────────────────────────────
  if (error) {
    return (
      <View
        style={[
          styles.root,
          { alignItems: "center", justifyContent: "center", gap: 16 },
        ]}
      >
        <StatusBar barStyle="light-content" />
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
      </View>
    );
  }

  // ── ListHeaderComponent ────────────────────────────────────────
  const ListHeader = (
    <View>
      {/* Hero */}
      {hero && (
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.heroCard}
          onPress={() => go(hero)}
        >
          <RNAnimated.View
            style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}
          >
            <Image
              source={{ uri: PLACEHOLDER[heroSlide] }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={400}
            />
          </RNAnimated.View>
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.18)", "rgba(0,0,0,0.72)"]}
            locations={[0, 0.45, 1]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroPause}>
            <Ionicons name="pause" size={11} color="#FFF" />
          </View>
          <View style={styles.heroLabel}>
            <View style={styles.heroBar} />
            <Text style={styles.heroName}>{hero.name?.toUpperCase()}</Text>
          </View>
          <View style={styles.heroDotsRow}>
            {[0, 1, 2].map((i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setHeroSlide(i)}
                activeOpacity={0.7}
                style={[
                  styles.heroDot,
                  i === heroSlide && styles.heroDotActive,
                ]}
              >
                {i === heroSlide && (
                  <Ionicons
                    name="chevron-forward"
                    size={10}
                    color="#000"
                    style={{ marginLeft: 1 }}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      )}

      {/* Filter pill */}
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
                onPress={() => setActiveCategory(cat)}
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

      {/* Section header */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Recommended Species</Text>
        <TouchableOpacity onPress={() => router.push("/(tabs)/explore")}>
          <Text style={styles.showAll}>Show All</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ── ListFooterComponent — horizontal cards section ─────────────
  const ListFooter = (
    <View>
      <View style={[styles.sectionRow, { marginTop: 28 }]}>
        <Text style={styles.sectionTitle}>Recommended Species</Text>
        <TouchableOpacity onPress={() => router.push("/(tabs)/explore")}>
          <Text style={styles.showAll}>Show All</Text>
        </TouchableOpacity>
      </View>
      {rowFish.map((item, i) => (
        <RowCard key={item.id} item={item} index={i} onPress={() => go(item)} />
      ))}
      <View style={{ height: 24 }} />
    </View>
  );

  // ── Empty state ────────────────────────────────────────────────
  const ListEmpty = (
    <View style={{ alignItems: "center", paddingTop: 40, gap: 12 }}>
      <Ionicons name="fish-outline" size={44} color="#2A2A2A" />
      <Text
        style={{
          color: "#2A2A2A",
          fontSize: 13,
          fontWeight: "900",
          letterSpacing: 3,
        }}
      >
        NO SPECIES FOUND
      </Text>
    </View>
  );

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <FlatList
        // Data: only the 4 grid fish (hero + horizontal rows handled in header/footer)
        data={gridFish}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        ListEmptyComponent={ListEmpty}
        showsVerticalScrollIndicator={false}
        // ✅ Performance optimisations
        windowSize={5}
        maxToRenderPerBatch={8}
        initialNumToRender={4}
        removeClippedSubviews
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={ACCENT}
            colors={[ACCENT]}
            progressBackgroundColor="#13140D"
          />
        }
        renderItem={({ item, index }) => (
          <View
            style={
              index % 2 === 0
                ? { marginRight: CARD_GAP / 2 }
                : { marginLeft: CARD_GAP / 2 }
            }
          >
            <GridCard item={item} index={index} onPress={() => go(item)} />
          </View>
        )}
      />
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  listContent: { paddingHorizontal: H_PAD, paddingBottom: 16 },
  row: { gap: CARD_GAP, marginBottom: CARD_GAP },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: H_PAD,
    rowGap: CARD_GAP,
  },

  // Hero
  heroCard: {
    marginHorizontal: H_PAD,
    marginTop: 52,
    width: HERO_W,
    height: HERO_H,
    borderRadius: HERO_RADIUS,
    overflow: "hidden",
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 16,
  },
  heroPause: {
    position: "absolute",
    top: 10,
    left: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroLabel: {
    position: "absolute",
    bottom: 30,
    left: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  heroBar: { width: 7, height: 20, backgroundColor: "#F4C41A", marginRight: 6 },
  heroName: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    flex: 1,
  },
  heroDotsRow: {
    position: "absolute",
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 7,
  },
  heroDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  heroDotActive: {
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: ACCENT,
  },

  // Filter pill
  filterPill: {
    marginHorizontal: H_PAD,
    marginBottom: 22,
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
  showAll: { color: ACCENT, fontSize: 12, fontWeight: "700" },

  // Grid card
  gridCard: {
    width: GRID_W,
    borderRadius: RADIUS,
    overflow: "hidden",
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER,
  },
  gridImgWrap: {
    width: "100%",
    height: GRID_W * 1.1,
    borderTopLeftRadius: RADIUS,
    borderTopRightRadius: RADIUS,
    overflow: "hidden",
  },
  gridImg: { width: "100%", height: "100%" },
  cardBody: { padding: 12, gap: 10 },
  cardName: { color: "#FFF", fontSize: 13, fontWeight: "700", lineHeight: 18 },
  readRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  readText: {
    color: "#AAA",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
  },

  // Row card
  rowCard: {
    flexDirection: "row",
    marginHorizontal: H_PAD,
    marginBottom: 12,
    borderRadius: RADIUS,
    overflow: "hidden",
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER,
    height: 120,
  },
  rowImgWrap: {
    width: 120,
    height: "100%",
    borderTopLeftRadius: RADIUS,
    borderBottomLeftRadius: RADIUS,
    overflow: "hidden",
  },
  rowImg: { width: "100%", height: "100%" },
  rowBody: { flex: 1, padding: 14, justifyContent: "space-between" },
  rowName: { color: "#FFF", fontSize: 14, fontWeight: "700", lineHeight: 19 },
});
