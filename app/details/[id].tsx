import { Fish } from "@/src/services/fishApi";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

const TABS = ["Overview", "Album", "Discussion"] as const;
type Tab = (typeof TABS)[number];

// Default fish images while API images aren't available
const DEFAULT_FISH_IMAGES = [
  "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Camponotus_flavomarginatus_ant.jpg/320px-Camponotus_flavomarginatus_ant.jpg",
  "https://images.unsplash.com/photo-1524704796725-9fc3044a58b2?w=800&q=80",
  "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800&q=80",
  "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=800&q=80",
];

// Reliable fish image placeholders
const FISH_HERO =
  "https://images.unsplash.com/photo-1524704796725-9fc3044a58b2?w=800&q=80";
const FISH_INLINE =
  "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800&q=80";
const FISH_ALBUM = [
  "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=800&q=80",
  "https://images.unsplash.com/photo-1524704796725-9fc3044a58b2?w=800&q=80",
  "https://images.unsplash.com/photo-1571752726703-5e7d1f6a986d?w=800&q=80",
  "https://images.unsplash.com/photo-1542315204-b75654b04dc5?w=800&q=80",
];

const resolveHero = (fish: Fish) =>
  fish.image?.startsWith("http") ? fish.image : FISH_HERO;
const resolveInline = (fish: Fish) =>
  fish.image?.startsWith("http")
    ? `https://picsum.photos/seed/${(fish.id ?? 0) + 5}/600/400`
    : FISH_INLINE;
const resolveAlbum = (fish: Fish, i: number) =>
  fish.image?.startsWith("http")
    ? `https://picsum.photos/seed/${(fish.id ?? 0) + i + 20}/600/400`
    : FISH_ALBUM[i % FISH_ALBUM.length];

// Default description shown instead of AI generation
const defaultDescription = (fish: Fish) =>
  `${fish.name} is a fascinating aquatic species belonging to the ${fish.family ?? "Actinopterygii"} family. ` +
  `Found in diverse water environments, this species plays a vital role in its ecosystem through its unique feeding habits and behaviors. ` +
  `Like many fish, it has adapted remarkable physiological traits over millions of years of evolution, making it a remarkable example of nature's ingenuity.`;

export default function FishDetails() {
  const { fishData } = useLocalSearchParams();
  const router = useRouter();
  const fish: Fish = fishData ? JSON.parse(fishData as string) : null;

  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const scrollY = useRef(new Animated.Value(0)).current;

  if (!fish) return null;

  const stickyOpacity = scrollY.interpolate({
    inputRange: [height * 0.3, height * 0.42],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* ── Floating buttons ─────────────────────────────── */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => router.back()}
        activeOpacity={0.85}
      >
        <Ionicons name="chevron-back" size={18} color="#FFF" />
      </TouchableOpacity>

      

      {/* ── Sticky title on scroll ────────────────────────── */}
      <Animated.View style={[styles.stickyHeader, { opacity: stickyOpacity }]}>
        <Text style={styles.stickyTitle} numberOfLines={1}>
          {fish.name}
        </Text>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
      >
        {/* ── Hero: full-width image + gradient + text ─── */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: resolveHero(fish) }}
            style={styles.heroImage}
            contentFit="cover"
            transition={400}
          />

          {/* Gradient: clear top → dark bottom seamlessly */}
          <LinearGradient
            colors={[
              "transparent",
              "rgba(17,18,20,0.30)",
              "rgba(17,18,20,0.82)",
              "#111214",
            ]}
            locations={[0.3, 0.58, 0.8, 1]}
            style={StyleSheet.absoluteFill}
          />

          {/* Title + author overlaid at bottom of hero */}
          <View style={styles.heroOverlayText}>
            <Text style={styles.heroTitle}>{fish.name}</Text>
            <Text style={styles.heroAuthorLine}>
              By <Text style={styles.heroAuthorAccent}>Virginia Morell</Text>
            </Text>
          </View>
        </View>

        {/* ── Meta line ────────────────────────────────────── */}
        <View style={styles.metaBlock}>
          <View style={styles.divider} />
          <Text style={styles.metaDate}>Published May 13, 2020</Text>
        </View>

        {/* ── Tabs ─────────────────────────────────────────── */}
        <View style={styles.tabBar}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={styles.tabItem}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === tab && styles.tabLabelActive,
                ]}
              >
                {tab}
              </Text>
              {activeTab === tab && <View style={styles.tabUnderline} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* ── OVERVIEW ─────────────────────────────────────── */}
        {activeTab === "Overview" && (
          <View style={styles.contentCard}>
            {/* Description paragraphs */}
            <Text style={styles.descText}>{defaultDescription(fish)}</Text>
            <Text style={styles.descText}>
              Its scientific name,{" "}
              <Text style={{ fontStyle: "italic" }}>
                {fish.scientific_name || fish.name}
              </Text>
              , reflects its taxonomic heritage within the order{" "}
              {fish.order || "Siluriformes"}. Researchers continue to study this
              species to better understand its migration patterns, reproductive
              strategies, and the threats it faces from habitat loss and climate
              change.
            </Text>

            {/* Inline image */}
            <View style={styles.inlineImgWrap}>
              <Image
                source={{ uri: resolveInline(fish) }}
                style={styles.inlineImg}
                contentFit="cover"
                transition={400}
              />
            </View>
          </View>
        )}

        {/* ── ALBUM ────────────────────────────────────────── */}
        {activeTab === "Album" && (
          <View style={styles.contentCard}>
            <Text style={styles.sectionHeading}>NATURAL HABITAT</Text>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={styles.albumItem}>
                <Image
                  source={{ uri: resolveAlbum(fish, i) }}
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

        {/* ── DISCUSSION ───────────────────────────────────── */}
        {activeTab === "Discussion" && (
          <View style={[styles.contentCard, styles.discussionEmpty]}>
            <Ionicons name="chatbubbles-outline" size={44} color="#2A2A2A" />
            <Text style={styles.discussionTitle}>COMMUNITY DISCUSSION</Text>
            <Text style={styles.discussionSub}>
              No comments yet. Be the first to contribute.
            </Text>
          </View>
        )}

        <View style={{ height: 56 }} />
      </Animated.ScrollView>
    </View>
  );
}

