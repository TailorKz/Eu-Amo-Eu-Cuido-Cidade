import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import MaskInput from "react-native-mask-input";
import { CodeVerificationModal } from "./src/components/CodeVerificationModal";
import { Input } from "./src/components/Input";
import { useAuthStore } from "./src/store/useAuthStore";
import { moderateScale, verticalScale } from "./src/utils/responsive";

export default function Login() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const cidadeSelecionada = useAuthStore((state) => state.cidadeSelecionada);
const [fundoPersonalizado, setFundoPersonalizado] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState(0);
  const TOTAL_IMAGES = 3;

  const [phone, setPhone] = useState("");
  const [phoneRaw, setPhoneRaw] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  // 🔴 ESTADOS PARA O FLUXO DE ESQUECI A SENHA
  const [isForgotModalVisible, setIsForgotModalVisible] = useState(false);
  const [isCodeModalVisible, setIsCodeModalVisible] = useState(false);
  const [isNewPasswordModalVisible, setIsNewPasswordModalVisible] =
    useState(false);
  const [forgotPhone, setForgotPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [errors, setErrors] = useState({
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
      setIsConfigLoaded(true); //  AVISA QUE O JAVA JÁ RESPONDEU (Dando erro ou não)
    }
  };

const [isConfigLoaded, setIsConfigLoaded] = useState(false); //bolinha de carregamento

  function validate() {
    let newErrors = { phone: "", password: "" };
    if (phoneRaw.length !== 11) newErrors.phone = "Número inválido";
    if (password.length < 8) newErrors.password = "Senha deve ter 8 caracteres";
    setErrors(newErrors);
    return !newErrors.phone && !newErrors.password;
  }

  function handleImageLoad() {
    setLoadedImages((prev) => prev + 1);
  }

  async function handleLogin() {
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
      const url = "http://192.168.1.17:8080/api/cidadaos/login";
      const dadosDeLogin = {
        telefone: phoneRaw,
        senha: password,
        cidade: cidadeSelecionada,
      };

      const response = await axios.post(url, dadosDeLogin);
      login(response.data);
      router.replace("/home");
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        Alert.alert("Acesso Negado", "Número de celular ou senha incorretos.");
      } else {
        Alert.alert(
          "Erro de Conexão",
          "Não foi possível conectar ao servidor. Verifique sua rede.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  // ==========================================================
  // FLUXO DE RECUPERAÇÃO DE SENHA
  // ==========================================================
  const handleRequestPasswordReset = () => {
    if (forgotPhone.replace(/\D/g, "").length < 11) {
      Alert.alert("Atenção", "Digite um número de celular válido com DDD.");
      return;
    }
    // AQUI FARÍAMOS A REQUISIÇÃO AO JAVA PARA VER SE O NÚMERO EXISTE NA BASE
    // Se existir, fecha a modal de telefone e abre a modal de código
    setIsForgotModalVisible(false);
    setTimeout(() => setIsCodeModalVisible(true), 500);
  };

  const handleCodeConfirm = (code: string) => {
    // Valida o código do WhatsApp
    setIsCodeModalVisible(false);
    setTimeout(() => setIsNewPasswordModalVisible(true), 500);
  };

  const saveRecoveredPassword = () => {
    if (newPassword.length < 8) {
      Alert.alert("Atenção", "A senha deve ter pelo menos 8 caracteres.");
      return;
    }
    // AQUI ENVIA A NOVA SENHA PARA O JAVA
    Alert.alert(
      "Sucesso!",
      "Sua senha foi redefinida. Faça o login para continuar.",
    );
    setIsNewPasswordModalVisible(false);
    setNewPassword("");
    setForgotPhone("");
  };

  return (
    <View style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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

            <TouchableOpacity onPress={() => setIsForgotModalVisible(true)}>
              <Text style={styles.textoEsqueceu}>Esqueceu sua senha?</Text>
            </TouchableOpacity>

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

          {(!isConfigLoaded || loadedImages < TOTAL_IMAGES) && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#1F41BB" />
            </View>
          )}

          {/* ================================================= */}
          {/* 1. MODAL: DIGITAR TELEFONE PARA RECUPERAR SENHA   */}
          {/* ================================================= */}
          <Modal
            visible={isForgotModalVisible}
            transparent
            animationType="slide"
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Recuperar Senha</Text>
                <Text style={styles.modalSubtitle}>
                  Digite o número cadastrado. Enviaremos um código via WhatsApp.
                </Text>

                <MaskInput
                  style={styles.modalInput}
                  placeholder="(00) 00000-0000"
                  keyboardType="numeric"
                  value={forgotPhone}
                  onChangeText={(masked) => setForgotPhone(masked)}
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

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.btnCancel}
                    onPress={() => setIsForgotModalVisible(false)}
                  >
                    <Text style={styles.btnCancelText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.btnConfirm}
                    onPress={handleRequestPasswordReset}
                  >
                    <Text style={styles.btnConfirmText}>Enviar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* ================================================= */}
          {/* 2. MODAL DE CÓDIGO (COMPONENTE)                   */}
          {/* ================================================= */}
          <CodeVerificationModal
            visible={isCodeModalVisible}
            onClose={() => setIsCodeModalVisible(false)}
            onConfirm={handleCodeConfirm}
            description={`Enviamos um código no Whatsapp do número: ${forgotPhone}`}
          />

          {/* ================================================= */}
          {/* 3. MODAL: DEFINIR NOVA SENHA                      */}
          {/* ================================================= */}
          <Modal
            visible={isNewPasswordModalVisible}
            transparent
            animationType="slide"
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Criar Nova Senha</Text>
                <Text style={styles.modalSubtitle}>
                  O código foi validado! Digite sua nova senha de acesso.
                </Text>

                <TextInput
                  style={styles.modalInput}
                  placeholder="Nova senha (min. 8 caracteres)"
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.btnCancel}
                    onPress={() => setIsNewPasswordModalVisible(false)}
                  >
                    <Text style={styles.btnCancelText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.btnConfirm}
                    onPress={saveRecoveredPassword}
                  >
                    <Text style={styles.btnConfirmText}>Salvar Senha</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
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
    paddingVertical: 10, // Adicionado para facilitar o clique
  },
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

  // 🔴 ESTILOS DAS MODAIS (Copiados do Perfil para consistência)
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFF",
    width: "100%",
    borderRadius: 20,
    padding: 24,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  modalInput: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  btnCancel: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    marginRight: 10,
    alignItems: "center",
  },
  btnCancelText: { color: "#666", fontWeight: "bold", fontSize: 16 },
  btnConfirm: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    backgroundColor: "#1F41BB",
    marginLeft: 10,
    alignItems: "center",
  },
  btnConfirmText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
});
