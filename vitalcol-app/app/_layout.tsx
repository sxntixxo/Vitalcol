import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ActivityIndicator, AppState, View } from 'react-native';
import { Session } from "@supabase/supabase-js";

// Tell Supabase to automatically refresh the session when the app is active
AppState.addEventListener('change', (nextAppState) => {
  if (nextAppState === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

const useProtectedRoute = (session: Session | null, initialized: boolean) => {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) {
      return;
    }

    const inAuthPages = segments.includes('login') || segments.includes('register');

    // If the user is signed in and the initial segment is not a protected route.
    if (session && inAuthPages) {
      // Redirect away from the sign-in page.
      router.replace('/dashboard');
    } else if (!session && !inAuthPages) {
      // Redirect to the sign-in page.
      router.replace('/login');
    }
  }, [session, initialized, segments]);
};


export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Obtenemos la sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitialized(true);
    });

    // Escuchamos cambios en la autenticación
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);
  
  useProtectedRoute(session, initialized);

  if (!initialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#4285F4' }}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="chat" options={{ headerShown: false }} />
      <Stack.Screen name="camara" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
      <Stack.Screen name="history" options={{ headerShown: false }} />
    </Stack>
  );
}