import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  moderateScale,
  scale,
  verticalScale,
} from "../app/src/utils/responsive";
import { BottomMenu } from "./src/components/BottomMenu";
import { router } from "expo-router";

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
      {/* HEADER */}
      <View style={styles.banner}>
        <Text style={styles.name}>Olá Tailor!</Text>

        <Image
          source={require("../assets/images/euamoipora.png")}
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
                params: { categoria: item.title.replace("\n", " ") }, // Tira a quebra de linha do título
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

      {/* AQUI ESTÁ A MÁGICA: O menu velho sumiu, e usamos só o componente novo */}
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
    paddingBottom: verticalScale(80), // Isso garante que os últimos botões não fiquem escondidos atrás do menu
  },

  banner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
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

  // Note que apaguei totalmente os estilos "bottomMenu", "menuItem" e "menuText" que estavam sobrando aqui.
});
