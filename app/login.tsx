import { useNavigation } from "@react-navigation/native";
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
  const navigation = useNavigation();
  const [loadedImages, setLoadedImages] = useState(0);

  const TOTAL_IMAGES = 3;
  const [phone, setPhone] = useState("");
  const [phoneRaw, setPhoneRaw] = useState("");

  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState({
    phone: "",
    password: "",
  });

  function validate() {
    let newErrors = {
      phone: "",
      password: "",
    };

    if (phoneRaw.length !== 11) {
      newErrors.phone = "Número inválido";
    }

    if (password.length < 8) {
      newErrors.password = "Senha deve ter 8 caracteres";
    }

    setErrors(newErrors);

    return !newErrors.phone && !newErrors.password;
  }

  function handleImageLoad() {
    setLoadedImages((prev) => prev + 1);
  }

  return (
    <View style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <View style={styles.footerImageContainer} pointerEvents="none">
            <Image
              source={require("../assets/images/cidadeipo.jpg")}
              style={styles.footerImage}
              resizeMode="cover"
              onLoadEnd={handleImageLoad}
            />

            <LinearGradient
              colors={[
                "rgba(237,237,237,1)",
                "rgba(237,237,237,0.8)",
                "rgba(237,237,237,0.4)",
                "rgba(237,237,237,0.3)",
              ]}
              style={styles.gradientOverlay}
            />
          </View>
          <KeyboardAwareScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            enableOnAndroid={true}
            extraScrollHeight={0}
            bounces={false}
            overScrollMode="never"
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

            <Input
              placeholder="Número:"
              icon="logo-whatsapp"
              value={phone}
              keyboardType="numeric"
              error={errors.phone}
              onChangeText={(masked, unmasked) => {
                setPhone(masked);
                setPhoneRaw(unmasked || "");
              }}
              mask={[
                "(",
                /\d/,
                /\d/,
                ")",
                " ",
                /\d/,
                /\d/,
                /\d/,
                /\d/,
                /\d/,
                "-",
                /\d/,
                /\d/,
                /\d/,
                /\d/,
              ]}
            />
            <Input
              placeholder="Senha:"
              icon="lock-closed-outline"
              secureTextEntry
              value={password}
              error={errors.password}
              onChangeText={(text) => setPassword(text)}
            />
            <Text style={styles.textoEsqueceu}>Esqueceu sua senha?</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                if (validate()) {
                  console.log("Tudo válido 🚀");
                }
              }}
            >
              <Text style={styles.buttonText}>Entrar</Text>
            </TouchableOpacity>

            <Text onPress={() => navigation.navigate("Cadastro")}>
              Quer criar uma conta? Clique aqui
            </Text>
          </KeyboardAwareScrollView>

          {loadedImages < TOTAL_IMAGES && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#1F41BB" />
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
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
    marginBottom: verticalScale(20),
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
    marginTop: verticalScale(15),
    fontSize: moderateScale(15),
    fontWeight: "600",
    marginBottom: verticalScale(40),
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
    marginTop: moderateScale(20),
  },
  buttonText: {
    fontSize: moderateScale(24),
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "600",
  },
  textoFinal: {
    marginTop: verticalScale(20),
    color: "#39555c",
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
    zIndex: -1,
  },
  footerImage: {
    width: "100%",
    height: Math.min(verticalScale(320), 340),
  },
  textoEsqueceu: {
    color: "#3A6C77",
    fontSize: moderateScale(13),
    fontWeight: "600",
    textAlign: "right",
    marginRight: moderateScale(20),
  },
  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "100%",
  },
  //LOADING
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EDEDED",
    zIndex: 999,
  },
});
