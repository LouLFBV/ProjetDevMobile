import React, { useEffect, useRef } from 'react';
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
    image: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?q=80&w=1200',
    title: 'DISCOVER\nNATURE',
    subtitle: 'Explore the hidden depths of the ocean and its extraordinary inhabitants.',
  },
  {
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1200',
    title: 'EXPLORE\nBEYOND',
    subtitle: 'Thousands of fish species await your curiosity in our living archive.',
  },
  {
    image: 'https://images.unsplash.com/photo-1559825481-12a05cc00344?q=80&w=1200',
    title: 'PROTECT\n& LEARN',
    subtitle: 'Knowledge is the first step to conservation. Dive in.',
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = React.useState(0);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(40)).current;
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const btnAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(slideUpAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]),
      Animated.timing(btnAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[currentSlide];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Background image */}
      <Image
        source={{ uri: slide.image }}
        style={styles.bgImage}
        contentFit="cover"
        transition={800}
      />

      {/* Dark gradient overlay */}
      <View style={styles.overlay} />

      {/* Top: NatGeo Logo */}
      <Animated.View style={[styles.logoArea, { transform: [{ scale: logoScale }], opacity: fadeAnim }]}>
        <View style={styles.natGeoBlock} />
        <View>
          <Text style={styles.logoText}>NATIONAL</Text>
          <Text style={styles.logoText}>GEOGRAPHIC</Text>
        </View>
      </Animated.View>

      {/* Center: Tagline */}
      <Animated.View
        style={[
          styles.centerContent,
          { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] },
        ]}
      >
        <View style={styles.accentLine} />
        <Text style={styles.tagline}>{slide.title}</Text>
        <Text style={styles.subtitle}>{slide.subtitle}</Text>
      </Animated.View>

      {/* Bottom: Pagination + CTA */}
      <Animated.View style={[styles.bottomArea, { opacity: btnAnim }]}>
        {/* Dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === currentSlide && styles.dotActive]}
            />
          ))}
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          style={styles.ctaButton}
          activeOpacity={0.85}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.ctaText}>GET STARTED</Text>
          <View style={styles.ctaArrow}>
            <Ionicons name="chevron-forward" size={20} color="#000" />
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
    ...StyleSheet.absoluteFillObject,
    width,
    height,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  logoArea: {
    position: 'absolute',
    top: 60,
    left: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  natGeoBlock: {
    width: 14,
    height: 50,
    backgroundColor: '#FEB204',
  },
  logoText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
    lineHeight: 19,
  },
  centerContent: {
    position: 'absolute',
    bottom: 200,
    left: 28,
    right: 28,
  },
  accentLine: {
    width: 48,
    height: 4,
    backgroundColor: '#FEB204',
    marginBottom: 20,
  },
  tagline: {
    color: '#FFF',
    fontSize: 52,
    fontWeight: '900',
    lineHeight: 56,
    letterSpacing: 1,
    marginBottom: 18,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 15,
    lineHeight: 24,
    maxWidth: 300,
  },
  bottomArea: {
    position: 'absolute',
    bottom: 50,
    left: 28,
    right: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  dotActive: {
    width: 24,
    backgroundColor: '#FEB204',
    borderRadius: 4,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEB204',
    paddingVertical: 14,
    paddingLeft: 24,
    paddingRight: 6,
    borderRadius: 4,
    gap: 12,
  },
  ctaText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },
  ctaArrow: {
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 2,
    padding: 6,
  },
});