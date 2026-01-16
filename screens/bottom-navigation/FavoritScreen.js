import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

export default function FavoritScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Favorit</Text>
      <Text>Daftar kos favoritmu akan tampil di sini.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});
