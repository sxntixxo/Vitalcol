
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pzxtgvozglyeuyxksdrx.supabase.co'; // <-- Reemplaza esto
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6eHRndm96Z2x5ZXV5eGtzZHJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNDk1MDAsImV4cCI6MjA2NjcyNTUwMH0.qL2bH0ZR6kjsLEVBcYH42OTUYtBbCNvJ_JdREw3Bn_I'; // <-- Reemplaza esto

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
