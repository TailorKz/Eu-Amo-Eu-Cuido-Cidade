import { Redirect, useRouter } from "expo-router";
import React, { useRef } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Select, SelectRef } from "./src/components/Select"; // 🔴 Importamos o SelectRef
import { moderateScale, scale, verticalScale } from "./src/utils/responsive";
import { useAuthStore } from "./src/store/useAuthStore";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  // 🔴 1. Cria a variável que vai segurar o controle remoto do Select
  const selectRef = useRef<SelectRef>(null);

  if (isAuthenticated) {
    return <Redirect href="/home" />;
  }

  // 🔴 2. Função inteligente de navegação
  const handleNavigation = (path: "/login" | "/cadastro") => {
    // Busca na memória NA HORA DO CLIQUE se tem cidade
    const cidadeAtual = useAuthStore.getState().cidadeSelecionada;

    if (!cidadeAtual) {
      Alert.alert("Atenção", "Por favor, escolha a sua cidade antes de continuar.");
      
      // MÁGICA 2: Aperta o botão do controle remoto para abrir o Select!
      selectRef.current?.openDropdown();
      return;
    }
    
    router.push(path);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>
          O cuidado com a cidade{"\n"}na palma da sua mão!
        </Text>
        <Image
          source={require("../assets/images/mao2.png")}
          style={styles.image}
          resizeMode="contain"
        />
        <View style={styles.content}>
          <View style={styles.bottomArea}>
            <Text style={styles.label}>Escolha sua cidade:</Text>
            
            {/* 🔴 3. Passa o controle remoto (ref) para o Select */}
            <Select
              ref={selectRef}
              placeholder="Escolha sua cidade"
              options={["Iporã do Oeste", "São Miguel do Oeste", "Itapiranga"]}
              onSelect={(value) => {
                useAuthStore.getState().setCidadeSelecionada(value);
              }}
            />
            
            <View style={styles.buttons}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => handleNavigation("/login")} // 🔴 Usa a nova função
              >
                <Text style={styles.primaryText}>Entrar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => handleNavigation("/cadastro")} // 🔴 Usa a nova função
              >
                <Text style={styles.secondaryText}>Criar conta</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#E9EAEC" },
  container: { paddingTop: verticalScale(30) },
  title: {
    fontSize: moderateScale(32),
    fontWeight: "700",
    color: "#1F41BB",
    textAlign: "center",
    marginBottom: verticalScale(20),
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  content: { paddingHorizontal: scale(24) },
  image: {
    width: Math.min(scale(360), width * 0.95),
    height: verticalScale(360),
    alignSelf: "flex-start",
    marginBottom: verticalScale(20),
    marginTop: verticalScale(20),
  },
  bottomArea: { width: "100%" },
  label: {
    fontSize: moderateScale(26),
    fontWeight: "600",
    marginBottom: verticalScale(20),
    color: "#292D36",
    textAlign: "center",
  },
  select: {
    height: moderateScale(50),
    backgroundColor: "#F2F2F2",
    borderRadius: moderateScale(10),
    justifyContent: "center",
    paddingHorizontal: scale(16),
    marginBottom: verticalScale(20),
  },
  selectText: { fontSize: moderateScale(16) },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: verticalScale(10),
  },
  primaryButton: {
    width: "48%",
    height: moderateScale(50),
    backgroundColor: "#1F41BB",
    borderRadius: moderateScale(10),
    justifyContent: "center",
    alignItems: "center",
  },
  primaryText: {
    color: "white",
    fontSize: moderateScale(16),
    fontWeight: "600",
  },
  secondaryButton: {
    width: "48%",
    height: moderateScale(50),
    backgroundColor: "#ffffff",
    borderRadius: moderateScale(10),
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryText: { fontSize: moderateScale(16), fontWeight: "500" },
});
