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

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const btnOpacity = useRef(new Animated.Value(0)).current;
  const imgFade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
  // On demande à expo-image de mettre toutes les images en cache immédiatement
  SLIDES.forEach(slide => {
    Image.prefetch(slide.image);
  });
}, []);
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
      // 1. On cache l'image actuelle (Opacité -> 0)
      Animated.timing(imgFade, { 
        toValue: 0, 
        duration: 400, 
        useNativeDriver: true 
      }).start(() => {
        
        // 2. On change l'URL de l'image
        setCurrentSlide(prev => (prev + 1) % SLIDES.length);

        // 3. ON ATTEND UN TOUT PETIT PEU (100ms) 
        // Cela laisse le temps au moteur de rendu de charger la nouvelle source
        setTimeout(() => {
          // 4. On réaffiche la nouvelle image (Opacité -> 1)
          Animated.timing(imgFade, { 
            toValue: 1, 
            duration: 600, 
            useNativeDriver: true 
          }).start();
        }, 250); // Ce délai fait toute la différence pour la synchro
        
      });
    }, 4500);

    return () => clearInterval(timer);
  }, [imgFade]); // Ajout de imgFade en dépendance pour la clarté

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
          // RETIRE transition={600} ici pour éviter le conflit
        />
      </Animated.View>

      {/* Dégradé noir partant du bas */}
      <LinearGradient
        // 'transparent' en haut, noir intense en bas
        colors={['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.9)', '#000']}
        // On définit où chaque couleur commence (0 = haut, 1 = bas)
        locations={[0, 0.4, 0.7, 1]}
        style={styles.overlayBottom}
      />

      {/* Center content */}
      <Animated.View
        style={[
          styles.centerContent,
          { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] },
        ]}
      >
        {/* <View style={styles.accentLine} /> */}
        <Text style={styles.tagline}>{slide.title}</Text>
        <Text style={styles.subtitle}>{slide.sub}</Text>
      </Animated.View>

      {/* Bottom: dots + CTA */}
      <Animated.View style={[styles.bottomArea, { opacity: btnOpacity }]}>
        {/* Pagination dots */}
        <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === currentSlide && styles.dotActive]}>
            {i === currentSlide && (
              <Ionicons name="chevron-forward" size={12} color="#000" style={{ marginLeft: 2 }} />
            )}
          </View>
        ))}
      </View>
        {/* CTA */}
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
  height: height * 0.75, // Couvre 75% de l'écran en partant du bas
},

 
  // Main text block
  centerContent: {
    position: 'absolute',
    bottom: 200,
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
ctaButton: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.15)', // Fond semi-transparent sombre
  paddingVertical: 8,       // Réduit pour laisser de la place au cercle
  paddingLeft: 10,          // Plus d'espace à gauche pour le texte
  paddingRight: 8,          // Peu d'espace à droite du cercle vert
  borderRadius: 20,         // Bien arrondi (pill shape)
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)', // Optionnel selon ta version d'Expo
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
  width: 15,        
  height: 15,       
  backgroundColor: '#C1F45A',
  borderRadius: 8,  // Moitié de la taille pour rester un cercle
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

ctaButtonContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  borderRadius: 10, 
  overflow: 'hidden', // Crucial pour que le dégradé ne dépasse pas des arrondis
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
  marginLeft: 10, 
  marginRight: 25,
  zIndex: 1, 
},
ctaIconWrap: {
  backgroundColor: '#C1F45A',
  borderRadius: 13,
  width: 48,
  height: 48,
  justifyContent: 'center',
  alignItems: 'center',
  margin: 5, // Petit espace entre le bord du bouton et le cercle vert
  zIndex: 1,
},
});