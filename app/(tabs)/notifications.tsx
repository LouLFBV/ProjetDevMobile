// app/(tabs)/notifications.tsx
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
 
export default function NotificationsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.natGeoMark} />
        <View>
          <Text style={styles.brand}>NATIONAL</Text>
          <Text style={styles.brand}>GEOGRAPHIC</Text>
        </View>
      </View>
      <View style={styles.center}>
        <Ionicons name="notifications-outline" size={48} color="#222" />
        <Text style={styles.title}>ALERTS</Text>
        <Text style={styles.sub}>No notifications yet</Text>
      </View>
    </SafeAreaView>
  );
}
 
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080808' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 18,
    marginBottom: 16,
  },
  natGeoMark: { width: 10, height: 40, backgroundColor: '#FEB204' },
  brand: { color: '#FFF', fontSize: 14, fontWeight: '900', letterSpacing: 2, lineHeight: 17 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  title: { color: '#2A2A2A', fontSize: 14, fontWeight: '900', letterSpacing: 3 },
  sub: { color: '#1E1E1E', fontSize: 13 },
});