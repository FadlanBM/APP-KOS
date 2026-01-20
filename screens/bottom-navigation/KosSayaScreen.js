import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Divider, Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons"; // Untuk icon kalender dan download

export default function KosSayaScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kos Favorit Saya</Text>
      </View>
      <View style={styles.nextPaymentBox}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View>
            <Text style={styles.label}>Next Payment</Text>
            <Text style={styles.amount}>$49.99</Text>
            <Text style={styles.dueDate}>Due - BILL-2024-12</Text>
          </View>
          <View style={styles.basicBadge}>
            <Text style={styles.basicText}>Basic</Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", marginTop: 15 }}>
          <TouchableOpacity style={styles.payNowButton}>
            <Text style={styles.payNowText}>Pay Now</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cameraButton}>
            <Ionicons name="camera-outline" size={20} color="black" />
          </TouchableOpacity>
        </View>
      </View>
      <Divider style={{ marginTop: 20, marginHorizontal: 10 }} />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Payment History */}
        <Text style={[styles.headerText, { marginTop: 20, marginBottom: 10 }]}>
          Payment History
        </Text>

        {/* Search Bar */}
        <TextInput
          style={styles.searchInput}
          placeholder="Search bills..."
          placeholderTextColor="#999"
        />

        {/* Payment Item */}
        <View style={styles.paymentItem}>
          <View style={styles.paymentHeader}>
            <Ionicons name="calendar-outline" size={20} color="#666" />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.paymentMonth}>December 2024</Text>
              <Text style={styles.paymentBill}>BILL-2024-12</Text>
            </View>
            <View style={styles.paidBadge}>
              <Text style={styles.paidText}>Paid</Text>
            </View>
          </View>
          <View style={styles.paymentDetails}>
            <View>
              <Text style={styles.label}>Amount</Text>
              <Text style={styles.amount}>$49.99</Text>
            </View>
            <View>
              <Text style={styles.label}>Paid on</Text>
              <Text style={styles.paidDate}>Dec 29, 2025</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.viewInvoiceButton}>
            <Text style={styles.viewInvoiceText}>View Invoice</Text>
            <Ionicons
              name="download-outline"
              size={20}
              color="#000"
              style={{ marginLeft: 10 }}
            />
          </TouchableOpacity>
        </View>

        {/* Reuse Payment Item for November */}
        <View style={styles.paymentItem}>
          <View style={styles.paymentHeader}>
            <Ionicons name="calendar-outline" size={20} color="#666" />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.paymentMonth}>November 2024</Text>
              <Text style={styles.paymentBill}>BILL-2024-12</Text>
            </View>
            <View style={styles.paidBadge}>
              <Text style={styles.paidText}>Paid</Text>
            </View>
          </View>
          <View style={styles.paymentDetails}>
            <View>
              <Text style={styles.label}>Amount</Text>
              <Text style={styles.amount}>$49.99</Text>
            </View>
            <View>
              <Text style={styles.label}>Paid on</Text>
              <Text style={styles.paidDate}>Nov 25, 2025</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.viewInvoiceButton}>
            <Text style={styles.viewInvoiceText}>View Invoice</Text>
            <Ionicons
              name="download-outline"
              size={20}
              color="#000"
              style={{ marginLeft: 10 }}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  content: { flex: 1, paddingHorizontal: 10 },
  nextPaymentBox: {
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 12,
    color: "#666",
  },
  amount: {
    fontWeight: "bold",
    fontSize: 24,
    marginTop: 5,
  },
  dueDate: {
    fontSize: 12,
    color: "#999",
    marginTop: 5,
  },
  basicBadge: {
    backgroundColor: "rgba(173, 96, 231, 0.2)", // Ungu muda transparan
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 15,
    alignSelf: "flex-start",
  },
  basicText: {
    color: "#ad60e7",
    fontWeight: "600",
    fontSize: 12,
  },
  payNowButton: {
    flex: 1,
    backgroundColor: "#000",
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    marginRight: 10,
  },
  payNowText: {
    color: "#fff",
    fontWeight: "bold",
  },
  cameraButton: {
    width: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 14,
    height: 45,
    paddingHorizontal: 15,
    color: "#000",
  },
  paymentItem: {
    backgroundColor: "#f7f7f7",
    padding: 15,
    borderRadius: 14,
    marginTop: 15,
  },
  paymentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  paymentMonth: {
    fontWeight: "bold",
    fontSize: 14,
  },
  paymentBill: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  paidBadge: {
    marginLeft: "auto",
    backgroundColor: "rgba(56, 177, 71, 0.2)", // Hijau transparan
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  paidText: {
    color: "#38b147",
    fontWeight: "600",
    fontSize: 12,
  },
  paymentDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  paidDate: {
    fontWeight: "bold",
    fontSize: 14,
  },
  viewInvoiceButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eaeaea",
    borderRadius: 10,
    paddingVertical: 10,
    justifyContent: "center",
  },
  viewInvoiceText: {
    fontWeight: "600",
  },
});
