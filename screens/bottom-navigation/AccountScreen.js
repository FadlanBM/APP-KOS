import { View, StyleSheet } from "react-native";
import { Text, Button, Avatar } from "react-native-paper";
import { useAuthStore } from "../../store/authStore";

export default function AccountScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <View style={styles.container}>
      <Avatar.Text
        size={80}
        label={user?.name ? user.name.substring(0, 2).toUpperCase() : "U"}
        style={styles.avatar}
      />

      <Text variant="headlineMedium" style={styles.name}>
        {user?.name || "User"}
      </Text>

      <Text variant="bodyLarge" style={styles.email}>
        {user?.email || "email@example.com"}
      </Text>

      <View style={styles.infoContainer}>
        <Text variant="bodyMedium">Atur profil dan pengaturan akunmu.</Text>
      </View>

      <Button
        mode="outlined"
        onPress={logout}
        style={styles.logoutButton}
        textColor="red"
      >
        Keluar
      </Button>
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
  avatar: {
    marginBottom: 16,
    backgroundColor: "#444",
  },
  name: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  email: {
    color: "#666",
    marginBottom: 24,
  },
  infoContainer: {
    marginBottom: 40,
  },
  logoutButton: {
    width: "100%",
    borderColor: "red",
  },
});
