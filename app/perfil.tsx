import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "./src/store/useAuthStore";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CodeVerificationModal } from "./src/components/CodeVerificationModal";
import { BottomMenu } from "./src/components/BottomMenu";
import { moderateScale, scale, verticalScale } from "./src/utils/responsive";

export default function Perfil() {
  const [modalVisible, setModalVisible] = useState(false);
  const [actionType, setActionType] = useState<"phone" | "password" | "delete">("phone");
  const logout = useAuthStore((state) => state.logout);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Meu Perfil</Text>

        {/* HEADER / AVATAR */}
        <View style={styles.headerProfile}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>TK</Text>
          </View>
          <Text style={styles.userName}>Tailor Kz</Text>
          <View style={styles.cityBadge}>
            <Ionicons name="location-sharp" size={moderateScale(14)} color="#1F41BB" />
            <Text style={styles.cityText}>Iporã do Oeste, SC</Text>
          </View>
        </View>

        {/* SEÇÃO 1: DADOS DA CONTA */}
        <Text style={styles.sectionTitle}>Dados da Conta</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={styles.iconBox}>
                <Ionicons name="person-outline" size={moderateScale(18)} color="#555" />
              </View>
              <Text style={styles.label}>Nome completo</Text>
            </View>
            <Text style={styles.value}>Tailor Kz</Text>
          </View>

          <View style={styles.divider} />

          {/* O campo de número agora funciona como um botão em formato de lista */}
          <TouchableOpacity 
            style={styles.row} 
            activeOpacity={0.6}
            onPress={() => {
              setActionType("phone");
              setModalVisible(true);
            }}
          >
            <View style={styles.rowLeft}>
              <View style={styles.iconBox}>
                <Ionicons name="call-outline" size={moderateScale(18)} color="#555" />
              </View>
              <View>
                <Text style={styles.label}>Número de Celular</Text>
                <Text style={styles.valuePhone}>(49) 99999-9999</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={moderateScale(20)} color="#CCC" />
          </TouchableOpacity>
        </View>

        {/* SEÇÃO 2: SEGURANÇA */}
        <Text style={styles.sectionTitle}>Segurança</Text>
        <View style={styles.card}>
          <TouchableOpacity 
            style={styles.row} 
            activeOpacity={0.6}
            onPress={() => {
              setActionType("password");
              setModalVisible(true);
            }}
          >
            <View style={styles.rowLeft}>
              <View style={styles.iconBox}>
                <Ionicons name="lock-closed-outline" size={moderateScale(18)} color="#555" />
              </View>
              <Text style={styles.label}>Alterar Senha</Text>
            </View>
            <Ionicons name="chevron-forward" size={moderateScale(20)} color="#CCC" />
          </TouchableOpacity>
        </View>

        {/* ÁREA DE RODAPÉ (Links e Ações Destrutivas) */}
        <View style={styles.footerArea}>
          <View style={styles.footerLinks}>
            <TouchableOpacity>
              <Text style={styles.footerLinkText}>Termos de uso</Text>
            </TouchableOpacity>
            <Text style={styles.footerDot}>•</Text>
            <TouchableOpacity>
              <Text style={styles.footerLinkText}>Privacidade</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.deleteAccountBtn}
            onPress={() => {
              setActionType("delete");
              setModalVisible(true);
            }}
          >
            <Text style={styles.deleteAccountText}>Excluir minha conta</Text>
          </TouchableOpacity>

          {/* BOTÃO DE SAIR NO FUNDO DA PÁGINA */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => {
              logout(); // 1. Apaga os dados do HD do celular
              router.replace("/"); // 2. Manda de volta pra tela inicial
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={moderateScale(22)} color="#ffffff" />
            <Text style={styles.logoutText}>Sair do Aplicativo</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* MENU INFERIOR COMPONENTIZADO */}
      <BottomMenu activeRoute="perfil" />

      {/* MODAL DE VERIFICAÇÃO */}
      <CodeVerificationModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={(code) => {
          console.log("Código:", code);

          if (actionType === "phone") console.log("Alterar número");
          if (actionType === "password") console.log("Alterar senha");
          if (actionType === "delete") console.log("Excluir conta");

          setModalVisible(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F4F7F8" },
  container: {
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(120), // Garante que o scroll passe do BottomMenu
  },

  pageTitle: {
    fontSize: moderateScale(24),
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
    marginBottom: verticalScale(25),
  },

  // ESTILOS DO HEADER DO PERFIL
  headerProfile: {
    alignItems: "center",
    marginBottom: verticalScale(30),
  },
  avatar: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(40),
    backgroundColor: "#1F41BB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: verticalScale(10),
    elevation: 3,
    shadowColor: "#1F41BB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  avatarText: {
    color: "#FFF",
    fontSize: moderateScale(30),
    fontWeight: "bold",
  },
  userName: {
    fontSize: moderateScale(22),
    fontWeight: "700",
    color: "#222",
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

  // ESTILOS DOS CARDS (Configurações)
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(16),
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(10),
    backgroundColor: "#F0F4F8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(12),
  },
  label: {
    fontSize: moderateScale(15),
    color: "#333",
    fontWeight: "500",
  },
  value: {
    fontSize: moderateScale(15),
    color: "#666",
    fontWeight: "400",
  },
  valuePhone: {
    fontSize: moderateScale(14),
    color: "#1F41BB",
    fontWeight: "600",
    marginTop: verticalScale(2),
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginLeft: scale(64), // Alinha a linha divisória com o texto, deixando o ícone livre (Padrão Apple)
  },

  // RODAPÉ E BOTÕES
  footerArea: {
    marginTop: verticalScale(10),
    alignItems: "center",
  },
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
    borderWidth: 1,
    borderColor: "#FFD2D0",
  },
  logoutText: {
    marginLeft: scale(8),
    color: "#ffffff",
    fontSize: moderateScale(16),
    fontWeight: "600",
  },
});