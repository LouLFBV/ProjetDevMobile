import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView } from 'react-native';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* En-tête avec une image */}
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://via.placeholder.com/150' }}
          style={styles.logo}
        />
        <Text style={styles.title}>Bienvenue dans mon App !</Text>
      </View>

      {/* Contenu principal */}
      <View style={styles.content}>
        <Text style={styles.subtitle}>Compteur interactif :</Text>
        <Text style={styles.counter}>{count}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setCount(count + 1)}
        >
          <Text style={styles.buttonText}>Appuie-moi !</Text>
        </TouchableOpacity>
      </View>

      {/* Pied de page */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2026 Mon Application</Text>
      </View>

      <StatusBar style="auto" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    alignItems: 'center',
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subtitle: {
    fontSize: 18,
    color: '#555',
    marginBottom: 10,
  },
  counter: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2196F3',
    marginVertical: 20,
  },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 20,
  },
  footerText: {
    color: '#777',
    fontSize: 12,
  },
});