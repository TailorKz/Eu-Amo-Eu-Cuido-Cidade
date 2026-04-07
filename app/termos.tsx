import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "./src/utils/responsive";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface TermoProps {
  numero: string;
  titulo: string;
  conteudo: string;
  icon: keyof typeof Ionicons.glyphMap;
  destaque?: "aviso" | "proibicao" | "normal";
}

// ─── Dados dos Termos ──────────────────────────────────────────────────────────

const termos: TermoProps[] = [
  {
    numero: "1",
    titulo: "Aceitação dos Termos",
    icon: "checkmark-circle-outline",
    destaque: "normal",
    conteudo:
      "Ao baixar, instalar, acessar ou utilizar o aplicativo 'Eu Amo, Eu Cuido', você declara ter lido, compreendido e concordado integralmente com estes Termos de Uso, bem como com a nossa Política de Privacidade.\n\n• Caso não concorde com qualquer parte destes termos, não utilize o aplicativo;\n• O uso continuado do aplicativo após alterações nos termos implica na aceitação das novas condições;\n• Alterações relevantes serão comunicadas via notificação push;\n• Estes termos são regidos pela legislação brasileira.",
  },
  {
    numero: "2",
    titulo: "Descrição do Serviço",
    icon: "phone-portrait-outline",
    destaque: "normal",
    conteudo:
      "O 'Eu Amo, Eu Cuido' é uma plataforma digital B2G (Business-to-Government) e e B2B (Business-to-Business) de zeladoria urbana que conecta principalmente cidadãos e prefeituras municipais. O serviço permite:\n\n• Reportar problemas urbanos (infraestrutura, iluminação, limpeza, saneamento, etc.);\n• Acompanhar o status de atendimento das solicitações em tempo real;\n• Receber notificações sobre respostas e atualizações do município ou órgão;\n• Visualizar a localização dos problemas reportados em mapa interativo.\n\nO sistema opera com isolamento total de dados por município (arquitetura multi-tenant), garantindo que cada prefeitura ou órgão acesse apenas as informações da sua cidade.",
  },
  {
    numero: "3",
    titulo: "Cadastro e Acesso",
    icon: "person-add-outline",
    destaque: "normal",
    conteudo:
      "Para utilizar o aplicativo, é necessário criar uma conta com informações verdadeiras e atualizadas:\n\n• O cadastro é vinculado ao número de telefone e à cidade do cidadão;\n• Cada número de telefone permite apenas uma conta por município;\n• Você é responsável pela confidencialidade da sua senha;\n• O compartilhamento de conta com terceiros não é permitido;\n• Em caso de suspeita de acesso não autorizado, altere sua senha imediatamente;\n• Contas de funcionários e gestores são geridas exclusivamente pela prefeitura municipal.",
  },
  {
    numero: "4",
    titulo: "Uso Correto do Aplicativo",
    icon: "thumbs-up-outline",
    destaque: "normal",
    conteudo:
      "O aplicativo deve ser utilizado exclusivamente para sua finalidade: reportar problemas reais de infraestrutura e zeladoria urbana no município cadastrado.\n\nUsos permitidos:\n• Reportar problemas visíveis no espaço público da sua cidade;\n• Acompanhar e interagir com suas próprias solicitações;\n• Utilizar o GPS e câmera para documentar o problema com precisão;\n• Avaliar o atendimento e reposta recebida.",
  },
  {
    numero: "5",
    titulo: "Condutas Proibidas",
    icon: "ban-outline",
    destaque: "proibicao",
    conteudo:
      "É estritamente proibido, sob pena de banimento imediato da plataforma:\n\n• Fazer reportes falsos, fictícios ou com localização incorreta propositalmente;\n• Enviar imagens impróprias, ofensivas, com nudez ou conteúdo violento;\n• Utilizar linguagem ofensiva, discriminatória ou de assédio nas observações;\n• Criar múltiplas contas para burlar restrições;\n• Tentar acessar dados de outros usuários ou de outros municípios;\n• Usar o aplicativo para fins comerciais, políticos ou eleitorais;\n• Realizar engenharia reversa, decompilação ou qualquer ataque à infraestrutura;\n• Enviar vírus, malware ou qualquer código malicioso.",
  },
  {
    numero: "6",
    titulo: "Conteúdo Enviado pelo Usuário",
    icon: "cloud-upload-outline",
    destaque: "normal",
    conteudo:
      "Ao enviar fotos, textos e localizações pelo aplicativo, você declara e garante que:\n\n• O conteúdo é verídico e relacionado a um problema real no espaço público;\n• As imagens não violam direitos de imagem de terceiros;\n• Você concede à prefeitura ou contratante e à plataforma o direito de usar o conteúdo para fins de atendimento e melhoria do serviço público;\n• Conteúdos que violem estas regras poderão ser removidos sem aviso prévio;\n• A prefeitura pode solicitar esclarecimentos sobre solicitações suspeitas.",
  },
  {
    numero: "7",
    titulo: "Responsabilidades da Plataforma",
    icon: "construct-outline",
    destaque: "aviso",
    conteudo:
      "A plataforma 'Eu Amo, Eu Cuido' se compromete a:\n\n• Manter o sistema disponível com melhores esforços razoáveis;\n• Proteger os dados dos usuários conforme a LGPD;\n• Encaminhar as solicitações ao setor correspondente;\n• Enviar notificações sobre atualizações do status das solicitações.\n\nA plataforma não se responsabiliza por:\n• O prazo ou a efetividade do atendimento pela prefeitura ou setor (responsabilidade do município);\n• Indisponibilidades temporárias por manutenção ou falhas técnicas;\n• Danos decorrentes do uso indevido do aplicativo pelo usuário.",
  },
  {
    numero: "8",
    titulo: "Perfis de Acesso",
    icon: "people-outline",
    destaque: "normal",
    conteudo:
      "O sistema possui cinco perfis de acesso com permissões distintas:\n\n• Cidadão: pode criar solicitações, acompanhar status e receber notificações;\n• Funcionário: pode visualizar solicitações da sua cidade, atualizar status, registrar resposta oficial e anexar foto de resolução;\n• Gestor de Setor: possui as permissões do Funcionário com visão gerencial do setor;\n• Vereador: possui a permissão de visualizar reportos classificados como 'Em andamento' ou 'Resolvido';\n• Super Admin: acesso completo à configuração da prefeitura, cadastro de funcionários e gestão dos setores.\n\nCada perfil é configurado pelo contratante e não pode ser alterado pelo usuário.",
  },
  {
    numero: "9",
    titulo: "Modificações e Descontinuação",
    icon: "settings-outline",
    destaque: "aviso",
    conteudo:
      "Reservamo-nos o direito de:\n\n• Modificar, atualizar ou melhorar o aplicativo a qualquer momento;\n• Corrigir erros ou vulnerabilidades de segurança sem aviso prévio;\n• Suspender temporariamente o serviço para manutenção programada;\n• Descontinuar o serviço em determinado município caso o contrato com a prefeitura seja encerrado.\n\nEm caso de descontinuação, os dados dos cidadãos serão mantidos pelo período previsto em lei, e você será notificado com antecedência razoável.",
  },
  {
    numero: "10",
    titulo: "Propriedade Intelectual",
    icon: "ribbon-outline",
    destaque: "normal",
    conteudo:
      "Todo o conteúdo, código, design, marca, logotipo e funcionalidades do aplicativo 'Eu Amo, Eu Cuido' são de propriedade exclusiva dos seus desenvolvedores e estão protegidos por leis de propriedade intelectual.\n\n• É proibida a reprodução, distribuição ou cópia do aplicativo sem autorização;\n• O nome, marca e identidade visual são protegidos;\n• O conteúdo gerado pelos usuários (fotos, textos) permanece de propriedade do usuário, com licença de uso concedida à plataforma para fins do serviço.",
  },
  {
    numero: "11",
    titulo: "Legislação Aplicável e Foro",
    icon: "library-outline",
    destaque: "normal",
    conteudo:
      "Estes Termos de Uso são regidos e interpretados de acordo com as leis da República Federativa do Brasil, em especial:\n\n• Lei nº 13.709/2018 (LGPD — Lei Geral de Proteção de Dados);\n• Lei nº 12.965/2014 (Marco Civil da Internet);\n• Código de Defesa do Consumidor (Lei nº 8.078/1990).\n\nQuaisquer disputas decorrentes do uso deste aplicativo serão submetidas ao foro da comarca do município onde o serviço é prestado, salvo disposição legal em contrário.",
  },
];

