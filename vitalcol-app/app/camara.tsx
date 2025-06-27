import { View, Text, StyleSheet } from 'react-native';

export default function Camara() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Pantalla de Cámara</Text>
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
  text: {
    fontSize: 28,
    color: 'white',
    fontWeight: 'bold',
  },
}); 