import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TextInput, View, TextInputProps } from "react-native";

import { moderateScale, scale, verticalScale } from "../utils/responsive";

type Props = TextInputProps & {
  icon?: any;
};

export function Input(props: Props) {
  const { icon, ...rest } = props;

  return (
    <View style={styles.container}>
      <TextInput
        {...rest}
        placeholderTextColor="#999"
        style={styles.input}
      />

      {icon && (
        <Ionicons
          name={icon}
          size={moderateScale(20)}
          color="#B0B0B0"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "90%",
    alignSelf: "center",
    height: moderateScale(60),
    backgroundColor: "#EDEDED",
    borderRadius: moderateScale(10),
    borderWidth: 0.5, // Define a largura da borda
    borderColor: "#B0B0B0", // Define a cor da borda

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    paddingHorizontal: scale(16),
    marginBottom: verticalScale(15),

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
});