// ─── Componente de Seção Expansível ───────────────────────────────────────────

function TermoExpansivel({ numero, titulo, conteudo, icon, destaque = "normal" }: TermoProps) {
  const [aberto, setAberto] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAberto((prev) => !prev);
  };

  const destaqueStyle =
    destaque === "proibicao"
      ? styles.cardProibicao
      : destaque === "aviso"
      ? styles.cardAviso
      : styles.cardNormal;

  const iconBgStyle =
    destaque === "proibicao"
      ? styles.iconBgProibicao
      : destaque === "aviso"
      ? styles.iconBgAviso
      : styles.iconBgNormal;

  const iconColor =
    destaque === "proibicao"
      ? "#C62828"
      : destaque === "aviso"
      ? "#E65100"
      : "#1F41BB";

  const numeroColor =
    destaque === "proibicao"
      ? "#C62828"
      : destaque === "aviso"
      ? "#E65100"
      : "#1F41BB";

  return (
    <View style={[styles.secaoCard, destaqueStyle]}>
      <TouchableOpacity
        style={styles.secaoHeader}
        onPress={toggle}
        activeOpacity={0.7}
      >
        <View style={styles.secaoHeaderEsquerda}>
          <View style={[styles.iconContainer, iconBgStyle]}>
            <Ionicons
              name={icon}
              size={moderateScale(18)}
              color={iconColor}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.secaoNumero, { color: numeroColor }]}>
              Cláusula {numero}
            </Text>
            <Text style={styles.secaoTitulo}>{titulo}</Text>
          </View>
        </View>
        <Ionicons
          name={aberto ? "chevron-up" : "chevron-down"}
          size={moderateScale(18)}
          color={iconColor}
        />
      </TouchableOpacity>

      {aberto && (
        <View style={styles.secaoCorpo}>
          <View
            style={[
              styles.divisor,
              destaque === "proibicao"
                ? { backgroundColor: "#FFCDD2" }
                : destaque === "aviso"
                ? { backgroundColor: "#FFE0B2" }
                : {},
            ]}
          />
          <Text style={styles.secaoConteudo}>{conteudo}</Text>
        </View>
      )}
    </View>
  );
}

