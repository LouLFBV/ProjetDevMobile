import { HapticTab } from "@/components/haptic-tab";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { View } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#121212",
          borderTopWidth: 0,
          height: 80,
          paddingTop: 10,
        },
        tabBarActiveTintColor: "#C1F45A",
        tabBarInactiveTintColor: "#555",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="home-sharp" size={26} color={color} />
              {focused && <View style={styles.indicator} />}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              {/* On utilise l'icône compass qui prend la couleur active/inactive automatiquement */}
              <Ionicons name="compass-sharp" size={26} color={color} />

              {/* Le point ne s'affiche que si l'onglet est actif */}
              {focused && <View style={styles.indicator} />}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

// Pour éviter de répéter le style du point, on peut utiliser un petit objet styles
const styles = {
  indicator: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#C1F45A",
    marginTop: 6,
  },
};
