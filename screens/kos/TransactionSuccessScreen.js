import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { PATCH } from "../../store/httpHelperFunctions";
import { useAuthStore } from "../../store/authStore";

export default function TransactionSuccessScreen({ route, navigation }) {
  // Handle both nested data (from PaymentScreen) and direct params (from Deep Link)
  const params = route.params || {};
  const data = params.data || params;

  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const updateTransactionStatus = async () => {
      try {
        setLoading(true);
        const payload = {
          order_id: data?.order_id,
          status: data?.status || "success",
          status_code: data?.status_code || "200",
          transaction_status: data?.transaction_status || "settlement",
        };

        const response = await PATCH({
          url: "/transactions",
          body: payload,
          token,
          showToast: false,
        });

        console.log("Transaction update response:", response);
      } catch (err) {
        console.error("Error updating transaction:", err);
        setError("Gagal memperbarui status transaksi");
      } finally {
        setLoading(false);
      }
    };

    if (data) {
      updateTransactionStatus();
    } else {
      setLoading(false);
    }
  }, [data, token]);

  const handleBackToHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "AppTabs", params: { screen: "Kos Saya" } }],
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Memproses Transaksi...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={100} color="#4CAF50" />
        </View>
        <Text style={styles.title}>Pembayaran Berhasil!</Text>
        <Text style={styles.message}>
          Terima kasih, pembayaran Anda telah kami terima.
        </Text>

        {data?.order_id && (
          <Text style={styles.orderId}>Order ID: {data.order_id}</Text>
        )}

        <TouchableOpacity style={styles.button} onPress={handleBackToHome}>
          <Text style={styles.buttonText}>Kembali ke Menu Transaksi</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  orderId: {
    fontSize: 14,
    color: "#999",
    marginBottom: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
