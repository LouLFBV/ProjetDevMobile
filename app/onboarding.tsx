import { View , Text, Button, Image} from "react-native";

export default function onboarding() {
  return (
    <View className="" style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Image
          source={require("../assets/onboarding-image.png")} style={styles.image}/>
      <Text>Welcome to Our App!</Text>
      <Text>Let's get you set up with a quick onboarding process.</Text>
      <Button title="Get Started" onPress={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
});
