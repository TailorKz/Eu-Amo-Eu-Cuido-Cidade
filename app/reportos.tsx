import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomMenu } from "./src/components/BottomMenu";
import { moderateScale, scale, verticalScale } from "./src/utils/responsive";

// 1. TIPAGEM ESTRITA (Profissionalismo em TypeScript)
interface Report {
  id: string;
  category: string;
  date: string;
  location: string;
  status: "Pendente" | "Em andamento" | "Resolvido";
  imageUrl: any; // Mudar para 'string' quando vier do banco de dados (URL da nuvem)
}

// 2. DADOS MOCKADOS (Simulando o Banco de Dados)
const MOCK_MEUS_REPORTOS: Report[] = [
  {
    id: "1",
    category: "Infraestrutura",
    date: "24 Mar 2026",
    location: "Rua das Flores, Centro",
    status: "Pendente",
    imageUrl: require("../assets/images/infra.png"),
  },
  {
    id: "2",
    category: "Iluminação",
    date: "10 Fev 2026",
    location: "Av. Principal, nº 400",
    status: "Resolvido",
    imageUrl: require("../assets/images/ilum.png"),
  },
];

const MOCK_SETOR_REPORTOS: Report[] = [
  {
    id: "3",
    category: "Infraestrutura",
    date: "26 Mar 2026",
    location: "Bairro São José",
    status: "Em andamento",
    imageUrl: require("../assets/images/infra.png"),
  },
];

export default function Reportos() {
  // Controle de Abas Internas (Cidadão vs Servidor)
  const [activeTab, setActiveTab] = useState<"meus" | "setor">("meus");

  const isFuncionarioPrefeitura = true;

  const getStatusColor = (status: Report["status"]) => {
    switch (status) {
      case "Resolvido":
        return "#4CAF50";
      case "Em andamento":
        return "#FFC107";
      case "Pendente":
      default:
        return "#F44336";
    }
  };

  // Componente de renderização de CADA item da lista
  const renderItem = ({ item }: { item: Report }) => (
    <View style={styles.card}>
      <Image
        source={item.imageUrl}
        style={styles.thumbnail}
        resizeMode="cover"
      />

      <View style={styles.cardInfo}>
        <View style={styles.cardHeader}>
          <Text style={styles.categoryTitle}>{item.category}</Text>
          <Text style={styles.dateText}>{item.date}</Text>
        </View>

        <View style={styles.locationRow}>
          <Ionicons
            name="location-outline"
            size={moderateScale(14)}
            color="#666"
          />
          <Text style={styles.locationText} numberOfLines={1}>
            {item.location}
          </Text>
        </View>

        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          />
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.pageTitle}>Solicitações</Text>

        {/* CONTROLE DE ABAS funcionário */}
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

        {/* LISTA DE REPORTOS */}
        <FlatList
          data={activeTab === "meus" ? MOCK_MEUS_REPORTOS : MOCK_SETOR_REPORTOS}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Nenhuma solicitação encontrada.
            </Text>
          }
        />
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
  thumbnail: {
    width: scale(70),
    height: scale(70),
    borderRadius: moderateScale(8),
    backgroundColor: "#F0F0F0",
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
  statusText: { fontSize: moderateScale(13), fontWeight: "600", color: "#444" },
});
