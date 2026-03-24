import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
const menuItems = [
  {
    title: "Infraestrutura",
    image: require("../assets/images/infra.png"),
  },
  {
    title: "Iluminação Pública",
    image: require("../assets/images/infra.png"),
  },
  {
    title: "Urbanismo",
    image: require("../assets/images/infra.png"),
  },
  {
    title: "Limpeza Urbana",
    image: require("../assets/images/infra.png"),
  },
  {
    title: "Saneamento e água",
    image: require("../assets/images/infra.png"),
  },
  {
    title: "Saúde Pública e Vigilância",
    image: require("../assets/images/infra.png"),
  },
];

export default function Home() {
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.name}>Olá Tailor!</Text>

        <Image
          source={require("../assets/images/euamoipora.png")}
          style={styles.logo}
        />
      </View>

      {/* TÍTULO */}
      <Text style={styles.title}>Faça sua solicitação:</Text>

      {/* GRID */}
      <View style={styles.grid}>
        {menuItems.map((item, index) => (
          <TouchableOpacity key={index} style={styles.card}>
            <Image source={item.image} style={styles.cardImage} />
            <Text style={styles.cardText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7F8",
    paddingHorizontal: 20,
    paddingTop: 50,
  },

  /* HEADER */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  name: {
    fontSize: 22,
    fontWeight: "600",
    color: "#333",
  },

  logo: {
    width: 120,
    height: 60,
    resizeMode: "contain",
  },

  /* TITLE */
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 30,
    marginBottom: 20,
    color: "#333",
  },

  /* GRID */
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  /* CARD */
  card: {
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,

    alignItems: "center",

    // sombra iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,

    // sombra Android
    elevation: 3,
  },

  cardImage: {
    width: 80,
    height: 80,
    marginBottom: 10,
    resizeMode: "contain",
  },

  cardText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
});
