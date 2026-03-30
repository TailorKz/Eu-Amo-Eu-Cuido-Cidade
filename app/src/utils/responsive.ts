import { Dimensions, PixelRatio } from "react-native";

const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

// ✅ Função ao invés de constante — lê as dimensões em tempo real
const getDimensions = () => Dimensions.get("window");

export const scale = (size: number) =>
  (getDimensions().width / guidelineBaseWidth) * size;

export const verticalScale = (size: number) =>
  (getDimensions().height / guidelineBaseHeight) * size;

export const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

// ✅ NOVO: para fontes — respeita a config de acessibilidade do celular
// Impede que a fonte estoure o layout se o usuário aumentou o tamanho
// do sistema (ex.: idosos com fonte grande no celular)
export const scaledFont = (size: number) =>
  moderateScale(size) / PixelRatio.getFontScale();