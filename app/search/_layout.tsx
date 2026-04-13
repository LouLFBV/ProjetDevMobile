import { Stack } from "expo-router";

export default function HomeStack() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{
                title: 'Search'
            }} />
            <Stack.Screen name="details" options={{
                title: 'Details'
            }} />
        </Stack>
    )
}