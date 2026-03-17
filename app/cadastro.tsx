import React from "react";
import { StyleSheet, View } from "react-native";
import { moderateScale, verticalScale } from "./src/utils/responsive";
import { LinearGradient } from 'expo-linear-gradient';

export default function Cadastro() {
  return (
    <View>
      <View style={styles.top}>
         <LinearGradient
        colors={['#87CDE9', '#1F41BB']}
        start={{ x: 1.5, y: 0 }}
        end={{ x: 0, y: 0 }}
        style={styles.background}
      />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  top: {

    
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: verticalScale(140),
    borderBottomLeftRadius: moderateScale(30),
    borderBottomRightRadius: moderateScale(30),
  },
});
