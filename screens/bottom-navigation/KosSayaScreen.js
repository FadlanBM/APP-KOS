import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";

export default function KosSayaScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Kos Saya</Text>
      <Text>Kelola kos yang kamu miliki.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
});
