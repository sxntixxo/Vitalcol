import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Audio } from 'expo-av';
import axios from 'axios';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ELEVENLABS_API_KEY = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY;
const ELEVENLABS_STT_URL = 'https://api.elevenlabs.io/v1/speech-to-text';

export default function VozAsistente() {
  const [recording, setRecording] = useState<Audio.Recording | undefined>(undefined);
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, [recording]);

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
      name: 'audio.m4a', // Eleven Labs supports m4a
      type: 'audio/m4a',
    });
    formData.append('model_id', 'eleven_multilingual_v2'); // Or another suitable model

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Asistente de Voz</Text>
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
});
