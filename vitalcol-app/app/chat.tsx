import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';

const MEDICAL_KEYWORDS = [
  'dolor', 'síntoma', 'enfermedad', 'medicina', 'tratamiento', 'doctor', 'salud', 'fiebre', 'tos', 'cabeza', 'estómago', 'presión', 'corazón', 'diabetes', 'infección', 'fractura', 'sangre', 'alergia', 'vacuna', 'virus', 'bacteria', 'hospital', 'consulta', 'receta', 'medicamento', 'cirugía', 'herida', 'malestar', 'mareo', 'vómito', 'gripa', 'gripe', 'asma', 'pulmón', 'riñón', 'hígado', 'piel', 'ojo', 'oído', 'nariz', 'boca', 'diente', 'muela', 'garganta', 'hueso', 'musculo', 'articulación', 'embarazo', 'menstruación', 'parto', 'pediatra', 'adulto', 'anciano', 'niño', 'bebé', 'urgencia', 'primeros auxilios'
];

const API_KEY = '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';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export default function Chat() {
  const [messages, setMessages] = useState([
    { from: 'ai', text: '¡Hola! Soy tu asistente médico. ¿En qué puedo ayudarte hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeoutError, setTimeoutError] = useState(false);
  const flatListRef = useRef<FlatList<any>>(null);

  const isMedical = (text: string) => {
    const lower = text.toLowerCase();
    return MEDICAL_KEYWORDS.some(word => lower.includes(word));
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    if (!isMedical(input)) {
      Alert.alert('Solo temas médicos', 'Por favor, realiza preguntas relacionadas con salud o medicina.');
      return;
    }
    const userMsg = { from: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setTimeoutError(false);
    let timeoutId: NodeJS.Timeout;
    try {
      // Timeout de 15 segundos
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error('timeout'));
        }, 15000);
      });
      const aiPromise = axios.post(API_URL, {
        model: 'openai/gpt-4o',
        messages: [
          { role: 'system', content: 'Eres un asistente médico profesional. Responde solo en español y únicamente a temas médicos.' },
          ...[...messages, userMsg].map(m => ({ role: m.from === 'user' ? 'user' : 'assistant', content: m.text }))
        ],
        max_tokens: 4096,
        usage: { include: true }
      }, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      const response = await Promise.race([aiPromise, timeoutPromise]);
      clearTimeout(timeoutId);
      // @ts-ignore
      const aiText = response.data.choices?.[0]?.message?.content?.trim() || 'Lo siento, no puedo responder en este momento.';
      setMessages(prev => [...prev, { from: 'ai', text: aiText }]);
    } catch (e: any) {
      if (e.message === 'timeout') {
        setTimeoutError(true);
        setMessages(prev => [...prev, { from: 'ai', text: 'La respuesta está tardando demasiado. Intenta de nuevo más tarde.' }]);
      } else {
        setMessages(prev => [...prev, { from: 'ai', text: 'Ocurrió un error al contactar la IA.' }]);
      }
    }
    setLoading(false);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const renderItem = ({ item }: { item: { from: string; text: string } }) => (
    <View style={[styles.bubble, item.from === 'user' ? styles.userBubble : styles.aiBubble]}>
      <Text style={[styles.bubbleText, item.from === 'user' ? styles.userText : styles.aiText]}>{item.text}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={styles.chat}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#1565c0" />
          <Text style={styles.loadingText}>Esperando respuesta de la IA...</Text>
        </View>
      )}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Escribe tu pregunta médica..."
          placeholderTextColor="#b0c4de"
          editable={!loading}
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage} disabled={loading}>
          <MaterialCommunityIcons name="send" size={28} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4285F4',
  },
  chat: {
    padding: 16,
    paddingBottom: 80,
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 18,
    padding: 12,
    marginVertical: 6,
  },
  userBubble: {
    backgroundColor: '#e3f2fd',
    alignSelf: 'flex-end',
    borderTopRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: 'white',
    alignSelf: 'flex-start',
    borderTopLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 16,
  },
  userText: {
    color: '#1565c0',
  },
  aiText: {
    color: '#333',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#4285F4',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  input: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 16,
    marginRight: 8,
    color: '#222',
  },
  sendBtn: {
    backgroundColor: '#1565c0',
    borderRadius: 20,
    padding: 10,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 80,
    backgroundColor: 'rgba(66,133,244,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 12,
    color: '#1565c0',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 