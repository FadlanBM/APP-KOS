import { StatusBar } from "expo-status-bar";
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
} from "react-native";

const { width } = Dimensions.get("window");

const slides = [
  {
    id: "1",
    title: "Welcome",
    description:
      "Temukan kos impianmu dengan mudah dan cepat. Tersedia berbagai pilihan kos dengan fasilitas lengkap.",
    image: require("../../assets/image/welcome.png"),
  },
  {
    id: "2",
    title: "Lokasi Strategis",
    description:
      "Cari kos di dekat kampus atau tempat kerjamu. Hemat waktu perjalanan dan biaya transportasi.",
    image: require("../../assets/image/welcome2.png"),
  },
  {
    id: "3",
    title: "Harga Terjangkau",
    description:
      "Bandingkan harga dan fasilitas kos untuk mendapatkan penawaran terbaik sesuai budgetmu.",
    image: require("../../assets/image/wel3.png"),
  },
];

export default function WelcomeScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  const renderItem = ({ item }) => (
    <View style={styles.slide}>
      <View style={styles.imageContainer}>
        <Image source={item.image} style={styles.image} resizeMode="contain" />
      </View>

      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />
      <View style={styles.content}>
        <FlatList
          ref={flatListRef}
          data={slides}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewConfigRef.current}
          style={styles.flatList}
        />

        {/* Indikator halaman (paging dots) */}
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index ? styles.activeDot : null,
              ]}
            />
          ))}
        </View>
      </View>

      {/* Bagian bawah dengan tombol */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate("login")}
        >
          <Text style={styles.loginButtonText}>Log In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.ownerButton}
          onPress={() => navigation.navigate("OwnerWebView")}
        >
          <Text style={styles.ownerButtonText}>Login sebagai Pemilik</Text>
        </TouchableOpacity>

        <Text style={styles.signUpText}>
          Don't have an account?{" "}
          <TouchableOpacity onPress={() => navigation.navigate("register")}>
            <Text style={styles.signUpLink}>Sign Up here</Text>
          </TouchableOpacity>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  flatList: {
    flexGrow: 0,
  },
  slide: {
    width: width,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  imageContainer: {
    width: width * 0.7,
    height: width * 0.7 * 1.4, // sesuai proporsi gambar
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#000",
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  pagination: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: "center",
    width: "100%",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#000",
    width: 20, // Opsional: membuat dot aktif lebih panjang
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  loginButton: {
    backgroundColor: "#000",
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 15,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  ownerButton: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#000",
  },
  ownerButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  signUpText: {
    textAlign: "center",
    color: "#777",
    fontSize: 14,
  },
  signUpLink: {
    color: "#000",
    fontWeight: "bold",
  },
});
