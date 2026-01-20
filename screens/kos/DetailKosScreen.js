import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Text, Divider, Button, useTheme } from "react-native-paper";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useAuthStore } from "../../store/authStore";
import { createHttpHelperFunctions } from "../../store/httpHelperFunctions";
import { SafeAreaView } from "react-native-safe-area-context";
import ImageViewer from "react-native-image-zoom-viewer";
import { StatusBar } from "expo-status-bar";

const { width } = Dimensions.get("window");
const { GET } = createHttpHelperFunctions();

const DetailKosScreen = ({ route, navigation }) => {
  const { item: initialItem } = route.params;
  const theme = useTheme();
  const [item, setItem] = useState(initialItem);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiking, setIsLiking] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const token = useAuthStore((state) => state.token);

  const { GET, POST } = createHttpHelperFunctions();

  const fetchDetailKos = async () => {
    try {
      setIsLoading(true);
      const { data: responseData } = await GET({
        url: `/kos/${initialItem.id}`,
        token,
        showToast: false,
      });

      if (responseData?.data) {
        setItem(responseData.data);
      }
    } catch (error) {
      console.error("Fetch detail kos error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkLikeStatus = async () => {
    try {
      const { data: responseData } = await GET({
        url: "/kos/like",
        params: {
          kos_id: initialItem.id,
        },
        token,
        showToast: false,
        handleErrorStatus: false,
      });

      if (responseData?.success || responseData?.data) {
        setIsLiked(!!responseData?.liked || !!responseData?.data);
      }
    } catch (error) {
      console.error("Check like status error:", error);
    }
  };

  const handleLike = async () => {
    if (isLiking) return;

    try {
      setIsLiking(true);
      const newLikedStatus = !isLiked;
      setIsLiked(newLikedStatus);

      await POST({
        url: "/kos/like",
        params: {
          kos_id: item.id,
        },
        token,
        showToast: false,
      });
    } catch (error) {
      setIsLiked(!isLiked);
      console.error("Like error:", error);
    } finally {
      setIsLiking(false);
    }
  };

  useEffect(() => {
    fetchDetailKos();
    if (token) {
      checkLikeStatus();
    }
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  const imagesForViewer =
    item?.gambar_kos?.map((img) => ({
      url: img.url_gambar,
    })) || [];

  if (isLoading && !item) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0A8D48" />
        <Text style={styles.loadingText}>Memuat detail kos...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Header Carousel */}
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const slide = Math.ceil(
                e.nativeEvent.contentOffset.x /
                  e.nativeEvent.layoutMeasurement.width,
              );
              if (slide !== activeImageIndex) {
                setActiveImageIndex(slide);
              }
            }}
            scrollEventThrottle={16}
          >
            {item?.gambar_kos && item.gambar_kos.length > 0 ? (
              item.gambar_kos.map((img, index) => (
                <TouchableOpacity
                  key={img.id || index}
                  activeOpacity={0.9}
                  onPress={() => {
                    setActiveImageIndex(index);
                    setIsModalVisible(true);
                  }}
                >
                  <Image
                    source={{ uri: img.url_gambar }}
                    style={styles.image}
                  />
                </TouchableOpacity>
              ))
            ) : (
              <Image
                source={{ uri: "https://via.placeholder.com/600x400" }}
                style={styles.image}
              />
            )}
          </ScrollView>

          {/* Pagination Indicator */}
          {item?.gambar_kos?.length > 1 && (
            <View style={styles.paginationContainer}>
              <View style={styles.imageCounter}>
                <Text style={styles.imageCounterText}>
                  {activeImageIndex + 1}/{item.gambar_kos.length}
                </Text>
              </View>
              <View style={styles.paginationDots}>
                {item.gambar_kos.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      activeImageIndex === index && styles.activeDot,
                    ]}
                  />
                ))}
              </View>
            </View>
          )}

          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.circleButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <View style={styles.rightHeaderButtons}>
              <TouchableOpacity style={styles.circleButton}>
                <Ionicons name="share-social-outline" size={24} color="#000" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.circleButton}
                onPress={handleLike}
                disabled={isLiking}
              >
                <Ionicons
                  name={isLiked ? "heart" : "heart-outline"}
                  size={24}
                  color={isLiked ? "#e53935" : "#000"}
                />
              </TouchableOpacity>
            </View>
          </View>
          {isLoading && (
            <View style={styles.imageLoadingOverlay}>
              <ActivityIndicator size="small" color="#fff" />
            </View>
          )}
        </View>

        <View style={styles.content}>
          {/* Title and Tags */}
          <View style={styles.tagRow}>
            <View
              style={[
                styles.genderTag,
                {
                  backgroundColor:
                    item?.gender_type === "male" ? "#E3F2FD" : "#FCE4EC",
                },
              ]}
            >
              <Text
                style={[
                  styles.genderText,
                  {
                    color: item?.gender_type === "male" ? "#1976D2" : "#D81B60",
                  },
                ]}
              >
                {item?.gender_type === "male" ? "Putra" : "Putri"}
              </Text>
            </View>
            <Text style={styles.availableText}>
              Sisa {item?.available_rooms} Kamar
            </Text>
          </View>

          <Text style={styles.name}>{item?.name}</Text>

          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.locationText}>{item?.location}</Text>
          </View>

          <Divider style={styles.divider} />

          {/* Key Specs Section */}
          <View style={styles.specGrid}>
            <View style={styles.specItem}>
              <MaterialIcons name="straighten" size={20} color="#666" />
              <Text style={styles.specLabel}>Luas Kamar</Text>
              <Text style={styles.specValue}>{item?.room_size} m²</Text>
            </View>
            <View style={styles.specItem}>
              <MaterialIcons name="flash-on" size={20} color="#666" />
              <Text style={styles.specLabel}>Listrik</Text>
              <Text style={styles.specValue}>{item?.electricity_type}</Text>
            </View>
            <View style={styles.specItem}>
              <MaterialIcons name="timer" size={20} color="#666" />
              <Text style={styles.specLabel}>Min. Sewa</Text>
              <Text style={styles.specValue}>
                {item?.min_stay_duration} bulan
              </Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Deskripsi Kos</Text>
            <Text style={styles.descriptionText}>{item?.description}</Text>
          </View>

          {/* Facilities */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fasilitas Kos</Text>
            <View style={styles.facilityList}>
              {item?.fasilitas_kos?.split("|").map((fac, index) => (
                <View key={index} style={styles.facilityItem}>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={18}
                    color="#0A8D48"
                  />
                  <Text style={styles.facilityText}>{fac}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Room Facilities */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fasilitas Kamar</Text>
            <Text style={styles.descriptionText}>{item?.fasilitas_kamar}</Text>
          </View>

          {/* Rules */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Peraturan Kos</Text>
            <Text style={styles.descriptionText}>{item?.peraturan_kos}</Text>
          </View>

          {/* Location Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lokasi</Text>
            <Text style={styles.descriptionText}>{item?.address}</Text>
            <View style={styles.campusInfo}>
              <Ionicons name="school-outline" size={18} color="#666" />
              <Text style={styles.campusText}>
                {item?.distance_to_campus}m ke {item?.nearest_campus}
              </Text>
            </View>
          </View>

          {/* Additional Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informasi Tambahan</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tipe Air</Text>
              <Text style={styles.infoValue}>{item?.water_type}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tipe Sertifikat</Text>
              <Text style={styles.infoValue}>{item?.certificate_type}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tahun Bangun</Text>
              <Text style={styles.infoValue}>{item?.year_built}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Jumlah Lantai</Text>
              <Text style={styles.infoValue}>{item?.building_floors}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer Price and Action */}
      <View style={styles.footer}>
        <View style={styles.footerPriceContainer}>
          <Text style={styles.footerPriceLabel}>Harga Sewa</Text>
          <Text style={styles.footerPrice}>
            {formatPrice(item?.monthly_price)}
          </Text>
          <Text style={styles.footerUnit}>/ bulan</Text>
        </View>
        <Button
          mode="contained"
          onPress={() => navigation.navigate("AjukanSewa", { kos: item })}
          style={styles.bookButton}
          contentStyle={{ height: 48 }}
          labelStyle={{ fontWeight: "bold" }}
          disabled={isLoading}
        >
          {isLoading ? "Memuat..." : "Ajukan Sewa"}
        </Button>
      </View>

      {/* Image Zoom Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <ImageViewer
          imageUrls={imagesForViewer}
          index={activeImageIndex}
          onSwipeDown={() => setIsModalVisible(false)}
          enableSwipeDown={true}
          renderHeader={() => (
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Ionicons name="close" size={30} color="#fff" />
            </TouchableOpacity>
          )}
        />
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
  },
  imageContainer: {
    height: 300,
    width: width,
  },
  image: {
    width: width,
    height: "100%",
    resizeMode: "cover",
  },
  paginationContainer: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  imageCounter: {
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  imageCounterText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  paginationDots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.4)",
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: "#fff",
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  closeModalButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 999,
    padding: 10,
  },
  imageLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerButtons: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rightHeaderButtons: {
    flexDirection: "row",
  },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  content: {
    padding: 20,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  genderTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 10,
  },
  genderText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  availableText: {
    fontSize: 12,
    color: "#D81B60",
    fontWeight: "600",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  locationText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  divider: {
    marginVertical: 16,
  },
  specGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  specItem: {
    alignItems: "center",
    flex: 1,
  },
  specLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  specValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111",
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#444",
  },
  facilityList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  facilityItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "50%",
    marginBottom: 8,
  },
  facilityText: {
    fontSize: 14,
    color: "#444",
    marginLeft: 8,
  },
  campusInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  campusText: {
    fontSize: 14,
    color: "#444",
    marginLeft: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
  },
  infoValue: {
    fontSize: 14,
    color: "#111",
    fontWeight: "500",
  },
  footer: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24, // Memberikan padding bawah agar tidak tertutup navigation bar/home indicator
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  footerPriceContainer: {
    flex: 1,
  },
  footerPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0A8D48",
  },
  footerPriceLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  footerUnit: {
    fontSize: 12,
    color: "#666",
  },
  bookButton: {
    flex: 1,
    backgroundColor: "#0A8D48",
    borderRadius: 8,
  },
});

export default DetailKosScreen;
