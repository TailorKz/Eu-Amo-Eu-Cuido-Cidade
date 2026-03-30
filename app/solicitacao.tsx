import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useAuthStore } from "./src/store/useAuthStore";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
 Dimensions } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { moderateScale, scale, verticalScale } from "./src/utils/responsive";
export default function Solicitacao() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const categoria = params.categoria || "Geral";
  const scrollRef = useRef<KeyboardAwareScrollView>(null);
const user = useAuthStore((state) => state.user);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [locationText, setLocationText] = useState("");
  const [observation, setObservation] = useState("");

  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { height } = Dimensions.get("window");

  useEffect(() => {
    fetchLocation();
  }, []);

  async function fetchLocation() {
    setIsLoadingLocation(true);
    try {
      //  Permissão
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

        const street =
          address.street || address.name || "Endereço não encontrado";
        const streetNumber = address.streetNumber
          ? `, ${address.streetNumber}`
          : "";

        let neighborhood = address.district || address.subregion || "";

        // FILTRO DE HIGIENIZAÇÃO: Evita que cidades vizinhas sejam lidas como bairro
        const cidadesBloqueadas = [
          "São Miguel do Oeste",
          "Iporã do Oeste",
          "Descanso",
          "Santa Catarina",
        ];

        if (cidadesBloqueadas.includes(neighborhood)) {
          neighborhood = ""; // Em caso de não retorno, apaga o bairro
        }

        // Formata o texto do bairro
        const neighborhoodText = neighborhood ? ` - ${neighborhood}` : "";

        setLocationText(
          `${street}${streetNumber}${neighborhoodText} - Iporã do Oeste, SC`,
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
      quality: 0.5, // COMPRESSÃO: Reduz o peso da foto em 50% antes de ir pro servidor
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
      Alert.alert("Erro", "Você precisa estar logado para enviar uma solicitação.");
      return;
    }

    setIsSubmitting(true);

    try {
      // ⚠️ ATENÇÃO: Troque pelo seu IP! Note que passamos o ID do usuário na URL
      const url = `http://192.168.1.17:8080/api/solicitacoes/nova/${user.id}`;
      
      // Monta a "encomenda" com os dados da tela
      const dadosSolicitacao = {
        categoria: categoria,
        localizacao: locationText,
        observacao: observation,
        // Por enquanto, mandamos um texto fixo até implementarmos o servidor de imagens
        urlImagem: "https://minhanuvem.com/imagem_temporaria.jpg" 
      };

      // Envia para o Java!
      await axios.post(url, dadosSolicitacao);
      
      Alert.alert(
        "Sucesso!",
        "Sua solicitação foi enviada para a prefeitura.",
        [{ text: "OK", onPress: () => router.replace("/home") }]
      );

    } catch (error) {
      console.log("Erro ao enviar solicitação:", error);
      Alert.alert("Erro", "Não foi possível enviar a solicitação. Tente novamente mais tarde.");
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

      <KeyboardAwareScrollView
        ref={scrollRef} // 🔥 AQUI
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={verticalScale(120)}
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
        <View style={styles.inputWrapper}>
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
            />
          )}
        </View>
        <Text style={styles.hintText}>
          * Você pode editar o endereço se o GPS não for exato.
        </Text>

        <Text style={styles.inputLabel}>Observações (Opcional)</Text>
        <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
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
                scrollRef.current?.scrollToPosition(0, height * 0.40, true);
              }, 100);
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
      </KeyboardAwareScrollView>
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
