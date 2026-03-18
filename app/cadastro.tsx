import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View, Image } from "react-native";
import { moderateScale, verticalScale } from "./src/utils/responsive";

export default function Cadastro() {
  return (
    <View>
      <View style={styles.top}>
        <LinearGradient
          colors={["#87CDE9", "#1F41BB"]}
          start={{ x: 1.5, y: 0 }}
          end={{ x: 0, y: 0 }}
          style={styles.background}
        />
      </View>
      <Image
        source={require("../assets/images/iporalogo1.png")}
        style={styles.logoMunicipio}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  top: {},
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: verticalScale(140),
    borderBottomLeftRadius: moderateScale(30),
    borderBottomRightRadius: moderateScale(30),
  },
  logoMunicipio: {
    position: "absolute",
    top: verticalScale(140) - moderateScale(60), 
    alignSelf: "center",
    width: moderateScale(120),
    height: moderateScale(120),
  },
});
