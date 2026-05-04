import { Fish, getFishes } from "@/src/services/fishApi";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const H_PAD = 16;
const CARD_GAP = 12;
const GRID_CARD_W = (width - H_PAD * 2 - CARD_GAP) / 2;

const HERO_W = width - H_PAD * 2;
const HERO_H = Math.round(HERO_W * (141 / 305));
const HERO_RADIUS = 24;

const CATEGORIES = ["All", "Marine", "Freshwater", "Tropical", "Deep Sea"];

const PLACEHOLDER_IMAGES = [
  "https://picsum.photos/seed/fish1/800/400",
  "https://picsum.photos/seed/fish2/800/400",
  "https://picsum.photos/seed/fish3/800/400",
];

const imgUrl = (fish: Fish): string => {
  if (fish.image && fish.image.startsWith("http")) return fish.image;
  return `https://picsum.photos/seed/${fish.id ?? 1}/400/500`;
};

const BG = "#111214";
const CARD_BG = "#30312D";
const BORDER = "#30312D";
const RADIUS = 18;

// ─── Grid card ───────────────────────────────────────────────────
function GridCard({ item, onPress }: { item: Fish; onPress: () => void }) {
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      style={styles.gridCard}
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
        <Text style={styles.cardName} numberOfLines={3}>
          {item.name}
        </Text>
        <View style={styles.readRow}>
          <Ionicons name="reorder-three-outline" size={15} color="#AAA" />
          <Text style={styles.readText}>READ</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Row card ─────────────────────────────────────────────────────
function RowCard({ item, onPress }: { item: Fish; onPress: () => void }) {
  return (
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
  );
}

// ─── Screen ──────────────────────────────────────────────────────
export default function HomeScreen() {
  const [fishes, setFishes] = useState<Fish[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [heroSlide, setHeroSlide] = useState(1);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const router = useRouter();

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
      setHeroSlide((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const load = async (force = false) => {
    try {
      const data = await getFishes(force);
      setFishes(data);
    } catch (e) {
      console.error(e);
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

  const hero = fishes[0];
  const gridFish = fishes.slice(1, 5);
  const rowFish = fishes.slice(5, 8);

  if (loading) {
    return (
      <View style={styles.loadingBox}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="#C1F45A" />
        <Text style={styles.loadingText}>LOADING…</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#C1F45A"
            colors={["#C1F45A"]}
            progressBackgroundColor="#13140D"
          />
        }
      >
        {/* ── Hero ──────────────────────────────────────────────── */}
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.heroCard}
          onPress={() => hero && go(hero)}
        >
          <Animated.View
            style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}
          >
            <Image
              source={{ uri: PLACEHOLDER_IMAGES[heroSlide] }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={400}
            />
          </Animated.View>

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
            <Text style={styles.heroName}>
              {hero?.name?.toUpperCase() ?? "ANIMALS"}
            </Text>
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

        {/* ── Filter pill ──────────────────────────────────────── */}
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
                    style={[
                      styles.filterText,
                      active && styles.filterTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                  {/* Underline flush at bottom of pill */}
                  {active && <View style={styles.filterUnderline} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ── Recommended 2-col ────────────────────────────────── */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Recommended Species</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/explore")}>
            <Text style={styles.showAll}>Show All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          {gridFish.map((item, i) => (
            <View
              key={item.id}
              style={
                i % 2 === 0
                  ? { marginRight: CARD_GAP / 2 }
                  : { marginLeft: CARD_GAP / 2 }
              }
            >
              <GridCard item={item} onPress={() => go(item)} />
            </View>
          ))}
        </View>

        {/* ── Recommended horizontal ───────────────────────────── */}
        <View style={[styles.sectionRow, { marginTop: 28 }]}>
          <Text style={styles.sectionTitle}>Recommended Species</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/explore")}>
            <Text style={styles.showAll}>Show All</Text>
          </TouchableOpacity>
        </View>

        {rowFish.map((item) => (
          <RowCard key={item.id} item={item} onPress={() => go(item)} />
        ))}

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  loadingBox: {
    flex: 1,
    backgroundColor: BG,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
  loadingText: {
    color: "#333",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 3,
  },
  scroll: { paddingBottom: 16 },

  // ── Hero ──
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
    backgroundColor: "#C1F45A",
  },

  // ── Filter pill ──
  // The pill has a fixed height so the underline can be positioned absolute bottom:0
  filterPill: {
    marginHorizontal: H_PAD,
    marginBottom: 22,
    backgroundColor: CARD_BG,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: "hidden",
    height: 48, // fixed height — gives underline a stable anchor
  },
  filterInner: {
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "stretch", // items stretch to fill the 48px height
    height: 48,
  },
  filterItem: {
    paddingHorizontal: 14,
    justifyContent: "center", // centre the text vertically
    alignItems: "center",
    position: "relative",
  },
  filterText: { color: "#666", fontSize: 14, fontWeight: "600" },
  filterTextActive: { color: "#FFF", fontWeight: "700" },
  // Flush at the very bottom of the 48px pill
  filterUnderline: {
    position: "absolute",
    bottom: 0,
    left: 8,
    right: 8,
    height: 3,
    backgroundColor: "#C1F45A",
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },

  // ── Section header ──
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: H_PAD,
    marginBottom: 14,
  },
  sectionTitle: { color: "#FFF", fontSize: 15, fontWeight: "800" },
  showAll: { color: "#C1F45A", fontSize: 12, fontWeight: "700" },

  // ── 2-col grid ──
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: H_PAD,
    rowGap: CARD_GAP,
  },
  gridCard: {
    width: GRID_CARD_W,
    borderRadius: RADIUS,
    overflow: "hidden",
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER,
  },
  gridImgWrap: {
    width: "100%",
    height: GRID_CARD_W * 1.1,
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

  // ── Horizontal row cards ──
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