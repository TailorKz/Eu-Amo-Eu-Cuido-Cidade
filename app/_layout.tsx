import { Stack } from 'expo-router';
import axios from 'axios';
import { useAuthStore } from './src/store/useAuthStore';

axios.interceptors.request.use(
  (config) => {
    // Acessa o estado global do Zustand sem precisar estar dentro de um componente React
    const token = useAuthStore.getState().user?.token;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}