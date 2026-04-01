import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "./src/utils/responsive";

export default function Termos() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={moderateScale(24)}
            color="#1F41BB"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Termos de Uso</Text>
        <View style={{ width: moderateScale(24) }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>1. Aceitação dos Termos</Text>
        <Text style={styles.paragraph}>
          Ao baixar, acessar ou utilizar o aplicativo, você concorda em ficar
          vinculado a estes Termos de Uso. Se você não concordar com qualquer
          parte destes termos, não deve utilizar o nosso aplicativo.
        </Text>

        <Text style={styles.title}>2. Uso do Aplicativo</Text>
        <Text style={styles.paragraph}>
          Este aplicativo foi desenvolvido para facilitar a comunicação entre
          cidadãos e a prefeitura local. Você concorda em usar o serviço apenas
          para reportar problemas reais da cidade (como buracos, iluminação
          pública, saneamento, etc).
        </Text>

        <Text style={styles.title}>3. Responsabilidades do Usuário</Text>
        <Text style={styles.paragraph}>
          Você é responsável por manter a confidencialidade da sua senha e
          conta. É estritamente proibido fazer reportes falsos, usar linguagem
          ofensiva ou enviar imagens impróprias. O descumprimento pode levar ao
          banimento da plataforma.
        </Text>

        <Text style={styles.title}>4. Modificações do Serviço</Text>
        <Text style={styles.paragraph}>
          Reservamo-nos o direito de modificar, suspender ou descontinuar o
          aplicativo (ou qualquer parte dele) a qualquer momento, com ou sem
          aviso prévio.
        </Text>

        <Text style={styles.updateText}>
          Última atualização: 01 de Abril de 2026
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(15),
    paddingHorizontal: scale(16),
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  backButton: { padding: moderateScale(5) },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: "700",
    color: "#333",
  },
  container: { padding: scale(20), paddingBottom: verticalScale(40) },
  title: {
    fontSize: moderateScale(18),
    fontWeight: "bold",
    color: "#1F41BB",
    marginBottom: verticalScale(10),
    marginTop: verticalScale(15),
  },
  paragraph: {
    fontSize: moderateScale(15),
    color: "#555",
    lineHeight: moderateScale(22),
    textAlign: "justify",
  },
  updateText: {
    fontSize: moderateScale(13),
    color: "#999",
    marginTop: verticalScale(40),
    fontStyle: "italic",
    textAlign: "center",
  },
});
