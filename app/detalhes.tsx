import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal, // ✅ MUDANÇA: import nativo
  Platform, // ✅ MUDANÇA: para detectar iOS/Android
  ScrollView, // ✅ MUDANÇA: ScrollView simples
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
// ✅ MUDANÇA: removido o import do KeyboardAwareScrollView
import axios from "axios";
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

  // ESTADOS NORMAIS
  const [isEditing, setIsEditing] = useState(false);
  const [editLocalizacao, setEditLocalizacao] = useState(
    chamado?.localizacao || "",
  );
  const [editObservacao, setEditObservacao] = useState(
    chamado?.observacao || "",
  );
  const [novoStatus, setNovoStatus] = useState(chamado?.status || "");

  // 🔴 ESTADOS PARA AS MODAIS E RESPOSTAS
  const [respostaPrefeitura, setRespostaPrefeitura] = useState(
    chamado?.resposta || "",
  );
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [isSetorModalVisible, setIsSetorModalVisible] = useState(false);
  const [setorSelecionado, setSetorSelecionado] = useState(
    chamado?.categoria || "",
  );

  const listaSetores = [
    "Infraestrutura",
    "Iluminação Pública",
    "Urbanismo",
    "Limpeza",
    "Saneamento e água",
    "Saúde Pública e Vigilância",
  ];

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
  const getImagemUrl = () => {
    if (!chamado.urlImagem) return null;
    return chamado.urlImagem.replace(
      "file:///C:/ipora_imagens/",
      "http://192.168.1.17:8080/imagens/",
    );
  };

  // --- FUNÇÕES DE AÇÃO (Conectadas ao Java) ---

  const handleSalvarEdicao = async () => {
    try {
      const url = `http://192.168.1.17:8080/api/solicitacoes/${chamado.id}`;
      await axios.put(url, {
        localizacao: editLocalizacao,
        observacao: editObservacao,
      });
      Alert.alert("Sucesso", "Solicitação atualizada com sucesso!");
      setIsEditing(false);
      chamado.localizacao = editLocalizacao;
      chamado.observacao = editObservacao;
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível atualizar a solicitação.");
    }
  };

  const handleExcluir = () => {
    Alert.alert("Atenção", "Tem certeza que deseja excluir esta solicitação?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sim, Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            const url = `http://192.168.1.17:8080/api/solicitacoes/${chamado.id}`;
            await axios.delete(url);
            Alert.alert("Excluído", "Solicitação removida.");
            router.replace("/reportos");
          } catch (error) {
            console.log(error);
            Alert.alert("Erro", "Não foi possível excluir.");
          }
        },
      },
    ]);
  };

  const handleAtualizarFuncionario = async () => {
    try {
      const url = `http://192.168.1.17:8080/api/solicitacoes/${chamado.id}`;
      //  ENVIA O STATUS, A NOVA CATEGORIA (SE MUDOU) E A RESPOSTA
      await axios.put(url, {
        status: novoStatus.replace(" ", "_"),
        categoria: setorSelecionado,
        resposta: respostaPrefeitura,
      });
      Alert.alert("Atualizado!", "Dados alterados com sucesso.");
      router.replace("/reportos");
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível atualizar os dados.");
    }
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
          {/* 1. ÁREA DA IMAGEM (AGORA É CLICÁVEL) */}
          <TouchableOpacity
            style={styles.imageContainer}
            activeOpacity={0.8}
            onPress={() => setIsImageModalVisible(true)} // 🔴 ABRE A FOTO GIGANTE
          >
            {getImagemUrl() ? (
              <Image
                source={{ uri: getImagemUrl() as string }}
                style={styles.image}
                resizeMode="cover"
              />
            ) : (
              <Image
                source={require("../assets/images/infra.png")}
                style={styles.image}
              />
            )}
            {!isEditing && (
              <View style={styles.expandIconOverlay}>
                <Ionicons name="expand" size={20} color="#FFF" />
              </View>
            )}
          </TouchableOpacity>

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
            <View
              onLayout={(e) => {
                observacaoY.current =
                  e.nativeEvent.layout.y +
                  verticalScale(200) +
                  verticalScale(15) +
                  scale(16);
              }}
            >
              {isEditing ? (
                <TextInput
                  style={[
                    styles.input,
                    { height: 80, textAlignVertical: "top" },
                  ]}
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

            {/* 🔴 RESPOSTA OFICIAL PARA O CIDADÃO LER */}
            {!isModoGestao && chamado.resposta && (
              <View style={styles.respostaBox}>
                <Text style={styles.respostaTitle}>
                  <Ionicons name="business" size={16} /> Resposta da Prefeitura:
                </Text>
                <Text style={styles.respostaText}>{chamado.resposta}</Text>
              </View>
            )}
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

              <Text style={styles.label}>Transferir de Setor:</Text>
              {/* 🔴 BOTÃO QUE ABRE A NOVA MODAL DE SETORES */}
              <TouchableOpacity
                style={styles.sectorButton}
                onPress={() => setIsSetorModalVisible(true)}
              >
                <Text style={styles.sectorButtonText}>{setorSelecionado}</Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>

              <Text style={styles.label}>Resposta Oficial ao Cidadão:</Text>
              <View
                onLayout={(e) => {
                  respostaY.current = e.nativeEvent.layout.y;
                }}
              >
                <TextInput
                  style={[
                    styles.input,
                    { height: 80, textAlignVertical: "top" },
                  ]}
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
                  <TouchableOpacity
                    style={styles.saveBtn}
                    onPress={handleSalvarEdicao}
                  >
                    <Text style={styles.saveBtnText}>Salvar Alterações</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => setIsEditing(false)}
                  >
                    <Text style={styles.cancelBtnText}>Cancelar</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => setIsEditing(true)}
                  >
                    <Ionicons
                      name="pencil"
                      size={18}
                      color="#FFF"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.saveBtnText}>Editar Solicitação</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={handleExcluir}
                  >
                    <Ionicons
                      name="trash"
                      size={18}
                      color="#FF3B30"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.deleteBtnText}>Excluir</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ========================================== */}
      {/* 🔴 MODAL 1: FOTO EM TELA CHEIA             */}
      {/* ========================================== */}
      <Modal
        visible={isImageModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalPhotoOverlay}>
          <TouchableOpacity
            style={styles.closePhotoBtn}
            onPress={() => setIsImageModalVisible(false)}
          >
            <Ionicons name="close-circle" size={36} color="#FFF" />
          </TouchableOpacity>
          {getImagemUrl() ? (
            <Image
              source={{ uri: getImagemUrl() as string }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          ) : (
            <Image
              source={require("../assets/images/infra.png")}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

      {/* ========================================== */}
      {/* 🔴 MODAL 2: TRANSFERIR SETOR               */}
      {/* ========================================== */}
      <Modal
        visible={isSetorModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalSectorOverlay}>
          <View style={styles.modalSectorContent}>
            <View style={styles.modalSectorHeader}>
              <Text style={styles.modalSectorTitle}>Escolha o novo Setor</Text>
              <TouchableOpacity onPress={() => setIsSetorModalVisible(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {listaSetores.map((setorItem, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.sectorListItem,
                    setorSelecionado === setorItem &&
                      styles.sectorListItemActive,
                  ]}
                  onPress={() => {
                    setSetorSelecionado(setorItem);
                    setIsSetorModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.sectorListText,
                      setorSelecionado === setorItem &&
                        styles.sectorListTextActive,
                    ]}
                  >
                    {setorItem}
                  </Text>
                  {setorSelecionado === setorItem && (
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color="#1F41BB"
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  expandIconOverlay: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
    borderRadius: 20,
  },

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

  // NOVA CAIXA DE RESPOSTA
  respostaBox: {
    marginTop: 15,
    backgroundColor: "#E4EBF7",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#1F41BB",
  },
  respostaTitle: {
    fontSize: moderateScale(14),
    fontWeight: "bold",
    color: "#1F41BB",
    marginBottom: 5,
  },
  respostaText: { fontSize: moderateScale(14), color: "#333", lineHeight: 20 },

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

  // NOVO BOTÃO DE SETOR
  sectorButton: {
    backgroundColor: "#F9F9F9",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectorButtonText: { fontSize: moderateScale(15), color: "#333" },

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

  // ESTILOS DAS MODAIS
  modalPhotoOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  closePhotoBtn: { position: "absolute", top: 50, right: 20, zIndex: 10 },
  fullScreenImage: { width: "100%", height: "80%" },

  modalSectorOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalSectorContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "60%",
  },
  modalSectorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalSectorTitle: {
    fontSize: moderateScale(18),
    fontWeight: "bold",
    color: "#333",
  },
  sectorListItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  sectorListItemActive: {
    backgroundColor: "#F4F7F8",
    borderRadius: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 0,
  },
  sectorListText: { fontSize: moderateScale(16), color: "#555" },
  sectorListTextActive: { color: "#1F41BB", fontWeight: "bold" },
});
