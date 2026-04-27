import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Keyboard,
  Linking,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { moderateScale, scale, verticalScale, scaledFont } from "../utils/responsive";

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (code: string) => void;
  onResend?: () => void;
  title?: string;
  description?: string;
};

export function CodeVerificationModal({
  visible,
  onClose,
  onConfirm,
  onResend,
  title = "Verificação",
  description = "Enviamos um código de 4 dígitos via SMS",
}: Props) {
  const [code, setCode] = useState(["", "", "", ""]);
  const inputs = useRef<TextInput[]>([]);

  const [countdown, setCountdown] = useState(60);
  const [resendCount, setResendCount] = useState(0);
  const [blockTime, setBlockTime] = useState(0);

  useEffect(() => {
    if (visible) {
      setCode(["", "", "", ""]);
      setCountdown(60);
      setResendCount(0);
      setBlockTime(0);
      setTimeout(() => {
        inputs.current[0]?.focus();
      }, 100);
    }
  }, [visible]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (visible && countdown > 0 && blockTime === 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown, visible, blockTime]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (visible && blockTime > 0) {
      timer = setInterval(() => setBlockTime((b) => b - 1), 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [blockTime, visible]);

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

  function handleResend() {
    if (countdown > 0 || blockTime > 0) return;

    const newAttemptCount = resendCount + 1;
    setResendCount(newAttemptCount);

    if (newAttemptCount >= 3) {
      setBlockTime(300);
    } else {
      setCountdown(60);
    }

    if (onResend) {
      onResend();
    }
  }

 function handleSupportWhatsApp() {
    const supportPhone = "5549991646337"; 
    const message = "Olá! Estou tentando criar a minha conta no aplicativo *Eu Amo, Eu Cuido*, mas não estou recebendo o código SMS. Podem ajudar-me a criar o meu acesso?";

    // Link oficial da API do WhatsApp
    const url = `whatsapp://send?phone=${supportPhone}&text=${encodeURIComponent(message)}`;

    Linking.openURL(url).catch(() => {
      Alert.alert(
        "Erro",
        "Parece que o WhatsApp não está instalado neste telemóvel.",
      );
    });
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      {/* Clicar no fundo cinza fecha o teclado */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.overlay}>
        
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.container}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.description}>{description}</Text>

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

              <View style={styles.resendArea}>
                {blockTime > 0 ? (
                  <Text style={styles.blockedText}>
                    Muitas tentativas. Tente novamente em {formatTime(blockTime)}.
                  </Text>
                ) : countdown > 0 ? (
                  <Text style={styles.timerText}>
                    Aguarde <Text style={{ fontWeight: "bold" }}>{countdown}s</Text> para reenviar.
                  </Text>
                ) : (
                  <TouchableOpacity onPress={handleResend}>
                    <Text style={styles.resendText}>Reenviar código por SMS</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.divider} />

              <TouchableOpacity
                style={styles.whatsappBtn}
                activeOpacity={0.7}
                onPress={handleSupportWhatsApp}
              >
                <Ionicons name="logo-whatsapp" size={moderateScale(20)} color="#25D366" />
                <Text style={styles.whatsappText}>Não recebeu? Fale com o Suporte</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={onClose} style={{ marginTop: verticalScale(15) }}>
                <Text style={styles.cancel}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
          
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
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
    width: "90%",
    marginBottom: verticalScale(20),
  },
  codeInput: {
    width: scale(50),
    height: verticalScale(60),
    borderRadius: moderateScale(10),
    borderWidth: 1,
    borderColor: "#DDD",
    textAlign: "center",
    fontSize: moderateScale(24),
    fontWeight: "600",
    backgroundColor: "#F9F9F9",
    color: "#333",
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
    fontSize: scaledFont(18),
    fontWeight: "600",
  },
  resendArea: {
    marginTop: verticalScale(20),
    height: verticalScale(25),
    justifyContent: "center",
  },
  timerText: {
    color: "#666",
    fontSize: scaledFont(15),
  },
  blockedText: {
    color: "#FF3B30",
    fontSize: scaledFont(15),
    fontWeight: "600",
  },
  resendText: {
    color: "#1F41BB",
    fontSize: scaledFont(15),
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#EEE",
    marginVertical: verticalScale(15),
  },
  whatsappBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F9EE",
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(15),
    borderRadius: moderateScale(8),
    borderWidth: 1,
    borderColor: "#A3E4B8",
  },
  whatsappText: {
    color: "#128C7E",
    fontSize: scaledFont(14),
    fontWeight: "700",
    marginLeft: scale(8),
  },
  cancel: {
    color: "#999",
    fontSize: scaledFont(16),
    fontWeight: "500",
  },
});