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
import MapView, { Marker } from "react-native-maps";
import ImageView from "react-native-image-viewing";
import { useAuthStore } from "./src/store/useAuthStore";
import { moderateScale, scale, verticalScale } from "./src/utils/responsive";
import * as ImageManipulator from 'expo-image-manipulator';

export default function Solicitacao() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const categoria = params.categoria || "Geral";
  const user = useAuthStore((state) => state.user);

  const cidadeSelecionada = useAuthStore((state) => state.cidadeSelecionada) || user?.cidade;

  const scrollRef = useRef<ScrollView>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [locationText, setLocationText] = useState("");
  const [observation, setObservation] = useState("");
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isMapModalVisible, setIsMapModalVisible] = useState(false);
  const [selectedCoordinate, setSelectedCoordinate] = useState<{ latitude: number; longitude: number } | null>(null);

  const [isImageViewVisible, setIsImageViewVisible] = useState(false);

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
        Alert.alert("Permissão negada", "Precisamos da localização para registar o problema.");
        setIsLoadingLocation(false);
        return;
      }
      // PRECISÃO MÁXIMA ATIVADA AQUI (Highest)
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      setSelectedCoordinate({ latitude: location.coords.latitude, longitude: location.coords.longitude });
      
      const geocode = await Location.reverseGeocodeAsync({ latitude: location.coords.latitude, longitude: location.coords.longitude });
      if (geocode.length > 0) processarGeocode(geocode[0]);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível obter a localização automática.");
    } finally {
      setIsLoadingLocation(false);
    }
  }

  const processarGeocode = (address: Location.LocationGeocodedAddress) => {
    // Pega os dados reais vindos da API de Mapas
    const rua = address.street || address.name || "";
    const numero = address.streetNumber ? `, ${address.streetNumber}` : "";
    const bairro = address.district ? ` - ${address.district}` : "";

    // O GPS costuma colocar a cidade no campo "city" ou "subregion"
    const cidadeReal = address.city || address.subregion || cidadeSelecionada;

    // Monta o endereço de forma limpa (Rua, Número - Bairro)
    let enderecoCompleto = `${rua}${numero}${bairro}`;

    // Limpa vírgulas ou traços sobrando no começo caso o GPS não ache o nome da rua
    enderecoCompleto = enderecoCompleto.replace(/^[\s,-]+/, '');

    if (!enderecoCompleto) {
      enderecoCompleto = "Localização aproximada";
    }

    // Exibe exatamente onde o cidadão está
    setLocationText(`${enderecoCompleto} - ${cidadeReal}`);
  };

  const handleConfirmMapLocation = async () => {
    if (!selectedCoordinate) return;
    setIsMapModalVisible(false);
    setIsLoadingLocation(true);
    try {
      const geocode = await Location.reverseGeocodeAsync({ latitude: selectedCoordinate.latitude, longitude: selectedCoordinate.longitude });
      if (geocode.length > 0) processarGeocode(geocode[0]);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  async function handleOpenCamera() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Precisamos de acesso à câmera.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false, 
      quality: 1,
    });

    if (!result.canceled) {
      // reduz a resolução da imagem
      const manipResult = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 800 } }], // Trava a largura máxima em 800px (excelente para web/mobile)
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG } // Comprime para JPEG leve
      );
      setImageUri(manipResult.uri);
    }
  }

  async function handleOpenGallery() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Precisamos de acesso à galeria.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false, 
      quality: 1,
    });

    if (!result.canceled) {
      // reduz a resolução da imagem
      const manipResult = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 800 } }], // Trava a largura máxima em 800px
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      setImageUri(manipResult.uri);
    }
  }

  async function handleSubmit() {
    if (!imageUri) return Alert.alert("Atenção", "Por favor, tire ou anexe uma foto do problema.");
    if (!locationText.trim()) return Alert.alert("Atenção", "A localização não pode ficar vazia.");
    if (!user) return Alert.alert("Erro", "Precisa estar logado para enviar uma solicitação.");

    setIsSubmitting(true);
    try {
      const url = `https://tailorkz-production-eu-amo.up.railway.app/api/solicitacoes/nova/${user.id}`;
      const formData = new FormData();
      formData.append("categoria", String(categoria));
      formData.append("localizacao", locationText);
      formData.append("observacao", observation);

      // envia as coordenadas GPS exatas para o Java
      if (selectedCoordinate) {
        formData.append("latitude", String(selectedCoordinate.latitude));
        formData.append("longitude", String(selectedCoordinate.longitude));
      }

      const filename = imageUri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename || "");
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      formData.append("imagem", { uri: imageUri, name: filename, type: type } as any);

      const response = await axios.post(url, formData, { headers: { "Content-Type": "multipart/form-data" } });
      Alert.alert("Sucesso!", `A sua solicitação foi enviada!\n\nProtocolo: ${response.data.protocolo || "Gerado"}`, [{ text: "OK", onPress: () => router.replace("/home") }]);
    } catch (error) {
      // Trata o erro 403 do Java (Geofencing / Fora da Cidade)
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        Alert.alert("Fora dos Limites", error.response.data);
      } else {
        Alert.alert("Erro", "Não foi possível enviar a solicitação. Tente novamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F4F7F8" }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={moderateScale(24)} color="#1F41BB" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nova Solicitação</Text>
        <View style={{ width: moderateScale(24) }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}>
        <ScrollView ref={scrollRef} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Faça a sua solicitação para o setor responsável por:{"\n"}<Text style={styles.categoryHighlight}>{categoria}</Text></Text>

          {imageUri ? (
            <View style={styles.imageFilledContainer}>
              <TouchableOpacity style={{ flex: 1 }} activeOpacity={0.8} onPress={() => setIsImageViewVisible(true)}>
                <Image source={{ uri: imageUri }} style={styles.previewImage} />
                <View style={styles.zoomHintOverlay}><Ionicons name="search" size={24} color="#FFF" /></View>
              </TouchableOpacity>
              
              <View style={styles.overlayActionsRow}>
                <TouchableOpacity style={styles.overlayActionBtn} onPress={handleOpenCamera}>
                  <Ionicons name="camera-reverse" size={moderateScale(20)} color="#FFF" />
                  <Text style={styles.overlayActionText}>Trocar Foto</Text>
                </TouchableOpacity>
                <View style={styles.overlayActionDivider} />
                <TouchableOpacity style={styles.overlayActionBtn} onPress={() => setImageUri(null)}>
                  <Ionicons name="trash" size={moderateScale(20)} color="#FF3B30" />
                  <Text style={[styles.overlayActionText, { color: '#FF3B30' }]}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.emptyPhotoContainer}>
              <TouchableOpacity style={styles.actionHalf} onPress={handleOpenCamera} activeOpacity={0.7}>
                <Ionicons name="camera" size={moderateScale(40)} color="#1F41BB" />
                <Text style={styles.cameraText}>Câmera</Text>
              </TouchableOpacity>
              <View style={styles.photoDivider} />
              <TouchableOpacity style={styles.actionHalf} onPress={handleOpenGallery} activeOpacity={0.7}>
                <Ionicons name="images" size={moderateScale(40)} color="#1F41BB" />
                <Text style={styles.cameraText}>Galeria</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.inputLabel}>Localização</Text>
          <View style={styles.inputWrapper} onLayout={(e) => { localizacaoY.current = e.nativeEvent.layout.y; }}>
            <Ionicons name="location-outline" size={moderateScale(20)} color="#1F41BB" style={styles.inputIcon} />
            {isLoadingLocation ? (
              <ActivityIndicator size="small" color="#1F41BB" style={{ marginLeft: scale(10) }} />
            ) : (
              <TextInput 
                style={styles.input} 
                value={locationText} 
                onChangeText={(text) => {
                  setLocationText(text);
                  // O SEGREDO ESTÁ AQUI: Se o cidadão digitar à mão, apagamos o GPS de fundo.
                  // Assim, o Java sabe que é um endereço manual, desliga a Cerca Virtual e aceita!
                  setSelectedCoordinate(null);
                }} 
                placeholder="Digite o endereço..." 
                placeholderTextColor="#999" 
                onFocus={() => setTimeout(() => scrollRef.current?.scrollTo({ y: localizacaoY.current - 20, animated: true }), 150)} 
              />
            )}
          </View>

          <TouchableOpacity style={styles.openMapBtn} onPress={() => {
            // Se a pessoa apagou a coordenada ao digitar, mas depois desistiu e abriu o mapa:
            if (!selectedCoordinate) {
              fetchLocation();
            }
            setIsMapModalVisible(true);
          }}>
            <Ionicons name="map" size={16} color="#1F41BB" />
            <Text style={styles.openMapBtnText}>Ajustar localização no mapa</Text>
          </TouchableOpacity>
          <Text style={styles.hintText}>* Pode digitar o endereço manualmente ou usar o mapa.</Text>

          <Text style={styles.inputLabel}>Observações (Opcional)</Text>
          <View style={[styles.inputWrapper, styles.textAreaWrapper]} onLayout={(e) => { observacaoY.current = e.nativeEvent.layout.y; }}>
            <TextInput style={[styles.input, styles.textArea]} value={observation} onChangeText={setObservation} placeholder="Detalhes do problema." placeholderTextColor="#999" multiline textAlignVertical="top" onFocus={() => setTimeout(() => scrollRef.current?.scrollTo({ y: observacaoY.current - 80, animated: true }), 150)} />
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? <ActivityIndicator size="large" color="#FFF" /> : <Text style={styles.submitButtonText}>Enviar Solicitação</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <ImageView images={imageUri ? [{ uri: imageUri }] : []} imageIndex={0} visible={isImageViewVisible} onRequestClose={() => setIsImageViewVisible(false)} swipeToCloseEnabled={true} doubleTapToZoomEnabled={true} />

      <Modal visible={isMapModalVisible} animationType="slide" transparent={false}>
        <View style={styles.mapModalContainer}>
          <View style={styles.mapModalHeader}>
            <Text style={styles.mapModalTitle}>Ajuste o Alfinete</Text>
            <TouchableOpacity onPress={() => setIsMapModalVisible(false)} style={{ padding: 5 }}><Ionicons name="close" size={28} color="#333" /></TouchableOpacity>
          </View>
          {selectedCoordinate ? (
            <MapView style={styles.mapArea} initialRegion={{ latitude: selectedCoordinate.latitude, longitude: selectedCoordinate.longitude, latitudeDelta: 0.005, longitudeDelta: 0.005 }} onPress={(e) => setSelectedCoordinate(e.nativeEvent.coordinate)}>
              <Marker coordinate={selectedCoordinate} draggable onDragEnd={(e) => setSelectedCoordinate(e.nativeEvent.coordinate)} />
            </MapView>
          ) : (
             <View style={[styles.mapArea, { justifyContent: "center", alignItems: "center" }]}><ActivityIndicator size="large" color="#1F41BB" /></View>
          )}
          <View style={styles.mapModalFooter}>
            <TouchableOpacity style={styles.confirmMapBtn} onPress={handleConfirmMapLocation}><Text style={styles.confirmMapBtnText}>Confirmar</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: verticalScale(50), paddingBottom: verticalScale(15), paddingHorizontal: scale(16), backgroundColor: "#FFF", elevation: 3 },
  backButton: { padding: moderateScale(5) },
  headerTitle: { fontSize: moderateScale(18), fontWeight: "600", color: "#333" },
  container: { paddingHorizontal: scale(20), paddingTop: verticalScale(20), paddingBottom: verticalScale(50) },
  title: { fontSize: moderateScale(18), color: "#333", textAlign: "center", fontWeight: "500", marginBottom: verticalScale(25), lineHeight: verticalScale(24) },
  categoryHighlight: { fontSize: moderateScale(22), fontWeight: "bold", color: "#1F41BB" },
  emptyPhotoContainer: { flexDirection: "row", width: "100%", height: verticalScale(160), backgroundColor: "#E9ECEF", borderRadius: moderateScale(16), borderWidth: 2, borderColor: "#D1D9E6", borderStyle: "dashed", marginBottom: verticalScale(25), overflow: "hidden" },
  actionHalf: { flex: 1, justifyContent: "center", alignItems: "center" },
  photoDivider: { width: 2, backgroundColor: "#D1D9E6", marginVertical: verticalScale(20) },
  cameraText: { marginTop: verticalScale(8), fontSize: moderateScale(15), color: "#666", fontWeight: "600" },
  imageFilledContainer: { width: "100%", height: verticalScale(220), borderRadius: moderateScale(16), overflow: "hidden", marginBottom: verticalScale(25), position: "relative", borderWidth: 1, borderColor: "#DDD" },
  previewImage: { width: "100%", height: "100%", resizeMode: "cover" },
  zoomHintOverlay: { position: "absolute", top: "40%", left: "45%", backgroundColor: "rgba(0,0,0,0.5)", padding: 10, borderRadius: 30 },
  overlayActionsRow: { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", backgroundColor: "rgba(0,0,0,0.75)" },
  overlayActionBtn: { flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center", paddingVertical: verticalScale(14) },
  overlayActionText: { color: "#FFF", marginLeft: scale(8), fontWeight: "700", fontSize: moderateScale(15) },
  overlayActionDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.3)", marginVertical: verticalScale(10) },
  inputLabel: { fontSize: moderateScale(15), fontWeight: "600", color: "#333", marginBottom: verticalScale(8), marginLeft: scale(5) },
  inputWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF", borderRadius: moderateScale(12), borderWidth: 1, borderColor: "#DDD", paddingHorizontal: scale(12), minHeight: moderateScale(55) },
  inputIcon: { marginRight: scale(8) },
  input: { flex: 1, fontSize: moderateScale(15), color: "#333" },
  openMapBtn: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", backgroundColor: "#E8F0FE", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginTop: 8, marginLeft: 5 },
  openMapBtnText: { color: "#1F41BB", fontWeight: "bold", fontSize: moderateScale(13), marginLeft: 6 },
  hintText: { fontSize: moderateScale(12), color: "#888", marginTop: verticalScale(10), marginLeft: scale(5), marginBottom: verticalScale(20) },
  textAreaWrapper: { alignItems: "flex-start", paddingVertical: verticalScale(12) },
  textArea: { minHeight: verticalScale(80) },
  submitButton: { width: "100%", height: moderateScale(60), backgroundColor: "#1F41BB", borderRadius: moderateScale(12), justifyContent: "center", alignItems: "center", marginTop: verticalScale(30) },
  submitButtonText: { color: "#FFF", fontSize: moderateScale(18), fontWeight: "700" },
  mapModalContainer: { flex: 1, backgroundColor: "#FFF" },
  mapModalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: verticalScale(50), paddingBottom: 15, paddingHorizontal: 20, backgroundColor: "#FFF", borderBottomWidth: 1, borderBottomColor: "#EEE" },
  mapModalTitle: { fontSize: moderateScale(18), fontWeight: "bold", color: "#333" },
  mapArea: { flex: 1, width: "100%" },
  mapModalFooter: { padding: 20, backgroundColor: "#FFF", borderTopWidth: 1, borderTopColor: "#EEE", paddingBottom: verticalScale(30) },
  confirmMapBtn: { backgroundColor: "#1F41BB", padding: 15, borderRadius: 12, alignItems: "center" },
  confirmMapBtnText: { color: "#FFF", fontWeight: "bold", fontSize: moderateScale(16) },
});