import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const formatPrice = (price) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price || 0);
};

const formatDateTime = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function TransactionDetailScreen({ route, navigation }) {
  const { transaction } = route.params;

  const handlePay = () => {
    const redirectUrl = transaction?.midtrans?.redirect_url;
    if (!redirectUrl) return;

    navigation.navigate("Payment", {
      url: redirectUrl.trim().replace(/`/g, ""),
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Transaksi</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>Nomor Invoice</Text>
          <Text style={styles.value}>{transaction.invoice_number}</Text>

          <View style={styles.separator} />

          <Text style={styles.label}>Tanggal Transaksi</Text>
          <Text style={styles.value}>
            {formatDateTime(transaction.transaction_date)}
          </Text>

          <View style={styles.separator} />

          <Text style={styles.label}>Jumlah</Text>
          <Text style={styles.amount}>{formatPrice(transaction.amount)}</Text>

          <View style={styles.separator} />

          <Text style={styles.label}>Status Pembayaran</Text>
          <Text style={styles.value}>{transaction.payment_status}</Text>

          <View style={styles.separator} />

          <Text style={styles.label}>Metode Pembayaran</Text>
          <Text style={styles.value}>{transaction.payment_method}</Text>

          <View style={styles.separator} />

          <Text style={styles.label}>Status Midtrans</Text>
          <Text style={styles.value}>{transaction.mitrans_status}</Text>

          <View style={styles.separator} />

          <Text style={styles.label}>Catatan</Text>
          <Text style={styles.value}>{transaction.notes}</Text>
        </View>

        {transaction?.midtrans?.redirect_url && (
          <TouchableOpacity style={styles.payButton} onPress={handlePay}>
            <Text style={styles.payButtonText}>Bayar</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
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
  content: {
    padding: 20,
  },
  card: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    backgroundColor: "#F9FAFB",
  },
  label: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 4,
  },
  value: {
    fontSize: 15,
    color: "#111827",
    marginBottom: 8,
  },
  amount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0A8D48",
    marginBottom: 8,
  },
  separator: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 8,
  },
  payButton: {
    marginTop: 24,
    backgroundColor: "#0A8D48",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  payButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
