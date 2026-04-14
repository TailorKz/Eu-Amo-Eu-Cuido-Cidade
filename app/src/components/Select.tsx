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
  onOpen?: () => void;
  onClose?: () => void; // 🔴 Propriedade de fechamento
};

export interface SelectRef {
  openDropdown: () => void;
}

export const Select = forwardRef<SelectRef, Props>(({
  options,
  placeholder = "Selecione uma opção",
  onSelect,
  onOpen,
  onClose,
}, ref) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("");

  const animation = useRef(new Animated.Value(0)).current;

  useImperativeHandle(ref, () => ({
    openDropdown: () => {
      setOpen(true);
      onOpen?.(); 
    }
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
    onSelect?.(value);
    onClose?.(); //  Avisa que fechou ao selecionar uma opção
  }

  function handleOpen() {
    const novoEstado = !open;
    setOpen(novoEstado);
    
    if (novoEstado) {
      onOpen?.();
    } else {
      onClose?.(); //  Avisa que fechou ao clicar na setinha
    }
  }

  return (
    <>
      {open && (
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => {
            setOpen(false);
            onClose?.(); // Avisa que fechou ao clicar fora do componente
          }}
        />
      )}

      <View style={{ zIndex: 10 }}>
        <TouchableOpacity
          style={styles.select}
          onPress={handleOpen} 
        >
          <Text style={[styles.text, !selected && styles.placeholder]}>
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
              style={[
                styles.option,
                selected === item && styles.optionActive,
              ]}
              onPress={() => handleSelect(item)}
            >
              <Text style={[
                styles.optionText,
                selected === item && styles.optionTextActive,
              ]}>
                {item}
              </Text>
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
    justifyContent: "space-between",
  },
  text: {
    fontSize: moderateScale(16),
    color: "#333",
  },
  placeholder: {
    color: "#999",
  },
  icon: {
    fontSize: moderateScale(14),
    color: "#666",
  },
  dropdown: {
    overflow: "hidden",
    backgroundColor: "#fff",
    borderRadius: moderateScale(10),
    marginTop: 5,
    elevation: 3,
    position: "absolute",
    top: moderateScale(50),
    left: 0,
    right: 0,
    zIndex: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  option: {
    height: 45,
    justifyContent: "center",
    paddingHorizontal: scale(16),
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  optionActive: {
    backgroundColor: "#EEF2FF",
  },
  optionText: {
    fontSize: moderateScale(15),
    color: "#333",
  },
  optionTextActive: {
    color: "#1F41BB",
    fontWeight: "600",
  },
});