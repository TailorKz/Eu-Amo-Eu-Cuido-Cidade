import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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
} from "react-native";
import ImageView from "react-native-image-viewing";
import { SafeAreaView } from "react-native-safe-area-context";
import { Select } from "./src/components/Select";
import { useAuthStore } from "./src/store/useAuthStore";
import {
  moderateScale,
  scale,
  scaledFont,
  verticalScale,
} from "./src/utils/responsive";

export default function Detalhes() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const chamado = params.dados ? JSON.parse(params.dados as string) : null;
  const user = useAuthStore((state) => state.user);
  const cidadeSelecionada =
    useAuthStore((state) => state.cidadeSelecionada) || user?.cidade;

  const origem = params.origem as string;
  const isModoGestao = origem === "setor";
  const isModoVereador = origem === "fiscalizacao";

  const scrollRef = useRef<ScrollView>(null);

  const chatScrollRef = useRef<ScrollView>(null); //scroll do chat

  //ESTADOS DO CHAT
  interface MensagemChat {
    id: number;
    texto: string;
    remetente: string;
    dataHora: string;
  }
  const [mensagens, setMensagens] = useState<MensagemChat[]>([]);
  const [novaMensagem, setNovaMensagem] = useState("");
  const [isEnviandoMsg, setIsEnviandoMsg] = useState(false);

  // ESTADOS PARA O VISUAL DO CHAT
  const [isChatExpanded, setIsChatExpanded] = useState(true); // Começa fechado para não poluir a tela
  const chatY = useRef(0);
  const chatInputY = useRef(0);
  const infoCardY = useRef(0);

  const [isEditing, setIsEditing] = useState(false);
  const [editLocalizacao, setEditLocalizacao] = useState(
    chamado?.localizacao || "",
  );
  const [editObservacao, setEditObservacao] = useState(
    chamado?.observacao || "",
  );
  const [novoStatus, setNovoStatus] = useState(chamado?.status || "");
  const [respostaPrefeitura, setRespostaPrefeitura] = useState(
    chamado?.resposta || "",
  );

  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [imagemParaZoom, setImagemParaZoom] = useState<any>(null);
  const [imagemResolvidaUri, setImagemResolvidaUri] = useState<string | null>(
    null,
  );

  const [isUploading, setIsUploading] = useState(false);
  const [isSetorModalVisible, setIsSetorModalVisible] = useState(false);
  const [setorSelecionado, setSetorSelecionado] = useState(
    chamado?.categoria || "",
  );
  const [setoresDaCidade, setSetoresDaCidade] = useState<any[]>([]);

  const listaSetores = [
    "Infraestrutura",
    "Iluminação Pública",
    "Urbanismo",
    "Limpeza",
    "Saneamento e água",
    "Saúde Pública e Vigilância",
  ];

  const observacaoY = useRef(0);
  const adminCardY = useRef(0);
  const respostaY = useRef(0);

  useEffect(() => {
    if (isModoGestao) {
      carregarSetores();
    }
    // Carrega o histórico do chat sempre que abrir a tela
    if (chamado?.id) {
      carregarMensagens(); // Carrega na hora que abre a tela

      // procura novas mensagens a cada 5 segundos de forma invisível
      const intervaloChat = setInterval(() => {
        carregarMensagens();
      }, 5000);

      // Quando a pessoa sair desta tela, desligamos o relógio para poupar internet/bateria
      return () => clearInterval(intervaloChat);
    }
  }, []);

  const carregarMensagens = async () => {
    try {
      const response = await axios.get(
        `https://tailorkz-production-eu-amo.up.railway.app/api/solicitacoes/${chamado.id}/mensagens`,
      );
      setMensagens(response.data);
    } catch (error) {
      console.log("Erro ao carregar chat:", error);
    }
  };

  const handleEnviarMensagem = async () => {
    if (!novaMensagem.trim()) return;
    setIsEnviandoMsg(true);
    try {
      const remetente = isModoGestao ? "PREFEITURA" : "CIDADÃO";
      await axios.post(
        `https://tailorkz-production-eu-amo.up.railway.app/api/solicitacoes/${chamado.id}/mensagens`,
        null,
        { params: { texto: novaMensagem, remetente } },
      );
      setNovaMensagem("");
      await carregarMensagens();
      setTimeout(() => {
        chatScrollRef.current?.scrollToEnd({ animated: true });
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível enviar a mensagem.");
    } finally {
      setIsEnviandoMsg(false);
    }
  };

  const carregarSetores = async () => {
    try {
      const response = await axios.get(
        `https://tailorkz-production-eu-amo.up.railway.app/api/setores?cidade=${cidadeSelecionada}`,
      );
      setSetoresDaCidade(response.data);
    } catch (error) {
      console.log("Erro ao carregar os setores:", error);
    }
  };

  if (!chamado)
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={{ textAlign: "center", marginTop: 50 }}>
          Chamado não encontrado.
        </Text>
      </SafeAreaView>
    );

  const getImagemUrl = (urlOriginal?: string) => {
    if (!urlOriginal) return null;
    return urlOriginal.replace(
      "file:///C:/ipora_imagens/",
      "https://tailorkz-production-eu-amo.up.railway.app/imagens/",
    );
  };

  const handleSalvarEdicao = async () => {
    try {
      await axios.put(
        `https://tailorkz-production-eu-amo.up.railway.app/api/solicitacoes/${chamado.id}`,
        { localizacao: editLocalizacao, observacao: editObservacao },
      );
      Alert.alert("Sucesso", "Solicitação atualizada!");
      setIsEditing(false);
      chamado.localizacao = editLocalizacao;
      chamado.observacao = editObservacao;
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar.");
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
            await axios.delete(
              `https://tailorkz-production-eu-amo.up.railway.app/api/solicitacoes/${chamado.id}`,
            );
            Alert.alert("Excluído", "Solicitação removida.");
            router.replace("/reportos");
          } catch (error) {
            Alert.alert("Erro", "Não foi possível excluir. Tente novamente.");
          }
        },
      },
    ]);
  };

  async function handleOpenCameraResolvido() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted")
      return Alert.alert(
        "Permissão necessária",
        "Precisamos acessar a câmera.",
      );

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      const manipResult = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 800 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG },
      );
      setImagemResolvidaUri(manipResult.uri);
    }
  }

  async function handleOpenGalleryResolvido() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted")
      return Alert.alert(
        "Permissão necessária",
        "Precisamos acessar a galeria.",
      );

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      const manipResult = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 800 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG },
      );
      setImagemResolvidaUri(manipResult.uri);
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

      await axios.put(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Alert.alert("Atualizado!", "Dados alterados com sucesso.");
      router.replace("/reportos");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar os dados.");
    } finally {
      setIsUploading(false);
    }
  };

  const abrirNoMapa = () => {
    // Se o chamado tiver GPS exato, traça a rota milimétrica
    if (chamado.latitude && chamado.longitude) {
      Linking.openURL(
        `https://www.google.com/maps/dir/?api=1&destination=${chamado.latitude},${chamado.longitude}`,
      );
    } else {
      // Fallback para chamados antigos apenas com texto
      const enderecoFormatado = encodeURIComponent(
        `${chamado.localizacao}, ${cidadeSelecionada || ""}`,
      );
      Linking.openURL(
        `https://www.google.com/maps/dir/?api=1&destination=${enderecoFormatado}`,
      );
    }
  };

  const abrirZoom = (urlNuvem: string | null) => {
    setImagemParaZoom(
      urlNuvem ? { uri: urlNuvem } : require("../assets/images/infra.png"),
    );
    setIsImageModalVisible(true);
  };

  return (
    <>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ padding: moderateScale(5) }}
          >
            <Ionicons
              name="arrow-back"
              size={moderateScale(24)}
              color="#1F41BB"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {chamado.protocolo ? `Protocolo ${chamado.protocolo}` : "Detalhes"}
          </Text>
          <View style={{ width: scale(24) }} />
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={0}
        >
          <ScrollView
            ref={scrollRef}
            style={{ flex: 1 }}
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
          >
            <TouchableOpacity
              style={styles.imageContainer}
              activeOpacity={0.8}
              onPress={() => abrirZoom(getImagemUrl(chamado.urlImagem))}
            >
              <Image
                source={
                  getImagemUrl(chamado.urlImagem)
                    ? { uri: getImagemUrl(chamado.urlImagem) as string }
                    : require("../assets/images/infra.png")
                }
                style={styles.image}
                resizeMode="cover"
              />
              {!isEditing && (
                <View style={styles.expandIconOverlay}>
                  <Ionicons
                    name="expand"
                    size={moderateScale(20)}
                    color="#FFF"
                  />
                </View>
              )}
            </TouchableOpacity>

            <View 
              style={styles.infoCard}
              onLayout={(e) => { infoCardY.current = e.nativeEvent.layout.y; }}
            >
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

              {(isModoGestao || isModoVereador) && chamado.cidadao && (
                <View
                  style={{
                    backgroundColor: "#F0F4F8",
                    padding: moderateScale(12),
                    borderRadius: moderateScale(8),
                    marginTop: verticalScale(10),
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "bold",
                      color: "#1F41BB",
                      fontSize: moderateScale(13),
                      marginBottom: verticalScale(5),
                    }}
                  >
                    👤 Solicitante:
                  </Text>
                  <Text
                    style={{
                      color: "#333",
                      fontSize: moderateScale(14),
                      fontWeight: "bold",
                    }}
                  >
                    {chamado.cidadao.nome}
                  </Text>
                  <Text style={{ color: "#555", fontSize: moderateScale(13) }}>
                    {chamado.cidadao.telefone}
                  </Text>
                </View>
              )}

              <View style={styles.divider} />
              <Text
                style={[
                  styles.label,
                  {
                    marginTop: verticalScale(15),
                    marginBottom: verticalScale(10),
                  },
                ]}
              >
                Localização
              </Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={editLocalizacao}
                  onChangeText={setEditLocalizacao}
                />
              ) : (
                <View style={styles.row}>
                  <Ionicons
                    name="location"
                    size={moderateScale(18)}
                    color="#1F41BB"
                  />
                  <Text style={styles.valueText}>
                    {editLocalizacao || chamado.localizacao}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={{
                  backgroundColor: "#E8F0FE",
                  padding: moderateScale(12),
                  borderRadius: moderateScale(8),
                  alignItems: "center",
                  marginTop: verticalScale(20),
                  marginBottom: verticalScale(15),
                }}
                onPress={abrirNoMapa}
              >
                <Text
                  style={{
                    color: "#1F41BB",
                    fontWeight: "bold",
                    fontSize: moderateScale(14),
                  }}
                >
                  📍 Ver Rota no Mapa
                </Text>
              </TouchableOpacity>

              <Text style={[styles.label, { marginTop: verticalScale(15) }]}>
                Observação do Cidadão
              </Text>
              <View
                onLayout={(e) => {
                  observacaoY.current = e.nativeEvent.layout.y;
                }}
              >
                {isEditing ? (
                  <TextInput
                    style={[
                      styles.input,
                      { height: verticalScale(80), textAlignVertical: "top" },
                    ]}
                    multiline
                    value={editObservacao}
                    onChangeText={setEditObservacao}
                    onFocus={() =>
                      setTimeout(
                        () =>
                          scrollRef.current?.scrollTo({
                            y: observacaoY.current + 200,
                            animated: true,
                          }),
                        150,
                      )
                    }
                  />
                ) : (
                  <Text style={styles.observacaoText}>
                    {editObservacao ||
                      chamado.observacao ||
                      "Nenhuma observação informada."}
                  </Text>
                )}
              </View>

              {/* --- INÍCIO DO SISTEMA DE CHAT --- */}
              <View 
                style={styles.chatContainer}
                onLayout={(e) => { chatY.current = e.nativeEvent.layout.y; }}
              >
                {/* Cabeçalho expansível — igual ao original */}
                <TouchableOpacity
                  style={styles.chatHeader}
                  onPress={() => setIsChatExpanded(!isChatExpanded)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.chatTitle}>
                    <Ionicons name="chatbubbles" size={moderateScale(18)} />{" "}
                    Histórico de Conversa
                  </Text>
                  <Ionicons
                    name={isChatExpanded ? "chevron-up" : "chevron-down"}
                    size={moderateScale(20)}
                    color="#1F41BB"
                  />
                </TouchableOpacity>

                {isChatExpanded && (
                  <>
                    <ScrollView
                      ref={chatScrollRef}
                      style={styles.chatMessagesScroll}
                      contentContainerStyle={{
                        paddingBottom: verticalScale(10),
                      }}
                      showsVerticalScrollIndicator={false}
                      keyboardShouldPersistTaps="handled"
                      // Rola para o fim automaticamente quando novas mensagens chegam
                      onContentSizeChange={() =>
                        chatScrollRef.current?.scrollToEnd({ animated: false })
                      }
                    >
                      {mensagens.length === 0 ? (
                        <Text style={styles.chatEmpty}>
                          Nenhuma mensagem enviada ainda.
                        </Text>
                      ) : (
                        mensagens.map((msg) => {
                          const isPrefeitura = msg.remetente === "PREFEITURA";
                          return (
                            <View
                              key={msg.id}
                              style={[
                                styles.chatBubble,
                                isPrefeitura
                                  ? styles.chatBubblePrefeitura
                                  : styles.chatBubbleCidadao,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.chatRemetente,
                                  isPrefeitura
                                    ? { color: "#1F41BB" }
                                    : { color: "#E0E0E0" },
                                ]}
                              >
                                {isPrefeitura ? "🏢 Equipe Responsável" : "👤 Você"}
                              </Text>
                              <Text
                                style={[
                                  styles.chatTexto,
                                  isPrefeitura
                                    ? { color: "#333" }
                                    : { color: "#FFF" },
                                ]}
                              >
                                {msg.texto}
                              </Text>
                              <Text
                                style={[
                                  styles.chatData,
                                  isPrefeitura
                                    ? { color: "#999" }
                                    : { color: "#D0D0D0" },
                                ]}
                              >
                                {new Date(msg.dataHora).toLocaleString(
                                  "pt-BR",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    day: "2-digit",
                                    month: "2-digit",
                                  },
                                )}
                              </Text>
                            </View>
                          );
                        })
                      )}
                    </ScrollView>

                    <View 
                  style={styles.chatInputContainer}
                  // Descobre a posição exata do campo do chat
                  onLayout={(e) => { chatInputY.current = e.nativeEvent.layout.y; }}
                >
                  <TextInput
                    style={styles.chatInput}
                    placeholder="Digite sua mensagem..."
                    placeholderTextColor="#999"
                    value={novaMensagem}
                    onChangeText={setNovaMensagem}
                    multiline
                    onFocus={() => {
                      // tempo para o teclado abrir
                      setTimeout(() => {
                        scrollRef.current?.scrollTo({
                          y: infoCardY.current + chatY.current + chatInputY.current - 200,
                          animated: true,
                        });
                      }, 300);
                    }}
                  />
                  <TouchableOpacity style={styles.chatSendBtn} onPress={handleEnviarMensagem} disabled={isEnviandoMsg}>
                    {isEnviandoMsg ? <ActivityIndicator size="small" color="#FFF" /> : <Ionicons name="send" size={moderateScale(20)} color="#FFF" />}
                  </TouchableOpacity>
                </View>
                  </>
                )}
              </View>

              {!isModoGestao && chamado.resposta && (
                <View style={styles.respostaBox}>
                  <Text style={styles.respostaTitle}>
                    <Ionicons name="business" size={moderateScale(16)} />{" "}
                    Resposta do chamado:
                  </Text>
                  <Text style={styles.respostaText}>{chamado.resposta}</Text>
                  {chamado.urlImagemResolvida && (
                    <View style={{ marginTop: verticalScale(15) }}>
                      <Text
                        style={{
                          fontSize: moderateScale(13),
                          fontWeight: "bold",
                          color: "#1F41BB",
                          marginBottom: verticalScale(8),
                        }}
                      >
                        <Ionicons name="camera" size={moderateScale(14)} /> Foto
                        da Resolução:
                      </Text>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() =>
                          abrirZoom(getImagemUrl(chamado.urlImagemResolvida))
                        }
                      >
                        <Image
                          source={{
                            uri: getImagemUrl(
                              chamado.urlImagemResolvida,
                            ) as string,
                          }}
                          style={{
                            width: "100%",
                            height: verticalScale(140),
                            borderRadius: moderateScale(8),
                          }}
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </View>

            {isModoGestao && (
              <View
                style={styles.adminCard}
                onLayout={(e) => {
                  adminCardY.current = e.nativeEvent.layout.y;
                }}
              >
                <Text style={styles.adminTitle}>Sua resposta:</Text>
                <Text style={styles.label}>Atualizar Status:</Text>
                <View style={{ zIndex: 10, marginBottom: verticalScale(15) }}>
                  <Select
                    placeholder="Selecione o Status"
                    options={["PENDENTE", "EM ANDAMENTO", "RESOLVIDO"]}
                    onSelect={(val) => setNovoStatus(val)}
                  />
                </View>

                <Text style={styles.label}>Transferir de Setor:</Text>
                <TouchableOpacity
                  style={styles.sectorButton}
                  onPress={() => setIsSetorModalVisible(true)}
                >
                  <Text style={styles.sectorButtonText}>
                    {setorSelecionado}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={moderateScale(20)}
                    color="#666"
                  />
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
                      { height: verticalScale(80), textAlignVertical: "top" },
                    ]}
                    multiline
                    placeholder="Ex: A equipe já foi enviada..."
                    value={respostaPrefeitura}
                    onChangeText={setRespostaPrefeitura}
                    onFocus={() =>
                      setTimeout(
                        () =>
                          scrollRef.current?.scrollTo({
                            y: adminCardY.current + respostaY.current - 120,
                            animated: true,
                          }),
                        150,
                      )
                    }
                  />
                </View>

                <Text style={[styles.label, { marginTop: verticalScale(10) }]}>
                  Foto da Resolução:
                </Text>

                {imagemResolvidaUri ? (
                  <View style={styles.imageFilledContainer}>
                    <TouchableOpacity
                      style={{ flex: 1 }}
                      activeOpacity={0.8}
                      onPress={() => abrirZoom(imagemResolvidaUri)}
                    >
                      <Image
                        source={{ uri: imagemResolvidaUri }}
                        style={styles.previewImage}
                      />
                      <View style={styles.zoomHintOverlay}>
                        <Ionicons name="search" size={24} color="#FFF" />
                      </View>
                    </TouchableOpacity>
                    <View style={styles.overlayActionsRow}>
                      <TouchableOpacity
                        style={styles.overlayActionBtn}
                        onPress={handleOpenCameraResolvido}
                      >
                        <Ionicons
                          name="camera-reverse"
                          size={moderateScale(20)}
                          color="#FFF"
                        />
                        <Text style={styles.overlayActionText}>
                          Trocar Foto
                        </Text>
                      </TouchableOpacity>
                      <View style={styles.overlayActionDivider} />
                      <TouchableOpacity
                        style={styles.overlayActionBtn}
                        onPress={() => setImagemResolvidaUri(null)}
                      >
                        <Ionicons
                          name="trash"
                          size={moderateScale(20)}
                          color="#FF3B30"
                        />
                        <Text
                          style={[
                            styles.overlayActionText,
                            { color: "#FF3B30" },
                          ]}
                        >
                          Excluir
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : chamado?.urlImagemResolvida ? (
                  <TouchableOpacity
                    style={styles.photoPreviewContainer}
                    onPress={() =>
                      abrirZoom(getImagemUrl(chamado?.urlImagemResolvida))
                    }
                    activeOpacity={0.8}
                  >
                    <Image
                      source={{
                        uri: getImagemUrl(chamado.urlImagemResolvida) as string,
                      }}
                      style={{ width: "100%", height: verticalScale(160) }}
                      resizeMode="cover"
                    />
                    <View style={styles.expandIconOverlay}>
                      <Ionicons
                        name="expand"
                        size={moderateScale(20)}
                        color="#FFF"
                      />
                    </View>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.emptyPhotoContainer}>
                    <TouchableOpacity
                      style={styles.actionHalf}
                      onPress={handleOpenCameraResolvido}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name="camera"
                        size={moderateScale(40)}
                        color="#666"
                      />
                      <Text style={styles.cameraText}>Câmera</Text>
                    </TouchableOpacity>
                    <View style={styles.photoDivider} />
                    <TouchableOpacity
                      style={styles.actionHalf}
                      onPress={handleOpenGalleryResolvido}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name="images"
                        size={moderateScale(40)}
                        color="#666"
                      />
                      <Text style={styles.cameraText}>Galeria</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={handleAtualizarFuncionario}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.saveBtnText}>Salvar Atualização</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {!isModoGestao && !isModoVereador && (
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
                        size={moderateScale(18)}
                        color="#FFF"
                        style={{ marginRight: scale(8) }}
                      />
                      <Text style={styles.saveBtnText}>Editar Descrição</Text>
                    </TouchableOpacity>

                    {(!chamado.status || chamado.status === "PENDENTE") && (
                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={handleExcluir}
                      >
                        <Ionicons
                          name="trash"
                          size={moderateScale(18)}
                          color="#FF3B30"
                          style={{ marginRight: scale(8) }}
                        />
                        <Text style={styles.deleteBtnText}>
                          Excluir Solicitação
                        </Text>
                      </TouchableOpacity>
                    )}
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
                <Ionicons name="close" size={moderateScale(28)} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {setoresDaCidade.map((setorItem, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.sectorListItem,
                    setorSelecionado === setorItem.nome &&
                      styles.sectorListItemActive,
                  ]}
                  onPress={() => {
                    setSetorSelecionado(setorItem.nome); // Guarda o nome do novo setor
                    setIsSetorModalVisible(false); // Fecha a modal
                  }}
                >
                  <Text
                    style={[
                      styles.sectorListText,
                      setorSelecionado === setorItem.nome &&
                        styles.sectorListTextActive,
                    ]}
                  >
                    {setorItem.nome}
                  </Text>
                  {setorSelecionado === setorItem.nome && (
                    <Ionicons
                      name="checkmark-circle"
                      size={moderateScale(22)}
                      color="#1F41BB"
                    />
                  )}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: scale(16),
    backgroundColor: "#FFF",
    elevation: 2,
  },
  headerTitle: {
    fontSize: scaledFont(18),
    fontWeight: "700",
    color: "#333",
  },
  container: { padding: scale(16), paddingBottom: verticalScale(120) },
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
    bottom: verticalScale(10),
    right: scale(10),
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: moderateScale(8),
    borderRadius: moderateScale(20),
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
    marginBottom: verticalScale(5),
  },
  categoria: {
    fontSize: scaledFont(20),
    fontWeight: "bold",
    color: "#1F41BB",
  },
  badge: {
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(12),
  },
  badgeText: { color: "#FFF", fontSize: scaledFont(12), fontWeight: "bold" },
  divider: {
    height: 1,
    backgroundColor: "#EEE",
    marginVertical: verticalScale(15),
  },
  label: {
    fontSize: scaledFont(14),
    color: "#888",
    fontWeight: "600",
    marginBottom: verticalScale(5),
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: verticalScale(2),
  },
  valueText: {
    fontSize: scaledFont(15),
    color: "#333",
    marginLeft: scale(6),
    flex: 1,
  },
  observacaoText: {
    fontSize: scaledFont(17),
    color: "#444",
    lineHeight: verticalScale(22),
  },
  input: {
    backgroundColor: "#F9F9F9",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: moderateScale(8),
    padding: moderateScale(12),
    fontSize: scaledFont(15),
    color: "#333",
  },
  respostaBox: {
    marginTop: verticalScale(15),
    backgroundColor: "#E4EBF7",
    padding: moderateScale(12),
    borderRadius: moderateScale(8),
    borderLeftWidth: scale(4),
    borderLeftColor: "#1F41BB",
  },
  respostaTitle: {
    fontSize: scaledFont(16),
    fontWeight: "bold",
    color: "#1F41BB",
    marginBottom: verticalScale(5),
  },
  respostaText: {
    fontSize: scaledFont(16),
    color: "#333",
    lineHeight: verticalScale(20),
  },
  adminCard: {
    backgroundColor: "#E8EEF2",
    borderRadius: moderateScale(12),
    padding: scale(16),
    borderWidth: 1,
    borderColor: "#CDE0ED",
  },
  adminTitle: {
    fontSize: scaledFont(16),
    fontWeight: "bold",
    color: "#1F41BB",
    marginBottom: verticalScale(15),
    textAlign: "center",
  },
  sectorButton: {
    backgroundColor: "#F9F9F9",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: moderateScale(8),
    padding: moderateScale(12),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(15),
  },
  sectorButtonText: { fontSize: scaledFont(15), color: "#333" },
  photoPreviewContainer: {
    width: "100%",
    borderRadius: moderateScale(8),
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#DDD",
    position: "relative",
    marginBottom: verticalScale(15),
  },
  actionButtons: { marginTop: verticalScale(10) },
  saveBtn: {
    backgroundColor: "#1F41BB",
    padding: moderateScale(15),
    borderRadius: moderateScale(10),
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: verticalScale(10),
  },
  saveBtnText: {
    color: "#FFF",
    fontSize: scaledFont(18),
    fontWeight: "bold",
  },
  cancelBtn: {
    backgroundColor: "#CCC",
    padding: moderateScale(15),
    borderRadius: moderateScale(10),
    alignItems: "center",
  },
  cancelBtnText: {
    color: "#333",
    fontSize: scaledFont(18),
    fontWeight: "bold",
  },
  editBtn: {
    backgroundColor: "#1F41BB",
    padding: moderateScale(15),
    borderRadius: moderateScale(10),
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: verticalScale(15),
  },
  deleteBtn: {
    backgroundColor: "#FFEBEA",
    borderWidth: 1,
    borderColor: "#FFD2D0",
    padding: moderateScale(15),
    borderRadius: moderateScale(10),
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  deleteBtnText: {
    color: "#FF3B30",
    fontSize: scaledFont(18),
    fontWeight: "bold",
  },
  emptyPhotoContainer: {
    flexDirection: "row",
    width: "100%",
    height: verticalScale(140),
    backgroundColor: "#FFF",
    borderRadius: moderateScale(10),
    borderWidth: 1,
    borderColor: "#DDD",
    borderStyle: "dashed",
    marginBottom: verticalScale(20),
    overflow: "hidden",
  },
  actionHalf: { flex: 1, justifyContent: "center", alignItems: "center" },
  photoDivider: {
    width: 1,
    backgroundColor: "#DDD",
    marginVertical: verticalScale(15),
  },
  cameraText: {
    marginTop: verticalScale(8),
    fontSize: scaledFont(14),
    color: "#666",
    fontWeight: "600",
  },
  imageFilledContainer: {
    width: "100%",
    height: verticalScale(220),
    borderRadius: moderateScale(12),
    overflow: "hidden",
    marginBottom: verticalScale(20),
    position: "relative",
    borderWidth: 1,
    borderColor: "#DDD",
  },
  previewImage: { width: "100%", height: "100%", resizeMode: "cover" },
  zoomHintOverlay: {
    position: "absolute",
    top: "40%",
    left: "45%",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
    borderRadius: 30,
  },
  overlayActionsRow: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.75)",
  },
  overlayActionBtn: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: verticalScale(12),
  },
  overlayActionText: {
    color: "#FFF",
    marginLeft: scale(8),
    fontWeight: "700",
    fontSize: scaledFont(17),
  },
  overlayActionDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginVertical: verticalScale(10),
  },
  modalSectorOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalSectorContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    padding: moderateScale(20),
    maxHeight: "60%",
  },
  modalSectorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(20),
  },
  modalSectorTitle: {
    fontSize: scaledFont(18),
    fontWeight: "bold",
    color: "#333",
  },
  sectorListItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: verticalScale(15),
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  sectorListItemActive: {
    backgroundColor: "#F4F7F8",
    borderRadius: moderateScale(8),
    paddingHorizontal: scale(10),
    borderBottomWidth: 0,
  },
  sectorListText: { fontSize: moderateScale(16), color: "#555" },
  sectorListTextActive: { color: "#1F41BB", fontWeight: "bold" },

  chatContainer: {
    marginTop: verticalScale(20),
    backgroundColor: "#F9F9F9",
    borderRadius: moderateScale(12),
    padding: scale(16),
    borderWidth: 1,
    borderColor: "#EEE",
  },
  chatTitle: {
    fontSize: scaledFont(16),
    fontWeight: "bold",
    color: "#1F41BB",
    marginBottom: verticalScale(15),
  },
  chatEmpty: {
    color: "#999",
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: verticalScale(10),
  },
  chatBubble: {
    padding: scale(12),
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(10),
    maxWidth: "85%",
  },
  chatBubblePrefeitura: {
    backgroundColor: "#E4EBF7",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 0,
  },
  chatBubbleCidadao: {
    backgroundColor: "#1F41BB",
    alignSelf: "flex-end",
    borderBottomRightRadius: 0,
  },
  chatRemetente: {
    fontSize: scaledFont(12),
    fontWeight: "bold",
    marginBottom: verticalScale(4),
  },
  chatTexto: { fontSize: scaledFont(15) },
  chatData: {
    fontSize: scaledFont(10),
    marginTop: verticalScale(5),
    textAlign: "right",
  },
  chatInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: verticalScale(15),
    borderTopWidth: 1,
    borderTopColor: "#DDD",
    paddingTop: verticalScale(15),
  },
  chatInput: {
    flex: 1,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: moderateScale(20),
    paddingHorizontal: scale(15),
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(10),
    minHeight: verticalScale(45),
    maxHeight: verticalScale(100),
  },
  chatSendBtn: {
    backgroundColor: "#1F41BB",
    width: moderateScale(45),
    height: moderateScale(45),
    borderRadius: moderateScale(25),
    justifyContent: "center",
    alignItems: "center",
    marginLeft: scale(10),
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(10),
  },

  chatMessagesScroll: {
    maxHeight: verticalScale(280),
    marginBottom: verticalScale(5),
  },
});
