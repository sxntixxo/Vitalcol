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

    const inAuthPages = segments[0] === 'login' || segments[0] === 'register';

    // If the user is signed in and the initial segment is not a protected route.
    if (session && inAuthPages) {
      // Redirect away from the sign-in page.
      router.replace('/dashboard');
    } else if (!session && !inAuthPages) {
      // Redirigir primero a la pantalla de registro en vez de login
      router.replace('/register');
    }
  }, [session, initialized, segments, router]);
};


export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    console.log('_layout: Initial session check');
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitialized(true);
      console.log('_layout: Session initialized:', session ? 'active' : 'null');
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      console.log('_layout: Auth state changed:', session ? 'active' : 'null');
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (session) {
      console.log('_layout: Verifying session validity');
      supabase.auth.getUser().then(({ data, error }) => {
        if (error || !data?.user) {
          console.log('_layout: Session invalid, signing out');
          supabase.auth.signOut();
          setSession(null);
        } else {
          console.log('_layout: Session valid');
        }
      });
    }
  }, [session]);
  
  useProtectedRoute(session, initialized);

  if (!initialized) {
    console.log('_layout: Not initialized, showing activity indicator');
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
      <Stack.Screen name="vozasistent" options={{ headerShown: false }} />
      <Stack.Screen name="camara" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
    </Stack>
  );
}