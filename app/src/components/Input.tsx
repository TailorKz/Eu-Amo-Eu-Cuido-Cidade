import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import MaskInput from "react-native-mask-input";
import { moderateScale, scale, verticalScale } from "../utils/responsive";

type Props = Omit<TextInputProps, "onChangeText"> & {
  icon?: any;
  mask?: any;
  error?: string;
  onChangeText?: (masked: string, unmasked?: string) => void;
};

export function Input(props: Props) {
  const { icon, mask, error, onChangeText, ...rest } = props;
  
  // Estado para controlar o olhinho da senha
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View style={styles.wrapper}>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <View style={styles.errorArrow} />
        </View>
      )}

      <View style={[styles.container, error && { borderColor: "#ff4d4f" }]}>
        {mask ? (
          <MaskInput
            {...rest}
            style={styles.input}
            placeholderTextColor="#999"
            onChangeText={(masked, unmasked) => {
              onChangeText?.(masked, unmasked);
            }}
          />
        ) : (
          <TextInput
            {...rest}
            //  Desativa a segurança se o olhinho estiver ativo
            secureTextEntry={rest.secureTextEntry && !isPasswordVisible}
            style={styles.input}
            placeholderTextColor="#999"
            onChangeText={(text) => {
              onChangeText?.(text);
            }}
          />
        )}

        {/* Se for senha, mostra o olhinho. Se não, mostra o ícone normal */}
        {rest.secureTextEntry ? (
          <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
            <Ionicons
              name={isPasswordVisible ? "eye-outline" : "eye-off-outline"}
              size={moderateScale(22)}
              color={isPasswordVisible ? "#1F41BB" : "#B0B0B0"}
            />
          </TouchableOpacity>
        ) : icon ? (
          <Ionicons name={icon} size={moderateScale(20)} color="#B0B0B0" />
        ) : null}
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  wrapper: {
    width: "90%",
    alignSelf: "center",
    marginBottom: verticalScale(15),
    position: "relative",
  },

  container: {
    height: moderateScale(60),
    backgroundColor: "#EDEDED",
    borderRadius: moderateScale(10),
    borderWidth: 0.5,
    borderColor: "#B0B0B0",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    paddingHorizontal: scale(16),

    // sombra iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,

    // sombra Android
    elevation: 2,
  },

  input: {
    flex: 1,
    fontSize: moderateScale(16),
    color: "#333",
  },

  errorContainer: {
    position: "absolute",
    top: -35,
    left: 10,
    backgroundColor: "#ff4d4f",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    zIndex: 10,
  },

  errorText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },

  // 🔻 SETINHA
  errorArrow: {
    position: "absolute",
    bottom: -6,
    left: 10,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#ff4d4f",
  },
});