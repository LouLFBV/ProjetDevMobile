import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function Search() {
    const router = useRouter();
    return (
        <View className="flex-1 items-center justify-center bg-gray-600">
            <TouchableOpacity onPress={() => router.push('/search/details')} className="bg-white px-4 py-2 rounded-full">
                <Text className="text-black">
                    Naviguer
                </Text>
            </TouchableOpacity>
        </View>
    )
}