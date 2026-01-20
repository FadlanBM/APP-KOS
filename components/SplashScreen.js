import React from "react";
import { View, StyleSheet, Image, ActivityIndicator } from "react-native";
import { Text, useTheme } from "react-native-paper";

const SplashScreen = () => {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/adaptive-icon.png")} // Menggunakan icon yang ada
          style={styles.logo}
          resizeMode="contain"
        />
        <Text variant="headlineMedium" style={styles.title}>
          APP KOS
        </Text>
      </View>
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="white" />
        <Text variant="bodyMedium" style={styles.loadingText}>
          Menyiapkan aplikasi...
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    color: "white",
    fontWeight: "bold",
    letterSpacing: 2,
  },
  loaderContainer: {
    position: "absolute",
    bottom: 50,
    alignItems: "center",
  },
  loadingText: {
    color: "white",
    marginTop: 10,
    opacity: 0.8,
  },
});

export default SplashScreen;
