import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Dashboard() {
  console.log('Dashboard: Component loaded');
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.absoluteTitle}>Vitalcol</Text>
      <View style={styles.cardsContainer}>
        <TouchableOpacity style={styles.card} onPress={() => router.push('/camara')}>
          <MaterialCommunityIcons name="camera" size={60} color="#4285F4" />
          <Text style={styles.cardText}>Cámara</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => router.push('/vozasistent')}>
          <MaterialCommunityIcons name="microphone" size={60} color="#4285F4" />
          <Text style={styles.cardText}>Asistente de Voz</Text>
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
  header: {
    alignItems: 'center',
    marginBottom: 0,
    marginTop: 0,
    paddingTop: 0,
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoSmall: {
    width: 36,
    height: 36,
    borderRadius: 8,
    marginRight: 10,
  },
  absoluteTitle: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginTop: 20,
    zIndex: 10,
  },
  cardsContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 50,
    marginTop: 100,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '85%',
    height: 170,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardText: {
    marginTop: 10,
    fontSize: 20,
    color: '#4285F4',
    fontWeight: 'bold',
    textAlign: 'center',
    alignSelf: 'center',
  },
}); 