import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
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
// 🔴 NOVO: Importação do Mapa
import MapView, { Marker } from "react-native-maps";
import { useAuthStore } from "./src/store/useAuthStore";
import { moderateScale, scale, verticalScale } from "./src/utils/responsive";

export default function Solicitacao() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const categoria = params.categoria || "Geral";
  const user = useAuthStore((state) => state.user);

  // 🔴 Pega a cidade correta
  const cidadeSelecionada =
    useAuthStore((state) => state.cidadeSelecionada) || user?.cidade;

  const scrollRef = useRef<ScrollView>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [locationText, setLocationText] = useState("");
  const [observation, setObservation] = useState("");
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔴 NOVOS ESTADOS PARA O MAPA INTERATIVO
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);
  const [selectedCoordinate, setSelectedCoordinate] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const localizacaoY = useRef(0);
  const observacaoY = useRef(0);

  useEffect(() => {
    fetchLocation();
  }, []);

  async function fetchLocation() {
    setIsLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissão negada",
          "Precisamos da localização para registar o problema.",
        );
        setIsLoadingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // 🔴 Salva a coordenada exata para quando o utilizador abrir o Mapa
      setSelectedCoordinate({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (geocode.length > 0) {
        processarGeocode(geocode[0]);
      }
    } catch (error) {
      console.log("Erro ao buscar localização:", error);
      Alert.alert("Erro", "Não foi possível obter a localização automática.");
    } finally {
      setIsLoadingLocation(false);
    }
  }

  // 🔴 NOVA FUNÇÃO: Transforma as coordenadas em texto limpo com o filtro de Falsos Bairros
  const processarGeocode = (address: Location.LocationGeocodedAddress) => {
    const street = address.street || address.name || "Endereço não encontrado";
    const streetNumber = address.streetNumber
      ? `, ${address.streetNumber}`
      : "";
    const neighborhood = address.district || address.subregion || "";

    // Filtro de Falsos Bairros
    const falsosBairros = [
      "São Miguel do Oeste",
      "Descanso",
      "Santa Helena",
      "Tunápolis",
      "Belmonte",
      "Mondaí",
      "Itapiranga",
    ];
    let neighborhoodText = "";
    if (neighborhood && !falsosBairros.includes(neighborhood)) {
      neighborhoodText = ` - ${neighborhood}`;
    }

    setLocationText(
      `${street}${streetNumber}${neighborhoodText} - ${cidadeSelecionada}`,
    );
  };

  // 🔴 NOVA FUNÇÃO: Quando o utilizador clica em "Confirmar" no mapa interativo
  const handleConfirmMapLocation = async () => {
    if (!selectedCoordinate) return;
    setIsMapModalVisible(false);
    setIsLoadingLocation(true);

    try {
      const geocode = await Location.reverseGeocodeAsync({
        latitude: selectedCoordinate.latitude,
        longitude: selectedCoordinate.longitude,
      });

      if (geocode.length > 0) {
        processarGeocode(geocode[0]);
      }
    } catch (error) {
      console.log("Erro ao reverter geocodificação do mapa:", error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  async function handleOpenCamera() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissão necessária",
        "Precisamos aceder à câmara para tirar a foto do problema.",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  }

  async function handleSubmit() {
    if (!imageUri) {
      Alert.alert("Atenção", "Por favor, tire uma foto do problema.");
      return;
    }
    if (!locationText.trim()) {
      Alert.alert("Atenção", "A localização não pode ficar vazia.");
      return;
    }
    if (!user) {
      Alert.alert("Erro", "Precisa estar logado para enviar uma solicitação.");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = `https://tailorkz-production-eu-amo.up.railway.app/api/solicitacoes/nova/${user.id}`;
      const formData = new FormData();
      formData.append("categoria", String(categoria));
      formData.append("localizacao", locationText);
      formData.append("observacao", observation);

      const filename = imageUri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename || "");
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      formData.append("imagem", {
        uri: imageUri,
        name: filename,
        type: type,
      } as any);

      await axios.post(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Alert.alert(
        "Sucesso!",
        "A sua solicitação foi enviada para a prefeitura.",
        [{ text: "OK", onPress: () => router.replace("/home") }],
      );
    } catch (error) {
      console.log("Erro ao enviar solicitação:", error);
      Alert.alert(
        "Erro",
        "Não foi possível enviar a solicitação. Tente novamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F4F7F8" }}>
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
        <Text style={styles.headerTitle}>Nova Solicitação</Text>
        <View style={{ width: moderateScale(24) }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>
            Faça a sua solicitação para o setor responsável por:{"\n"}
            <Text style={styles.categoryHighlight}>{categoria}</Text>
          </Text>

          <TouchableOpacity
            style={styles.photoContainer}
            onPress={handleOpenCamera}
            activeOpacity={0.8}
          >
            {imageUri ? (
              <View style={{ width: "100%", height: "100%" }}>
                <Image source={{ uri: imageUri }} style={styles.previewImage} />
                <View style={styles.retakeOverlay}>
                  <Ionicons
                    name="camera-reverse"
                    size={moderateScale(24)}
                    color="#FFF"
                  />
                  <Text style={styles.retakeText}>Tirar outra foto</Text>
                </View>
              </View>
            ) : (
              <View style={styles.cameraPlaceholder}>
                <Ionicons
                  name="camera"
                  size={moderateScale(50)}
                  color="#1F41BB"
                />
                <Text style={styles.cameraText}>Tocar para abrir a câmara</Text>
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.inputLabel}>Localização</Text>

          <View
            style={styles.inputWrapper}
            onLayout={(e) => {
              localizacaoY.current = e.nativeEvent.layout.y;
            }}
          >
            <Ionicons
              name="location-outline"
              size={moderateScale(20)}
              color="#1F41BB"
              style={styles.inputIcon}
            />
            {isLoadingLocation ? (
              <ActivityIndicator
                size="small"
                color="#1F41BB"
                style={{ marginLeft: scale(10) }}
              />
            ) : (
              <TextInput
                style={styles.input}
                value={locationText}
                onChangeText={setLocationText}
                placeholder="A aguardar GPS..."
                placeholderTextColor="#999"
                onFocus={() => {
                  setTimeout(() => {
                    scrollRef.current?.scrollTo({
                      y: localizacaoY.current - 20,
                      animated: true,
                    });
                  }, 150);
                }}
              />
            )}
          </View>

          {/* 🔴 NOVO BOTÃO: Abrir o Mapa Interativo */}
          <TouchableOpacity
            style={styles.openMapBtn}
            onPress={() => setIsMapModalVisible(true)}
          >
            <Ionicons name="map" size={16} color="#1F41BB" />
            <Text style={styles.openMapBtnText}>
              Ajustar localização no mapa
            </Text>
          </TouchableOpacity>

          <Text style={styles.hintText}>
            * Pode digitar o endereço manualmente ou usar o mapa acima se o GPS
            falhar.
          </Text>

          <Text style={styles.inputLabel}>Observações (Opcional)</Text>

          <View
            style={[styles.inputWrapper, styles.textAreaWrapper]}
            onLayout={(e) => {
              observacaoY.current = e.nativeEvent.layout.y;
            }}
          >
            <TextInput
              style={[styles.input, styles.textArea]}
              value={observation}
              onChangeText={setObservation}
              placeholder="Descreva detalhes do problema ou ponto de referência."
              placeholderTextColor="#999"
              multiline
              textAlignVertical="top"
              onFocus={() => {
                setTimeout(() => {
                  scrollRef.current?.scrollTo({
                    y: observacaoY.current - 20,
                    animated: true,
                  });
                }, 150);
              }}
            />
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="large" color="#FFF" />
            ) : (
              <Text style={styles.submitButtonText}>Enviar Solicitação</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ========================================== */}
      {/* 🔴 MODAL INTERATIVA DO MAPA              */}
      {/* ========================================== */}
      <Modal
        visible={isMapModalVisible}
        animationType="slide"
        transparent={false}
      >
        <View style={styles.mapModalContainer}>
          <View style={styles.mapModalHeader}>
            <Text style={styles.mapModalTitle}>Ajuste o Alfinete</Text>
            <TouchableOpacity
              onPress={() => setIsMapModalVisible(false)}
              style={{ padding: 5 }}
            >
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.mapInstructions}>
            <Text style={styles.mapInstructionsText}>
              Toque ou arraste no mapa para apontar o local exato do problema.
            </Text>
          </View>

          {selectedCoordinate ? (
            <MapView
              style={styles.mapArea}
              initialRegion={{
                latitude: selectedCoordinate.latitude,
                longitude: selectedCoordinate.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
              // Atualiza o pino quando o utilizador toca no mapa
              onPress={(e) => setSelectedCoordinate(e.nativeEvent.coordinate)}
            >
              <Marker
                coordinate={selectedCoordinate}
                draggable // Permite arrastar o pino
                onDragEnd={(e) =>
                  setSelectedCoordinate(e.nativeEvent.coordinate)
                }
              />
            </MapView>
          ) : (
            <View
              style={[
                styles.mapArea,
                { justifyContent: "center", alignItems: "center" },
              ]}
            >
              <ActivityIndicator size="large" color="#1F41BB" />
            </View>
          )}

          <View style={styles.mapModalFooter}>
            <TouchableOpacity
              style={styles.confirmMapBtn}
              onPress={handleConfirmMapLocation}
            >
              <Text style={styles.confirmMapBtnText}>Confirmar este Local</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: verticalScale(50),
    paddingBottom: verticalScale(15),
    paddingHorizontal: scale(16),
    backgroundColor: "#FFF",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    zIndex: 10,
  },
  backButton: { padding: moderateScale(5) },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: "600",
    color: "#333",
  },
  container: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(50),
  },
  title: {
    fontSize: moderateScale(18),
    color: "#333",
    textAlign: "center",
    fontWeight: "500",
    marginBottom: verticalScale(25),
    lineHeight: verticalScale(24),
  },
  categoryHighlight: {
    fontSize: moderateScale(22),
    fontWeight: "bold",
    color: "#1F41BB",
  },

  photoContainer: {
    width: "100%",
    height: verticalScale(200),
    backgroundColor: "#E9ECEF",
    borderRadius: moderateScale(16),
    overflow: "hidden",
    marginBottom: verticalScale(25),
    borderWidth: 2,
    borderColor: "#D1D9E6",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraPlaceholder: { alignItems: "center" },
  cameraText: {
    marginTop: verticalScale(10),
    fontSize: moderateScale(14),
    color: "#666",
    fontWeight: "600",
  },
  previewImage: { width: "100%", height: "100%" },
  retakeOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(8),
  },
  retakeText: {
    color: "#FFF",
    marginLeft: scale(8),
    fontSize: moderateScale(14),
    fontWeight: "600",
  },

  inputLabel: {
    fontSize: moderateScale(15),
    fontWeight: "600",
    color: "#333",
    marginBottom: verticalScale(8),
    marginLeft: scale(5),
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: "#DDD",
    paddingHorizontal: scale(12),
    minHeight: moderateScale(55),
  },
  inputIcon: { marginRight: scale(8) },
  input: { flex: 1, fontSize: moderateScale(15), color: "#333" },

  // 🔴 ESTILOS NOVOS DO MAPA E BOTOES
  openMapBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#E8F0FE",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
    marginLeft: 5,
  },
  openMapBtnText: {
    color: "#1F41BB",
    fontWeight: "bold",
    fontSize: moderateScale(13),
    marginLeft: 6,
  },

  hintText: {
    fontSize: moderateScale(12),
    color: "#888",
    marginTop: verticalScale(10),
    marginLeft: scale(5),
    marginBottom: verticalScale(20),
  },
  textAreaWrapper: {
    alignItems: "flex-start",
    paddingVertical: verticalScale(12),
  },
  textArea: { minHeight: verticalScale(80) },
  submitButton: {
    width: "100%",
    height: moderateScale(60),
    backgroundColor: "#1F41BB",
    borderRadius: moderateScale(12),
    justifyContent: "center",
    alignItems: "center",
    marginTop: verticalScale(30),
    elevation: 2,
    shadowColor: "#1F41BB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: moderateScale(18),
    fontWeight: "700",
  },

  // 🔴 ESTILOS DA MODAL DO MAPA
  mapModalContainer: { flex: 1, backgroundColor: "#FFF" },
  mapModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: verticalScale(50),
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  mapModalTitle: {
    fontSize: moderateScale(18),
    fontWeight: "bold",
    color: "#333",
  },
  mapInstructions: { backgroundColor: "#F4F7F8", padding: 15 },
  mapInstructionsText: {
    color: "#555",
    textAlign: "center",
    fontSize: moderateScale(14),
  },
  mapArea: { flex: 1, width: "100%" },
  mapModalFooter: {
    padding: 20,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    paddingBottom: verticalScale(30),
  },
  confirmMapBtn: {
    backgroundColor: "#1F41BB",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmMapBtnText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: moderateScale(16),
  },
});
