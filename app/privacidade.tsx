import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Animated,
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

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface SectionProps {
  numero: string;
  titulo: string;
  conteudo: string;
  icon: keyof typeof Ionicons.glyphMap;
}

// ─── Dados das Seções ──────────────────────────────────────────────────────────

const secoes: SectionProps[] = [
  {
    numero: "1",
    titulo: "Coleta de Dados Pessoais",
    icon: "person-outline",
    conteudo:
      "Em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018), coletamos apenas os dados estritamente necessários para o funcionamento do aplicativo:\n\n• Nome completo: para identificação nas solicitações;\n• Número de telefone: utilizado como login único por cidade, evitando duplicidade de contas;\n• Cidade de residência: necessário para o correto isolamento dos dados entre municípios (arquitetura multi-tenant);\n• Senha (criptografada): armazenada exclusivamente em formato hash seguro (bcrypt), nunca em texto plano.\n\nNão coletamos e-mail, CPF, data de nascimento ou quaisquer outros dados sensíveis além dos listados acima.",
  },
  {
    numero: "2",
    titulo: "Uso da Localização (GPS)",
    icon: "location-outline",
    conteudo:
      "O aplicativo solicita permissão para acessar sua localização geográfica exata (GPS) exclusivamente no momento em que você cria uma nova solicitação de zeladoria urbana. Essa informação é essencial para que a equipe da prefeitura localize com precisão o problema reportado.\n\n• Não rastreamos sua localização em segundo plano;\n• Não armazenamos histórico de deslocamentos;\n• A localização é usada apenas para preencher o endereço da solicitação, podendo ser ajustada manualmente pelo mapa interativo;\n• Você pode negar a permissão de GPS e informar o endereço manualmente a qualquer momento.",
  },
  {
    numero: "3",
    titulo: "Uso da Câmera e Imagens",
    icon: "camera-outline",
    conteudo:
      "As fotografias capturadas pela câmera do seu dispositivo dentro do aplicativo são enviadas de forma segura para nossos servidores e anexadas à sua solicitação, ficando visíveis exclusivamente para as equipes encarregadas do atendimento.\n\n• Não acessamos sua galeria de fotos privada;\n• As imagens são armazenadas em servidor seguro (Amazon AWS S3) com política de acesso controlado;\n• As fotos são utilizadas exclusivamente para documentar e resolver o problema reportado;\n• Fotos de resolução (anexadas pela equipe) ficam disponíveis para consulta do cidadão na solicitação.",
  },
  {
    numero: "4",
    titulo: "Notificações Push",
    icon: "notifications-outline",
    conteudo:
      "Com sua permissão, enviamos notificações push para mantê-lo informado sobre o andamento das suas solicitações, como mudanças de status (Em Andamento, Resolvido) e respostas oficiais do município.\n\n• As notificações são enviadas exclusivamente sobre as suas próprias solicitações;\n• O token de notificação (identificador do dispositivo) é armazenado de forma segura e isolado por cidade;\n• Você pode desativar as notificações a qualquer momento nas configurações do seu dispositivo;\n• Não enviamos notificações de marketing ou publicidade.",
  },
  {
    numero: "5",
    titulo: "Compartilhamento de Dados",
    icon: "share-social-outline",
    conteudo:
      "Seus dados pessoais são compartilhados de forma restrita e apenas com as entidades estritamente necessárias:\n\n• Entidade Responsável pela sua localidade: gestores e equipes de atendimento do órgão competente têm acesso às solicitações, incluindo nome e telefone do usuário, exclusivamente para fins de contato e resolução da demanda;\n• Amazon AWS S3: serviço de armazenamento de imagens, sujeito à política de privacidade da Amazon;\n• Twilio: serviço de comunicação por SMS baseado na API oficial do WhatsApp, utilizado para envio de notificações via mensagem de texto.\n\nNão vendemos, alugamos ou comercializamos seus dados com terceiros para fins de marketing ou publicidade.",
  },
  {
    numero: "6",
    titulo: "Isolamento de Dados por Cidade",
    icon: "business-outline",
    conteudo:
      "O sistema 'Eu Amo, Eu Cuido' opera com arquitetura multi-tenant, o que significa que múltiplas cidades compartilham a mesma infraestrutura tecnológica, porém com isolamento rigoroso de dados.\n\n• Os dados de uma cidade jamais são acessados por outro município;\n• Todas as consultas ao banco de dados são obrigatoriamente filtradas pelo identificador da cidade;\n• Gestores e agentes autorizados têm acesso somente às solicitações vinculadas à sua própria área de atuação;\n• O isolamento é garantido por regras de negócio no servidor (back-end), não dependendo apenas de restrições de interface.",
  },
  {
    numero: "7",
    titulo: "Segurança dos Dados",
    icon: "shield-checkmark-outline",
    conteudo:
      "Adotamos medidas técnicas e organizacionais para proteger seus dados contra acesso não autorizado, alteração, divulgação ou destruição:\n\n• Senhas armazenadas com hash bcrypt (irreversível);\n• Comunicação entre app e servidor protegida por HTTPS/TLS;\n• Armazenamento de imagens em servidor seguro (AWS S3);\n• Controle de acesso por perfil (CIDADAO, GESTOR_SETOR, SUPER_ADMIN);\n• Infraestrutura hospedada com backups automáticos.",
  },
  {
    numero: "8",
    titulo: "Seus Direitos (LGPD)",
    icon: "document-text-outline",
    conteudo:
      "Conforme a LGPD, você possui os seguintes direitos em relação aos seus dados pessoais:\n\n• Acesso: solicitar quais dados possuímos sobre você;\n• Correção: atualizar dados incorretos ou desatualizados;\n• Eliminação: solicitar a exclusão permanente da sua conta e dados;\n• Portabilidade: solicitar seus dados em formato estruturado;\n• Revogação de consentimento: retirar permissões concedidas (GPS, câmera, notificações) a qualquer momento.\n\nPara exercer seus direitos, utilize a opção 'Excluir minha conta' no seu Perfil dentro do aplicativo, ou entre em contato com o nosso número de contato: .",
  },
  {
    numero: "9",
    titulo: "Retenção e Exclusão de Dados",
    icon: "trash-outline",
    conteudo:
      "Mantemos seus dados pelo tempo necessário para o cumprimento das finalidades descritas nesta política:\n\n• Dados da conta: mantidos enquanto a conta estiver ativa;\n• Solicitações: mantidas para fins de histórico e para fins estatísticos;\n• Exclusão de conta: ao solicitar a exclusão, seus dados pessoais são permanentemente removidos. As solicitações podem ser mantidas de forma anonimizada para fins estatísticos.\n\nA exclusão pode ser solicitada diretamente pela opção 'Excluir minha conta' disponível na tela de Perfil do aplicativo.",
  },
  {
    numero: "10",
    titulo: "Contato e Encarregado de Dados",
    icon: "mail-outline",
    conteudo:
      "Para dúvidas, solicitações ou reclamações relacionadas ao tratamento dos seus dados pessoais, entre em contato através do nosso telefone de contato: , responsável pelo uso e gestão dos dados coletados no âmbito da sua localidade.\n\nO sistema 'Eu Amo, Eu Cuido' é desenvolvido e operado como uma plataforma tecnológica B2G (Business-to-Government) e B2B (Business-to-Business). Desta forma, cada instituição ou órgão contratante (como municípios, corporações ou entidades parceiras) atua como a controladora dos dados dos seus respectivos usuários, nos termos da LGPD.\n\nEsta política pode ser atualizada periodicamente. Alterações relevantes serão comunicadas via notificação no aplicativo.",
  },
];

