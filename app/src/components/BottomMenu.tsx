import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { moderateScale, verticalScale } from "../utils/responsive";

type Props = {
  activeRoute: "home" | "reportos" | "perfil";
};

export function BottomMenu({ activeRoute }: Props) {
  const insets = useSafeAreaInsets();
  const safeBottomPadding = insets.bottom > 0 ? insets.bottom : verticalScale(10);

  // 🔴 FUNÇÃO NOVA: Só navega se a pessoa estiver numa aba diferente!
  const handleNavigation = (route: "home" | "reportos" | "perfil", path: any) => {
    if (activeRoute !== route) {
      router.replace(path);
    }
  };

  return (
    <View
      style={[
        styles.bottomMenu,
        {
          height: verticalScale(60) + safeBottomPadding,
          paddingBottom: safeBottomPadding,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.menuItem}
        // 🔴 Tira o efeito de clique se já estiver na aba!
        activeOpacity={activeRoute === "home" ? 1 : 0.2} 
        onPress={() => handleNavigation("home", "/home")}
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
        activeOpacity={activeRoute === "reportos" ? 1 : 0.2}
        onPress={() => handleNavigation("reportos", "/reportos")}
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
        activeOpacity={activeRoute === "perfil" ? 1 : 0.2}
        onPress={() => handleNavigation("perfil", "/perfil")}
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
    backgroundColor: "#EDEDED",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#DDD",
  },
  menuItem: { 
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20, 
  },
  menuText: {
    fontSize: moderateScale(13),
    color: "#555",
    fontWeight: "600",
    marginTop: verticalScale(2),
  },
});