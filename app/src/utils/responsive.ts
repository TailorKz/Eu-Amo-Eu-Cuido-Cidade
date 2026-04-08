import { Dimensions, PixelRatio } from "react-native";

const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

// lê as dimensões em tempo real
const getDimensions = () => Dimensions.get("window");

export const scale = (size: number) =>
  (getDimensions().width / guidelineBaseWidth) * size;

export const verticalScale = (size: number) =>
  (getDimensions().height / guidelineBaseHeight) * size;

export const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

// Impede que a fonte estoure o layout se o usuário aumentou o tamanho
export const scaledFont = (size: number) =>
  moderateScale(size) / PixelRatio.getFontScale();