// import { View, StyleSheet } from 'react-native';
// import { Text } from 'react-native-paper';
// import { StatusBar } from 'expo-status-bar';

// export default function CariScreen() {
//   return (
//     <View style={styles.container}>
//       <Text variant="headlineMedium">Cari Kos</Text>
//       <Text>Cari kos sesuai kebutuhanmu.</Text>
//       <StatusBar style="auto" />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 20,
//   },
// });

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
  Dimensions,
} from "react-native";
import {
  Ionicons,
  MaterialIcons,
  FontAwesome5,
  Entypo,
} from "@expo/vector-icons";
import { useAuthStore } from "../../store/authStore";
import { createHttpHelperFunctions } from "../../store/httpHelperFunctions";
import { useDebounce } from "use-debounce";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";

const { width } = Dimensions.get("window");

const { GET, POST } = createHttpHelperFunctions();

const KosCard = ({ item }) => {
  const navigation = useNavigation();
  const token = useAuthStore((state) => state.token);
  const [liked, setLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const checkLikeStatus = async () => {
        try {
          const { data: responseData } = await GET({
            url: "/kos/like",
            params: {
              kos_id: item.id,
            },
            token,
            showToast: false,
            handleErrorStatus: false,
          });

          if (responseData?.success || responseData?.data) {
            setLiked(!!responseData?.liked || !!responseData?.data);
          }
        } catch (error) {
          console.error("Check like status error:", error);
        }
      };

      if (item?.id && token) {
        checkLikeStatus();
      }
    }, [item?.id, token])
  );

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleLike = async () => {
    if (isLiking) return;

    try {
      setIsLiking(true);
      // Optimistic update
      const newLikedStatus = !liked;
      setLiked(newLikedStatus);

      await POST({
        url: "/kos/like",
        params: {
          kos_id: item.id,
        },
        token,
        showToast: false,
      });
    } catch (error) {
      // Revert if failed
      setLiked(!liked);
      console.error("Like error:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const mainImage =
    item.gambar_kos?.[0]?.url_gambar || "https://via.placeholder.com/300x200";

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("DetailKos", { item })}
    >
      <View style={styles.cardImageWrapper}>
        <Image source={{ uri: mainImage }} style={styles.cardImage} />
        <TouchableOpacity
          style={styles.likeButton}
          onPress={handleLike}
          activeOpacity={0.8}
          disabled={isLiking}
        >
          <FontAwesome5
            name="heart"
            size={14}
            color={liked ? "#e53935" : "#ffffff"}
            solid={liked}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardTagRow}>
          <View
            style={[
              styles.genderTag,
              {
                backgroundColor:
                  item.gender_type === "male" ? "#E3F2FD" : "#FCE4EC",
              },
            ]}
          >
            <Text
              style={[
                styles.genderText,
                { color: item.gender_type === "male" ? "#1976D2" : "#D81B60" },
              ]}
            >
              {item.gender_type === "male" ? "Putra" : "Putri"}
            </Text>
          </View>
          <Text style={styles.availableText}>
            Sisa {item.available_rooms} Kamar
          </Text>
        </View>

        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.cardLocation} numberOfLines={1}>
          {item.location}
        </Text>

        <View style={styles.ratingRow}>
          <Ionicons name="star" size={14} color="#FFB300" />
          <Text style={styles.ratingText}>
            {item.rating_average} ({item.total_reviews})
          </Text>
          <Text style={styles.dotSeparator}>•</Text>
          <Text style={styles.campusText} numberOfLines={1}>
            {item.nearest_campus}
          </Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.priceText}>
            {formatPrice(item.monthly_price)}
          </Text>
          <Text style={styles.priceUnit}> / bulan</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const KosCardSkeleton = () => {
  return (
    <View style={styles.card}>
      <View style={styles.cardImageWrapper}>
        <View style={styles.skeletonImage} />
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardTagRow}>
          <View style={[styles.genderTag, styles.skeletonLine]} />
          <View
            style={[
              styles.skeletonLine,
              { width: 80, height: 10, marginLeft: 8 },
            ]}
          />
        </View>
        <View
          style={[
            styles.skeletonLine,
            { width: "70%", height: 16, marginBottom: 6 },
          ]}
        />
        <View
          style={[
            styles.skeletonLine,
            { width: "50%", height: 14, marginBottom: 10 },
          ]}
        />
        <View
          style={[
            styles.skeletonLine,
            { width: "60%", height: 12, marginBottom: 12 },
          ]}
        />
        <View style={styles.priceRow}>
          <View
            style={[
              styles.skeletonLine,
              { width: 90, height: 16, marginBottom: 0 },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

export default function CariScreen() {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500); // Tunggu 500ms setelah user berhenti mengetik
  const [kosList, setKosList] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const token = useAuthStore((state) => state.token);

  const fetchKos = async (
    pageToLoad = 1,
    isRefresh = false,
    searchKeyword = ""
  ) => {
    if (isLoading) return;

    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const { data: responseData } = await GET({
        url: "/kos",
        params: {
          page: pageToLoad,
          limit: 10,
          search: searchKeyword, // Kirim parameter search ke API
        },
        token,
        showToast: false,
        handleErrorStatus: false,
      });

      const data = responseData?.data || [];
      const pagination = responseData?.pagination;

      setKosList((prev) =>
        pageToLoad === 1 || isRefresh ? data : [...prev, ...data]
      );
      setPage(pageToLoad);

      if (pagination) {
        const nextExists =
          pagination.next_page !== null && pageToLoad < pagination.total_pages;
        setHasNextPage(nextExists);
      } else {
        setHasNextPage(data.length > 0);
      }
    } catch (error) {
      console.error("Fetch kos error:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchKos(1, true, debouncedSearch);
  }, [debouncedSearch]); // Re-fetch saat debouncedSearch berubah

  const handleLoadMore = () => {
    if (!hasNextPage || isLoading) return;
    fetchKos(page + 1, false, debouncedSearch);
  };

  const handleRefresh = () => {
    fetchKos(1, true, debouncedSearch);
  };

  const headerComponent = useMemo(
    () => (
      <View>
        <Text style={styles.hashtag}>#EnaknyaNgekos</Text>
        <Text style={styles.subtitle}>Cari & Sewa Kos Mudah</Text>

        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={22}
            color="#999"
            style={{ marginHorizontal: 8 }}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Mau cari kos di mana?"
            placeholderTextColor="#999"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <View style={styles.listSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Rekomendasi Kos</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    ),
    [search] // Hanya re-render header jika nilai search berubah, tapi tidak me-remount komponennya
  );

  const renderFooter = () => {
    if (!isLoading || !hasNextPage) return null;
    return (
      <ActivityIndicator
        style={{ marginVertical: 16 }}
        size="small"
        color="#0A8D48"
      />
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Text
              style={{ fontWeight: "bold", fontSize: 20, color: "#0A8D48" }}
            >
              M
            </Text>
          </View>
          <Text style={styles.logoText}>KOS-APP</Text>
        </View>
        <TouchableOpacity style={styles.bellButton}>
          <Ionicons name="notifications-outline" size={28} color="#444" />
        </TouchableOpacity>
      </View>

      <FlatList
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 80 }}
        data={kosList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <KosCard item={item} />}
        ListHeaderComponent={headerComponent}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          isLoading ? (
            <>
              <KosCardSkeleton />
              <KosCardSkeleton />
              <KosCardSkeleton />
            </>
          ) : null
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoContainer: { flexDirection: "row", alignItems: "center" },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E7F6E7",
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0A8D48",
    marginLeft: 8,
  },
  bellButton: {},

  content: { flex: 1, paddingHorizontal: 16 },

  hashtag: { fontSize: 22, fontWeight: "bold", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#555", marginBottom: 16 },

  searchContainer: {
    flexDirection: "row",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 10,
    height: 50,
    alignItems: "center",
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#222",
  },

  // Card Styles
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#eee",
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImageWrapper: {
    position: "relative",
  },
  cardImage: {
    width: "100%",
    height: 180,
    resizeMode: "cover",
  },
  skeletonImage: {
    width: "100%",
    height: 180,
    backgroundColor: "#E5E7EB",
  },
  likeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: {
    padding: 12,
  },
  cardTagRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  genderTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  genderText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  availableText: {
    fontSize: 11,
    color: "#e53935",
    fontWeight: "600",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  cardLocation: {
    fontSize: 13,
    color: "#666",
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    marginLeft: 4,
  },
  dotSeparator: {
    marginHorizontal: 4,
    color: "#999",
  },
  campusText: {
    fontSize: 12,
    color: "#666",
    flex: 1,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  priceText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  priceUnit: {
    fontSize: 12,
    color: "#666",
  },
  skeletonLine: {
    height: 12,
    backgroundColor: "#E5E7EB",
    borderRadius: 6,
  },

  // Section Styles
  listSection: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  seeAllText: {
    fontSize: 14,
    color: "#0A8D48",
    fontWeight: "600",
  },

  altSearchText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
  },

  apartemenButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 50,
    marginBottom: 20,
  },
  apartemenIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#E7F6E7",
    justifyContent: "center",
    alignItems: "center",
  },
  apartemenText: {
    fontSize: 16,
    marginLeft: 12,
    color: "#333",
  },

  bannerScroll: {
    height: 150,
    marginBottom: 8,
  },
  banner: {
    width,
    borderRadius: 12,
    overflow: "hidden",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  bannerContent: {
    flexDirection: "row",
    backgroundColor: "#9E7DC1",
    borderRadius: 12,
    alignItems: "center",
    padding: 12,
  },
  bannerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
  },
  bannerSubtitle: {
    color: "#fff",
    fontSize: 12,
    maxWidth: "85%",
  },
  bannerImage: {
    height: 130,
    width: 120,
    marginLeft: "auto",
  },

  paginationDots: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ccc",
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: "#0A8D48",
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  notifyCard: {
    flexDirection: "row",
    backgroundColor: "#EBF6EB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  notifyTitle: {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 4,
    color: "#0A8D48",
  },
  notifyMessage: {
    fontSize: 13,
    color: "#444",
    marginBottom: 6,
  },
  notifyLink: {
    fontSize: 13,
    color: "#0A8D48",
    fontWeight: "bold",
  },

  promoContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#662D91",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 20,
  },
  promoText: {
    fontSize: 16,
    color: "#662D91",
  },
  countdownBox: {
    backgroundColor: "#662D91",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  countdownText: {
    color: "white",
    fontWeight: "bold",
  },

  bottomNav: {
    height: 70,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  navText: {
    fontSize: 11,
    marginTop: 2,
    color: "#999",
  },

  profileDot: {
    position: "absolute",
    top: 0,
    right: 6,
    width: 8,
    height: 8,
    backgroundColor: "#FF3B30",
    borderRadius: 4,
    zIndex: 10,
  },
});
