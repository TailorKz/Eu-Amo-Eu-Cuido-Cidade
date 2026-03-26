import React, { useEffect, useRef, useState } from "react";
import {
    Keyboard,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { moderateScale, scale, verticalScale } from "../utils/responsive";
type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (code: string) => void;
  title?: string;
  description?: string;
};

export function CodeVerificationModal({
  visible,
  onClose,
  onConfirm,
  title = "Verificação",
  description = "Enviamos um código de 4 dígitos para seu WhatsApp",
}: Props) {
  const [code, setCode] = useState(["", "", "", ""]);

  const inputs = useRef<TextInput[]>([]);

  function handleChange(text: string, index: number) {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 3) {
      inputs.current[index + 1].focus();
    }
  }

  function handleConfirm() {
    const finalCode = code.join("");
    if (finalCode.length === 4) {
      onConfirm(finalCode);
    }
  }

  function handleBackspace(index: number) {
    if (code[index] === "" && index > 0) {
      const newCode = [...code];
      newCode[index - 1] = "";
      setCode(newCode);
      inputs.current[index - 1].focus();
    }
  }

  useEffect(() => {
    if (!visible) {
      setCode(["", "", "", ""]);
    }
  }, [visible]);

  useEffect(() => {
  if (visible) {
    setTimeout(() => {
      inputs.current[0]?.focus();
    }, 100);
  }
}, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>

            {/* INPUTS DE CÓDIGO */}
            <View style={styles.codeContainer}>
              {code.map((value, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    if (ref) inputs.current[index] = ref;
                  }}
                  style={styles.codeInput}
                  keyboardType="numeric"
                  maxLength={1}
                  value={value}
                  onChangeText={(text) => handleChange(text, index)}
                  onKeyPress={({ nativeEvent }) => {
                    if (nativeEvent.key === "Backspace") {
                      handleBackspace(index);
                    }
                  }}
                />
              ))}
            </View>

            <TouchableOpacity style={styles.button} onPress={handleConfirm}>
              <Text style={styles.buttonText}>Confirmar</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancel}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  container: {
    width: "85%",
    backgroundColor: "#FFF",
    borderRadius: moderateScale(16),
    padding: moderateScale(20),
    alignItems: "center",

    elevation: 10,
  },

  title: {
    fontSize: moderateScale(20),
    fontWeight: "700",
    color: "#222",
    marginBottom: verticalScale(8),
  },

  description: {
    fontSize: moderateScale(14),
    color: "#666",
    textAlign: "center",
    marginBottom: verticalScale(20),
  },

  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginBottom: verticalScale(20),
  },

  codeInput: {
    width: scale(50),
    height: verticalScale(60),
    borderRadius: moderateScale(10),
    borderWidth: 1,
    borderColor: "#DDD",
    textAlign: "center",
    fontSize: moderateScale(22),
    fontWeight: "600",
    backgroundColor: "#F7F7F7",
  },

  button: {
    width: "100%",
    height: verticalScale(55),
    backgroundColor: "#1F41BB",
    borderRadius: moderateScale(12),
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: "#FFF",
    fontSize: moderateScale(16),
    fontWeight: "600",
  },

  cancel: {
    marginTop: verticalScale(20),
    color: "#999",
    fontSize: moderateScale(15),
  },
});
