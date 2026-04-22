import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomMenu } from "./src/components/BottomMenu";
import { useAuthStore } from "./src/store/useAuthStore";
import {
  moderateScale,
  scale,
  scaledFont,
  verticalScale,
} from "./src/utils/responsive";

interface Report {
  id: number;
  categoria: string;
  dataCriacao: string;
  localizacao: string;
  status: "PENDENTE" | "EM_ANDAMENTO" | "RESOLVIDO";
  urlImagem: string;
  protocolo?: string;
}

export default function Reportos() {
  const router = useRouter();

  // "metricas" substitui "fiscalizacao"
  const [activeTab, setActiveTab] = useState<"meus" | "setor" | "metricas">(
    "meus",
  );

  const [meusReportos, setMeusReportos] = useState<Report[]>([]);
  const [reportosSetor, setReportosSetor] = useState<Report[]>([]);
  const [metricasData, setMetricasData] = useState<any>(null);
  const [periodoFiltro, setPeriodoFiltro] = useState<
    "HOJE" | "SEMANA" | "MES" | "ANO" | "TUDO"
  >("TUDO");

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const user = useAuthStore((state) => state.user);

  const isVereador = user?.perfil === "VEREADOR";
  const isGestaoGlobal =
    user?.perfil === "SUPER_ADMIN" || user?.perfil === "PREFEITO";
  const isFuncionarioPrefeitura =
    user?.perfil === "FUNCIONARIO" || user?.perfil === "GESTOR_SETOR";

  const meuSetor = user?.setorAtuacao;
  const cidadeSelecionada =
    useAuthStore((state) => state.cidadeSelecionada) || user?.cidade;

  async function carregarMeusReportos() {
    if (!user) return;
    try {
      const url = `https://tailorkz-production-eu-amo.up.railway.app/api/solicitacoes/cidadao/${user.id}`;
      const response = await axios.get(url);
      setMeusReportos(response.data);
    } catch (error) {
      console.log("Erro ao buscar meus reportos:", error);
    }
  }

  async function carregarReportosDoSetor() {
    if (!isFuncionarioPrefeitura && !isGestaoGlobal) return;
    try {
      let url = `https://tailorkz-production-eu-amo.up.railway.app/api/solicitacoes/setor/${meuSetor}?cidade=${cidadeSelecionada}`;
      if (isGestaoGlobal) {
        url = `https://tailorkz-production-eu-amo.up.railway.app/api/solicitacoes/cidade/${cidadeSelecionada}`;
      }
      const response = await axios.get(url);
      setReportosSetor(response.data);
    } catch (error) {
      console.log("Erro ao buscar reportos do setor:", error);
    }
  }

  async function carregarMetricas() {
    if (!isVereador && !isGestaoGlobal) return;
    try {
      const url = `https://tailorkz-production-eu-amo.up.railway.app/api/solicitacoes/metricas?cidade=${cidadeSelecionada}&periodo=${periodoFiltro}`;
      const response = await axios.get(url);
      setMetricasData(response.data);
    } catch (error) {
      console.log("Erro ao buscar métricas:", error);
    }
  }

  // RECARREGA OS DADOS SEMPRE QUE O FILTRO MUDAR
  useEffect(() => {
    if (activeTab === "metricas") {
      carregarMetricas();
    }
  }, [periodoFiltro, activeTab]);

  async function carregarTudo() {
    setIsLoading(true);
    await carregarMeusReportos();
    await carregarReportosDoSetor();
    await carregarMetricas();
    setIsLoading(false);
  }

  async function onRefresh() {
    setIsRefreshing(true);
    await carregarMeusReportos();
    await carregarReportosDoSetor();
    await carregarMetricas();
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

  const getMiniaturaUrl = (urlOriginal: string) => {
    if (!urlOriginal) return null;
    return urlOriginal.replace(
      "file:///C:/ipora_imagens/",
      "https://tailorkz-production-eu-amo.up.railway.app/imagens/",
    );
  };

  const renderMetricas = () => {
    if (!metricasData) return null;

    const abrirLista = (tipo: string) => {
      router.push({
        pathname: "/lista-metricas",
        params: { tipo, periodo: periodoFiltro },
      } as any);
    };

    const FiltroBtn = ({ rotulo, valor }: { rotulo: string; valor: any }) => (
      <TouchableOpacity
        style={[
          styles.filtroBtn,
          periodoFiltro === valor && styles.filtroBtnAtivo,
        ]}
        onPress={() => setPeriodoFiltro(valor)}
      >
        <Text
          style={[
            styles.filtroTexto,
            periodoFiltro === valor && styles.filtroTextoAtivo,
          ]}
        >
          {rotulo}
        </Text>
      </TouchableOpacity>
    );

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* BARRA DE FILTROS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginVertical: 10 }}
        >
          <FiltroBtn rotulo="Hoje" valor="HOJE" />
          <FiltroBtn rotulo="7 Dias" valor="SEMANA" />
          <FiltroBtn rotulo="30 Dias" valor="MES" />
          <FiltroBtn rotulo="1 Ano" valor="ANO" />
          <FiltroBtn rotulo="Tudo" valor="TUDO" />
        </ScrollView>

        <View style={styles.metricasHeader}>
          <Text style={styles.metricasTitle}>Painel de Transparência</Text>
        </View>

        <View style={styles.cardsRow}>
          <TouchableOpacity
            style={[styles.metricaCard, { backgroundColor: "#E8F0FE" }]}
            onPress={() => abrirLista("ABERTAS_HOJE")}
          >
            <Text style={styles.metricaValor}>{metricasData.abertasHoje}</Text>
            <Text style={styles.metricaLabel}>Abertas Hoje</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.metricaCard, { backgroundColor: "#F0F4F8" }]}
            onPress={() => abrirLista("TOTAL")}
          >
            <Text style={styles.metricaValor}>{metricasData.total}</Text>
            <Text style={styles.metricaLabel}>Total Acumulado</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statusCardsContainer}>
          <TouchableOpacity
            style={styles.statusCard}
            onPress={() => abrirLista("PENDENTE")}
          >
            <View style={[styles.statusIconBg, { backgroundColor: "#FFEBEE" }]}>
              <Ionicons name="alert-circle" size={24} color="#F44336" />
            </View>
            <View style={styles.statusTextContainer}>
              <Text style={styles.statusLabel}>Pendentes</Text>
              <Text style={[styles.statusNumber, { color: "#F44336" }]}>
                {metricasData.pendentes}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statusCard}
            onPress={() => abrirLista("EM_ANDAMENTO")}
          >
            <View style={[styles.statusIconBg, { backgroundColor: "#FFF8E1" }]}>
              <Ionicons name="construct" size={24} color="#FFC107" />
            </View>
            <View style={styles.statusTextContainer}>
              <Text style={styles.statusLabel}>Em Andamento</Text>
              <Text style={[styles.statusNumber, { color: "#FFC107" }]}>
                {metricasData.emAndamento}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statusCard}
            onPress={() => abrirLista("RESOLVIDO")}
          >
            <View style={[styles.statusIconBg, { backgroundColor: "#E8F5E9" }]}>
              <Ionicons
                name="checkmark-done-circle"
                size={24}
                color="#4CAF50"
              />
            </View>
            <View style={styles.statusTextContainer}>
              <Text style={styles.statusLabel}>Resolvidas</Text>
              <Text style={[styles.statusNumber, { color: "#4CAF50" }]}>
                {metricasData.resolvidas}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  const renderItem = ({ item }: { item: Report }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => {
        router.push({
          pathname: "/detalhes",
          params: { dados: JSON.stringify(item), origem: activeTab },
        });
      }}
    >
      <View style={styles.thumbnailContainer}>
        {getMiniaturaUrl(item.urlImagem) ? (
          <Image
            source={{ uri: getMiniaturaUrl(item.urlImagem) as string }}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: moderateScale(8),
            }}
          />
        ) : (
          <Ionicons
            name="image-outline"
            size={moderateScale(30)}
            color="#999"
          />
        )}
      </View>

      <View style={styles.cardInfo}>
        <View style={styles.cardHeader}>
          <Text style={styles.categoryTitle}>
            {item.protocolo
              ? `Protocolo ${item.protocolo}`
              : `Solicitação #${item.id}`}
          </Text>
          <Text style={styles.dateText}>{formatarData(item.dataCriacao)}</Text>
        </View>
        <Text
          style={{
            fontSize: moderateScale(13),
            color: "#1F41BB",
            fontWeight: "600",
            marginTop: verticalScale(4),
          }}
        >
          Setor: {item.categoria}
        </Text>

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

        {(isFuncionarioPrefeitura || isVereador || isGestaoGlobal) && (
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

            {(isFuncionarioPrefeitura || isGestaoGlobal) && (
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
                  {isGestaoGlobal ? "Gestão da Cidade" : "Do Meu Setor"}
                </Text>
              </TouchableOpacity>
            )}

            {(isVereador || isGestaoGlobal) && (
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === "metricas" && styles.tabButtonActive,
                ]}
                onPress={() => setActiveTab("metricas")}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "metricas" && styles.tabTextActive,
                  ]}
                >
                  Métricas
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {isLoading ? (
          <ActivityIndicator
            size="large"
            color="#1F41BB"
            style={{ marginTop: verticalScale(50) }}
          />
        ) : activeTab === "metricas" ? (
          renderMetricas()
        ) : (
          <FlatList
            data={activeTab === "meus" ? meusReportos : reportosSetor}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                {activeTab === "meus"
                  ? "Você ainda não fez nenhuma solicitação."
                  : "Nenhuma solicitação pendente no momento."}
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
    fontSize: scaledFont(26),
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
  tabText: {
    fontSize: scaledFont(13),
    fontWeight: "600",
    color: "#666",
    textAlign: "center",
  },
  tabTextActive: { color: "#1F41BB" },
  listContent: { paddingBottom: verticalScale(100) },
  emptyText: {
    textAlign: "center",
    marginTop: verticalScale(40),
    color: "#888",
    fontSize: scaledFont(16),
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
    fontSize: scaledFont(16),
    fontWeight: "700",
    color: "#333",
    flex: 1,
  },
  dateText: { fontSize: scaledFont(14), color: "#888", fontWeight: "500" },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: verticalScale(4),
  },
  locationText: {
    fontSize: scaledFont(14),
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
    fontSize: scaledFont(14),
    fontWeight: "600",
    color: "#444",
    textTransform: "capitalize",
  },

  // NOVOS ESTILOS PARA MÉTRICAS
  metricasHeader: {
    alignItems: "center",
    marginBottom: verticalScale(25),
    marginTop: verticalScale(10),
  },
  metricasTitle: {
    fontSize: scaledFont(22),
    fontWeight: "bold",
    color: "#333",
    marginTop: verticalScale(10),
  },
  metricasSubtitle: {
    fontSize: scaledFont(14),
    color: "#666",
    marginTop: verticalScale(5),
  },
  cardsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: verticalScale(20),
  },
  metricaCard: {
    flex: 1,
    padding: moderateScale(20),
    borderRadius: moderateScale(16),
    alignItems: "center",
    marginHorizontal: scale(5),
    elevation: 1,
  },
  metricaValor: {
    fontSize: scaledFont(28),
    fontWeight: "bold",
    color: "#1F41BB",
  },
  metricaLabel: {
    fontSize: scaledFont(13),
    color: "#555",
    fontWeight: "600",
    marginTop: verticalScale(5),
  },
  statusCardsContainer: {
    backgroundColor: "#FFF",
    borderRadius: moderateScale(16),
    padding: moderateScale(15),
    elevation: 2,
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: verticalScale(15),
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  statusIconBg: {
    width: moderateScale(46),
    height: moderateScale(46),
    borderRadius: moderateScale(23),
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(15),
  },
  statusTextContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusLabel: { fontSize: scaledFont(16), color: "#333", fontWeight: "600" },
  statusNumber: { fontSize: scaledFont(22), fontWeight: "bold" },

  filtroBtn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: "#E0E5E8", borderRadius: 20, marginRight: 8, elevation: 1 },
  filtroBtnAtivo: { backgroundColor: "#1F41BB" },
  filtroTexto: { color: "#555", fontWeight: "bold" },
  filtroTextoAtivo: { color: "#FFF" },
});
