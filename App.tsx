import "./global.css"
import { StatusBar } from 'expo-status-bar';
import { Text, View, Image } from 'react-native';
export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-red-500 text-2xl font-bold text-center mb-4 font-Arial">
        Open up App.tsx!
      </Text>
      <Image source={{
        uri: 'https://picsum.photos/200/300'
      }} className="w-20 h-20" />
      <StatusBar style="auto" />
    </View>
  );
}
