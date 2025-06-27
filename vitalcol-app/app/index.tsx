import { StyleSheet, View, Text, Animated, Easing } from 'react-native';
import { useEffect, useRef } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Index() {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const router = useRouter();

  useEffect(() => {
    // Animación de palpitación más suave y sutil
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.08,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      { iterations: 2 }
    ).start();

    // Navegar después de 2 segundos
    const timeout = setTimeout(() => {
      router.replace('/dashboard');
    }, 2000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <View style={styles.logoRow}>
          <MaterialCommunityIcons name="stethoscope" size={65} color="white" style={styles.icon}/>
          <View style={styles.textColumn}>
            <Text style={styles.title}>VitalCol</Text>
            <Text style={styles.subtitle}>Asistente de Triaje Médico</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 60,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  textColumn: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginLeft: 12,
  },
  title: {
    fontSize: 44,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 18,
    color: 'white',
    letterSpacing: 0.5,
    marginTop: -15,
    marginLeft: 10,
  },
  icon: {
    marginTop: 15,
  },
});