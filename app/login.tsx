import axios from "axios";
import { useAuthStore } from "./src/store/useAuthStore";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Input } from "./src/components/Input";
import { moderateScale, verticalScale } from "./src/utils/responsive";

export default function Login() {
  const router = useRouter(); 
  const login = useAuthStore((state) => state.login);
  const cidadeSelecionada = useAuthStore((state) => state.cidadeSelecionada);// Puxa a função de salvar na memória

  const [loadedImages, setLoadedImages] = useState(0);
  const TOTAL_IMAGES = 3;

  const [phone, setPhone] = useState("");
  const [phoneRaw, setPhoneRaw] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const [errors, setErrors] = useState({
    phone: "",
    password: "",
  });

  function validate() {
    let newErrors = {
      phone: "",
      password: "",
    };

    if (phoneRaw.length !== 11) {
      newErrors.phone = "Número inválido";
    }

    if (password.length < 8) {
      newErrors.password = "Senha deve ter 8 caracteres";
    }

    setErrors(newErrors);

    return !newErrors.phone && !newErrors.password;
  }

  function handleImageLoad() {
    setLoadedImages((prev) => prev + 1);
  }

  // 3. FUNÇÃO QUE FALA COM O JAVA PARA FAZER O LOGIN
  async function handleLogin() {
    if (!validate()) return;
    
    // Trava de segurança: Se a pessoa chegou no login sem cidade, manda voltar
    if (!cidadeSelecionada) {
      Alert.alert("Atenção", "Por favor, volte e escolha a sua cidade na tela inicial.");
      return;
    }
    
    setIsLoading(true);

    try {
      const url = "http://192.168.1.17:8080/api/cidadaos/login"; // USE O SEU IP
      
      const dadosDeLogin = {
        telefone: phoneRaw,
        senha: password,
        cidade: cidadeSelecionada // 🔴 AGORA ENVIA A CIDADE TAMBÉM!
      };

      const response = await axios.post(url, dadosDeLogin);
      
      login(response.data); 
      router.replace("/home");

    } catch (error: any) {
      console.log("Erro no login:", error);
      if (error.response && error.response.status === 401) {
        Alert.alert("Acesso Negado", "Número de celular ou senha incorretos.");
      } else {
        Alert.alert("Erro de Conexão", "Não foi possível conectar ao servidor. Verifique sua rede.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <View style={styles.footerImageContainer} pointerEvents="none">
            <Image
              source={require("../assets/images/cidadeipo.jpg")}
              style={styles.footerImage}
              resizeMode="cover"
              onLoadEnd={handleImageLoad}
            />

            <LinearGradient
              colors={[
                "rgba(237,237,237,1)",
                "rgba(237,237,237,0.8)",
                "rgba(237,237,237,0.4)",
                "rgba(237,237,237,0.3)",
              ]}
              style={styles.gradientOverlay}
            />
          </View>
          <KeyboardAwareScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            enableOnAndroid={true}
            extraScrollHeight={0}
            bounces={false}
            overScrollMode="never"
          >
            <View style={styles.top}>
              <LinearGradient
                colors={["#87CDE9", "#1F41BB"]}
                start={{ x: 1.5, y: 0 }}
                end={{ x: 0, y: 0 }}
                style={styles.background}
              />
            </View>

            <View style={styles.logoContainer}>
              <Image
                source={require("../assets/images/iporalogo1.png")}
                style={styles.logoMunicipio}
                onLoadEnd={handleImageLoad}
              />

              <Image
                source={require("../assets/images/logoeuamoipora.png")}
                style={styles.logo}
                onLoadEnd={handleImageLoad}
              />

              <Text style={styles.textoCuidado}>
                O cuidado com a cidade na palma da sua mão.
              </Text>
            </View>

            <Input
              placeholder="Número:"
              icon="logo-whatsapp"
              value={phone}
              keyboardType="numeric"
              error={errors.phone}
              onChangeText={(masked, unmasked) => {
                setPhone(masked);
                setPhoneRaw(unmasked || "");
              }}
              mask={[
                "(",
                /\d/,
                /\d/,
                ")",
                " ",
                /\d/,
                /\d/,
                /\d/,
                /\d/,
                /\d/,
                "-",
                /\d/,
                /\d/,
                /\d/,
                /\d/,
              ]}
            />
            <Input
              placeholder="Senha:"
              icon="lock-closed-outline"
              secureTextEntry
              value={password}
              error={errors.password}
              onChangeText={(text) => setPassword(text)}
            />
            <Text style={styles.textoEsqueceu}>Esqueceu sua senha?</Text>

            {/* 4. BOTÃO ATUALIZADO COM CARREGAMENTO */}
            <TouchableOpacity
              style={styles.button}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="large" color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Entrar</Text>
              )}
            </TouchableOpacity>

            <Text
              onPress={() => router.push("/cadastro")}
              style={styles.textoFinal}
            >
              Quer criar uma conta? Clique aqui
            </Text>
          </KeyboardAwareScrollView>

          {loadedImages < TOTAL_IMAGES && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#1F41BB" />
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  top: {},
  container: {
    flex: 1,
    position: "relative",
    backgroundColor: "#EDEDED",
  },
  content: {
    paddingBottom: verticalScale(200),
    zIndex: 1,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: verticalScale(120),
    borderBottomLeftRadius: moderateScale(30),
    borderBottomRightRadius: moderateScale(30),
  },
  logoMunicipio: {
    width: moderateScale(120),
    height: moderateScale(120),
    marginBottom: verticalScale(20),
    zIndex: 1,
  },
  logoContainer: {
    marginTop: verticalScale(120) - moderateScale(60),
    alignItems: "center",
  },
  logo: {
    width: moderateScale(200),
    alignSelf: "center",
    height: moderateScale(100),
    marginTop: -verticalScale(15),
    zIndex: 2,
  },
  textoCuidado: {
    color: "#3A6C77",
    marginTop: verticalScale(15),
    fontSize: moderateScale(15),
    fontWeight: "600",
    marginBottom: verticalScale(40),
    textAlign: "center",
  },
  inputContainer: {},
  textoInput: {},

  button: {
    height: moderateScale(60),
    width: "80%",
    alignSelf: "center",
    justifyContent: "center",
    borderRadius: moderateScale(10),
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(10),
    backgroundColor: "#1F41BB",
    fontSize: moderateScale(18),
    marginTop: moderateScale(20),
  },
  buttonText: {
    fontSize: moderateScale(24),
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "600",
  },
  textoFinal: {
    marginTop: verticalScale(20),
    color: "#39555c",
    fontSize: moderateScale(15),
    fontWeight: "600",
    marginBottom: verticalScale(20),
    textAlign: "center",
  },
  footerImageContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: -1,
  },
  footerImage: {
    width: "100%",
    height: Math.min(verticalScale(320), 340),
  },
  textoEsqueceu: {
    color: "#3A6C77",
    fontSize: moderateScale(13),
    fontWeight: "600",
    textAlign: "right",
    marginRight: moderateScale(20),
  },
  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "100%",
  },
  //LOADING
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EDEDED",
    zIndex: 999,
  },
});
