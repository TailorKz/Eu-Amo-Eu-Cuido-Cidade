import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import {
  moderateScale,
  scale,
  verticalScale,
} from "../app/src/utils/responsive";

export default function Home() {
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
          <TouchableOpacity key={index} style={styles.card}>
            <Image source={item.image} style={styles.cardImage} />

            <View style={styles.textContainer}>
              <Text style={styles.cardText}>{item.title}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* MENU INFERIOR */}
      <View style={styles.bottomMenu}>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Reportos</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7F8",
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(40),
  },

  banner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  name: {
    fontSize: moderateScale(22),
    fontWeight: "600",
    color: "#333",
  },

  logo: {
    width: scale(120),
    height: verticalScale(50),
  },

  title: {
    fontSize: moderateScale(20),
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
    height: verticalScale(180),

    backgroundColor: "#FFF",
    borderRadius: moderateScale(14),

    alignItems: "center",

    marginBottom: verticalScale(10),
    elevation: 3,
  },

  cardContent: {
    alignItems: "center",
    justifyContent: "center",
  },

  cardImage: {
    width: scale(120),
    height: scale(120),
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

  bottomMenu: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,

    height: verticalScale(70),
    backgroundColor: "#EDEDED",

    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",

    borderTopWidth: 1,
    borderColor: "#DDD",
  },

  menuItem: {
    alignItems: "center",
  },

  menuText: {
    fontSize: moderateScale(13),
    color: "#555",
    fontWeight: "600",
  },
});