// ─── Tela Principal ────────────────────────────────────────────────────────────

export default function Termos() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={moderateScale(24)}
            color="#1F41BB"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Termos de Uso</Text>
        <View style={{ width: moderateScale(24) }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner intro */}
        <View style={styles.bannerIntro}>
          <View style={styles.bannerIcone}>
            <Ionicons
              name="document-text"
              size={moderateScale(32)}
              color="#1F41BB"
            />
          </View>
          <Text style={styles.bannerTitulo}>Termos de Uso do Serviço</Text>
          <Text style={styles.bannerSubtitulo}>
            Ao utilizar o &apos;Eu Amo, Eu Cuido&apos;, você concorda com estas condições.
            Toque em cada cláusula para ler os detalhes completos.
          </Text>
        </View>

        {/* Legenda de cores */}
        <View style={styles.legendaContainer}>
          <Text style={styles.legendaTitulo}>LEGENDA</Text>
          <View style={styles.legendaRow}>
            <View style={[styles.legendaDot, { backgroundColor: "#E3F2FD" }]} />
            <Text style={styles.legendaTexto}>Cláusula padrão</Text>
            <View style={[styles.legendaDot, { backgroundColor: "#FFF3E0" }]} />
            <Text style={styles.legendaTexto}>Atenção</Text>
            <View style={[styles.legendaDot, { backgroundColor: "#FFEBEE" }]} />
            <Text style={styles.legendaTexto}>Proibição</Text>
          </View>
        </View>

        {/* Cláusulas */}
        <Text style={styles.secaoLabel}>CLÁUSULAS DO CONTRATO</Text>
        {termos.map((t) => (
          <TermoExpansivel key={t.numero} {...t} />
        ))}

        {/* Aviso de aceitação */}
        <View style={styles.avisoAceitacao}>
          <Ionicons
            name="information-circle-outline"
            size={moderateScale(16)}
            color="#1F41BB"
          />
          <Text style={styles.avisoTexto}>
            O uso contínuo do aplicativo implica na aceitação integral destes termos.
          </Text>
        </View>

        {/* Rodapé */}
        <View style={styles.rodape}>
          <Ionicons
            name="calendar-outline"
            size={moderateScale(14)}
            color="#999"
          />
          <Text style={styles.updateText}>
            {"  "}Última atualização: 07 de Abril de 2026
          </Text>
        </View>

        <Text style={styles.versaoTexto}>
          Eu Amo, Eu Cuido — Termos de Uso v2.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Estilos ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F9FF",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(15),
    paddingHorizontal: scale(16),
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  backButton: {
    padding: moderateScale(5),
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: "700",
    color: "#333",
  },

  // Container
  container: {
    padding: scale(16),
    paddingBottom: verticalScale(50),
  },

  // Banner
  bannerIntro: {
    backgroundColor: "#EEF2FF",
    borderRadius: moderateScale(16),
    padding: scale(20),
    alignItems: "center",
    marginBottom: verticalScale(14),
    borderWidth: 1,
    borderColor: "#C7D2FE",
  },
  bannerIcone: {
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(30),
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: verticalScale(12),
    borderWidth: 1,
    borderColor: "#C7D2FE",
  },
  bannerTitulo: {
    fontSize: moderateScale(17),
    fontWeight: "700",
    color: "#1F41BB",
    textAlign: "center",
    marginBottom: verticalScale(8),
  },
  bannerSubtitulo: {
    fontSize: moderateScale(13),
    color: "#4B5563",
    textAlign: "center",
    lineHeight: moderateScale(20),
  },

  // Legenda
  legendaContainer: {
    backgroundColor: "#FFF",
    borderRadius: moderateScale(10),
    padding: scale(12),
    marginBottom: verticalScale(16),
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  legendaTitulo: {
    fontSize: moderateScale(10),
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 1.2,
    marginBottom: verticalScale(8),
  },
  legendaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
  },
  legendaDot: {
    width: moderateScale(14),
    height: moderateScale(14),
    borderRadius: moderateScale(4),
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  legendaTexto: {
    fontSize: moderateScale(12),
    color: "#6B7280",
    marginRight: scale(8),
  },

  // Label de seção
  secaoLabel: {
    fontSize: moderateScale(11),
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 1.2,
    marginBottom: verticalScale(10),
    marginLeft: scale(4),
  },

  // Cards
  secaoCard: {
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(8),
    borderWidth: 1,
    overflow: "hidden",
  },
  cardNormal: {
    backgroundColor: "#FFF",
    borderColor: "#E5E7EB",
  },
  cardAviso: {
    backgroundColor: "#FFFBF5",
    borderColor: "#FFE0B2",
  },
  cardProibicao: {
    backgroundColor: "#FFF8F8",
    borderColor: "#FFCDD2",
  },

  // Header do card
  secaoHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: scale(14),
  },
  secaoHeaderEsquerda: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: scale(12),
  },
  iconContainer: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(10),
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  iconBgNormal: {
    backgroundColor: "#EEF2FF",
  },
  iconBgAviso: {
    backgroundColor: "#FFF3E0",
  },
  iconBgProibicao: {
    backgroundColor: "#FFEBEE",
  },
  secaoNumero: {
    fontSize: moderateScale(10),
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  secaoTitulo: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#1F2937",
    marginTop: verticalScale(1),
  },

  // Corpo expansível
  secaoCorpo: {
    paddingHorizontal: scale(14),
    paddingBottom: verticalScale(14),
  },
  divisor: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginBottom: verticalScale(12),
  },
  secaoConteudo: {
    fontSize: moderateScale(13),
    color: "#4B5563",
    lineHeight: moderateScale(21),
    textAlign: "justify",
  },

  // Aviso de aceitação
  avisoAceitacao: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#EEF2FF",
    borderRadius: moderateScale(10),
    padding: scale(12),
    marginTop: verticalScale(20),
    gap: scale(8),
    borderWidth: 1,
    borderColor: "#C7D2FE",
  },
  avisoTexto: {
    flex: 1,
    fontSize: moderateScale(12),
    color: "#3730A3",
    lineHeight: moderateScale(18),
    fontStyle: "italic",
  },

  // Rodapé
  rodape: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: verticalScale(24),
    marginBottom: verticalScale(6),
  },
  updateText: {
    fontSize: moderateScale(12),
    color: "#999",
    fontStyle: "italic",
  },
  versaoTexto: {
    fontSize: moderateScale(11),
    color: "#C4C4C4",
    textAlign: "center",
    marginBottom: verticalScale(8),
  },
});