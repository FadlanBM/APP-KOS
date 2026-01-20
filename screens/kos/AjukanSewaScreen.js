import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useAuthStore } from "../../store/authStore";
import { createHttpHelperFunctions } from "../../store/httpHelperFunctions";

export default function AjukanSewaScreen({ route, navigation }) {
  const { kos } = route.params;
  const { token } = useAuthStore();
  const { POST } = createHttpHelperFunctions();

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(
    new Date(new Date().setMonth(new Date().getMonth() + 3)),
  );
  const [showPicker, setShowPicker] = useState(null); // 'start' or 'end'
  const [isLoading, setIsLoading] = useState(false);

  const onDateChange = (event, selectedDate) => {
    setShowPicker(null);
    if (selectedDate) {
      if (showPicker === "start") {
        setStartDate(selectedDate);
        // Otomatis set end date minimal 1 bulan dari start date jika end date jadi lebih kecil
        if (selectedDate >= endDate) {
          const nextDate = new Date(selectedDate);
          nextDate.setMonth(nextDate.getMonth() + 1);
          setEndDate(nextDate);
        }
      } else {
        setEndDate(selectedDate);
      }
    }
  };

  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  const calculateDuration = () => {
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const months = Math.ceil(diffDays / 30);
    return months;
  };

  const duration = calculateDuration();
  const totalPrice = duration * (kos.monthly_price || 0);

  const handleAjukanSewa = async () => {
    try {
      setIsLoading(true);
      const payload = {
        kos_id: kos.id,
        start_date: formatDate(startDate),
        end_date: formatDate(endDate),
      };

      const response = await POST({
        url: "/sewa",
        body: payload,
        token,
      });

      const tagihanId = response?.data?.data?.tagihan?.id;

      if (!tagihanId) {
        throw new Error("Tagihan ID tidak ditemukan dari respons sewa");
      }

      const transactionPayload = {
        tagihan_id: tagihanId,
        payment_method: "midtrans",
        notes: "Bayar kos bulan Februari",
      };

      const transactionResponse = await POST({
        url: "/transactions",
        body: transactionPayload,
        token,
        showToast: false,
      });

      const transactionData = transactionResponse?.data?.data;

      if (transactionData) {
        navigation.navigate("TransactionDetail", {
          transaction: transactionData,
        });
      }
    } catch (error) {
      console.error("Error ajukan sewa:", error);
    } finally {
      setIsLoading(false);
    }
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
        <Text style={styles.headerTitle}>Ajukan Sewa</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.kosInfo}>
          <Text style={styles.kosName}>{kos.name}</Text>
          <Text style={styles.kosAddress}>{kos.address}</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Tanggal Mulai Sewa</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowPicker("start")}
          >
            <Ionicons name="calendar-outline" size={20} color="#666" />
            <Text style={styles.dateText}>{formatDate(startDate)}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Tanggal Selesai Sewa</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowPicker("end")}
          >
            <Ionicons name="calendar-outline" size={20} color="#666" />
            <Text style={styles.dateText}>{formatDate(endDate)}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Ringkasan Sewa</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Durasi</Text>
            <Text style={styles.summaryValue}>{duration} Bulan</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Harga per Bulan</Text>
            <Text style={styles.summaryValue}>
              {formatPrice(kos.monthly_price)}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Pembayaran</Text>
            <Text style={styles.totalValue}>{formatPrice(totalPrice)}</Text>
          </View>
        </View>

        {showPicker && (
          <DateTimePicker
            value={showPicker === "start" ? startDate : endDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onDateChange}
            minimumDate={showPicker === "start" ? new Date() : startDate}
          />
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            isLoading && styles.submitButtonDisabled,
          ]}
          onPress={handleAjukanSewa}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Konfirmasi Sewa</Text>
          )}
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
  kosInfo: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
  },
  kosName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  kosAddress: {
    fontSize: 14,
    color: "#666",
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
  },
  dateText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
  },
  summaryContainer: {
    marginTop: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  totalRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0A8D48",
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  submitButton: {
    backgroundColor: "#0A8D48",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#A5D6A7",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
