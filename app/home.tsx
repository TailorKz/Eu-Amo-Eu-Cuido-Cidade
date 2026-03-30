import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  moderateScale,
  scale,
  verticalScale,
} from "../app/src/utils/responsive";
import { BottomMenu } from "./src/components/BottomMenu";
import { router } from "expo-router";

// 1. ADICIONE A IMPORTAÇÃO DO GRADIENTE
import { LinearGradient } from "expo-linear-gradient";

const menuItems = [
  {
    title: "Infraestrutura",
    image: require("../assets/images/infra.png"),
  },
  {
    title: "Iluminação\nPública",
    image: require("../assets/images/ilum.png"),
  },
  {
    title: "Urbanismo",
    image: require("../assets/images/urbanismo.png"),
  },
  {
    title: "Limpeza\nUrbana",
    image: require("../assets/images/limpeza.png"),
  },
  {
    title: "Saneamento\ne água",
    image: require("../assets/images/saneamento.png"),
  },
  {
    title: "Saúde Pública\ne Vigilância",
    image: require("../assets/images/saude.png"),
  },
];

export default function Home() {
  return (
    <View style={styles.container}>
      {/* 2. GRADIENTE DE FUNDO (Fica atrás de tudo por causa do position absolute) */}
      <LinearGradient
        // Começa com um azul bem leve e transparente (baseado no seu azul #1F41BB) e vai para 100% transparente
        colors={["rgba(2, 154, 255, 0.25)", "transparent"]} 
        style={styles.headerGradient}
      />

      {/* HEADER */}
      <View style={styles.banner}>
        <Text style={styles.name}>Olá Tailor!</Text>

        <Image
          source={require("../assets/images/logoeuamoipora.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* TÍTULO */}
      <Text style={styles.title}>Faça sua solicitação:</Text>

      {/* GRID */}
      <View style={styles.grid}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: "/solicitacao",
                params: { categoria: item.title.replace("\n", " ") }, 
              })
            }
          >
            <Image source={item.image} style={styles.cardImage} />
            <View style={styles.textContainer}>
              <Text style={styles.cardText}>{item.title}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <BottomMenu activeRoute="home" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7F8",
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(40),
    paddingBottom: verticalScale(80), 
  },

  // 3. ESTILO NOVO DO GRADIENTE
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: verticalScale(200), // Altura que o gradiente vai descer antes de sumir totalmente
    zIndex: 0, // Garante que fique atrás do texto
  },

  banner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 1, // Garante que o texto fique por cima do gradiente
  },

  name: {
    fontSize: moderateScale(24),
    fontWeight: "600",
    color: "#333",
  },

  logo: {
    width: scale(120),
    height: verticalScale(70),
  },

  title: {
    fontSize: moderateScale(24),
    fontWeight: "700",
    color: "#333",
    marginTop: verticalScale(20),
    marginBottom: verticalScale(20),
    textAlign: "center",
    zIndex: 1, 
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    zIndex: 1,
  },

  card: {
    width: "48%",
    height: verticalScale(170),
    backgroundColor: "#FFF",
    borderRadius: moderateScale(14),
    alignItems: "center",
    marginBottom: verticalScale(10),
    elevation: 3,
  },

  cardImage: {
    width: scale(110),
    height: scale(110),
    marginTop: verticalScale(10),
  },

  cardText: {
    fontSize: moderateScale(18),
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },

  textContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
});