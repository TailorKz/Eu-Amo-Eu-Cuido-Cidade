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

export default function Privacidade() {
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
        <Text style={styles.headerTitle}>Política de Privacidade</Text>
        <View style={{ width: moderateScale(24) }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>1. Coleta de Dados</Text>
        <Text style={styles.paragraph}>
          Em conformidade com a LGPD (Lei Geral de Proteção de Dados),
          informamos que coletamos dados pessoais mínimos para o funcionamento
          do aplicativo, como Nome, Número de Telefone e a Cidade de residência.
        </Text>

        <Text style={styles.title}>2. Uso da Localização (GPS)</Text>
        <Text style={styles.paragraph}>
          O aplicativo solicita permissão para acessar a sua localização exata
          apenas no momento em que você cria uma solicitação. Essa informação é
          vital para que a equipe da prefeitura encontre o problema reportado.
          Não rastreamos a sua localização em segundo plano.
        </Text>

        <Text style={styles.title}>3. Uso de Imagens (Câmera)</Text>
        <Text style={styles.paragraph}>
          As imagens capturadas pela sua câmera dentro do aplicativo são
          enviadas diretamente para o nosso servidor seguro e anexadas à sua
          solicitação pública. Não acessamos a sua galeria de fotos privada.
        </Text>

        <Text style={styles.title}>4. Exclusão de Dados</Text>
        <Text style={styles.paragraph}>
          Você tem o direito de solicitar a exclusão permanente da sua conta e
          de todos os seus dados a qualquer momento, através da opção &quot;Excluir
          minha conta&quot; disponível no seu Perfil.
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