// ─── Componente de Seção Expansível ───────────────────────────────────────────

function SecaoExpansivel({ numero, titulo, conteudo, icon }: SectionProps) {
  const [aberta, setAberta] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAberta((prev) => !prev);
  };

  return (
    <View style={styles.secaoCard}>
      <TouchableOpacity
        style={styles.secaoHeader}
        onPress={toggle}
        activeOpacity={0.7}
      >
        <View style={styles.secaoHeaderEsquerda}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={icon}
              size={moderateScale(18)}
              color="#1F41BB"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.secaoNumero}>Art. {numero}</Text>
            <Text style={styles.secaoTitulo}>{titulo}</Text>
          </View>
        </View>
        <Ionicons
          name={aberta ? "chevron-up" : "chevron-down"}
          size={moderateScale(18)}
          color="#1F41BB"
        />
      </TouchableOpacity>

      {aberta && (
        <View style={styles.secaoCorpo}>
          <View style={styles.divisor} />
          <Text style={styles.secaoConteudo}>{conteudo}</Text>
        </View>
      )}
    </View>
  );
}

// ─── Tela Principal ────────────────────────────────────────────────────────────

export default function Privacidade() {
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
        <Text style={styles.headerTitle}>Política de Privacidade</Text>
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
              name="shield-checkmark"
              size={moderateScale(32)}
              color="#1F41BB"
            />
          </View>
          <Text style={styles.bannerTitulo}>Seus dados estão protegidos</Text>
          <Text style={styles.bannerSubtitulo}>
            Em conformidade com a LGPD (Lei nº 13.709/2018), coletamos apenas o
            essencial. Toque em cada seção para ver os detalhes completos.
          </Text>
        </View>

        {/* Badges de destaque */}
        <View style={styles.badgesRow}>
          <View style={styles.badge}>
            <Ionicons name="checkmark-circle" size={moderateScale(14)} color="#2E7D32" />
            <Text style={styles.badgeTexto}>Sem rastreamento</Text>
          </View>
          <View style={styles.badge}>
            <Ionicons name="checkmark-circle" size={moderateScale(14)} color="#2E7D32" />
            <Text style={styles.badgeTexto}>Sem venda de dados</Text>
          </View>
          <View style={styles.badge}>
            <Ionicons name="checkmark-circle" size={moderateScale(14)} color="#2E7D32" />
            <Text style={styles.badgeTexto}>LGPD compliant</Text>
          </View>
        </View>

        {/* Seções expansíveis */}
        <Text style={styles.secaoLabel}>DETALHAMENTO COMPLETO</Text>
        {secoes.map((s) => (
          <SecaoExpansivel key={s.numero} {...s} />
        ))}

        {/* Rodapé */}
        <View style={styles.rodape}>
          <Ionicons name="calendar-outline" size={moderateScale(14)} color="#999" />
          <Text style={styles.updateText}>
            {"  "}Última atualização: 07 de Abril de 2026
          </Text>
        </View>

        <Text style={styles.versaoTexto}>
          Eu Amo, Eu Cuido — Versão da Política 2.0
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

  // Container principal
  container: {
    padding: scale(16),
    paddingBottom: verticalScale(50),
  },

  // Banner intro
  bannerIntro: {
    backgroundColor: "#EEF2FF",
    borderRadius: moderateScale(16),
    padding: scale(20),
    alignItems: "center",
    marginBottom: verticalScale(16),
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

  // Badges
  badgesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: verticalScale(20),
    gap: scale(6),
  },
  badge: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0FDF4",
    borderRadius: moderateScale(20),
    paddingVertical: verticalScale(6),
    paddingHorizontal: scale(6),
    borderWidth: 1,
    borderColor: "#BBF7D0",
    gap: scale(4),
  },
  badgeTexto: {
    fontSize: moderateScale(10),
    color: "#2E7D32",
    fontWeight: "600",
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

  // Card de seção expansível
  secaoCard: {
    backgroundColor: "#FFF",
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(8),
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
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
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  secaoNumero: {
    fontSize: moderateScale(10),
    color: "#1F41BB",
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

  // Rodapé
  rodape: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: verticalScale(32),
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