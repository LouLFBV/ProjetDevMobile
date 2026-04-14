import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?q=80&w=1200',
    label: 'OCEAN',
    title: 'Discover nature\n and explore beyond',
    sub: 'find with us your dream house uickly and precisely',
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
        {/* <View>
          <Text style={styles.logoLine}>NATIONAL</Text>
          <Text style={styles.logoLine}>GEOGRAPHIC</Text>
        </View> */}
      </Animated.View>

      {/* Slide label tag
      <Animated.View style={[styles.labelTag, { opacity: fadeAnim }]}>
        <Text style={styles.labelTagText}>{slide.label}</Text>
      </Animated.View> */}

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
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 18 }}>Get Started</Text>
          <View style={styles.ctaIconWrap}>
            <Ionicons name="chevron-forward" size={24} color="white" />
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
    backgroundColor: '#C1F45A',
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
    color: '#C1F45A',
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
    backgroundColor: '#C1F45A',
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
// --- DANS TON STYLESHEET ---
ctaButton: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.15)', // Fond semi-transparent sombre
  paddingVertical: 8,       // Réduit pour laisser de la place au cercle
  paddingLeft: 25,          // Plus d'espace à gauche pour le texte
  paddingRight: 8,          // Peu d'espace à droite du cercle vert
  borderRadius: 20,         // Bien arrondi (pill shape)
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)', // Optionnel selon ta version d'Expo
},
ctaIconWrap: {
  backgroundColor: '#C1F45A', // Le vert pomme
  borderRadius: 15,          // Cercle parfait
  width: 45,                 // Taille fixe pour le rond
  height: 45,
  justifyContent: 'center',
  alignItems: 'center',
  marginLeft: 15,
},
// --- AJUSTE AUSSI LES DOTS ---
dotActive: {
  width: 12,                 // Plus petit rond
  height: 12,
  backgroundColor: '#C1F45A',
  borderRadius: 6,
},
dot: {
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: 'rgba(255,255,255,0.3)',
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
  ctaText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 2,
  },
});