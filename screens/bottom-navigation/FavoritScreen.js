import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useAuthStore } from "../../store/authStore";
import { createHttpHelperFunctions } from "../../store/httpHelperFunctions";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";

const { width } = Dimensions.get("window");

const { GET, POST } = createHttpHelperFunctions();

const KosCard = ({ item, onLikeUpdate }) => {
  const navigation = useNavigation();
  const token = useAuthStore((state) => state.token);
  const [liked, setLiked] = useState(true); // Default true karena di halaman favorit
  const [isLiking, setIsLiking] = useState(false);

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

      // Jika diun-like, beri tahu parent untuk refresh list
      if (!newLikedStatus && onLikeUpdate) {
        onLikeUpdate();
      }
    } catch (error) {
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

export default function FavoritScreen() {
  const [kosList, setKosList] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const token = useAuthStore((state) => state.token);

  const fetchKos = async (pageToLoad = 1, isRefresh = false) => {
    if (isLoading && !isRefresh) return;

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
          liked: true,
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
      console.error("Fetch favorit error:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Gunakan useFocusEffect agar data selalu refresh saat user masuk ke tab Favorit
  useFocusEffect(
    useCallback(() => {
      fetchKos(1, true);
    }, [])
  );

  const handleLoadMore = () => {
    if (!hasNextPage || isLoading) return;
    fetchKos(page + 1, false);
  };

  const handleRefresh = () => {
    fetchKos(1, true);
  };

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
        <Text style={styles.headerTitle}>Kos Favorit Saya</Text>
      </View>

      <FlatList
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 80, paddingTop: 10 }}
        data={kosList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <KosCard item={item} onLikeUpdate={() => fetchKos(1, true)} />
        )}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          isLoading ? (
            <>
              <KosCardSkeleton />
              <KosCardSkeleton />
              <KosCardSkeleton />
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="heart-dislike-outline" size={80} color="#ccc" />
              <Text style={styles.emptyText}>Belum ada kos favorit</Text>
              <Text style={styles.emptySubtext}>
                Kos yang kamu sukai akan muncul di sini
              </Text>
            </View>
          )
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
  content: { flex: 1, paddingHorizontal: 16 },

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
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
});
