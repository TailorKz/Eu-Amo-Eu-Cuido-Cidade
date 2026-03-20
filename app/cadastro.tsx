import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Input } from "./src/components/Input";
import { moderateScale, verticalScale } from "./src/utils/responsive";

export default function Cadastro() {
  const [loadedImages, setLoadedImages] = useState(0);

  const TOTAL_IMAGES = 3;

  function handleImageLoad() {
    setLoadedImages((prev) => prev + 1);
  }

return (
  <View style={{ flex: 1 }}>
    
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>

        <KeyboardAwareScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid={true}
          extraScrollHeight={0} // 🔥 ESSENCIAL
        >
          <View style={styles.top}>
            <LinearGradient
              colors={["#87CDE9", "#1F41BB"]}
              start={{ x: 1.5, y: 0 }}
              end={{ x: 0, y: 0 }}
              style={styles.background}
            />
          </View>

          <View style={styles.logoContainer}>
            <Image
              source={require("../assets/images/iporalogo1.png")}
              style={styles.logoMunicipio}
              onLoadEnd={handleImageLoad}
            />

            <Image
              source={require("../assets/images/cor2.jpg")}
              style={styles.logo}
              onLoadEnd={handleImageLoad}
            />

            <Text style={styles.textoCuidado}>
              O cuidado com a cidade na palma da sua mão.
            </Text>
          </View>

          <Input placeholder="Nome completo:" />
          <Input placeholder="Número:" />
          <Input placeholder="Senha:" secureTextEntry />
          <Input placeholder="Confirme a senha:" secureTextEntry />

          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>

          <Text style={styles.textoFinal}>
            Já tem uma conta? Clique aqui
          </Text>
        </KeyboardAwareScrollView>

        {loadedImages < TOTAL_IMAGES && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#1F41BB" />
          </View>
        )}

      </View>
    </TouchableWithoutFeedback>

    <View style={styles.footerImageContainer} pointerEvents="none">
      <Image
        source={require("../assets/images/cidadeipo.png")}
        style={styles.footerImage}
        resizeMode="cover"
        onLoadEnd={handleImageLoad}
      />
    </View>

  </View>
);
}

const styles = StyleSheet.create({
  top: {},
  container: {
    flex: 1,
    position: "relative",
    backgroundColor: "#EDEDED",
  },
  content: {
    paddingBottom: verticalScale(200),
    zIndex: 1,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: verticalScale(120),
    borderBottomLeftRadius: moderateScale(30),
    borderBottomRightRadius: moderateScale(30),
  },
  logoMunicipio: {
    width: moderateScale(120),
    height: moderateScale(120),
    marginBottom: verticalScale(10),
    zIndex: 1,
  },
  logoContainer: {
    marginTop: verticalScale(120) - moderateScale(60),
    alignItems: "center",
  },
  logo: {
    width: moderateScale(200),
    alignSelf: "center",
    height: moderateScale(100),
    marginTop: -verticalScale(15),
    zIndex: 2,
  },
  textoCuidado: {
    color: "#3A6C77",
    marginTop: verticalScale(5),
    fontSize: moderateScale(15),
    fontWeight: "600",
    marginBottom: verticalScale(20),
    textAlign: "center",
  },
  inputContainer: {},
  textoInput: {},

  button: {
    height: moderateScale(60),
    width: "80%",
    alignSelf: "center",
    justifyContent: "center",
    borderRadius: moderateScale(10),
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(10),
    backgroundColor: "#1F41BB",
    fontSize: moderateScale(18),
  },
  buttonText: {
    fontSize: moderateScale(24),
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "600",
  },
  textoFinal: {
    marginTop: verticalScale(20),
    color: "#3A6C77",
    fontSize: moderateScale(15),
    fontWeight: "600",
    marginBottom: verticalScale(20),
    textAlign: "center",
  },
  footerImageContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 0,
  },
  footerImage: {
    width: "100%",
    height: Math.min(verticalScale(320), 340),
  },
  //LOADING
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EDEDED", // mesma cor da tela
    zIndex: 999,
  },
});
