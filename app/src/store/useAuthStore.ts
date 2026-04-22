import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: number;
  nome: string;
  telefone: string;
  cidade: string;
  perfil?: string;
  setorAtuacao?: string | null; 
  pushToken?: string;
  token?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  cidadeSelecionada: string | null; //Guarda a cidade escolhida no Index
  
  setCidadeSelecionada: (cidade: string) => void; // Função para salvar a cidade
  login: (userData: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      cidadeSelecionada: null,

      setCidadeSelecionada: (cidade) => set({ cidadeSelecionada: cidade }),
      login: (userData) => set({ user: userData, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false, cidadeSelecionada: null }), // Apaga tudo ao sair
    }),
    {
      name: 'ipora-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);