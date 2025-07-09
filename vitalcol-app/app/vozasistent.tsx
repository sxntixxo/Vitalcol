

'use dom';

import { useConversation } from '@elevenlabs/react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback } from 'react';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import tools from '../lib/tools';

async function requestMicrophonePermission() {
  try {
    // @ts-ignore
    await navigator.mediaDevices.getUserMedia({ audio: true });
    return true;
  } catch (error) {
    console.error('Microphone permission denied');
    return false;
  }
}

export default function VozAsistente() {
  const conversation = useConversation({
    onConnect: () => console.log('Connected'),
    onDisconnect: () => console.log('Disconnected'),
    onMessage: (message) => console.log(message),
    onError: (error) => console.error('Error:', error),
  });

  const startConversation = useCallback(async () => {
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      alert('No permission for microphone');
      return;
    }
    await conversation.startSession({
      agentId: 'agent_01jz2951exfm69wzewj6kqs90x',
      dynamicVariables: { platform: Platform.OS },
      clientTools: {
        get_battery_level: tools.get_battery_level,
        change_brightness: tools.change_brightness,
        flash_screen: tools.flash_screen,
      },
    });
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.callButton, conversation.status === 'connected' && styles.callButtonActive]}
        onPress={conversation.status === 'disconnected' ? startConversation : stopConversation}
      >
        <View style={[styles.buttonInner, conversation.status === 'connected' && styles.buttonInnerActive]}>
          <MaterialCommunityIcons name="microphone" size={32} color="#E2E8F0" style={styles.buttonIcon} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1565c0',
  },
  callButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  callButtonActive: {
    backgroundColor: 'rgba(239,68,68,0.2)',
  },
  buttonInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 5,
  },
  buttonInnerActive: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
  },
  buttonIcon: {
    transform: [{ translateY: 2 }],
  },
});
