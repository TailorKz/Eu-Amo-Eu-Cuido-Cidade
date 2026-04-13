import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
import { CodeVerificationModal } from "./src/components/CodeVerificationModal"; // 🔴 IMPORTADO
import { Input } from "./src/components/Input";
import { useAuthStore } from "./src/store/useAuthStore";
import { cityAssets } from "./src/utils/cityAssets";
import { moderateScale, verticalScale } from "./src/utils/responsive";

export default function Cadastro() {
  const router = useRouter();
  const cidadeSelecionada = useAuthStore((state) => state.cidadeSelecionada);
  const login = useAuthStore((state) => state.login);
  const assets =
    cityAssets[cidadeSelecionada || "Iporã do Oeste"] ||
    cityAssets["Iporã do Oeste"];

  const [nome, setNome] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneRaw, setPhoneRaw] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isConfigLoaded, setIsConfigLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fundoPersonalizado, setFundoPersonalizado] = useState<string | null>(
    null,
  );

  // 🔴 NOVOS ESTADOS PARA A VALIDAÇÃO WHATSAPP
  const [isCodeModalVisible, setIsCodeModalVisible] = useState(false);
  const [codigoGeradoBackend, setCodigoGeradoBackend] = useState("");

  const [errors, setErrors] = useState({
    nome: "",
    phone: "",
    password: "",
  });

  useEffect(() => {
    buscarConfiguracoes();
  }, []);

  const buscarConfiguracoes = async () => {
    if (!cidadeSelecionada) {
      setIsConfigLoaded(true);
      return;
    }
    try {
      const response = await axios.get(
        `https://tailorkz-production-eu-amo.up.railway.app/api/configuracoes?cidade=${cidadeSelecionada}`,
      );
      if (response.data.imagemFundoLogin) {
        setFundoPersonalizado(response.data.imagemFundoLogin);
      }
    } catch (error) {
      console.log("Erro ao carregar fundo:", error);
    } finally {
      setIsConfigLoaded(true);
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

  // 🔴 PASSO 1: INICIA O CADASTRO E SOLICITA O WHATSAPP
  async function handleIniciarCadastro() {
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
      // Como o usuário ainda não existe, para evitar criar lixo no banco,
      // o ideal seria uma rota Java que só dispara o SMS.
      // (Adapte a URL abaixo caso você crie uma rota específica no Java para gerar OTP sem salvar o cidadão)

      /* Exemplo se tiver a rota:
      const response = await axios.post(`https://tailorkz-production-eu-amo.up.railway.app/api/cidadaos/enviar-otp-cadastro?telefone=${phoneRaw}`);
      setCodigoGeradoBackend(response.data.codigo); // Guarda o código que o Java gerou
      */

      // Por enquanto, simulamos a abertura da modal (Remova isso quando conectar a rota)
      setIsCodeModalVisible(true);
    } catch (error: any) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível enviar o código.");
    } finally {
      setIsLoading(false);
    }
  }

  // 🔴 PASSO 2: CONFIRMA O CÓDIGO E CRIA A CONTA
  async function handleConfirmarCodigo(codeDigitado: string) {
    // Se você tiver a rota Java, verifique: if (codeDigitado !== codigoGeradoBackend) return Alert("Erro");

    setIsCodeModalVisible(false);
    setIsLoading(true);

    try {
      const url =
        "https://tailorkz-production-eu-amo.up.railway.app/api/cidadaos/cadastrar";
      const dadosParaEnviar = {
        nome: nome,
        telefone: phoneRaw,
        senha: password,
        cidade: cidadeSelecionada,
      };

      const response = await axios.post(url, dadosParaEnviar);
      login(response.data);

      Alert.alert("Sucesso!", "A sua conta foi criada com sucesso.", [
        { text: "OK", onPress: () => router.replace("/home") },
      ]);
    } catch (error: any) {
      console.log("Erro no cadastro:", error);
      if (error.response && error.response.status === 400) {
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
              source={
                fundoPersonalizado ? { uri: fundoPersonalizado } : assets.fundo
              }
              style={styles.footerImage}
              resizeMode="cover"
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
              <Image source={assets.brasao} style={styles.logoMunicipio} />
              <Image source={assets.logo} style={styles.logo} />
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

            {/* 🔴 CHAMA O PASSO 1 */}
            <TouchableOpacity
              style={styles.button}
              onPress={handleIniciarCadastro}
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

          {!isConfigLoaded && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#1F41BB" />
            </View>
          )}

          {/*  MODAL PARA DIGITAR O CÓDIGO DO WHATSAPP */}
          <CodeVerificationModal
            visible={isCodeModalVisible}
            onClose={() => setIsCodeModalVisible(false)}
            onConfirm={handleConfirmarCodigo}
            description={`Enviamos um código no Whatsapp do número: ${phone}`}
          />
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
    backgroundColor: "#edededa7",
    alignSelf: "center",
    paddingHorizontal: moderateScale(10),
    borderRadius: moderateScale(10),
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
