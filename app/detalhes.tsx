import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
    Alert,
    Image,
    KeyboardAvoidingView, // ✅ MUDANÇA: import nativo
    Platform, // ✅ MUDANÇA: para detectar iOS/Android
    ScrollView, // ✅ MUDANÇA: ScrollView simples
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
// ✅ MUDANÇA: removido o import do KeyboardAwareScrollView
import { SafeAreaView } from "react-native-safe-area-context";
import { Select } from "./src/components/Select";
import { useAuthStore } from "./src/store/useAuthStore";
import { moderateScale, scale, verticalScale } from "./src/utils/responsive";
export default function Detalhes() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const chamado = params.dados ? JSON.parse(params.dados as string) : null;
  const user = useAuthStore((state) => state.user);
  const origem = params.origem as string;
  const isModoGestao = origem === "setor";

  const scrollRef = useRef<ScrollView>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editLocalizacao, setEditLocalizacao] = useState(chamado?.localizacao || "");
  const [editObservacao, setEditObservacao] = useState(chamado?.observacao || "");
  const [novoStatus, setNovoStatus] = useState(chamado?.status || "");
  const [respostaPrefeitura, setRespostaPrefeitura] = useState("");

  const observacaoRef = useRef<View>(null);
  const respostaRef = useRef<View>(null);
  const observacaoY = useRef(0);
  const respostaY = useRef(0);

  if (!chamado) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={{ textAlign: "center", marginTop: 50 }}>
          Chamado não encontrado.
        </Text>
      </SafeAreaView>
    );
  }

  const handleSalvarEdicao = () => {
    Alert.alert("Sucesso", "Solicitação atualizada!");
    setIsEditing(false);
  };

  const handleExcluir = () => {
    Alert.alert("Atenção", "Tem certeza que deseja excluir esta solicitação?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sim, Excluir",
        style: "destructive",
        onPress: () => {
          Alert.alert("Excluído", "Solicitação removida.");
          router.back();
        },
      },
    ]);
  };

  const handleAtualizarFuncionario = () => {
    Alert.alert("Atualizado!", "Status alterado e cidadão notificado.");
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 5 }}>
          <Ionicons name="arrow-back" size={24} color="#1F41BB" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes da Solicitação</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 1. ÁREA DA IMAGEM */}
          <View style={styles.imageContainer}>
            <Image
              source={require("../assets/images/infra.png")}
              style={styles.image}
            />
            {isEditing && (
              <TouchableOpacity style={styles.deletePhotoBtn}>
                <Ionicons name="trash" size={20} color="#FFF" />
                <Text style={styles.deletePhotoText}>Trocar Foto</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* 2. INFORMAÇÕES BÁSICAS */}
          <View style={styles.infoCard}>
            <View style={styles.rowBetween}>
              <Text style={styles.categoria}>{chamado.categoria}</Text>
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor:
                      chamado.status === "RESOLVIDO" ? "#4CAF50" : "#F44336",
                  },
                ]}
              >
                <Text style={styles.badgeText}>
                  {chamado.status.replace("_", " ")}
                </Text>
              </View>
            </View>

            {isModoGestao && (
              <Text style={styles.enviadoPor}>
                Enviado por:{" "}
                <Text style={{ fontWeight: "bold" }}>João Cidadão</Text>
              </Text>
            )}

            <View style={styles.divider} />

            <Text style={[styles.label, { marginTop: 15 }]}>Localização</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editLocalizacao}
                onChangeText={setEditLocalizacao}
              />
            ) : (
              <View style={styles.row}>
                <Ionicons name="location" size={18} color="#1F41BB" />
                <Text style={styles.valueText}>{chamado.localizacao}</Text>
              </View>
            )}

            <Text style={[styles.label, { marginTop: 15 }]}>
              Observação do Cidadão
            </Text>

            {/* ✅ onLayout somando o offset real da imagem + margins acima do card */}
            <View
              ref={observacaoRef}
              onLayout={(e) => {
                observacaoY.current =
                  e.nativeEvent.layout.y +
                  verticalScale(200) + // altura da imagem
                  verticalScale(15) +  // margin abaixo da imagem
                  scale(16);           // padding interno do infoCard
              }}
            >
              {isEditing ? (
                <TextInput
                  style={[styles.input, { height: 80, textAlignVertical: "top" }]}
                  multiline
                  value={editObservacao}
                  onChangeText={setEditObservacao}
                  onFocus={() => {
                    setTimeout(() => {
                      scrollRef.current?.scrollTo({
                        y: observacaoY.current - 20,
                        animated: true,
                      });
                    }, 180);
                  }}
                />
              ) : (
                <Text style={styles.observacaoText}>
                  {chamado.observacao || "Nenhuma observação informada."}
                </Text>
              )}
            </View>
          </View>

          {/* 3A. VISÃO DO FUNCIONÁRIO */}
          {isModoGestao && (
            <View style={styles.adminCard}>
              <Text style={styles.adminTitle}>Painel da Prefeitura</Text>

              <Text style={styles.label}>Atualizar Status:</Text>
              <View style={{ zIndex: 10, marginBottom: 15 }}>
                <Select
                  placeholder="Selecione o Status"
                  options={["PENDENTE", "EM ANDAMENTO", "RESOLVIDO"]}
                  onSelect={(val) => setNovoStatus(val)}
                />
              </View>

              <Text style={styles.label}>Transferir de Setor (Opcional):</Text>
              <View style={{ zIndex: 9, marginBottom: 15 }}>
                <Select
                  placeholder="Manter no setor atual"
                  options={[
                    "Infraestrutura",
                    "Iluminação Pública",
                    "Urbanismo",
                    "Limpeza",
                  ]}
                />
              </View>

              <Text style={styles.label}>Resposta Oficial ao Cidadão:</Text>
              <View
                ref={respostaRef}
                onLayout={(e) => {
                  respostaY.current = e.nativeEvent.layout.y;
                }}
              >
                <TextInput
                  style={[styles.input, { height: 80, textAlignVertical: "top" }]}
                  multiline
                  placeholder="Ex: A equipe já foi enviada ao local..."
                  value={respostaPrefeitura}
                  onChangeText={setRespostaPrefeitura}
                  onFocus={() => {
                    setTimeout(() => {
                      scrollRef.current?.scrollTo({
                        y: respostaY.current - 20,
                        animated: true,
                      });
                    }, 150);
                  }}
                />
              </View>

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleAtualizarFuncionario}
              >
                <Text style={styles.saveBtnText}>Salvar Atualização</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 3B. VISÃO DO CIDADÃO */}
          {!isModoGestao && (
            <View style={styles.actionButtons}>
              {isEditing ? (
                <>
                  <TouchableOpacity style={styles.saveBtn} onPress={handleSalvarEdicao}>
                    <Text style={styles.saveBtnText}>Salvar Alterações</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsEditing(false)}>
                    <Text style={styles.cancelBtnText}>Cancelar</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditing(true)}>
                    <Ionicons name="pencil" size={18} color="#FFF" style={{ marginRight: 8 }} />
                    <Text style={styles.saveBtnText}>Editar Solicitação</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteBtn} onPress={handleExcluir}>
                    <Ionicons name="trash" size={18} color="#FF3B30" style={{ marginRight: 8 }} />
                    <Text style={styles.deleteBtnText}>Excluir</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F4F7F8" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: scale(16),
    backgroundColor: "#FFF",
    elevation: 2,
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: "700",
    color: "#333",
  },
  container: { padding: scale(16), paddingBottom: verticalScale(50) },
  imageContainer: {
    width: "100%",
    height: verticalScale(200),
    borderRadius: moderateScale(12),
    overflow: "hidden",
    marginBottom: verticalScale(15),
    position: "relative",
  },
  image: { width: "100%", height: "100%", backgroundColor: "#E0E0E0" },
  deletePhotoBtn: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(255, 59, 48, 0.9)",
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  deletePhotoText: { color: "#FFF", fontWeight: "bold", marginLeft: 5 },
  infoCard: {
    backgroundColor: "#FFF",
    borderRadius: moderateScale(12),
    padding: scale(16),
    marginBottom: verticalScale(20),
    elevation: 1,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  categoria: {
    fontSize: moderateScale(20),
    fontWeight: "bold",
    color: "#1F41BB",
  },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: "#FFF", fontSize: moderateScale(12), fontWeight: "bold" },
  enviadoPor: { fontSize: moderateScale(13), color: "#666", marginTop: 5 },
  divider: {
    height: 1,
    backgroundColor: "#EEE",
    marginVertical: verticalScale(15),
  },
  label: {
    fontSize: moderateScale(13),
    color: "#888",
    fontWeight: "600",
    marginBottom: 5,
    textTransform: "uppercase",
  },
  row: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  valueText: {
    fontSize: moderateScale(15),
    color: "#333",
    marginLeft: 6,
    flex: 1,
  },
  observacaoText: {
    fontSize: moderateScale(15),
    color: "#444",
    lineHeight: 22,
  },
  input: {
    backgroundColor: "#F9F9F9",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 12,
    fontSize: moderateScale(15),
    color: "#333",
  },
  adminCard: {
    backgroundColor: "#E8EEF2",
    borderRadius: moderateScale(12),
    padding: scale(16),
    borderWidth: 1,
    borderColor: "#CDE0ED",
  },
  adminTitle: {
    fontSize: moderateScale(16),
    fontWeight: "bold",
    color: "#1F41BB",
    marginBottom: 15,
    textAlign: "center",
  },
  actionButtons: { marginTop: 10 },
  saveBtn: {
    backgroundColor: "#1F41BB",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  saveBtnText: {
    color: "#FFF",
    fontSize: moderateScale(16),
    fontWeight: "bold",
  },
  cancelBtn: {
    backgroundColor: "#CCC",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelBtnText: {
    color: "#333",
    fontSize: moderateScale(16),
    fontWeight: "bold",
  },
  editBtn: {
    backgroundColor: "#1F41BB",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 15,
  },
  deleteBtn: {
    backgroundColor: "#FFEBEA",
    borderWidth: 1,
    borderColor: "#FFD2D0",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  deleteBtnText: {
    color: "#FF3B30",
    fontSize: moderateScale(16),
    fontWeight: "bold",
  },
});