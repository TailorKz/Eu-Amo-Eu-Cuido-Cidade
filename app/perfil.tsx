import { Ionicons } from "@expo/vector-icons";
import axios from "axios"; // 🔴 IMPORTAMOS O AXIOS
import { router } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import MaskInput from "react-native-mask-input";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomMenu } from "./src/components/BottomMenu";
import { CodeVerificationModal } from "./src/components/CodeVerificationModal";
import { useAuthStore } from "./src/store/useAuthStore";
import { moderateScale, scale, verticalScale } from "./src/utils/responsive";

export default function Perfil() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const login = useAuthStore((state) => state.login); // Para atualizar os dados localmente

  const [actionType, setActionType] = useState<"phone" | "password" | "delete">(
    "phone",
  );
  const [isCodeModalVisible, setIsCodeModalVisible] = useState(false);

  const [isSenhaAtualModalVisible, setIsSenhaAtualModalVisible] =
    useState(false);
  const [isNovoNumeroModalVisible, setIsNovoNumeroModalVisible] =
    useState(false);
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novoNumero, setNovoNumero] = useState("");

  const [isNovaSenhaModalVisible, setIsNovaSenhaModalVisible] = useState(false);
  const [novaSenha, setNovaSenha] = useState("");
  const [codigoValidado, setCodigoValidado] = useState("");

  const [isLoading, setIsLoading] = useState(false); // Para mostrar que está a carregar

  const API_URL =
    "https://tailorkz-production-eu-amo.up.railway.app/api/cidadaos";

  // ==========================================
  // 1. ALTERAR SENHA
  // ==========================================
  const iniciarTrocaSenha = async () => {
    setActionType("password");
    setIsLoading(true);
    try {
      // 🔴 CHAMA O JAVA PARA GERAR O CÓDIGO E MANDAR O WHATSAPP
      await axios.post(`${API_URL}/${user?.id}/solicitar-codigo?tipo=SENHA`);
      setIsCodeModalVisible(true);
    } catch (error) {
      Alert.alert(
        "Erro",
        "Não foi possível solicitar o código. Tente novamente.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const salvarNovaSenha = async () => {
    if (novaSenha.length < 6) {
      Alert.alert("Atenção", "A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    setIsLoading(true);
    try {
      // 🔴 CHAMA O JAVA PARA ALTERAR A SENHA
      await axios.put(
        `${API_URL}/${user?.id}/alterar-senha?codigo=${codigoValidado}&novaSenha=${novaSenha}`,
      );
      Alert.alert("Sucesso!", "Sua senha foi alterada com segurança.");
      setIsNovaSenhaModalVisible(false);
      setNovaSenha("");
    } catch (error) {
      Alert.alert("Erro", "Código inválido ou expirado.");
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // 2. VERIFICAR SENHA ATUAL (SEGURANÇA)
  // ==========================================
  const iniciarTrocaNumero = () => {
    setActionType("phone");
    setIsSenhaAtualModalVisible(true);
  };

  const iniciarExclusaoConta = () => {
    setActionType("delete");
    setIsSenhaAtualModalVisible(true);
  };

  const confirmarSenhaAtual = async () => {
    if (!senhaAtual)
      return Alert.alert("Atenção", "Digite sua senha para continuar.");

    setIsLoading(true);
    try {
      // 🔴 CHAMA O JAVA PARA VERIFICAR SE A SENHA BATE COM A DO BANCO
      await axios.post(`${API_URL}/${user?.id}/verificar-senha`, senhaAtual, {
        headers: { "Content-Type": "text/plain" },
      });

      setIsSenhaAtualModalVisible(false);
      setSenhaAtual("");

      // Se a senha estiver correta, avança para o próximo passo
      if (actionType === "phone") {
        setTimeout(() => setIsNovoNumeroModalVisible(true), 500);
      } else if (actionType === "delete") {
        // Se for para deletar, já pede o código para o número atual
        await axios.post(`${API_URL}/${user?.id}/solicitar-codigo?tipo=SENHA`);
        setTimeout(() => setIsCodeModalVisible(true), 500);
      }
    } catch (error) {
      Alert.alert("Acesso Negado", "A senha atual está incorreta.");
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // 3. NOVO NÚMERO
  // ==========================================
  const solicitarCodigoNovoNumero = async () => {
    const numeroLimpo = novoNumero.replace(/\D/g, "");
    if (numeroLimpo.length < 11)
      return Alert.alert("Atenção", "Digite um celular válido.");

    setIsLoading(true);
    try {
      // 🔴 CHAMA O JAVA PARA MANDAR O CÓDIGO PARA O *NOVO* NÚMERO
      await axios.post(
        `${API_URL}/${user?.id}/solicitar-codigo?tipo=NUMERO&novoNumero=${numeroLimpo}`,
      );
      setIsNovoNumeroModalVisible(false);
      setTimeout(() => setIsCodeModalVisible(true), 500);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível enviar o código para este número.");
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // 4. VALIDAR O CÓDIGO DE 4 DÍGITOS
  // ==========================================
  const handleCodeConfirm = async (code: string) => {
    setIsCodeModalVisible(false);

    if (actionType === "password") {
      setCodigoValidado(code);
      setTimeout(() => setIsNovaSenhaModalVisible(true), 500);
    } else if (actionType === "phone") {
      setIsLoading(true);
      try {
        const numeroLimpo = novoNumero.replace(/\D/g, "");
        // 🔴 CHAMA O JAVA PARA SALVAR O NOVO NÚMERO E ATUALIZA A MEMÓRIA DO APP
        const response = await axios.put(
          `${API_URL}/${user?.id}/alterar-numero?codigo=${code}&novoNumero=${numeroLimpo}`,
        );
        login(response.data); // Atualiza o Zustand com o novo telefone para aparecer na tela na hora!
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
        // 🔴 CHAMA O JAVA PARA APAGAR A CONTA DEFINITIVAMENTE
        await axios.delete(
          `${API_URL}/${user?.id}/excluir-conta?codigo=${code}`,
        );
        Alert.alert(
          "Conta Excluída",
          "Sua conta e todos os seus dados foram apagados com sucesso.",
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
      >
        <Text style={styles.pageTitle}>Meu Perfil</Text>

        <View style={styles.headerProfile}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.nome ? user.nome.charAt(0).toUpperCase() : "U"}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.nome || "Usuário"}</Text>
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

      {/* MODAIS (MANTIDAS EXATAMENTE IGUAIS) */}
      <CodeVerificationModal
        visible={isCodeModalVisible}
        onClose={() => setIsCodeModalVisible(false)}
        onConfirm={handleCodeConfirm}
        description={
          actionType === "phone"
            ? `Enviamos um código no Whatsapp do número: ${novoNumero}`
            : `Enviamos um código no Whatsapp do seu número ${user?.telefone}`
        }
      />

      <Modal
        visible={isSenhaAtualModalVisible}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons
              name={actionType === "delete" ? "warning" : "shield-checkmark"}
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

            <TextInput
              style={styles.input}
              placeholder="Sua senha atual"
              secureTextEntry
              value={senhaAtual}
              onChangeText={setSenhaAtual}
            />

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
        </View>
      </Modal>

      <Modal
        visible={isNovoNumeroModalVisible}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Novo Número</Text>
            <Text style={styles.modalSubtitle}>
              Enviaremos um SMS no seu Whatsapp para este novo número:
            </Text>

            <MaskInput
              style={styles.input}
              placeholder="(00) 00000-0000"
              keyboardType="numeric"
              value={novoNumero}
              onChangeText={(masked) => setNovoNumero(masked)}
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
        </View>
      </Modal>

      <Modal
        visible={isNovaSenhaModalVisible}
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
              style={styles.input}
              placeholder="Nova senha (min. 6 caracteres)"
              secureTextEntry
              value={novaSenha}
              onChangeText={setNovaSenha}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.btnCancel}
                onPress={() => setIsNovaSenhaModalVisible(false)}
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
                  <Text style={styles.btnConfirmText}>Salvar Senha</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
    fontSize: moderateScale(24),
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
    fontSize: moderateScale(30),
    fontWeight: "bold",
  },
  userName: {
    fontSize: moderateScale(22),
    fontWeight: "700",
    color: "#22",
    textTransform: "capitalize",
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
    fontSize: moderateScale(13),
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: moderateScale(14),
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
  label: { fontSize: moderateScale(15), color: "#333", fontWeight: "500" },
  value: { fontSize: moderateScale(15), color: "#666", fontWeight: "400" },
  valuePhone: {
    fontSize: moderateScale(14),
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
    fontSize: moderateScale(14),
    fontWeight: "500",
  },
  footerDot: {
    color: "#CCC",
    marginHorizontal: scale(10),
    fontSize: moderateScale(16),
  },
  deleteAccountBtn: {
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(20),
    marginBottom: verticalScale(30),
  },
  deleteAccountText: {
    color: "#FF3B30",
    fontSize: moderateScale(15),
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
    fontSize: moderateScale(16),
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
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  input: {
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
