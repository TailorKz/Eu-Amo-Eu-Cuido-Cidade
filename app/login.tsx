import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
  Pressable,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import MaskInput from "react-native-mask-input";
import { CodeVerificationModal } from "./src/components/CodeVerificationModal";
import { Input } from "./src/components/Input";
import { useAuthStore } from "./src/store/useAuthStore";
import { moderateScale, verticalScale, scale, scaledFont } from "./src/utils/responsive";
import { cityAssets } from "./src/utils/cityAssets";

export default function Login() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const cidadeSelecionada = useAuthStore((state) => state.cidadeSelecionada);

  const assets =
    cityAssets[cidadeSelecionada || "Iporã do Oeste"] ||
    cityAssets["Iporã do Oeste"];

  const [fundoPersonalizado, setFundoPersonalizado] = useState<string | null>(null);

  const [phone, setPhone] = useState("");
  const [phoneRaw, setPhoneRaw] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);

  const [isForgotModalVisible, setIsForgotModalVisible] = useState(false);
  const [isCodeModalVisible, setIsCodeModalVisible] = useState(false);
  const [isNewPasswordModalVisible, setIsNewPasswordModalVisible] = useState(false);
  
  const [forgotPhone, setForgotPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  

  const [codigoRecuperacao, setCodigoRecuperacao] = useState("");

  const [errors, setErrors] = useState({ phone: "", password: "" });

  useEffect(() => {
    buscarConfiguracoesBackground();
  }, []);

  const buscarConfiguracoesBackground = async () => {
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
      console.log("A usar imagem local (Offline ou sem imagem na API).");
    } finally {
      setIsConfigLoaded(true);
    }
  };

  function validate() {
    let newErrors = { phone: "", password: "" };
    if (phoneRaw.length !== 11) newErrors.phone = "Número inválido";
    if (password.length < 8) newErrors.password = "Senha deve ter 8 caracteres";
    setErrors(newErrors);
    return !newErrors.phone && !newErrors.password;
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
      const url = "https://tailorkz-production-eu-amo.up.railway.app/api/cidadaos/login";
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

  // SOLICITA O CÓDIGO
  const handleRequestPasswordReset = async () => {
    const numeroLimpo = forgotPhone.replace(/\D/g, "");
    if (numeroLimpo.length < 11) {
      Alert.alert("Atenção", "Digite um número de celular válido com DDD.");
      return;
    }
    if (!cidadeSelecionada) {
      Alert.alert("Atenção", "Volte e escolha a sua cidade na tela inicial.");
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(
        `https://tailorkz-production-eu-amo.up.railway.app/api/cidadaos/recuperar-senha/solicitar?telefone=${numeroLimpo}&cidade=${cidadeSelecionada}`
      );
      
      setIsForgotModalVisible(false);
      setTimeout(() => setIsCodeModalVisible(true), 500);
    } catch (error) {
      Alert.alert("Erro", "Não encontramos uma conta com este número na sua cidade.");
    } finally {
      setIsLoading(false);
    }
  };

  // VALIDA O CÓDIGO NA HORA (NOVA TRAVA DE SEGURANÇA)
  const handleCodeConfirm = async (code: string) => {
    setIsLoading(true);
    try {
      const numeroLimpo = forgotPhone.replace(/\D/g, "");
      
      // Bate no Java para perguntar se o código que o cidadão digitou está certo
      await axios.post(
        `https://tailorkz-production-eu-amo.up.railway.app/api/cidadaos/recuperar-senha/validar-codigo?telefone=${numeroLimpo}&cidade=${cidadeSelecionada}&codigo=${code}`
      );
      
      // Se o Java responder OK, avança!
      setCodigoRecuperacao(code); 
      setNewPassword(""); 
      setIsCodeModalVisible(false);
      setTimeout(() => setIsNewPasswordModalVisible(true), 500);
      
    } catch (error) {
      // Se o Java devolver erro 401 (Código inválido), barra na hora!
      Alert.alert("Erro", "O código digitado está incorreto ou expirou.");
    } finally {
      setIsLoading(false);
    }
  };

  // ENVIA A NOVA SENHA E O CÓDIGO
  const saveRecoveredPassword = async () => {
    if (newPassword.length < 8) {
      Alert.alert("Atenção", "A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    setIsLoading(true);
    try {
      const numeroLimpo = forgotPhone.replace(/\D/g, "");
      
      await axios.put(
        `https://tailorkz-production-eu-amo.up.railway.app/api/cidadaos/recuperar-senha/alterar?telefone=${numeroLimpo}&cidade=${cidadeSelecionada}&codigo=${codigoRecuperacao}&novaSenha=${newPassword}`
      );
      
      Alert.alert("Sucesso!", "Sua senha foi redefinida. Faça o login para continuar.");
      setIsNewPasswordModalVisible(false);
      setNewPassword("");
      setForgotPhone("");
      setCodigoRecuperacao(""); 
    } catch (error) {
      Alert.alert("Erro", "Ocorreu um erro ao redefinir a senha.");
    } finally {
      setIsLoading(false);
    }
  };

  function handleIniciarCadastro(): void {
    throw new Error("Function not implemented.");
  }

  return (
    <View style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
              <Image source={assets.brasao} style={styles.logoMunicipio} />
              <Image source={assets.logo} style={styles.logo} />
              <Text style={styles.textoCuidado}>
                O cuidado com a cidade na palma da sua mão.
              </Text>
            </View>

            <Input
              placeholder="Número:"
              icon="call-outline"
              value={phone}
              keyboardType="numeric"
              error={errors.phone}
              onChangeText={(masked, unmasked) => {
                setPhone(masked);
                setPhoneRaw(unmasked || "");
              }}
              // <-- Máscara nova: (xx)xxxxx-xxxx (sem o espaço)
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

            <TouchableOpacity 
              style={styles.btnSecondary} 
              onPress={() => router.push("/cadastro")}
            >
              <Text style={styles.btnSecondaryText}>Quer criar uma conta? Clique aqui</Text>
            </TouchableOpacity>
          </KeyboardAwareScrollView>

          {!isConfigLoaded && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#1F41BB" />
            </View>
          )}

          <Modal
            visible={isForgotModalVisible}
            transparent
            animationType="slide"
          >
            <Pressable style={styles.modalOverlay} onPress={Keyboard.dismiss}>
              <Pressable style={styles.modalContent}>
                <Text style={styles.modalTitle}>Recuperar Senha</Text>
                <Text style={styles.modalSubtitle}>
                  Digite o número cadastrado. Enviaremos um código via SMS.
                </Text>
                
                <View style={{ width: "110%", alignSelf: "center", marginTop: 10 }}>
                  <Input
                    placeholder="(00) 00000-0000"
                    icon="phone-portrait-outline"
                    keyboardType="numeric"
                    value={forgotPhone}
                    onChangeText={(masked) => setForgotPhone(masked || "")}
                    mask={[
                      "(", /\d/, /\d/, ")", " ", /\d/, /\d/, /\d/, /\d/, /\d/, "-", /\d/, /\d/, /\d/, /\d/,
                    ]}
                  />
                </View>
                
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
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#FFF" />
                    ) : (
                      <Text style={styles.btnConfirmText}>Enviar</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </Pressable>
            </Pressable>
          </Modal>

          <CodeVerificationModal
            visible={isCodeModalVisible}
            onClose={() => setIsCodeModalVisible(false)}
            onConfirm={handleCodeConfirm}
            onResend={handleIniciarCadastro}
            description={`Enviamos um SMS com o código para o número: ${forgotPhone}`}
          />

          <Modal
            visible={isNewPasswordModalVisible}
            transparent
            animationType="slide"
          >
            <Pressable style={styles.modalOverlay} onPress={Keyboard.dismiss}>
              <Pressable style={styles.modalContent}>
                <Text style={styles.modalTitle}>Criar Nova Senha</Text>
                <Text style={styles.modalSubtitle}>
                  O código foi validado! Digite sua nova senha de acesso.
                </Text>
                
                <View style={{ width: "110%", alignSelf: "center", marginTop: 10 }}>
                  <Input
                    placeholder="Nova senha (min. 8)"
                    icon="lock-open-outline"
                    secureTextEntry
                    value={newPassword}
                    onChangeText={setNewPassword}
                  />
                </View>

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
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#FFF" />
                    ) : (
                      <Text style={styles.btnConfirmText}>Salvar Senha</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </Pressable>
            </Pressable>
          </Modal>
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
  btnSecondary: {
    marginTop: verticalScale(15),
    alignSelf: "center",
    
    marginBottom: verticalScale(20),
    backgroundColor: "#edededa7",
    paddingHorizontal: moderateScale(10),
    borderRadius: moderateScale(10),
    
  },
  btnSecondaryText: {
    color: "#39555c",
    fontSize: moderateScale(15),
    fontWeight: "600",
    textAlign: "center",
  },
  footerImageContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: -1,
  },
  footerImage: { width: "100%", height: Math.min(verticalScale(320), 340) },
  textoEsqueceu: {
    color: "#3A6C77",
    fontSize: moderateScale(13),
    fontWeight: "600",
    textAlign: "right",
    marginRight: moderateScale(20),
    paddingVertical: 10,
  },
  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "100%",
  },
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EDEDED",
    zIndex: 999,
  },
});