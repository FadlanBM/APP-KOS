import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { WebView } from "react-native-webview";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";

export default function PaymentScreen({ route, navigation }) {
  const { url, onFinish } = route.params;

  const goToTransactionMenu = () => {
    if (onFinish) {
      onFinish();
    }

    navigation.reset({
      index: 0,
      routes: [{ name: "AppTabs", params: { screen: "Kos Saya" } }],
    });
  };

  const handleNavigationStateChange = (navState) => {
    console.log(navState);

    // Cek jika URL mengandung indikator selesai/sukses
    // if (navState.url.includes("finish") || navState.url.includes("success")) {
    //   try {
    //     const { queryParams } = Linking.parse(navState.url);
    //     console.log("Payment Success URL:", navState.url);
    //     console.log("Params:", queryParams);

    //     // Navigasi ke halaman sukses dengan membawa data parameter
    //     navigation.replace("TransactionSuccess", {
    //       data: queryParams,
    //     });
    //   } catch (error) {
    //     console.error("Error handling payment success:", error);
    //     goToTransactionMenu();
    //   }
    // }
    // // Cek jika URL mengandung indikator error atau close
    // else if (navState.url.includes("error") || navState.url.includes("close")) {
    //   goToTransactionMenu();
    // }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={goToTransactionMenu}
          style={styles.backButton}
        >
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pembayaran</Text>
        <View style={{ width: 40 }} />
      </View>
      <WebView
        source={{ uri: url }}
        onNavigationStateChange={handleNavigationStateChange}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  backButton: {
    padding: 8,
  },
});
