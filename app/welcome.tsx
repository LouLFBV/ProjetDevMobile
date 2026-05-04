import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  { id: '1', image: 'https://images.pexels.com/photos/30162615/pexels-photo-30162615.jpeg', title: 'Discover nature\nand explore beyond', sub: 'find with us your dream house \nquickly and precisely' },
  { id: '2', image: 'https://images.pexels.com/photos/14438493/pexels-photo-14438493.jpeg', title: 'EXPLORE\nTHE UNKNOWN', sub: 'Over 800 documented fish species await your curiosity.' },
  { id: '3', image: 'https://images.pexels.com/photos/14863434/pexels-photo-14863434.jpeg', title: 'PROTECT\n& LEARN', sub: 'Every species tells a story worth knowing and protecting.' },
  { id: '4', image: 'https://images.unsplash.com/photo-1610741620547-1191d693e43d?q=80&w=1200&auto=format', title: 'DISCOVER\n& PRESERVE', sub: 'Each living being holds secrets that connect us to the heart of nature.' },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollX = useRef(new Animated.Value(0)).current;
  
  // TECHNIQUE DU RIDEAU : Le calque noir commence à opacité 1
  const overlayOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // On lance l'animation après un micro-délai pour laisser le thread JS respirer
    Animated.timing(overlayOpacity, {
      toValue: 0,
      duration: 800, 
      useNativeDriver: true, // Crucial pour la fluidité
    }).start();
  }, []);

  const onScroll = (event: any) => {
    const xPosition = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(xPosition / width);
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  const handleStart = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      router.replace('/(tabs)');
    } catch (e) {
      console.error(e);
    }
  };

  const renderItem = ({ item, index }: { item: typeof SLIDES[0], index: number }) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

    const imageOpacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.4, 1, 0.4],
    });

    const translateY = scrollX.interpolate({
      inputRange,
      outputRange: [60, 0, -60],
    });

    const textOpacity = scrollX.interpolate({
      inputRange,
      outputRange: [0, 1, 0],
    });

    return (
      <View style={styles.slideContainer}>
        <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: imageOpacity }]}>
          <Image 
            source={{ uri: item.image }} 
            style={styles.bgImage} 
            contentFit="cover"
            transition={300} // Fondu interne à l'image pour plus de douceur
          />
        </Animated.View>
        
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.9)', '#000']}
          locations={[0, 0.4, 0.7, 1]}
          style={styles.overlayBottom}
        />

        <Animated.View style={[
          styles.centerContent, 
          { opacity: textOpacity, transform: [{ translateY }] }
        ]}>
          <Text style={styles.tagline}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.sub}</Text>
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <Animated.FlatList
        data={SLIDES}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true, listener: onScroll }
        )}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.id}
      />

      <View style={styles.bottomArea} pointerEvents="box-none">
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]}>
              {i === activeIndex && (
                <Ionicons name="chevron-forward" size={10} color="#000" style={{ marginLeft: 2 }} />
              )}
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.ctaButtonContainer} onPress={handleStart}>
          <LinearGradient
            colors={['transparent', 'rgba(255, 255, 255, 0.15)']}
            start={{ x: 1, y: 0.5 }} end={{ x: 0.35, y: 0.5 }}
            style={styles.ctaGradientBg}
          />
          <Text style={styles.ctaTextLabel}>Get Started</Text>
          <View style={styles.ctaIconWrap}>
            <Ionicons name="chevron-forward" size={30} color="#000" />
          </View>
        </TouchableOpacity>
      </View>

      {/* LE RIDEAU NOIR : Il couvre tout et s'efface pour révéler l'interface */}
      <Animated.View 
        pointerEvents="none" // Permet de cliquer à travers une fois invisible
        style={[
          StyleSheet.absoluteFillObject, 
          { backgroundColor: '#000', opacity: overlayOpacity }
        ]} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  slideContainer: { width, height },
  bgImage: { ...StyleSheet.absoluteFillObject },
  overlayBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: height * 0.75 },
  centerContent: { position: 'absolute', bottom: 250, left: 26, right: 26 },
  tagline: { color: '#FFF', fontSize: 32, fontWeight: '700', lineHeight: 45, letterSpacing: 1, marginBottom: 16 },
  subtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 15, lineHeight: 24, maxWidth: 310 },
  bottomArea: { position: 'absolute', bottom: 52, left: 26, right: 26, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dotsRow: { flexDirection: 'row', gap: 7, alignItems: 'center' },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
  dotActive: { width: 12.5, height: 12.5, backgroundColor: '#C1F45A', borderRadius: 11 }, // Un peu plus grand pour l'icône
  ctaButtonContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' },
  ctaGradientBg: { ...StyleSheet.absoluteFillObject },
  ctaTextLabel: { color: '#FFF', fontWeight: 'bold', fontSize: 18, marginLeft: 15, marginRight: 10, zIndex: 1 },
  ctaIconWrap: { backgroundColor: '#C1F45A', borderRadius: 13, width: 48, height: 48, justifyContent: 'center', alignItems: 'center', margin: 5, zIndex: 1 },
});