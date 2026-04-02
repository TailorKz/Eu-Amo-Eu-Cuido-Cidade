import axios from "axios"; // IMPORTAMOS O AXIOS
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
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
import { useAuthStore } from "./src/store/useAuthStore";
import { moderateScale, verticalScale } from "./src/utils/responsive";



export default function Cadastro() {
  const router = useRouter();
  const cidadeSelecionada = useAuthStore((state) => state.cidadeSelecionada);
  const login = useAuthStore((state) => state.login);
  const [loadedImages, setLoadedImages] = useState(0);
  const TOTAL_IMAGES = 3;
  const [nome, setNome] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneRaw, setPhoneRaw] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
const [isConfigLoaded, setIsConfigLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 
const [fundoPersonalizado, setFundoPersonalizado] = useState<string | null>(null);
  const [errors, setErrors] = useState({
    nome: "",
    phone: "",
    password: "",
  });
useEffect(() => {
    buscarConfiguracoes();
  }, []);

  const buscarConfiguracoes = async () => {
    try {
      const response = await axios.get("http://192.168.1.17:8080/api/configuracoes");
      if (response.data.imagemFundoLogin) {
        setFundoPersonalizado(response.data.imagemFundoLogin);
      }
    } catch (error) {
      console.log("Erro ao carregar fundo:", error);
    } finally {
      setIsConfigLoaded(true); // AVISA QUE O JAVA JÁ RESPONDEU (Dando erro ou não)
    }
  };
  function validate() {
    let newErrors = { nome: "", phone: "", password: "" };

    if (nome.trim().length < 3) newErrors.nome = "Nome é obrigatório";
    if (phoneRaw.length !== 11) newErrors.phone = "Número inválido";
    if (password.length < 8) newErrors.password = "Mínimo de 8 caracteres";
    if (password !== confirmPassword)
      newErrors.password = "As senhas não coincidem";

    setErrors(newErrors);
    return !newErrors.nome && !newErrors.phone && !newErrors.password;
  }

  function handleImageLoad() {
    setLoadedImages((prev) => prev + 1);
  }
  async function handleCadastro() {
    if (!validate()) return;

    if (!cidadeSelecionada) {
      Alert.alert(
        "Atenção",
        "Por favor, volte e escolha a sua cidade na tela inicial.",
      );
      return;
    }

    setIsLoading(true);

    try {
      const url = "http://192.168.1.17:8080/api/cidadaos/cadastrar";

      const dadosParaEnviar = {
        nome: nome,
        telefone: phoneRaw,
        senha: password,
        cidade: cidadeSelecionada, //  ENVIA A CIDADE ESCOLHIDA
      };

      const response = await axios.post(url, dadosParaEnviar);

      login(response.data);
      
      Alert.alert(
        "Sucesso!", 
        "A sua conta foi criada com sucesso.", 
        [{ text: "OK", onPress: () => router.replace("/home") }] // Vai para a Home!
      );
    } catch (error: any) {
      console.log("Erro no cadastro:", error);
      if (error.response && error.response.status === 400) {
        // este erro só acontece se tentar repetir o número NA MESMA CIDADE
        Alert.alert(
          "Atenção",
          "Este número de celular já está registrado nesta cidade.",
        );
      } else {
        Alert.alert(
          "Erro de Conexão",
          "Não foi possível comunicar com os servidores.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <View style={styles.footerImageContainer} pointerEvents="none">
            <Image
              source={fundoPersonalizado ? { uri: fundoPersonalizado } : require("../assets/images/cidadeipo.jpg")}
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
            extraScrollHeight={verticalScale(80)}
            bounces={false}
            showsVerticalScrollIndicator={false}
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
              placeholder="Nome completo:"
              icon="person-outline"
              value={nome}
              error={errors.nome}
              onChangeText={setNome}
            />

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

            <Input
              placeholder="Confirme a senha:"
              icon="lock-closed-outline"
              secureTextEntry
              value={confirmPassword}
              onChangeText={(text) => setConfirmPassword(text)}
            />

            {/* BOTÃO ATUALIZADO */}
            <TouchableOpacity
              style={styles.button}
              onPress={handleCadastro}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="large" color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Cadastrar</Text>
              )}
            </TouchableOpacity>

            <Text
              onPress={() => router.push("/login")}
              style={styles.textoFinal}
            >
              Já tem uma conta? Clique aqui
            </Text>
          </KeyboardAwareScrollView>

          {(!isConfigLoaded || loadedImages < TOTAL_IMAGES) && (
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
  container: { flex: 1, position: "relative", backgroundColor: "#EDEDED" },
  content: { paddingBottom: verticalScale(200), zIndex: 1 },
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
    marginBottom: verticalScale(10),
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
    marginTop: verticalScale(5),
    fontSize: moderateScale(15),
    fontWeight: "600",
    marginBottom: verticalScale(20),
    textAlign: "center",
  },
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
  },
  buttonText: {
    fontSize: moderateScale(24),
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "600",
  },
  textoFinal: {
    marginTop: verticalScale(15),
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
    zIndex: 0,
  },
  footerImage: { width: "100%", height: Math.min(verticalScale(320), 340) },
  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "100%",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EDEDED",
    zIndex: 999,
  },
});
