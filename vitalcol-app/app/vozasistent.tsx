import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions, Platform, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { Audio } from 'expo-av';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ELEVENLABS_API_KEY = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY;

const getConvaiHtml = (apiKey) => `
  <!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta charset="utf-8"><style>body{margin:0;padding:0;background:transparent;font-family:'Segoe UI',sans-serif;height:100vh;display:flex;justify-content:center;align-items:center;}elevenlabs-convai{width:100%;height:100%;background:white;border-radius:15px;box-shadow:0 10px 30px rgba(0,0,0,0.3);}</style></head><body><elevenlabs-convai agent-id="agent_01jz2951exfm69wzewj6kqs90x" xi-api-key="${apiKey}"></elevenlabs-convai><script src="https://unpkg.com/@elevenlabs/convai-widget-embed" async type="text/javascript"></script></body></html>
`;

export default function VozAsistente() {
  const [permissionStatus, setPermissionStatus] = useState('unasked');
  const [viewState, setViewState] = useState('idle');

  useEffect(() => {
    if (Platform.OS !== 'web') {
      Audio.getPermissionsAsync().then(permission => {
        if (permission.granted) {
          setPermissionStatus('granted');
        }
      });
    }
  }, []);

  const handleRequestPermission = async () => {
    if (Platform.OS === 'web') return;

    const permission = await Audio.requestPermissionsAsync();
    if (permission.granted) {
      setPermissionStatus('granted');
    } else {
      setPermissionStatus('denied');
      Alert.alert('Permiso Denegado', 'No se puede usar el asistente sin acceso al micrófono. Por favor, actívalo en los ajustes de tu dispositivo.');
    }
  };

  const handleStartAssistant = () => {
    if (!ELEVENLABS_API_KEY) {
      Alert.alert('Error de Configuración', 'La clave API de ElevenLabs no está definida. Revisa tu archivo .env');
      setViewState('error');
      return;
    }
    setViewState('loading');
    setTimeout(() => setViewState('active'), 100);
  };

  if (permissionStatus !== 'granted') {
    return (
      <View style={styles.container}>
        <MaterialCommunityIcons name="microphone-off" size={80} color="rgba(255,255,255,0.7)" />
        <Text style={styles.title}>Acceso al Micrófono</Text>
        <Text style={styles.subtitle}>El asistente de voz necesita tu permiso para escucharte.</Text>
        <TouchableOpacity style={styles.button} onPress={handleRequestPermission}>
          <Text style={styles.buttonText}>Activar Micrófono</Text>
        </TouchableOpacity>
        {permissionStatus === 'denied' && <Text style={styles.errorText}>El permiso fue denegado. Debes activarlo en los ajustes de la app.</Text>}
      </View>
    );
  }

  if (viewState !== 'active') {
    return (
      <View style={styles.container}>
        <MaterialCommunityIcons name="robot-happy-outline" size={80} color="rgba(255,255,255,0.7)" />
        <Text style={styles.title}>Asistente Listo</Text>
        <Text style={styles.subtitle}>Presiona para iniciar la conversación.</Text>
        <TouchableOpacity style={styles.button} onPress={handleStartAssistant}>
          <Text style={styles.buttonText}>Iniciar Asistente de Voz</Text>
        </TouchableOpacity>
        {viewState === 'error' && <Text style={styles.errorText}>Hubo un error al configurar el asistente.</Text>}
      </View>
    );
  }

  return (
    <View style={styles.fullScreenContainer}>
      <WebView 
        source={{ html: getConvaiHtml(ELEVENLABS_API_KEY) }}
        style={styles.webview}
        javaScriptEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        mediaCapturePermissionGrantType={"grant"}
        domStorageEnabled={true}
        allowsAirPlayForMediaPlayback={true}
        originWhitelist={['*']}
        onLoadStart={() => console.log('[WebView] Carga iniciada...')}
        onLoadEnd={() => console.log('[WebView] Carga finalizada.')}
        onError={(event) => console.error('[WebView] Error:', event.nativeEvent.description)}
        onMessage={(event) => console.log('[WebView] Mensaje:', event.nativeEvent.data)}
        renderLoading={() => <ActivityIndicator style={StyleSheet.absoluteFill} size="large" color="#FFFFFF"/>}
        startInLoadingState={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1565c0',
    padding: 20,
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#1565c0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#34A853',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#FFCDD2',
    marginTop: 20,
    textAlign: 'center',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
