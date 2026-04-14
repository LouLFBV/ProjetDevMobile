import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?q=80&w=1200',
    label: 'OCEAN',
    title: 'DISCOVER\nNATURE',
    sub: 'Dive into the extraordinary world of aquatic life, from shallow reefs to the abyssal deep.',
  },
  {
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200',
    label: 'WILDLIFE',
    title: 'EXPLORE\nBEYOND',
    sub: 'Over 800 documented fish species await your curiosity in our living scientific archive.',
  },
  {
    image: 'https://images.unsplash.com/photo-1559825481-12a05cc00344?q=80&w=1200',
    label: 'SCIENCE',
    title: 'PROTECT\n& LEARN',
    sub: 'Knowledge is the first step to conservation. Every species tells a story worth knowing.',
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const btnOpacity = useRef(new Animated.Value(0)).current;
  const imgFade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(150),
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, useNativeDriver: true, tension: 55, friction: 8 }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(slideUpAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]),
      Animated.timing(btnOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  // Auto-advance with crossfade
  useEffect(() => {
    const timer = setInterval(() => {
      Animated.timing(imgFade, { toValue: 0.4, duration: 400, useNativeDriver: true }).start(() => {
        setCurrentSlide(prev => (prev + 1) % SLIDES.length);
        Animated.timing(imgFade, { toValue: 1, duration: 600, useNativeDriver: true }).start();
      });
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[currentSlide];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Background */}
      <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: imgFade }]}>
        <Image
          source={{ uri: slide.image }}
          style={styles.bgImage}
          contentFit="cover"
          transition={600}
        />
      </Animated.View>

      {/* Gradient overlays */}
      <View style={styles.overlayTop} />
      <View style={styles.overlayBottom} />

      {/* NatGeo Logo */}
      <Animated.View
        style={[styles.logoArea, { opacity: fadeAnim, transform: [{ scale: logoScale }] }]}
      >
        <View style={styles.natGeoBlock} />
        <View>
          <Text style={styles.logoLine}>NATIONAL</Text>
          <Text style={styles.logoLine}>GEOGRAPHIC</Text>
        </View>
      </Animated.View>

      {/* Slide label tag */}
      <Animated.View style={[styles.labelTag, { opacity: fadeAnim }]}>
        <Text style={styles.labelTagText}>{slide.label}</Text>
      </Animated.View>

      {/* Center content */}
      <Animated.View
        style={[
          styles.centerContent,
          { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] },
        ]}
      >
        <View style={styles.accentLine} />
        <Text style={styles.tagline}>{slide.title}</Text>
        <Text style={styles.subtitle}>{slide.sub}</Text>
      </Animated.View>

      {/* Bottom: dots + CTA */}
      <Animated.View style={[styles.bottomArea, { opacity: btnOpacity }]}>
        {/* Pagination dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === currentSlide && styles.dotActive]} />
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={styles.ctaButton}
          activeOpacity={0.82}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.ctaText}>GET STARTED</Text>
          <View style={styles.ctaIconWrap}>
            <Ionicons name="chevron-forward" size={18} color="#000" />
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  bgImage: {
    width,
    height,
  },
  overlayTop: {
    ...StyleSheet.absoluteFillObject,
    height: height * 0.45,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  overlayBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.6,
    backgroundColor: 'rgba(0,0,0,0.72)',
  },

  // Logo
  logoArea: {
    position: 'absolute',
    top: 58,
    left: 26,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  natGeoBlock: {
    width: 12,
    height: 44,
    backgroundColor: '#FEB204',
  },
  logoLine: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 2.5,
    lineHeight: 18,
  },

  // Label tag (top-right)
  labelTag: {
    position: 'absolute',
    top: 66,
    right: 26,
    borderWidth: 1,
    borderColor: 'rgba(254,178,4,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 2,
  },
  labelTagText: {
    color: '#FEB204',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2.5,
  },

  // Main text block
  centerContent: {
    position: 'absolute',
    bottom: 160,
    left: 26,
    right: 26,
  },
  accentLine: {
    width: 44,
    height: 4,
    backgroundColor: '#FEB204',
    marginBottom: 22,
    borderRadius: 2,
  },
  tagline: {
    color: '#FFF',
    fontSize: 56,
    fontWeight: '900',
    lineHeight: 60,
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
    lineHeight: 24,
    maxWidth: 310,
  },

  // Bottom CTA area
  bottomArea: {
    position: 'absolute',
    bottom: 52,
    left: 26,
    right: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 7,
    alignItems: 'center',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: {
    width: 22,
    height: 7,
    backgroundColor: '#FEB204',
    borderRadius: 4,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEB204',
    paddingVertical: 14,
    paddingLeft: 22,
    paddingRight: 6,
    borderRadius: 4,
    gap: 10,
  },
  ctaText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 2,
  },
  ctaIconWrap: {
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderRadius: 2,
    padding: 5,
  },
});