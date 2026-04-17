import { Redirect, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
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
import { Select, SelectRef } from "./src/components/Select"; 
import { moderateScale, scale, scaledFont, verticalScale } from "./src/utils/responsive";
import { useAuthStore } from "./src/store/useAuthStore";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  const selectRef = useRef<SelectRef>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const [cidadeEscolhida, setCidadeEscolhida] = useState<string | null>(null);

  if (isAuthenticated) {
    return <Redirect href="/home" />;
  }

  const handleNavigation = (path: "/login" | "/cadastro") => {
    // Verifica se escolheu a cidade
    if (!cidadeEscolhida) {
      Alert.alert("Atenção", "Por favor, escolha a sua cidade antes de continuar.");
      selectRef.current?.openDropdown();
      
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 150);
      
      return;
    }
    
    // alva no banco de memória (Zustand)
    useAuthStore.getState().setCidadeSelecionada(cidadeEscolhida);
    router.push(path);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        ref={scrollViewRef} 
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
            
            <Select
              ref={selectRef}
              placeholder="Escolha sua cidade"
              options={["Iporã do Oeste", "São Miguel do Oeste", "Itapiranga"]}
              onSelect={(value) => {
                setCidadeEscolhida(value);
              }}
              onOpen={() => {
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 150); 
              }}
              onClose={() => {
                setTimeout(() => {
                  scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                }, 150);
              }}
            />
            
            <View style={styles.buttons}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => handleNavigation("/cadastro")} 
              >
                <Text style={styles.primaryText}>Criar conta</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => handleNavigation("/login")} 
              >
                <Text style={styles.secondaryText}>Entrar</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                Ao continuar você declara estar ciente dos{" "}
                <Text 
                  style={styles.linkText} 
                  onPress={() => router.push("/termos")}
                >
                  Termos de uso
                </Text>
                {" "}e{" "}
                <Text 
                  style={styles.linkText} 
                  onPress={() => router.push("/privacidade")}
                >
                  Política de privacidade
                </Text>
                .
              </Text>
            </View>

          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#E9EAEC" },
  container: { paddingTop: verticalScale(30), paddingBottom: verticalScale(80) },
  title: {
    fontSize: scaledFont(30),
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
    width: width * 0.92, 
    height: width * 0.92, 
    alignSelf: "flex-start", 
    marginBottom: verticalScale(20),
    marginTop: verticalScale(10),
  },
  bottomArea: { width: "100%" },
  label: {
    fontSize: scaledFont(28),
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
    fontSize: scaledFont(17),
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
  secondaryText: { fontSize: scaledFont(17), fontWeight: "500" },
  
  termsContainer: {
    marginTop: verticalScale(25),
    alignItems: "center",
    paddingHorizontal: scale(10),
  },
  termsText: {
    fontSize: scaledFont(12),
    color: "#666",
    textAlign: "center",
    lineHeight: moderateScale(18),
  },
  linkText: {
    color: "#1F41BB",
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});