import { useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Select } from "./src/components/Select";
import { moderateScale, scale, verticalScale } from "./src/utils/responsive";


const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>
          O cuidado com a cidade{"\n"}na palma da sua mão!
        </Text>
        <Image
          source={require("../assets/images/mao2.png")}
          style={styles.image}
          resizeMode="contain"
        />
        <View style={styles.content}>
          <View style={styles.bottomArea}>
            <Text style={styles.label}>Escolha sua cidade:</Text>
            <Select
              placeholder="Escolha sua cidade"
              options={["Iporã do Oeste", "São Miguel do Oeste"]}
              onSelect={(value) => console.log(value)}
            />
            <View style={styles.buttons}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => router.push("/login")}
              >
                <Text style={styles.primaryText}>Entrar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => router.push("/cadastro")}
              >
                <Text style={styles.secondaryText}>Criar conta</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#E9EAEC" },
  container: { paddingTop: verticalScale(30) },
  title: {
    fontSize: moderateScale(32),
    fontWeight: "700",
    color: "#1F41BB",
    textAlign: "center",
    marginBottom: verticalScale(20),
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  content: { paddingHorizontal: scale(24) },
  image: {
    width: Math.min(scale(360), width * 0.95),
    height: verticalScale(360),
    alignSelf: "flex-start",
    marginBottom: verticalScale(20),
    marginTop: verticalScale(20),
  },
  bottomArea: { width: "100%" },
  label: {
    fontSize: moderateScale(26),
    fontWeight: "600",
    marginBottom: verticalScale(20),
    color: "#292D36",
    textAlign: "center",
  },
  select: {
    height: moderateScale(50),
    backgroundColor: "#F2F2F2",
    borderRadius: moderateScale(10),
    justifyContent: "center",
    paddingHorizontal: scale(16),
    marginBottom: verticalScale(20),
  },
  selectText: { fontSize: moderateScale(16) },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: verticalScale(10),
  },
  primaryButton: {
    width: "48%",
    height: moderateScale(50),
    backgroundColor: "#1F41BB",
    borderRadius: moderateScale(10),
    justifyContent: "center",
    alignItems: "center",
  },
  primaryText: {
    color: "white",
    fontSize: moderateScale(16),
    fontWeight: "600",
  },
  secondaryButton: {
    width: "48%",
    height: moderateScale(50),
    backgroundColor: "#ffffff",
    borderRadius: moderateScale(10),
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryText: { fontSize: moderateScale(16), fontWeight: "500" },
});
