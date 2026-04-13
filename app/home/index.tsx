import { useQuery } from "@tanstack/react-query";
import { Text, View, FlatList, ActivityIndicator, RefreshControl } from "react-native";

const loadPosts = async () => {
  console.log('test')
  // simulate delay 5s
  await new Promise((resolve) => setTimeout(resolve, 5000));
  return fetch("https://jsonplaceholder.typicode.com/posts")
    .then((res) => res.json())
};

export default function Home() {
  const { isLoading, isError, data, refetch, isRefetching } = useQuery({
    queryKey: ['items'],
    queryFn: loadPosts,
    staleTime: 60 * 1000 * 5, // 5mn
  })

  if (isLoading) {
    return (
      <View className="flex-1 bg-white justify-center align-center">
        <ActivityIndicator />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 bg-white justify-center align-center">
        <Text className="text-center">Une erreur est survenue</Text>
      </View>
    );
  }

  return (
    <FlatList
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
      data={data}
      contentContainerClassName="gap-4 p-4"
      renderItem={({ item }) => (
        <View className="bg-gray-300 px-4 py-2">
          <Text className="text-xl">{item.title}</Text>
          <Text className="text-sm">{item.body}</Text>
        </View>
      )}
    />
  );
}