// ── Design tokens ─────────────────────────────────────────────────
const BG = "#111214";
const CARD_BG = "#1C1E22";
const BORDER = "#2C2C2E";
const ACCENT = "#FEC158";
const ACCENT2 = "#C1F45A";


const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  // Floating buttons
  backBtn: {
    position: "absolute",
    top: 52,
    left: 16,
    zIndex: 40,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(60,60,60,0.75)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Sticky header
  stickyHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 30,
    backgroundColor: BG,
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 60,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    alignItems: "center",
  },
  stickyTitle: { color: "#FFF", fontSize: 13, fontWeight: "800" },

  // Hero
  heroContainer: {
    width,
    height: height * 0.55,
  },
  heroImage: { width: "100%", height: "100%" },

  heroOverlayText: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
  heroTitle: {
    color: "#FFF",
    fontSize: 27,
    fontWeight: "900",
    lineHeight: 33,
    marginBottom: 6,
  },
  heroAuthorLine: {
    color: "#AAA",
    fontSize: 13,
    fontWeight: "500",
  },
  heroAuthorAccent: {
    color: ACCENT,
    fontWeight: "700",
  },

  // Meta
  metaBlock: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 2,
  },
  divider: {
    height: 1,
    backgroundColor: BORDER,
    marginBottom: 10,
    marginTop: 4,
  },
  metaDate: {
    color: "#b1b1b1",
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },

  // Tabs
  tabBar: {
    flexDirection: "row",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    marginBottom: 16,
  },
  tabItem: {
    marginRight: 28,
    paddingVertical: 14,
    position: "relative",
  },
  tabLabel: { color: "#b1b1b1", fontSize: 14, fontWeight: "600" },
  tabLabelActive: { color: ACCENT2, fontWeight: "700" },
  tabUnderline: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: ACCENT2,
    borderTopLeftRadius: 1,
    borderTopRightRadius: 1,
  },

  // Content card
  contentCard: {
    marginHorizontal: 14,
    backgroundColor: CARD_BG,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 18,
    gap: 16,
  },

  // Description
  descText: {
    color: "#CCC",
    fontSize: 15,
    lineHeight: 26,
  },

  // Inline image
  inlineImgWrap: { borderRadius: 14, overflow: "hidden" },
  inlineImg: { width: "100%", height: 180 },

  // Section heading (album)
  sectionHeading: {
    color: ACCENT2,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 3,
  },

  // Album
  albumItem: { borderRadius: 14, overflow: "hidden" },
  albumImage: { width: "100%", height: 190 },
  albumCaption: {
    backgroundColor: "#111",
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: ACCENT2,
  },
  albumCaptionText: {
    color: "#555",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.5,
  },

  // Discussion
  discussionEmpty: { alignItems: "center", paddingVertical: 60, gap: 12 },
  discussionTitle: {
    color: "#2A2A2A",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 3,
  },
  discussionSub: { color: "#1E1E1E", fontSize: 13, textAlign: "center" },
});