import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "./src/store/useAuthStore";
import { moderateScale, scale, scaledFont, verticalScale } from "./src/utils/responsive";

export default function ListaMetricas() {
  const router = useRouter();
  const { tipo, periodo } = useLocalSearchParams();
  const [lista, setLista] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const cidadeEstado = useAuthStore((state) => state.cidadeSelecionada);
  const usuarioLogado = useAuthStore((state) => state.user);
  const cidadeSelecionada = cidadeEstado || usuarioLogado?.cidade;

  useEffect(() => {
    carregarLista();
  }, []);

  const carregarLista = async () => {
    try {
      const url = `https://tailorkz-production-eu-amo.up.railway.app/api/solicitacoes/metricas/lista?cidade=${cidadeSelecionada}&periodo=${periodo}&tipo=${tipo}`;
      const response = await axios.get(url);
      setLista(response.data);
    } catch (error) {
      console.log("Erro ao carregar lista de métricas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTitulo = () => {
    switch (tipo) {
      case "PENDENTE": return "Demandas Pendentes";
      case "EM_ANDAMENTO": return "Em Andamento";
      case "RESOLVIDO": return "Demandas Resolvidas";
      case "ABERTAS_HOJE": return "Abertas Hoje";
      case "TOTAL": return "Todas as Demandas";
      default: return "Auditoria";
    }
  };

  const formatarData = (dataString: string) => {
    if (!dataString) return "";
    return new Date(dataString).toLocaleDateString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Ionicons name="calendar-outline" size={16} color="#666" />
        <Text style={styles.dataTexto}>{formatarData(item.dataCriacao)}</Text>
      </View>
      <View style={styles.row}>
        <Ionicons name="business-outline" size={16} color="#1F41BB" />
        <Text style={styles.setorTexto}>{item.categoria}</Text>
      </View>
      
      {/* Exibe o status Apenas se for "TOTAL" */}
      {tipo === "TOTAL" && (
        <View style={[styles.row, { marginTop: 8 }]}>
          <Text style={[styles.statusBadge, 
            item.status === "RESOLVIDO" ? { backgroundColor: "#E8F5E9", color: "#4CAF50" } :
            item.status === "EM_ANDAMENTO" ? { backgroundColor: "#FFF8E1", color: "#FFC107" } :
            { backgroundColor: "#FFEBEE", color: "#F44336" }
          ]}>
            {item.status.replace("_", " ")}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 5 }}>
          <Ionicons name="arrow-back" size={24} color="#1F41BB" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getTitulo()}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.container}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#1F41BB" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={lista}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 50 }}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Nenhum registo encontrado para este período.</Text>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F4F7F8" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, backgroundColor: "#FFF", elevation: 2 },
  headerTitle: { fontSize: scaledFont(18), fontWeight: "bold", color: "#333" },
  container: { flex: 1, padding: 16 },
  card: { backgroundColor: "#FFF", padding: 16, borderRadius: 12, marginBottom: 12, elevation: 1 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  dataTexto: { marginLeft: 8, fontSize: 14, color: "#666", fontWeight: "600" },
  setorTexto: { marginLeft: 8, fontSize: 16, color: "#1F41BB", fontWeight: "bold" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, fontSize: 12, fontWeight: "bold", overflow: "hidden" },
  emptyText: { textAlign: "center", marginTop: 40, color: "#888", fontSize: 16 }
});