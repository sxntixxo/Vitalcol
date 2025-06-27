import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Dashboard() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <View style={styles.cardsContainer}>
        <TouchableOpacity style={styles.card} onPress={() => router.push('/chat')}>
          <MaterialCommunityIcons name="chat" size={60} color="#4285F4" />
          <Text style={styles.cardText}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => router.push('/camara')}>
          <MaterialCommunityIcons name="camera" size={60} color="#4285F4" />
          <Text style={styles.cardText}>Cámara</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4285F4',
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 48,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardText: {
    marginTop: 18,
    fontSize: 24,
    color: '#4285F4',
    fontWeight: 'bold',
  },
}); 