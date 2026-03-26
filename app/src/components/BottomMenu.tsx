import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale, verticalScale } from "../utils/responsive";

type Props = {
  activeRoute: "home" | "reportos" | "perfil";
};

export function BottomMenu({ activeRoute }: Props) {
  return (
    <View style={styles.bottomMenu}>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => router.replace("/home")}
      >
        <Ionicons
          name={activeRoute === "home" ? "home" : "home-outline"}
          size={moderateScale(22)}
          color={activeRoute === "home" ? "#1F41BB" : "#555"}
        />
        <Text
          style={[
            styles.menuText,
            activeRoute === "home" && { color: "#1F41BB" },
          ]}
        >
          Home
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => router.replace("/reportos")}
      >
        <Ionicons
          name={
            activeRoute === "reportos"
              ? "document-text"
              : "document-text-outline"
          }
          size={moderateScale(22)}
          color={activeRoute === "reportos" ? "#1F41BB" : "#555"}
        />
        <Text
          style={[
            styles.menuText,
            activeRoute === "reportos" && { color: "#1F41BB" },
          ]}
        >
          Reportos
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => router.replace("/perfil")}
      >
        <Ionicons
          name={activeRoute === "perfil" ? "person" : "person-outline"}
          size={moderateScale(22)}
          color={activeRoute === "perfil" ? "#1F41BB" : "#555"}
        />
        <Text
          style={[
            styles.menuText,
            activeRoute === "perfil" && { color: "#1F41BB" },
          ]}
        >
          Perfil
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
  menuItem: { alignItems: "center" },
  menuText: {
    fontSize: moderateScale(13),
    color: "#555",
    fontWeight: "600",
    marginTop: verticalScale(2),
  },
});
