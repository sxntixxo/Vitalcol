import React, { useState } from 'react';
import { Alert, StyleSheet, View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { MaterialCommunityIcons } from '@expo/vector-icons';

WebBrowser.maybeCompleteAuthSession();

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function signUpWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Registro exitoso', 'Por favor, revisa tu correo para verificar tu cuenta.');
      router.replace('/login');
    }
    setLoading(false);
  }

  async function signInWithGoogle() {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: AuthSession.makeRedirectUri({
          preferLocalhost: true,
          native: 'vitalcolapp:///',
        }),
      },
    });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      const res = await WebBrowser.openAuthSessionAsync(data.url);
      if (res.type === 'success' && res.url) {
        const hash = res.url.split('#')[1];
        if (hash) {
          const params = new URLSearchParams(hash);
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken && refreshToken) {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
          }
        }
      }
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>VitalCol</Text>
      <Text style={styles.subtitle}>Crear Cuenta</Text>

      <TextInput
        style={styles.input}
        onChangeText={setEmail}
        value={email}
        placeholder="correo@ejemplo.com"
        autoCapitalize={'none'}
        keyboardType="email-address"
        placeholderTextColor="#b0c4de"
      />
      <TextInput
        style={styles.input}
        onChangeText={setPassword}
        value={password}
        secureTextEntry
        placeholder="Contraseña (mín. 6 caracteres)"
        autoCapitalize={'none'}
        placeholderTextColor="#b0c4de"
      />

      <TouchableOpacity style={styles.button} onPress={signUpWithEmail} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Registrarse</Text>
        )}
      </TouchableOpacity>

      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>O</Text>
        <View style={styles.divider} />
      </View>

      <TouchableOpacity style={[styles.button, styles.googleButton]} onPress={signInWithGoogle} disabled={loading}>
        <MaterialCommunityIcons name="google" size={24} color="#4285F4" />
        <Text style={[styles.buttonText, styles.googleButtonText]}>Registrarse con Google</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/login')} disabled={loading}>
        <Text style={styles.linkText}>¿Ya tienes una cuenta? Inicia sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4285F4',
    padding: 24,
  },
  title: {
    fontSize: 44,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 24,
    color: 'white',
    marginBottom: 40,
  },
  input: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#222',
    marginBottom: 16,
  },
  button: {
    width: '100%',
    backgroundColor: '#1565c0',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    color: 'white',
    marginTop: 24,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  googleButton: {
    backgroundColor: 'white',
  },
  googleButtonText: {
    color: '#4285F4',
    marginLeft: 12,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'white',
  },
  dividerText: {
    color: 'white',
    marginHorizontal: 10,
  },
});
