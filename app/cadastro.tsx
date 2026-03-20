import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Input } from "./src/components/Input";
import { moderateScale, verticalScale } from "./src/utils/responsive";

export default function Cadastro() {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <View style={styles.content}>
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
              />

              <Image
                source={require("../assets/images/cor2.jpg")}
                style={styles.logo}
              />
              <Text style={styles.textoCuidado}>
                O cuidado com a cidade na palma da sua mão.
              </Text>
            </View>
            <Input placeholder="Nome completo:" icon="person-outline" />
            <Input placeholder="Número:" icon="logo-whatsapp" />
            <Input
              placeholder="Senha:"
              icon="lock-closed-outline"
              secureTextEntry
            />
            <Input
              placeholder="Confirme a senha:"
              icon="lock-closed-outline"
              secureTextEntry
            />
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Entrar</Text>
            </TouchableOpacity>
            <Text style={styles.textoFinal}>Já tem uma conta? Clique aqui</Text>
          </View>

          <View style={styles.footerImageContainer}>
            <Image
              source={require("../assets/images/cidadeipo.png")}
              style={styles.footerImage}
              resizeMode="cover"
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
});
