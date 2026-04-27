import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomMenu } from "./src/components/BottomMenu";
import { CodeVerificationModal } from "./src/components/CodeVerificationModal";
import { Input } from "./src/components/Input";
import { useAuthStore } from "./src/store/useAuthStore";
import {
  moderateScale,
  scale,
  scaledFont,
  verticalScale,
} from "./src/utils/responsive";

export default function Perfil() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const login = useAuthStore((state) => state.login);

  const [actionType, setActionType] = useState<"phone" | "delete">("phone");
  const [isCodeModalVisible, setIsCodeModalVisible] = useState(false);

  const [isSenhaAtualModalVisible, setIsSenhaAtualModalVisible] =
    useState(false);
  const [isNovoNumeroModalVisible, setIsNovoNumeroModalVisible] =
    useState(false);
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novoNumero, setNovoNumero] = useState("");

  const [isTrocarSenhaModalVisible, setIsTrocarSenhaModalVisible] =
    useState(false);
  const [senhaAtualTroca, setSenhaAtualTroca] = useState("");
  const [novaSenhaTroca, setNovaSenhaTroca] = useState("");
  const [confirmaNovaSenhaTroca, setConfirmaNovaSenhaTroca] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const API_URL =
    "https://tailorkz-production-eu-amo.up.railway.app/api/cidadaos";

  // ALTERAR SENHA
  const iniciarTrocaSenha = () => {
    setSenhaAtualTroca("");
    setNovaSenhaTroca("");
    setConfirmaNovaSenhaTroca("");
    setIsTrocarSenhaModalVisible(true);
  };

  const salvarNovaSenha = async () => {
    if (!senhaAtualTroca)
      return Alert.alert("Atenção", "Digite sua senha atual.");
    if (novaSenhaTroca.length < 8)
      return Alert.alert(
        "Atenção",
        "A nova senha deve ter pelo menos 8 caracteres.",
      );
    if (novaSenhaTroca !== confirmaNovaSenhaTroca)
      return Alert.alert(
        "Atenção",
        "A nova senha e a confirmação não coincidem.",
      );

    setIsLoading(true);
    try {
      await axios.post(
        `${API_URL}/${user?.id}/verificar-senha`,
        senhaAtualTroca,
        {
          headers: { "Content-Type": "text/plain" },
        },
      );

      await axios.put(
        `${API_URL}/${user?.id}/alterar-senha-direta?novaSenha=${novaSenhaTroca}`,
      );

      Alert.alert("Sucesso!", "Sua senha foi alterada com segurança.");
      setIsTrocarSenhaModalVisible(false);
    } catch (error) {
      Alert.alert("Erro", "A senha atual está incorreta ou houve um erro.");
    } finally {
      setIsLoading(false);
    }
  };

  // VERIFICAR SENHA ATUAL
  const iniciarTrocaNumero = () => {
    setActionType("phone");
    setSenhaAtual("");
    setIsSenhaAtualModalVisible(true);
  };

  const iniciarExclusaoConta = () => {
    setActionType("delete");
    setSenhaAtual("");
    setIsSenhaAtualModalVisible(true);
  };

  const confirmarSenhaAtual = async () => {
    if (!senhaAtual)
      return Alert.alert("Atenção", "Digite sua senha para continuar.");

    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/${user?.id}/verificar-senha`, senhaAtual, {
        headers: { "Content-Type": "text/plain" },
      });

      setIsSenhaAtualModalVisible(false);
      setSenhaAtual("");

      if (actionType === "phone") {
        setTimeout(() => setIsNovoNumeroModalVisible(true), 500);
      } else if (actionType === "delete") {
        await axios.post(`${API_URL}/${user?.id}/solicitar-codigo?tipo=SENHA`);
        setTimeout(() => setIsCodeModalVisible(true), 500);
      }
    } catch (error) {
      Alert.alert("Acesso Negado", "A senha atual está incorreta.");
    } finally {
      setIsLoading(false);
    }
  };

  // NOVO NÚMERO
  const solicitarCodigoNovoNumero = async () => {
    const numeroLimpo = novoNumero.replace(/\D/g, "");
    if (numeroLimpo.length < 11)
      return Alert.alert("Atenção", "Digite um celular válido.");

    setIsLoading(true);
    try {
      await axios.post(
        `${API_URL}/${user?.id}/solicitar-codigo?tipo=NUMERO&novoNumero=${numeroLimpo}`,
      );
      setIsNovoNumeroModalVisible(false);
      setTimeout(() => setIsCodeModalVisible(true), 500);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível enviar o código.");
    } finally {
      setIsLoading(false);
    }
  };

  // VALIDAR O CÓDIGO
  const handleCodeConfirm = async (code: string) => {
    setIsCodeModalVisible(false);

    if (actionType === "phone") {
      setIsLoading(true);
      try {
        const numeroLimpo = novoNumero.replace(/\D/g, "");
        const response = await axios.put(
          `${API_URL}/${user?.id}/alterar-numero?codigo=${code}&novoNumero=${numeroLimpo}`,
        );
        login(response.data);
        Alert.alert(
          "Sucesso!",
          `Seu número foi atualizado para ${novoNumero}.`,
        );
        setNovoNumero("");
      } catch (error) {
        Alert.alert("Erro", "Código inválido.");
      } finally {
        setIsLoading(false);
      }
    } else if (actionType === "delete") {
      setIsLoading(true);
      try {
        await axios.delete(
          `${API_URL}/${user?.id}/excluir-conta?codigo=${code}`,
        );
        Alert.alert(
          "Conta Excluída",
          "Sua conta e dados foram apagados com sucesso.",
        );
        logout();
        router.replace("/");
      } catch (error) {
        Alert.alert("Erro", "Código inválido. Exclusão cancelada.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.pageTitle}>Meu Perfil</Text>

       <View style={styles.headerProfile}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.nome ? user.nome.charAt(0).toUpperCase() : "U"}
            </Text>
          </View>
          <Text 
            style={styles.userName} 
            numberOfLines={2} 
            adjustsFontSizeToFit 
          >
            {user?.nome || "Usuário"}
          </Text>
          <View style={styles.cityBadge}>
            <Ionicons
              name="location-sharp"
              size={moderateScale(14)}
              color="#1F41BB"
            />
            <Text style={styles.cityText}>
              {user?.cidade || "Cidade não definida"}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Dados da Conta</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={styles.iconBox}>
                <Ionicons
                  name="person-outline"
                  size={moderateScale(18)}
                  color="#555"
                />
              </View>
              <Text style={styles.label}>Nome completo</Text>
            </View>
            <Text style={styles.value}>{user?.nome}</Text>
          </View>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.6}
            onPress={iniciarTrocaNumero}
            disabled={isLoading}
          >
            <View style={styles.rowLeft}>
              <View style={styles.iconBox}>
                <Ionicons
                  name="call-outline"
                  size={moderateScale(18)}
                  color="#555"
                />
              </View>
              <View>
                <Text style={styles.label}>Número de Celular</Text>
                <Text style={styles.valuePhone}>{user?.telefone}</Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={moderateScale(20)}
              color="#CCC"
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Segurança</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.6}
            onPress={iniciarTrocaSenha}
            disabled={isLoading}
          >
            <View style={styles.rowLeft}>
              <View style={styles.iconBox}>
                <Ionicons
                  name="lock-closed-outline"
                  size={moderateScale(18)}
                  color="#555"
                />
              </View>
              <Text style={styles.label}>Alterar Senha</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={moderateScale(20)}
              color="#CCC"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.footerArea}>
          <View style={styles.footerLinks}>
            <TouchableOpacity onPress={() => router.push("/termos")}>
              <Text style={styles.footerLinkText}>Termos de uso</Text>
            </TouchableOpacity>
            <Text style={styles.footerDot}>•</Text>
            <TouchableOpacity onPress={() => router.push("/privacidade")}>
              <Text style={styles.footerLinkText}>Privacidade</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.deleteAccountBtn}
            onPress={iniciarExclusaoConta}
            disabled={isLoading}
          >
            <Text style={styles.deleteAccountText}>Excluir minha conta</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => {
              logout();
              router.replace("/");
            }}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons
                  name="log-out-outline"
                  size={moderateScale(22)}
                  color="#ffffff"
                />
                <Text style={styles.logoutText}>Sair do Aplicativo</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomMenu activeRoute="perfil" />

      {/*  MODAL PARA TROCA DIRETA DE SENHA */}
      <Modal
        visible={isTrocarSenhaModalVisible}
        transparent
        animationType="slide"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback
              onPress={Keyboard.dismiss}
              accessible={false}
            >
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Alterar Senha</Text>
                <Text style={styles.modalSubtitle}>
                  Digite sua senha atual e a nova senha desejada.
                </Text>

                <View
                  style={{ width: "110%", alignSelf: "center", marginTop: 10 }}
                >
                  <Input
                    placeholder="Senha atual"
                    icon="key-outline"
                    secureTextEntry
                    value={senhaAtualTroca}
                    onChangeText={setSenhaAtualTroca}
                  />
                  <Input
                    placeholder="Nova senha (min. 8)"
                    icon="lock-closed-outline"
                    secureTextEntry
                    value={novaSenhaTroca}
                    onChangeText={setNovaSenhaTroca}
                  />
                  <Input
                    placeholder="Confirme nova senha"
                    icon="checkmark-circle-outline"
                    secureTextEntry
                    value={confirmaNovaSenhaTroca}
                    onChangeText={setConfirmaNovaSenhaTroca}
                  />
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.btnCancel}
                    onPress={() => setIsTrocarSenhaModalVisible(false)}
                  >
                    <Text style={styles.btnCancelText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.btnConfirm}
                    onPress={salvarNovaSenha}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#FFF" />
                    ) : (
                      <Text style={styles.btnConfirmText}>Salvar</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <CodeVerificationModal
        visible={isCodeModalVisible}
        onClose={() => setIsCodeModalVisible(false)}
        onConfirm={handleCodeConfirm}
        description={
          actionType === "phone"
            ? `Enviamos um código SMS para o número: ${novoNumero}`
            : `Enviamos um código SMS para o seu número: ${user?.telefone}`
        }
      />

      {/*  MODAL DE SENHA ATUAL */}
      <Modal
        visible={isSenhaAtualModalVisible}
        transparent
        animationType="fade"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback
              onPress={Keyboard.dismiss}
              accessible={false}
            >
              <View style={styles.modalContent}>
                <Ionicons
                  name={
                    actionType === "delete" ? "warning" : "shield-checkmark"
                  }
                  size={40}
                  color={actionType === "delete" ? "#FF3B30" : "#1F41BB"}
                  style={{ alignSelf: "center", marginBottom: 10 }}
                />
                <Text style={styles.modalTitle}>Confirme sua Identidade</Text>
                <Text style={styles.modalSubtitle}>
                  {actionType === "delete"
                    ? "Para EXCLUIR sua conta permanentemente, digite sua senha atual."
                    : "Para alterar o número, digite sua senha atual."}
                </Text>

                <View
                  style={{ width: "110%", alignSelf: "center", marginTop: 10 }}
                >
                  <Input
                    placeholder="Digite sua senha atual"
                    icon="lock-closed-outline"
                    secureTextEntry
                    value={senhaAtual}
                    onChangeText={setSenhaAtual}
                  />
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.btnCancel}
                    onPress={() => setIsSenhaAtualModalVisible(false)}
                  >
                    <Text style={styles.btnCancelText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.btnConfirm,
                      actionType === "delete" && { backgroundColor: "#FF3B30" },
                    ]}
                    onPress={confirmarSenhaAtual}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#FFF" />
                    ) : (
                      <Text style={styles.btnConfirmText}>Avançar</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <CodeVerificationModal
        visible={isCodeModalVisible}
        onClose={() => setIsCodeModalVisible(false)}
        onConfirm={handleCodeConfirm}
        onResend={
          actionType === "phone"
            ? solicitarCodigoNovoNumero
            : confirmarSenhaAtual
        }
        description={
          actionType === "phone"
            ? `Enviamos um SMS para o número: ${novoNumero}`
            : `Enviamos um SMS para o seu número ${user?.telefone}`
        }
      />

      {/*  MODAL DE NOVO NÚMERO */}
      <Modal
        visible={isNovoNumeroModalVisible}
        transparent
        animationType="slide"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback
              onPress={Keyboard.dismiss}
              accessible={false}
            >
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Novo Número</Text>
                <Text style={styles.modalSubtitle}>
                  Enviaremos um SMS para este novo número:
                </Text>

                <View
                  style={{ width: "110%", alignSelf: "center", marginTop: 10 }}
                >
                  <Input
                    placeholder="(00) 00000-0000"
                    icon="call-outline"
                    keyboardType="numeric"
                    value={novoNumero}
                    onChangeText={(masked) => setNovoNumero(masked || "")}
                    mask={[
                      "(",
                      /\d/,
                      /\d/,
                      ")",
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
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.btnCancel}
                    onPress={() => setIsNovoNumeroModalVisible(false)}
                  >
                    <Text style={styles.btnCancelText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.btnConfirm}
                    onPress={solicitarCodigoNovoNumero}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#FFF" />
                    ) : (
                      <Text style={styles.btnConfirmText}>Avançar</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F4F7F8" },
  container: {
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(120),
  },
  pageTitle: {
    fontSize: scaledFont(28),
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
    marginBottom: verticalScale(25),
  },
  headerProfile: { alignItems: "center", marginBottom: verticalScale(30) },
  avatar: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(40),
    backgroundColor: "#1F41BB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: verticalScale(10),
    elevation: 3,
  },
  avatarText: {
    color: "#FFF",
    fontSize: scaledFont(30),
    fontWeight: "bold",
  },
  userName: {
    fontSize: scaledFont(22),
    fontWeight: "700",
    color: "#222",
    textTransform: "capitalize",
    textAlign: "center",
    maxWidth: "85%",
  },
  cityBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E4EBF7",
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(15),
    marginTop: verticalScale(6),
  },
  cityText: {
    marginLeft: scale(4),
    color: "#1F41BB",
    fontSize: scaledFont(15),
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: scaledFont(18),
    color: "#888",
    fontWeight: "600",
    marginLeft: scale(5),
    marginBottom: verticalScale(8),
    textTransform: "uppercase",
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: moderateScale(16),
    paddingVertical: verticalScale(5),
    marginBottom: verticalScale(25),
    elevation: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(16),
  },
  rowLeft: { flexDirection: "row", alignItems: "center" },
  iconBox: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(10),
    backgroundColor: "#F0F4F8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(12),
  },
  label: { fontSize: scaledFont(15), color: "#333", fontWeight: "500" },
  value: { fontSize: scaledFont(15), color: "#666", fontWeight: "400" },
  valuePhone: {
    fontSize: scaledFont(14),
    color: "#1F41BB",
    fontWeight: "600",
    marginTop: verticalScale(2),
  },
  divider: { height: 1, backgroundColor: "#F0F0F0", marginLeft: scale(64) },
  footerArea: { marginTop: verticalScale(10), alignItems: "center" },
  footerLinks: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(25),
  },
  footerLinkText: {
    color: "#1F41BB",
    fontSize: scaledFont(14),
    fontWeight: "500",
  },
  footerDot: {
    color: "#CCC",
    marginHorizontal: scale(10),
    fontSize: scaledFont(16),
  },
  deleteAccountBtn: {
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(20),
    marginBottom: verticalScale(30),
  },
  deleteAccountText: {
    color: "#FF3B30",
    fontSize: scaledFont(15),
    fontWeight: "500",
    textDecorationLine: "underline",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3156df",
    width: "100%",
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(12),
  },
  logoutText: {
    marginLeft: scale(8),
    color: "#ffffff",
    fontSize: scaledFont(16),
    fontWeight: "600",
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
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 10,
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
});
