import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomMenu } from "./src/components/BottomMenu";
import { useAuthStore } from "./src/store/useAuthStore";
import { moderateScale, scale, verticalScale } from "./src/utils/responsive";

// TIPAGEM ESTRITA
interface Report {
  id: number;
  categoria: string;
  dataCriacao: string;
  localizacao: string;
  status: "PENDENTE" | "EM_ANDAMENTO" | "RESOLVIDO";
  urlImagem: string;
}

export default function Reportos() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"meus" | "setor">("meus");

  const [meusReportos, setMeusReportos] = useState<Report[]>([]);
  const [reportosSetor, setReportosSetor] = useState<Report[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false); //  ESTADO DO PULL-TO-REFRESH

  const user = useAuthStore((state) => state.user);

  //  SIMULAÇÃO DE FUNCIONÁRIO DA PREFEITURA
  const isFuncionarioPrefeitura = true;
  const meuSetor = "Infraestrutura";

  async function carregarMeusReportos() {
    if (!user) return;
    try {
      const url = `http://192.168.1.17:8080/api/solicitacoes/cidadao/${user.id}`;
      const response = await axios.get(url);
      setMeusReportos(response.data);
    } catch (error) {
      console.log("Erro ao buscar meus reportos:", error);
    }
  }

  async function carregarReportosDoSetor() {
    if (!isFuncionarioPrefeitura) return;
    try {
      const url = `http://192.168.1.17:8080/api/solicitacoes/setor/${meuSetor}`;
      const response = await axios.get(url);
      setReportosSetor(response.data);
    } catch (error) {
      console.log("Erro ao buscar reportos do setor:", error);
    }
  }

  async function carregarTudo() {
    setIsLoading(true);
    await carregarMeusReportos();
    await carregarReportosDoSetor();
    setIsLoading(false);
  }

  //  FUNÇÃO EXECUTADA AO PUXAR A TELA PARA BAIXO
  async function onRefresh() {
    setIsRefreshing(true);
    await carregarMeusReportos();
    await carregarReportosDoSetor();
    setIsRefreshing(false);
  }

  useEffect(() => {
    carregarTudo();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "RESOLVIDO":
        return "#4CAF50";
      case "EM_ANDAMENTO":
        return "#FFC107";
      case "PENDENTE":
      default:
        return "#F44336";
    }
  };

  const formatarData = (dataString: string) => {
    if (!dataString) return "";
    const data = new Date(dataString);
    return data.toLocaleDateString("pt-BR");
  };

  // Converte o caminho do computador para a URL da internet
  const getMiniaturaUrl = (urlOriginal: string) => {
    if (!urlOriginal) return null;
    return urlOriginal.replace(
      "file:///C:/ipora_imagens/",
      "http://192.168.1.17:8080/imagens/",
    );
  };

  const renderItem = ({ item }: { item: Report }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => {
        router.push({
          pathname: "/detalhes",
          params: {
            dados: JSON.stringify(item),
            origem: activeTab,
          },
        });
      }}
    >
      <View style={styles.thumbnailContainer}>
        {getMiniaturaUrl(item.urlImagem) ? (
          <Image
            source={{ uri: getMiniaturaUrl(item.urlImagem) as string }} //  FIX DO TYPESCRIPT ('as string')
            style={{ width: "100%", height: "100%", borderRadius: 8 }}
          />
        ) : (
          <Ionicons name="image-outline" size={30} color="#999" />
        )}
      </View>

      <View style={styles.cardInfo}>
        <View style={styles.cardHeader}>
          <Text style={styles.categoryTitle}>{item.categoria}</Text>
          <Text style={styles.dateText}>{formatarData(item.dataCriacao)}</Text>
        </View>

        <View style={styles.locationRow}>
          <Ionicons
            name="location-outline"
            size={moderateScale(14)}
            color="#666"
          />
          <Text style={styles.locationText} numberOfLines={1}>
            {item.localizacao}
          </Text>
        </View>

        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          />
          <Text style={styles.statusText}>{item.status.replace("_", " ")}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.pageTitle}>Solicitações</Text>

        {isFuncionarioPrefeitura && (
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "meus" && styles.tabButtonActive,
              ]}
              onPress={() => setActiveTab("meus")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "meus" && styles.tabTextActive,
                ]}
              >
                Meus Reportos
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "setor" && styles.tabButtonActive,
              ]}
              onPress={() => setActiveTab("setor")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "setor" && styles.tabTextActive,
                ]}
              >
                Do Meu Setor
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {isLoading ? (
          <ActivityIndicator
            size="large"
            color="#1F41BB"
            style={{ marginTop: verticalScale(50) }}
          />
        ) : (
          <FlatList
            data={activeTab === "meus" ? meusReportos : reportosSetor}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshing={isRefreshing} //  LIGA A ANIMAÇÃO DE REFRESH
            onRefresh={onRefresh} //  LIGA A FUNÇÃO DE REFRESH
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                {activeTab === "meus"
                  ? "Você ainda não fez nenhuma solicitação."
                  : "Nenhuma solicitação recebida no seu setor."}
              </Text>
            }
          />
        )}
      </View>

      <BottomMenu activeRoute="reportos" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F4F7F8" },
  container: {
    flex: 1,
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(10),
  },
  pageTitle: {
    fontSize: moderateScale(24),
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
    marginBottom: verticalScale(20),
    marginTop: verticalScale(20),
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#E0E5E8",
    borderRadius: moderateScale(10),
    padding: moderateScale(4),
    marginBottom: verticalScale(20),
  },
  tabButton: {
    flex: 1,
    paddingVertical: verticalScale(8),
    alignItems: "center",
    borderRadius: moderateScale(8),
  },
  tabButtonActive: {
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: { fontSize: moderateScale(14), fontWeight: "600", color: "#666" },
  tabTextActive: { color: "#1F41BB" },
  listContent: { paddingBottom: verticalScale(100) },
  emptyText: {
    textAlign: "center",
    marginTop: verticalScale(40),
    color: "#888",
    fontSize: moderateScale(16),
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: moderateScale(12),
    padding: moderateScale(12),
    marginBottom: verticalScale(12),
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  thumbnailContainer: {
    width: scale(70),
    height: scale(70),
    borderRadius: moderateScale(8),
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  cardInfo: { flex: 1, marginLeft: scale(12), justifyContent: "space-between" },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  categoryTitle: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    color: "#333",
    flex: 1,
  },
  dateText: { fontSize: moderateScale(12), color: "#888", fontWeight: "500" },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: verticalScale(4),
  },
  locationText: {
    fontSize: moderateScale(13),
    color: "#666",
    marginLeft: scale(4),
    flex: 1,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: verticalScale(8),
  },
  statusDot: {
    width: moderateScale(10),
    height: moderateScale(10),
    borderRadius: moderateScale(5),
    marginRight: scale(6),
  },
  statusText: {
    fontSize: moderateScale(13),
    fontWeight: "600",
    color: "#444",
    textTransform: "capitalize",
  },
});
