import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { Audio } from 'expo-av';
import axios from 'axios';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';

const ELEVENLABS_API_KEY = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY;
const ELEVENLABS_STT_URL = 'https://api.elevenlabs.io/v1/speech-to-text';

export default function VozAsistente() {
  const [recording, setRecording] = useState<Audio.Recording | undefined>(undefined);
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConvai, setShowConvai] = useState(false);

  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, [recording]);

  const convaiHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta charset="utf-8">
      <style>
        body { 
          margin: 0; 
          padding: 0; 
          background: linear-gradient(135deg, #4285F4 0%, #1565c0 100%);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .container {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 20px;
          box-sizing: border-box;
        }
        .title {
          color: white;
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 20px;
          text-align: center;
        }
        .loading {
          color: white;
          font-size: 16px;
          margin-top: 20px;
        }
        elevenlabs-convai {
          width: 95%;
          max-width: 450px;
          height: 70%;
          min-height: 400px;
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          background: white;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="title">Conversa con tu Asistente IA</div>
        <div class="loading" id="loading">Cargando widget...</div>
        <elevenlabs-convai 
          agent-id="agent_01jz2951exfm69wzewj6kqs90x"
          style="display: none;"
        ></elevenlabs-convai>
        <script src="https://unpkg.com/@elevenlabs/convai-widget-embed" 
                onload="document.getElementById('loading').style.display='none'; document.querySelector('elevenlabs-convai').style.display='block';"
                onerror="document.getElementById('loading').innerHTML='Error al cargar el widget. Verifica tu conexión.';"
                async type="text/javascript">
        </script>
      </div>
    </body>
    </html>
  `;

  async function startRecording() {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      setTranscribedText('');
      Alert.alert('Grabando', 'Comienza a hablar...');
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error de grabación', 'No se pudo iniciar la grabación. Asegúrate de que los permisos de micrófono estén concedidos.');
    }
  }

  async function stopRecording() {
    setIsRecording(false);
    setLoading(true);
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        if (uri) {
          await sendAudioForTranscription(uri);
        }
      }
    } catch (error) {
      console.error('Error stopping recording or sending audio:', error);
      Alert.alert('Error', 'Ocurrió un error al detener la grabación o transcribir el audio.');
    } finally {
      setRecording(undefined);
      setLoading(false);
    }
  }

  async function sendAudioForTranscription(audioUri: string) {
    if (!ELEVENLABS_API_KEY) {
      Alert.alert('Error de configuración', 'La clave API de Eleven Labs no está configurada.');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    // @ts-ignore
    formData.append('audio', {
      uri: audioUri,
      name: 'audio.m4a',
      type: 'audio/m4a',
    });
    formData.append('model_id', 'eleven_multilingual_v2');

    try {
      const response = await axios.post(ELEVENLABS_STT_URL, formData, {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'multipart/form-data',
        },
      });
      setTranscribedText(response.data.text);
    } catch (error: any) {
      console.error('Error transcribing audio:', error.response?.data || error.message);
      Alert.alert('Error de transcripción', error.response?.data?.detail || 'No se pudo transcribir el audio.');
      setTranscribedText('Error al transcribir el audio.');
    }
  }

  const handleConvaiToggle = () => {
    setShowConvai(!showConvai);
  };

  if (showConvai) {
    return (
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleConvaiToggle}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>
        <WebView 
          source={{ html: convaiHtml }}
          style={styles.webview}
          javaScriptEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          mixedContentMode={'compatibility'}
          originWhitelist={['*']}
          onError={(error) => {
            console.error('WebView Error:', error);
            Alert.alert('Error', 'No se pudo cargar el widget. Verifica tu conexión a internet.');
          }}
          onHttpError={(error) => {
            console.error('HTTP Error:', error);
          }}
          onLoadStart={() => console.log('WebView loading started')}
          onLoadEnd={() => console.log('WebView loading finished')}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Asistente de Voz</Text>
      
      {/* Botón para abrir Convai */}
      <TouchableOpacity
        style={styles.convaiButton}
        onPress={handleConvaiToggle}
      >
        <MaterialCommunityIcons name="robot" size={30} color="white" />
        <Text style={styles.convaiButtonText}>Conversar con IA</Text>
      </TouchableOpacity>

      {/* Botón de grabación original */}
      <TouchableOpacity
        style={styles.recordButton}
        onPress={isRecording ? stopRecording : startRecording}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <MaterialCommunityIcons
            name={isRecording ? 'microphone-off' : 'microphone'}
            size={60}
            color="white"
          />
        )}
      </TouchableOpacity>
      
      <Text style={styles.recordStatus}>
        {isRecording ? 'Grabando...' : 'Toca para grabar'}
      </Text>
      
      {transcribedText ? (
        <View style={styles.transcriptionContainer}>
          <Text style={styles.transcriptionLabel}>Texto Transcrito:</Text>
          <Text style={styles.transcribedText}>{transcribedText}</Text>
        </View>
      ) : null}
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4285F4',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 40,
  },
  convaiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34A853',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 30,
    marginBottom: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  convaiButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  recordButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1565c0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  recordStatus: {
    fontSize: 18,
    color: 'white',
    marginBottom: 30,
  },
  transcriptionContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '40%',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  transcriptionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  transcribedText: {
    fontSize: 16,
    color: '#555',
  },
  webview: {
    flex: 1,
    width: width,
    height: height,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1000,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 5,
  },
});
