import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import * as Linking from "expo-linking";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ImageView from "react-native-image-viewing";
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
  const isModoVereador = origem === "fiscalizacao";

  const scrollRef = useRef<ScrollView>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editLocalizacao, setEditLocalizacao] = useState(chamado?.localizacao || "");
  const [editObservacao, setEditObservacao] = useState(chamado?.observacao || "");
  const [novoStatus, setNovoStatus] = useState(chamado?.status || "");
  const [respostaPrefeitura, setRespostaPrefeitura] = useState(chamado?.resposta || "");
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [imagemParaZoom, setImagemParaZoom] = useState<any>(null);
  const [imagemResolvidaUri, setImagemResolvidaUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSetorModalVisible, setIsSetorModalVisible] = useState(false);
  const [setorSelecionado, setSetorSelecionado] = useState(chamado?.categoria || "");

  const listaSetores = [
    "Infraestrutura",
    "Iluminação Pública",
    "Urbanismo",
    "Limpeza",
    "Saneamento e água",
    "Saúde Pública e Vigilância",
  ];

  const observacaoY = useRef(0);
  // ✅ Dois refs: um para o card inteiro, outro para o campo dentro do card
  const adminCardY = useRef(0);
  const respostaY = useRef(0);

  if (!chamado) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={{ textAlign: "center", marginTop: verticalScale(50) }}>
          Chamado não encontrado.
        </Text>
      </SafeAreaView>
    );
  }

  const getImagemUrl = (urlOriginal?: string) => {
    if (!urlOriginal) return null;
    return urlOriginal.replace(
      "file:///C:/ipora_imagens/",
      "https://tailorkz-production-eu-amo.up.railway.app/imagens/",
    );
  };

  const handleSalvarEdicao = async () => {
    try {
      const url = `https://tailorkz-production-eu-amo.up.railway.app/api/solicitacoes/${chamado.id}`;
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
            const url = `https://tailorkz-production-eu-amo.up.railway.app/api/solicitacoes/${chamado.id}`;
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

  async function handleOpenCameraResolvido() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Precisamos aceder à câmara para tirar a foto.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });
    if (!result.canceled) {
      setImagemResolvidaUri(result.assets[0].uri);
    }
  }

  const handleAtualizarFuncionario = async () => {
    setIsUploading(true);
    try {
      const url = `https://tailorkz-production-eu-amo.up.railway.app/api/solicitacoes/${chamado.id}/atualizar-com-foto`;
      const formData = new FormData();
      formData.append("status", novoStatus.replace(" ", "_"));
      formData.append("categoria", setorSelecionado);
      formData.append("resposta", respostaPrefeitura);

      if (imagemResolvidaUri) {
        const filename = imagemResolvidaUri.split("/").pop();
        const match = /\.(\w+)$/.exec(filename || "");
        const type = match ? `image/${match[1]}` : `image/jpeg`;
        formData.append("imagemResolvida", {
          uri: imagemResolvidaUri,
          name: filename,
          type: type,
        } as any);
      }

      await axios.put(url, formData, { headers: { "Content-Type": "multipart/form-data" } });
      Alert.alert("Atualizado!", "Dados alterados com sucesso.");
      router.replace("/reportos");
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível atualizar os dados.");
    } finally {
      setIsUploading(false);
    }
  };

  const abrirNoMapa = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(chamado.localizacao)}`;
    Linking.openURL(url);
  };

  const abrirZoom = (urlNuvem: string | null) => {
    const source = urlNuvem ? { uri: urlNuvem } : require("../assets/images/infra.png");
    setImagemParaZoom(source);
    setIsImageModalVisible(true);
  };

  return (
    <>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: moderateScale(5) }}>
            <Ionicons name="arrow-back" size={moderateScale(24)} color="#1F41BB" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
          {chamado.protocolo ? `Protocolo ${chamado.protocolo}` : "Detalhes da Solicitação"}
        </Text>
          <View style={{ width: scale(24) }} />
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
            {/* 1. ÁREA DA IMAGEM DO PROBLEMA */}
            <TouchableOpacity
              style={styles.imageContainer}
              activeOpacity={0.8}
              onPress={() => abrirZoom(getImagemUrl(chamado.urlImagem))}
            >
              {getImagemUrl(chamado.urlImagem) ? (
                <Image source={{ uri: getImagemUrl(chamado.urlImagem) as string }} style={styles.image} resizeMode="cover" />
              ) : (
                <Image source={require("../assets/images/infra.png")} style={styles.image} />
              )}
              {!isEditing && (
                <View style={styles.expandIconOverlay}>
                  <Ionicons name="expand" size={moderateScale(20)} color="#FFF" />
                </View>
              )}
            </TouchableOpacity>

            {/* 2. INFORMAÇÕES BÁSICAS */}
            <View style={styles.infoCard}>
              <View style={styles.rowBetween}>
                <Text style={styles.categoria}>{chamado.categoria}</Text>
                <View style={[styles.badge, { backgroundColor: chamado.status === "RESOLVIDO" ? "#4CAF50" : "#F44336" }]}>
                  <Text style={styles.badgeText}>{chamado.status.replace("_", " ")}</Text>
                </View>
              </View>

              {(isModoGestao || isModoVereador) && chamado.cidadao && (
                <View style={{ backgroundColor: '#F0F4F8', padding: moderateScale(12), borderRadius: moderateScale(8), marginTop: verticalScale(10) }}>
                  <Text style={{ fontWeight: 'bold', color: '#1F41BB', fontSize: moderateScale(13), marginBottom: verticalScale(5) }}>
                    👤 Solicitante:
                  </Text>
                  <Text style={{ color: '#333', fontSize: moderateScale(14), fontWeight: 'bold', marginBottom: verticalScale(2) }}>
                    {chamado.cidadao.nome}
                  </Text>
                  <Text style={{ color: '#555', fontSize: moderateScale(13) }}>
                    {chamado.cidadao.telefone}
                  </Text>
                </View>
              )}

              <View style={styles.divider} />
              <Text style={[styles.label, { marginTop: verticalScale(15), marginBottom: verticalScale(10) }]}>Localização</Text>

              {isEditing ? (
                <TextInput style={styles.input} value={editLocalizacao} onChangeText={setEditLocalizacao} />
              ) : (
                <View style={styles.row}>
                  <Ionicons name="location" size={moderateScale(18)} color="#1F41BB" />
                  <Text style={styles.valueText}>{chamado.localizacao}</Text>
                </View>
              )}

              <TouchableOpacity
                style={{ backgroundColor: '#E8F0FE', padding: moderateScale(12), borderRadius: moderateScale(8), alignItems: 'center', marginTop: verticalScale(20), marginBottom: verticalScale(15) }}
                onPress={abrirNoMapa}
              >
                <Text style={{ color: '#1F41BB', fontWeight: 'bold', fontSize: moderateScale(14) }}>📍 Ver Rota no Mapa</Text>
              </TouchableOpacity>

              <Text style={[styles.label, { marginTop: verticalScale(15) }]}>Observação do Cidadão</Text>
              <View
                onLayout={(e) => {
                  observacaoY.current = e.nativeEvent.layout.y;
                }}
              >
                {isEditing ? (
                  <TextInput
                    style={[styles.input, { height: verticalScale(80), textAlignVertical: "top" }]}
                    multiline
                    value={editObservacao}
                    onChangeText={setEditObservacao}
                    onFocus={() => {
                      setTimeout(() => {
                        scrollRef.current?.scrollTo({
                          y: observacaoY.current + verticalScale(200) + verticalScale(15) + scale(16) - 20,
                          animated: true,
                        });
                      }, 150);
                    }}
                  />
                ) : (
                  <Text style={styles.observacaoText}>{chamado.observacao || "Nenhuma observação informada."}</Text>
                )}
              </View>

              {(!isModoGestao && chamado.resposta) && (
                <View style={styles.respostaBox}>
                  <Text style={styles.respostaTitle}>
                    <Ionicons name="business" size={moderateScale(16)} /> Resposta da Prefeitura:
                  </Text>
                  <Text style={styles.respostaText}>{chamado.resposta}</Text>

                  {chamado.urlImagemResolvida && (
                    <View style={{ marginTop: verticalScale(15) }}>
                      <Text style={{ fontSize: moderateScale(13), fontWeight: 'bold', color: '#1F41BB', marginBottom: verticalScale(8) }}>
                        <Ionicons name="camera" size={moderateScale(14)} /> Foto da Resolução:
                      </Text>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => abrirZoom(getImagemUrl(chamado.urlImagemResolvida))}
                      >
                        <Image
                          source={{ uri: getImagemUrl(chamado.urlImagemResolvida) as string }}
                          style={{ width: '100%', height: verticalScale(140), borderRadius: moderateScale(8) }}
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* 3A. VISÃO DO FUNCIONÁRIO */}
            {isModoGestao && (
              // ✅ onLayout aqui captura onde o card começa no ScrollView
              <View
                style={styles.adminCard}
                onLayout={(e) => {
                  adminCardY.current = e.nativeEvent.layout.y;
                }}
              >
                <Text style={styles.adminTitle}>Painel da Prefeitura</Text>

                <Text style={styles.label}>Atualizar Status:</Text>
                <View style={{ zIndex: 10, marginBottom: verticalScale(15) }}>
                  <Select
                    placeholder="Selecione o Status"
                    options={["PENDENTE", "EM ANDAMENTO", "RESOLVIDO"]}
                    onSelect={(val) => setNovoStatus(val)}
                  />
                </View>

                <Text style={styles.label}>Transferir de Setor:</Text>
                <TouchableOpacity style={styles.sectorButton} onPress={() => setIsSetorModalVisible(true)}>
                  <Text style={styles.sectorButtonText}>{setorSelecionado}</Text>
                  <Ionicons name="chevron-down" size={moderateScale(20)} color="#666" />
                </TouchableOpacity>

                <Text style={styles.label}>Resposta Oficial ao Cidadão:</Text>
                
                <View
                  onLayout={(e) => {
                    respostaY.current = e.nativeEvent.layout.y;
                  }}
                >
                  <TextInput
                    style={[styles.input, { height: verticalScale(80), textAlignVertical: "top" }]}
                    multiline
                    placeholder="Ex: A equipe já foi enviada ao local..."
                    value={respostaPrefeitura}
                    onChangeText={setRespostaPrefeitura}
                    onFocus={() => {
                      setTimeout(() => {
                        scrollRef.current?.scrollTo({
                          y: adminCardY.current + respostaY.current - 120,
                          animated: true,
                        });
                      }, 150);
                    }}
                  />
                </View>

                <Text style={[styles.label, { marginTop: verticalScale(10) }]}>Foto da Resolução (Opcional):</Text>

                {imagemResolvidaUri || chamado?.urlImagemResolvida ? (
                  <View style={{ marginBottom: verticalScale(20) }}>
                    <TouchableOpacity
                      style={styles.photoPreviewContainer}
                      onPress={() => abrirZoom(imagemResolvidaUri || getImagemUrl(chamado?.urlImagemResolvida))}
                      activeOpacity={0.8}
                    >
                      <Image
                        source={{ uri: imagemResolvidaUri || (getImagemUrl(chamado.urlImagemResolvida) as string) }}
                        style={{ width: '100%', height: verticalScale(160) }}
                        resizeMode="cover"
                      />
                      <View style={styles.expandIconOverlay}>
                        <Ionicons name="expand" size={moderateScale(20)} color="#FFF" />
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderWidth: 1, borderColor: '#1F41BB', borderRadius: moderateScale(8) }}
                      onPress={handleOpenCameraResolvido}
                    >
                      <Ionicons name="camera-reverse" size={moderateScale(18)} color="#1F41BB" />
                      <Text style={{ color: '#1F41BB', marginLeft: scale(8), fontWeight: 'bold' }}>Tirar outra foto</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.photoButton}
                    onPress={handleOpenCameraResolvido}
                    activeOpacity={0.8}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="camera" size={moderateScale(20)} color="#666" />
                      <Text style={[styles.photoButtonText, { marginLeft: scale(8) }]}>Tirar foto do problema resolvido</Text>
                    </View>
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.saveBtn} onPress={handleAtualizarFuncionario} disabled={isUploading}>
                  {isUploading ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.saveBtnText}>Salvar Atualização</Text>}
                </TouchableOpacity>
              </View>
            )}

            {/* 3B. VISÃO DO CIDADÃO */}
            {(!isModoGestao && !isModoVereador) && (
              <View style={styles.actionButtons}>
                {isEditing ? (
                  <>
                    <TouchableOpacity style={styles.saveBtn} onPress={handleSalvarEdicao}><Text style={styles.saveBtnText}>Salvar Alterações</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsEditing(false)}><Text style={styles.cancelBtnText}>Cancelar</Text></TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditing(true)}>
                      <Ionicons name="pencil" size={moderateScale(18)} color="#FFF" style={{ marginRight: scale(8) }} />
                      <Text style={styles.saveBtnText}>Editar Solicitação</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteBtn} onPress={handleExcluir}>
                      <Ionicons name="trash" size={moderateScale(18)} color="#FF3B30" style={{ marginRight: scale(8) }} />
                      <Text style={styles.deleteBtnText}>Excluir</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {isImageModalVisible && (
        <ImageView
          images={imagemParaZoom ? [imagemParaZoom] : []}
          imageIndex={0}
          visible={isImageModalVisible}
          onRequestClose={() => setIsImageModalVisible(false)}
          swipeToCloseEnabled={true}
          doubleTapToZoomEnabled={true}
        />
      )}

      <Modal visible={isSetorModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalSectorOverlay}>
          <View style={styles.modalSectorContent}>
            <View style={styles.modalSectorHeader}>
              <Text style={styles.modalSectorTitle}>Escolha o novo Setor</Text>
              <TouchableOpacity onPress={() => setIsSetorModalVisible(false)}>
                <Ionicons name="close" size={moderateScale(28)} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {listaSetores.map((setorItem, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.sectorListItem, setorSelecionado === setorItem && styles.sectorListItemActive]}
                  onPress={() => { setSetorSelecionado(setorItem); setIsSetorModalVisible(false); }}
                >
                  <Text style={[styles.sectorListText, setorSelecionado === setorItem && styles.sectorListTextActive]}>{setorItem}</Text>
                  {setorSelecionado === setorItem && <Ionicons name="checkmark-circle" size={moderateScale(22)} color="#1F41BB" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F4F7F8" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: scale(16), backgroundColor: "#FFF", elevation: 2 },
  headerTitle: { fontSize: moderateScale(18), fontWeight: "700", color: "#333" },
  container: { padding: scale(16), paddingBottom: verticalScale(50) },
  imageContainer: { width: "100%", height: verticalScale(200), borderRadius: moderateScale(12), overflow: "hidden", marginBottom: verticalScale(15), position: "relative" },
  image: { width: "100%", height: "100%", backgroundColor: "#E0E0E0" },
  expandIconOverlay: { position: "absolute", bottom: verticalScale(10), right: scale(10), backgroundColor: "rgba(0,0,0,0.5)", padding: moderateScale(8), borderRadius: moderateScale(20) },
  infoCard: { backgroundColor: "#FFF", borderRadius: moderateScale(12), padding: scale(16), marginBottom: verticalScale(20), elevation: 1 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: verticalScale(5) },
  categoria: { fontSize: moderateScale(20), fontWeight: "bold", color: "#1F41BB" },
  badge: { paddingHorizontal: scale(10), paddingVertical: verticalScale(4), borderRadius: moderateScale(12) },
  badgeText: { color: "#FFF", fontSize: moderateScale(12), fontWeight: "bold" },
  divider: { height: 1, backgroundColor: "#EEE", marginVertical: verticalScale(15) },
  label: { fontSize: moderateScale(13), color: "#888", fontWeight: "600", marginBottom: verticalScale(5), textTransform: "uppercase" },
  row: { flexDirection: "row", alignItems: "center", marginTop: verticalScale(2) },
  valueText: { fontSize: moderateScale(15), color: "#333", marginLeft: scale(6), flex: 1 },
  observacaoText: { fontSize: moderateScale(15), color: "#444", lineHeight: verticalScale(22) },
  input: { backgroundColor: "#F9F9F9", borderWidth: 1, borderColor: "#DDD", borderRadius: moderateScale(8), padding: moderateScale(12), fontSize: moderateScale(15), color: "#333" },
  respostaBox: { marginTop: verticalScale(15), backgroundColor: "#E4EBF7", padding: moderateScale(12), borderRadius: moderateScale(8), borderLeftWidth: scale(4), borderLeftColor: "#1F41BB" },
  respostaTitle: { fontSize: moderateScale(14), fontWeight: "bold", color: "#1F41BB", marginBottom: verticalScale(5) },
  respostaText: { fontSize: moderateScale(14), color: "#333", lineHeight: verticalScale(20) },
  adminCard: { backgroundColor: "#E8EEF2", borderRadius: moderateScale(12), padding: scale(16), borderWidth: 1, borderColor: "#CDE0ED" },
  adminTitle: { fontSize: moderateScale(16), fontWeight: "bold", color: "#1F41BB", marginBottom: verticalScale(15), textAlign: "center" },
  sectorButton: { backgroundColor: "#F9F9F9", borderWidth: 1, borderColor: "#DDD", borderRadius: moderateScale(8), padding: moderateScale(12), flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: verticalScale(15) },
  sectorButtonText: { fontSize: moderateScale(15), color: "#333" },
  photoButton: { backgroundColor: "#FFF", borderWidth: 1, borderColor: "#DDD", borderStyle: "dashed", borderRadius: moderateScale(8), padding: moderateScale(15), alignItems: "center", marginBottom: verticalScale(20) },
  photoButtonText: { fontSize: moderateScale(14), color: "#666", fontWeight: "500" },
  photoPreviewContainer: { width: "100%", borderRadius: moderateScale(8), overflow: "hidden", borderWidth: 1, borderColor: "#DDD", position: 'relative' },
  actionButtons: { marginTop: verticalScale(10) },
  saveBtn: { backgroundColor: "#1F41BB", padding: moderateScale(15), borderRadius: moderateScale(10), alignItems: "center", flexDirection: "row", justifyContent: "center", marginBottom: verticalScale(10) },
  saveBtnText: { color: "#FFF", fontSize: moderateScale(16), fontWeight: "bold" },
  cancelBtn: { backgroundColor: "#CCC", padding: moderateScale(15), borderRadius: moderateScale(10), alignItems: "center" },
  cancelBtnText: { color: "#333", fontSize: moderateScale(16), fontWeight: "bold" },
  editBtn: { backgroundColor: "#1F41BB", padding: moderateScale(15), borderRadius: moderateScale(10), alignItems: "center", flexDirection: "row", justifyContent: "center", marginBottom: verticalScale(15) },
  deleteBtn: { backgroundColor: "#FFEBEA", borderWidth: 1, borderColor: "#FFD2D0", padding: moderateScale(15), borderRadius: moderateScale(10), alignItems: "center", flexDirection: "row", justifyContent: "center" },
  deleteBtnText: { color: "#FF3B30", fontSize: moderateScale(16), fontWeight: "bold" },
  modalSectorOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalSectorContent: { backgroundColor: "#FFF", borderTopLeftRadius: moderateScale(20), borderTopRightRadius: moderateScale(20), padding: moderateScale(20), maxHeight: "60%" },
  modalSectorHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: verticalScale(20) },
  modalSectorTitle: { fontSize: moderateScale(18), fontWeight: "bold", color: "#333" },
  sectorListItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: verticalScale(15), borderBottomWidth: 1, borderBottomColor: "#EEE" },
  sectorListItemActive: { backgroundColor: "#F4F7F8", borderRadius: moderateScale(8), paddingHorizontal: scale(10), borderBottomWidth: 0 },
  sectorListText: { fontSize: moderateScale(16), color: "#555" },
  sectorListTextActive: { color: "#1F41BB", fontWeight: "bold" },
});