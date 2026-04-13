import "../global.css"
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import {
  QueryClient,
} from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import {
  createAsyncStoragePersister
} from '@tanstack/query-async-storage-persister';

import { createAsyncStorage } from "@react-native-async-storage/async-storage";
const storage = createAsyncStorage("appDB");

const queryClient = new QueryClient()
const asyncStoragePersister = createAsyncStoragePersister({
  storage,
})

export default function TabsLayout() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister }}
    >
      <Tabs screenOptions={{ headerShown: false }}>
        <Tabs.Screen
          name="index"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <FontAwesome size={22} name="home" color={color} />,
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Search',
            tabBarIcon: ({ color }) => <FontAwesome size={22} name="search" color={color} />,
          }}
        />
      </Tabs>
    </PersistQueryClientProvider>
  )
}