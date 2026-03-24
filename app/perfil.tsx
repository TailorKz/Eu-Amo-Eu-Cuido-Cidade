import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import {
  moderateScale,
  scale,
  verticalScale,
} from "../app/src/utils/responsive";

export default function Perfil() {
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <Text style={styles.title}>Perfil</Text>

      {/* NOME */}
      <View style={styles.card}>
        <View style={styles.row}>
          <Ionicons name="person-outline" size={moderateScale(20)} />
          <Text style={styles.label}>Nome completo</Text>
        </View>
        <Text style={styles.value}>Tailor Kz</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <FontAwesome6 name="tree-city" size={moderateScale(20)} color="#686868" />
          <Text style={styles.label}>Cidade</Text>
        </View>
        <Text style={styles.value}>Iporã do Oeste</Text>
      </View>

      {/* TELEFONE */}
      <View style={styles.card}>
        <View style={styles.row}>
          <Ionicons name="call-outline" size={moderateScale(20)} />
          <Text style={styles.label}>Número</Text>
        </View>

        <Text style={styles.value}>(49) 99999-9999</Text>

        <TouchableOpacity>
          <Text style={styles.link}>Alterar número</Text>
        </TouchableOpacity>
      </View>

      {/* ALTERAR SENHA */}
      <TouchableOpacity style={[styles.option, styles.senha]}>
        <Ionicons name="lock-closed-outline" size={moderateScale(20)} />
        <Text style={styles.optionText}>Alterar senha</Text>
      </TouchableOpacity>

      {/* BOTÃO SAIR */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => router.replace("/login")}
      >
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>

      {/* TERMOS */}
      <View style={styles.footer}>
        <TouchableOpacity>
          <Text style={styles.footerLink}>Termos de uso</Text>
        </TouchableOpacity>

        <TouchableOpacity>
          <Text style={styles.footerLink}>Política de privacidade</Text>
        </TouchableOpacity>

        <TouchableOpacity>
          <Text style={styles.deleteText}>Excluir conta</Text>
        </TouchableOpacity>
      </View>

      {/* MENU INFERIOR */}
      <View style={styles.bottomMenu}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/home")}
        >
          <Ionicons name="home-outline" size={moderateScale(22)} color="#555" />
          <Text style={styles.menuText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons
            name="document-text-outline"
            size={moderateScale(22)}
            color="#555"
          />
          <Text style={styles.menuText}>Reportos</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="person" size={moderateScale(22)} color="#1F41BB" />
          <Text style={[styles.menuText, { color: "#1F41BB" }]}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7F8",
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(50),
  },

  title: {
    fontSize: moderateScale(22),
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
    marginBottom: verticalScale(20),
    marginTop: verticalScale(30),
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: moderateScale(12),
    padding: moderateScale(15),
    marginBottom: verticalScale(12),

    elevation: 2,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
    marginBottom: verticalScale(5),
  },

  label: {
    fontSize: moderateScale(14),
    color: "#555",
    fontWeight: "600",
  },

  value: {
    fontSize: moderateScale(16),
    color: "#333",
  },

  link: {
    marginTop: verticalScale(6),
    color: "#1F41BB",
    fontSize: moderateScale(14),
    fontWeight: "600",
  },

  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
    marginTop: verticalScale(10),
  },

  optionText: {
    fontSize: moderateScale(16),
    color: "#333",
    fontWeight: "600",
  },
senha: {
  marginTop: moderateScale(20),
},
  logoutButton: {
    marginTop: verticalScale(55),
    backgroundColor: "#1F41BB",
    padding: moderateScale(15),
    borderRadius: moderateScale(10),
    alignItems: "center",
  },

  logoutText: {
    color: "#FFF",
    fontSize: moderateScale(16),
    fontWeight: "600",
  },

  footer: {
    marginTop: "auto",
    alignItems: "flex-start",
    marginBottom: verticalScale(120),
  },

  footerLink: {
    color: "#1F41BB",
    fontSize: moderateScale(14),
    marginBottom: verticalScale(8),
  },

  deleteText: {
    color: "#FF4D4F",
    fontSize: moderateScale(14),
    marginTop: verticalScale(10),
  },

  bottomMenu: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,

    height: verticalScale(70),
    backgroundColor: "#EDEDED",

    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",

    borderTopWidth: 1,
    borderColor: "#DDD",
  },

  menuItem: {
    alignItems: "center",
  },

  menuText: {
    fontSize: moderateScale(13),
    color: "#555",
    fontWeight: "600",
  },
});
