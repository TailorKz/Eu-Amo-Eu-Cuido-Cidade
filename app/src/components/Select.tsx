import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Pressable
} from "react-native";

import { scale, moderateScale } from "../utils/responsive";

type Props = {
  options: string[];
  placeholder?: string;
  onSelect?: (value: string) => void;
};

// 🔴 1. CRIAMOS O "CONTROLE REMOTO" PARA EXPORTAR
export interface SelectRef {
  openDropdown: () => void;
}

// 🔴 2. ENVOLVEMOS O COMPONENTE COM forwardRef
export const Select = forwardRef<SelectRef, Props>(({
  options,
  placeholder = "Selecione uma opção",
  onSelect
}, ref) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("");

  const animation = useRef(new Animated.Value(0)).current;

  // 🔴 3. ENTREGAMOS O BOTÃO DE ABRIR PARA O CONTROLE REMOTO
  useImperativeHandle(ref, () => ({
    openDropdown: () => setOpen(true)
  }));

  useEffect(() => {
    Animated.timing(animation, {
      toValue: open ? 1 : 0,
      duration: 200,
      useNativeDriver: false
    }).start();
  }, [open]);

  const heightInterpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, options.length * 45]
  });

  const rotateInterpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"]
  });

  function handleSelect(value: string) {
    setSelected(value);
    setOpen(false);
    onSelect && onSelect(value);
  }

  return (
    <>
      {open && (
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => setOpen(false)}
        />
      )}

      <View style={{ zIndex: 10 }}>
        <TouchableOpacity
          style={styles.select}
          onPress={() => setOpen(!open)}
        >
          <Text style={styles.text}>
            {selected || placeholder}
          </Text>

          <Animated.Text
            style={[styles.icon, { transform: [{ rotate: rotateInterpolate }] }]}
          >
            ▼
          </Animated.Text>
        </TouchableOpacity>

        <Animated.View style={[styles.dropdown, { height: heightInterpolate }]}>
          {options.map((item) => (
            <TouchableOpacity
              key={item}
              style={styles.option}
              onPress={() => handleSelect(item)}
            >
              <Text>{item}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      </View>
    </>
  );
});
Select.displayName = "Select";

const styles = StyleSheet.create({
  select: {
    height: moderateScale(50),
    backgroundColor: "#F2F2F2",
    borderRadius: moderateScale(10),
    paddingHorizontal: scale(16),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  text: { fontSize: moderateScale(16), color: "#333" },
  icon: { fontSize: moderateScale(14), color: "#666" },
  dropdown: {
    overflow: "hidden",
    backgroundColor: "#fff",
    borderRadius: moderateScale(10),
    marginTop: 5,
    elevation: 3,
    position: 'absolute', // Faz o menu flutuar por cima dos botões
    top: moderateScale(50),
    left: 0,
    right: 0,
    zIndex: 999,
  },
  option: { height: 45, justifyContent: "center", paddingHorizontal: scale(16) }
});