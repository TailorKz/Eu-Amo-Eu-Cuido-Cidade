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
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useAuthStore } from "./src/store/useAuthStore";
import { moderateScale, scale, verticalScale } from "./src/utils/responsive";

export default function Solicitacao() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const categoria = params.categoria || "Geral";
  const user = useAuthStore((state) => state.user);
// Pegamos a cidade correta da memória do app
  const cidadeSelecionada = useAuthStore((state) => state.cidadeSelecionada) || user?.cidade;
  const scrollRef = useRef<ScrollView>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [locationText, setLocationText] = useState("");
  const [observation, setObservation] = useState("");
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Posição real de cada campo, funciona em qualquer dispositivo
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
          "Precisamos da localização para registrar o problema.",
        );
        setIsLoadingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (geocode.length > 0) {
        const address = geocode[0];
        const street = address.street || address.name || "Endereço não encontrado";
        const streetNumber = address.streetNumber ? `, ${address.streetNumber}` : "";
        
        // Pega o que o GPS acha que é o bairro
        const neighborhood = address.district || address.subregion || "";
        
        // filtro inteligente de microrregiões
        const falsosBairros = [
          "São Miguel do Oeste", 
          "Descanso", 
          "Santa Helena", 
          "Tunápolis", 
          "Belmonte", 
          "Mondaí", 
          "Itapiranga"
        ];
        
        // Se o bairro for uma cidade vizinha, ignoramos para não sujar o endereço
        let neighborhoodText = "";
        if (neighborhood && !falsosBairros.includes(neighborhood)) {
           neighborhoodText = ` - ${neighborhood}`;
        }

        // Monta o texto final cravando a cidade selecionada no final
        setLocationText(
          `${street}${streetNumber}${neighborhoodText} - ${cidadeSelecionada}`
        );
      }
    } catch (error) {
      console.log("Erro ao buscar localização:", error);
      Alert.alert("Erro", "Não foi possível obter a localização automática.");
    } finally {
      setIsLoadingLocation(false);
    }
  }

  async function handleOpenCamera() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissão necessária",
        "Precisamos acessar sua câmera para tirar a foto do problema.",
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
      Alert.alert(
        "Erro",
        "Você precisa estar logado para enviar uma solicitação.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      // ⚠️ LEMBRE-SE DE CONFIRMAR O SEU IP!
      const url = `https://tailorkz-production-eu-amo.up.railway.app/api/solicitacoes/nova/${user.id}`;

      // 🔴 MÁGICA DO UPLOAD: Criamos um "pacote" FormData em vez de um objeto JSON normal
      const formData = new FormData();
      formData.append("categoria", String(categoria));
      formData.append("localizacao", locationText);
      formData.append("observacao", observation);

      // Pega o nome do arquivo da câmera e o formato (ex: .jpg)
      const filename = imageUri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename || "");
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      // Adiciona o arquivo binário da imagem ao pacote
      formData.append("imagem", {
        uri: imageUri,
        name: filename,
        type: type,
      } as any);

      // Envia via Axios informando que o conteúdo é 'multipart/form-data'
      await axios.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      Alert.alert(
        "Sucesso!",
        "Sua solicitação foi enviada para a prefeitura.",
        [{ text: "OK", onPress: () => router.replace("/home") }],
      );
    } catch (error) {
      console.log("Erro ao enviar solicitação:", error);
      Alert.alert(
        "Erro",
        "Não foi possível enviar a solicitação. Tente novamente mais tarde.",
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

      {/* ✅ Mesma estrutura do detalhes.tsx que já funciona */}
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
            Faça sua solicitação para o setor responsável por:{"\n"}
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
                <Text style={styles.cameraText}>Tocar para abrir a câmera</Text>
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.inputLabel}>Localização</Text>

          {/* ✅ onLayout captura a posição real do campo em qualquer dispositivo */}
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
                placeholder="Aguardando GPS..."
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

          <Text style={styles.hintText}>
            * Você pode editar o endereço se o GPS não for exato.
          </Text>

          <Text style={styles.inputLabel}>Observações (Opcional)</Text>

          {/* ✅ onLayout captura a posição real do campo de observação */}
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
              placeholder="Descreva detalhes do problema, complemento ou ponto de referência."
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
  hintText: {
    fontSize: moderateScale(12),
    color: "#888",
    marginTop: verticalScale(4),
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
});
