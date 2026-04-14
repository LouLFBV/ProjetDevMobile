import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function FishDetails() {
  const { fishData } = useLocalSearchParams();
  const router = useRouter();
  const fish = fishData ? JSON.parse(fishData as string) : null;

  if (!fish) return null;

  return (
    <View style={styles.container}>
      {/* Bouton Retour flottant */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Ionicons name="chevron-back" size={28} color="#000" />
      </TouchableOpacity>

      <ScrollView bounces={false}>
        {/* Image Header */}
        <Image 
          source={{ uri: fish.image || 'https://images.unsplash.com/photo-1551244072-5d12893278ab?q=80&w=500' }} 
          style={styles.mainImage}
          contentFit="cover"
        />

        {/* Bloc Titre NatGeo Style */}
        <View style={styles.headerInfo}>
          <View style={styles.natGeoTag} />
          <Text style={styles.scientificName}>{fish.scientific_name}</Text>
          <Text style={styles.mainTitle}>{fish.name}</Text>
        </View>

        {/* Fiche Technique */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>FAMILLE</Text>
            <Text style={styles.detailValue}>{fish.family || 'Inconnue'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>HABITAT</Text>
            <Text style={styles.detailValue}>{fish.habitat || 'Océan'}</Text>
          </View>
        </View>

        {/* Description / Bio */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>CARACTÉRISTIQUES</Text>
          <Text style={styles.descriptionText}>
            {fish.description || "Cette espèce fait partie de la classe des actinoptérygiens. Les détails spécifiques sur son comportement et sa biologie sont répertoriés dans les archives de la faune aquatique."}
          </Text>
        </View>
      </ScrollView>

      {/* Barre de pied de page décorative */}
      <View style={styles.footerBar} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  backBtn: { 
    position: 'absolute', top: 50, left: 20, zIndex: 10, 
    backgroundColor: '#FEB204', padding: 8, borderRadius: 2 
  },
  mainImage: { width: width, height: 400 },
  headerInfo: { padding: 25, marginTop: -30, backgroundColor: '#000', borderTopLeftRadius: 30 },
  natGeoTag: { width: 40, height: 6, backgroundColor: '#FEB204', marginBottom: 15 },
  scientificName: { color: '#FEB204', fontSize: 13, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' },
  mainTitle: { color: '#FFF', fontSize: 36, fontWeight: '900', marginTop: 5, textTransform: 'uppercase' },
  detailsGrid: { 
    flexDirection: 'row', paddingHorizontal: 25, borderTopWidth: 1, borderTopColor: '#222', 
    borderBottomWidth: 1, borderBottomColor: '#222', paddingVertical: 20 
  },
  detailItem: { flex: 1 },
  detailLabel: { color: '#666', fontSize: 10, fontWeight: 'bold', marginBottom: 5 },
  detailValue: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  descriptionSection: { padding: 25 },
  sectionTitle: { color: '#FEB204', fontSize: 14, fontWeight: '800', marginBottom: 15 },
  descriptionText: { color: '#CCC', fontSize: 16, lineHeight: 26 },
  footerBar: { height: 10, backgroundColor: '#FEB204', width: '100%' }
});