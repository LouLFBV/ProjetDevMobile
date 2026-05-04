import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
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
    image: 'https://images.pexels.com/photos/30162615/pexels-photo-30162615.jpeg',
    label: 'DEEP BLUE',
    title: 'Discover nature\nand explore beyond',
    sub: 'Experience the silent beauty of the ocean depths.',
  },
  {
    image: 'https://images.pexels.com/photos/14438493/pexels-photo-14438493.jpeg',
    label: 'TROPICAL',
    title: 'EXPLORE\nTHE UNKNOWN',
    sub: 'Over 800 documented fish species await your curiosity.',
  },
  {
    image: 'https://images.pexels.com/photos/14863434/pexels-photo-14863434.jpeg',
    label: 'ECOSYSTEM',
    title: 'PROTECT\n& LEARN',
    sub: 'Every species tells a story worth knowing and protecting.',
  },
  {
    image: 'https://images.unsplash.com/photo-1610741620547-1191d693e43d?q=80&w=1200&auto=format',
    label: 'BIODIVERSITY',
    title: 'DISCOVER\n& PRESERVE',
    sub: 'Each living being holds secrets that connect us to the heart of nature. Let’s unveil and safeguard them together.',
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const btnOpacity = useRef(new Animated.Value(0)).current;
  const imgFade = useRef(new Animated.Value(1)).current;

  // Prefetch des images
  useEffect(() => {
    SLIDES.forEach(slide => Image.prefetch(slide.image));
  }, []);

  // Animations d'entrée (au chargement)
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

  // Fonction de transition fluide
  // 1. On fige la fonction pour qu'elle soit accessible partout sans erreur
const changeSlide = (index: number) => {
  if (!imgFade) return; // Sécurité

  Animated.timing(imgFade, {
    toValue: 0,
    duration: 400,
    useNativeDriver: true,
  }).start(() => {
    setCurrentSlide(index);
    
    // Le setTimeout permet d'éviter le "glitch" visuel
    setTimeout(() => {
      Animated.timing(imgFade, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, 250);
  });
}; // Dépendance nécessaire pour useCallback

// 2. Gestion du cycle de vie du timer
useEffect(() => {
  // On crée l'intervalle
  const intervalId = setInterval(() => {
    const nextIndex = (currentSlide + 1) % SLIDES.length;
    changeSlide(nextIndex);
  }, 4500);

  // On stocke dans la ref pour pouvoir l'annuler au clic manuel
  timerRef.current = intervalId;

  // Nettoyage automatique
  return () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };
}, [currentSlide, changeSlide]); // Le timer se reset proprement à chaque changement

  // Gestion du cycle de vie du timer
useEffect(() => {
  // On crée l'intervalle dans une variable locale d'abord
  const id = setInterval(() => {
    const nextIndex = (currentSlide + 1) % SLIDES.length;
    changeSlide(nextIndex);
  }, 4500);

  // On l'assigne à la ref
  timerRef.current = id;

  // Nettoyage
  return () => {
    if (id) clearInterval(id);
  };
}, [currentSlide]); // On redémarre le timer quand la slide change

  const slide = SLIDES[currentSlide];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Background avec animation de fondu */}
      <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: imgFade }]}>
        <Image
          source={{ uri: slide.image }}
          style={styles.bgImage}
          contentFit="cover"
        />
      </Animated.View>

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.9)', '#000']}
        locations={[0, 0.4, 0.7, 1]}
        style={styles.overlayBottom}
      />

      {/* Texte au centre */}
      <Animated.View
        style={[
          styles.centerContent,
          { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] },
        ]}
      >
        <Text style={styles.tagline}>{slide.title}</Text>
        <Text style={styles.subtitle}>{slide.sub}</Text>
      </Animated.View>

      {/* Barre du bas : Dots + Bouton */}
      <Animated.View style={[styles.bottomArea, { opacity: btnOpacity }]}>
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <TouchableOpacity
              key={i}
              activeOpacity={0.8}
              onPress={() => {
                if (i !== currentSlide) {
                  if (timerRef.current) clearInterval(timerRef.current);
                  changeSlide(i);
                }
              }}
              style={{ padding: 10, margin: -10 }} 
            >
              <View style={[styles.dot, i === currentSlide && styles.dotActive]}>
                {i === currentSlide && (
                  <Ionicons name="chevron-forward" size={12} color="#000" style={{ marginLeft: 2 }} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.ctaButtonContainer}
          onPress={() => router.replace('/(tabs)')}
        >
          <LinearGradient
            colors={['transparent', 'rgba(255, 255, 255, 0.15)']}
            start={{ x: 1, y: 0.5 }}
            end={{ x: 0.35, y: 0.5 }}
            style={styles.ctaGradientBg}
          />
          <Text style={styles.ctaTextLabel}>Get Started</Text>
          <View style={styles.ctaIconWrap}>
            <Ionicons name="chevron-forward" size={30} color="white" />
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
  overlayBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.75,
  },
  centerContent: {
    position: 'absolute',
    bottom: 200,
    left: 26,
    right: 26,
  },
  tagline: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 45,
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
    lineHeight: 24,
    maxWidth: 310,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotActive: {
    width: 26, // Un peu plus large pour le chevron
    height: 26,
    backgroundColor: '#C1F45A',
    borderRadius: 13,
  },
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
    gap: 15,
    alignItems: 'center',
  },
  ctaButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  ctaGradientBg: {
    ...StyleSheet.absoluteFillObject,
  },
  ctaTextLabel: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 15,
    marginRight: 10,
    zIndex: 1,
  },
  ctaIconWrap: {
    backgroundColor: '#C1F45A',
    borderRadius: 13,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    zIndex: 1,
  },
});