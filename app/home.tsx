import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import {
    moderateScale,
    scale,
    scaledFont,
    verticalScale,
} from "../app/src/utils/responsive";
import { BottomMenu } from "./src/components/BottomMenu";
import { useAuthStore } from "./src/store/useAuthStore";

import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface Setor {
  id: number;
  nome: string;
  icone: string;
}

const imagensPadrao: Record<string, any> = {
  Infraestrutura: require("../assets/images/infra.png"),
  "Iluminação Pública": require("../assets/images/ilum.png"),
  "Urbanismo": require("../assets/images/urbanismo.png"),
  "Limpeza Urbana": require("../assets/images/limpeza.png"),
  "Saneamento e água": require("../assets/images/saneamento.png"),
  "Saúde Pública": require("../assets/images/saude.png"),
};

const formatarNomeSetor = (nome: string) => {
  if (!nome) return "";

  if (nome === "Saúde Pública" || nome === "Saúde Pública e Vigilância") {
    return "Saúde Pública\ne Vigilância";
  }

  if (nome === "Saneamento e água" || nome === "Saneamento e Água") return "Saneamento\ne Água";
  if (nome === "Iluminação Pública") return "Iluminação\nPública";
  if (nome === "Limpeza Urbana" || nome === "Limpeza") return "Limpeza\nUrbana";

  // Se for qualquer outro setor com 2 ou mais palavras, quebra no meio
  const palavras = nome.split(" ");
  if (palavras.length === 2) {
    return `${palavras[0]}\n${palavras[1]}`;
  } else if (palavras.length > 2) {
    const meio = Math.ceil(palavras.length / 2);
    return palavras.slice(0, meio).join(" ") + "\n" + palavras.slice(meio).join(" ");
  }

  // Se for só 1 palavra retorna normal
  return nome;
};

export default function Home() {
  const user = useAuthStore((state) => state.user);
  const cidadeSelecionada = useAuthStore((state) => state.cidadeSelecionada) || user?.cidade;

  const [modalAvisoVisible, setModalAvisoVisible] = useState(false);
  const [tituloAviso, setTituloAviso] = useState("");
  const [mensagemAviso, setMensagemAviso] = useState("");

  const [setores, setSetores] = useState<Setor[]>([]);
  const [isLoadingSetores, setIsLoadingSetores] = useState(true);

  useEffect(() => {
    verificarAvisosPrefeitura();
    carregarSetores();
    registrarParaPushNotifications();
  }, []);

  const registrarParaPushNotifications = async () => {
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Permissão para notificações negada!");
        return;
      }

      try {
        const projectId =
          Constants.expoConfig?.extra?.eas?.projectId ??
          Constants.easConfig?.projectId;

        if (!projectId) {
          console.log("⚠️ Project ID não encontrado. Você rodou 'npx eas-cli init'?");
          return;
        }

        const tokenData = await Notifications.getExpoPushTokenAsync({
          projectId: projectId,
        });
        const token = tokenData.data;

        if (user?.id) {
          await axios.put(
            `https://tailorkz-production-eu-amo.up.railway.app/api/cidadaos/${user.id}/push-token`,
            token,
            { headers: { "Content-Type": "text/plain" } },
          );
        }
      } catch (error) {
        console.log(" Erro ao gerar token:", error);
      }
    }
  };

 const verificarAvisosPrefeitura = async () => {
    if (!cidadeSelecionada) return;

    try {
      const response = await axios.get(
        `https://tailorkz-production-eu-amo.up.railway.app/api/configuracoes?cidade=${cidadeSelecionada}`,
      );
      const config = response.data;

      if (config.popUpAtivo) {
        setTituloAviso(config.tituloPopUp);
        setMensagemAviso(config.mensagemPopUp);
        setModalAvisoVisible(true);
      }
    } catch (error) {
      console.log("Erro ao buscar configurações:", error);
    }
  };

  const carregarSetores = async () => {
    if (!cidadeSelecionada) return;

    try {
      const response = await axios.get(
        `https://tailorkz-production-eu-amo.up.railway.app/api/setores?cidade=${cidadeSelecionada}`,
      );
      setSetores(response.data);
    } catch (error) {
      console.log("Erro ao buscar setores:", error);
    } finally {
      setIsLoadingSetores(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["rgba(2, 154, 255, 0.25)", "transparent"]}
        style={styles.headerGradient}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.banner}>
          <Text style={styles.name}>
            Olá, {user?.nome ? user.nome.split(" ")[0] : "Cidadão"}!
          </Text>
          <Image
            source={require("../assets/images/logoeuamoipora.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Faça sua solicitação:</Text>

        <View style={styles.grid}>
          {isLoadingSetores ? (
            <ActivityIndicator
              size="large"
              color="#1F41BB"
              style={{ marginTop: 50, alignSelf: "center", width: "100%" }}
            />
          ) : (
            setores.map((item) => {
              const imageSource = imagensPadrao[item.nome] || {
                uri: item.icone,
              };

              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.card}
                  onPress={() =>
                    router.push({
                      pathname: "/solicitacao",
                      params: { categoria: item.nome },
                    })
                  }
                >
                  <Image source={imageSource} style={styles.cardImage} />
                  <View style={styles.textContainer}>
                    <Text style={styles.cardText}>
                      {/* 🔴 Chama a função que insere a quebra de linha natural */}
                      {formatarNomeSetor(item.nome)}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      <BottomMenu activeRoute="home" />

      <Modal visible={modalAvisoVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.iconAviso}>
              <Text style={{ fontSize: 30 }}>📢</Text>
            </View>
            <Text style={styles.modalTitle}>{tituloAviso}</Text>
            <Text style={styles.modalSubtitle}>{mensagemAviso}</Text>

            <TouchableOpacity
              style={styles.btnEntendi}
              onPress={() => setModalAvisoVisible(false)}
            >
              <Text style={styles.btnEntendiText}>Ciente</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F7F8" },
  scrollContent: {
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(40),
    paddingBottom: verticalScale(120),
  },
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: verticalScale(200),
    zIndex: 0,
  },
  banner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 1,
  },
  name: { fontSize: moderateScale(24), fontWeight: "600", color: "#333" },
  logo: { width: scale(120), height: verticalScale(70) },
  title: {
    fontSize: moderateScale(24),
    fontWeight: "700",
    color: "#333",
    marginTop: verticalScale(20),
    marginBottom: verticalScale(20),
    textAlign: "center",
    zIndex: 1,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    zIndex: 1,
  },
  card: {
    width: "48%",
    height: verticalScale(180), 
    backgroundColor: "#FFF",
    borderRadius: moderateScale(14),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: verticalScale(15), 
    elevation: 3,
    paddingHorizontal: scale(4),
  },
  cardImage: {
    width: scale(105),
    height: scale(105),
    marginBottom: verticalScale(12),
  },
  textContainer: {
    width: "100%",
    alignItems: "center",

  },
  cardText: {
    fontSize: scaledFont(18),
    fontWeight: "700", 
    color: "#333",
    textAlign: "center",
    // Removidas as travas que impediam a quebra
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
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
    alignItems: "center",
  },
  iconAviso: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFF3E0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 22,
  },
  btnEntendi: {
    width: "100%",
    padding: 15,
    borderRadius: 12,
    backgroundColor: "#1F41BB",
    alignItems: "center",
  },
  btnEntendiText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
});