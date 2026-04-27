import "dotenv/config";

export default {
  expo: {
    name: "Eu Amo Eu Cuido",
    slug: "eu-amo-eu-cuido-cidade",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/logo.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.tailorkz.euamoeucuido",
      buildNumber: "1",
      infoPlist: {
        NSCameraUsageDescription:
          "O aplicativo precisa de acesso à sua câmera para que você possa fotografar os problemas de zeladoria na cidade e anexá-los à sua solicitação.",
        NSPhotoLibraryUsageDescription:
          "O aplicativo precisa de acesso à galeria para que você possa escolher fotos de problemas urbanos e enviá-las para o setor responsável.",
        NSLocationWhenInUseUsageDescription:
          "Precisamos da sua localização exata para identificar onde o problema urbano ocorreu, facilitando o atendimento pela equipe responsável e garantindo que sua solicitação seja direcionada para a área correta da cidade.",
      },
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_IOS,
      },
    },
    android: {
      versionCode: 1,
      adaptiveIcon: {
        foregroundImage: "./assets/images/iconandroid.png",
        backgroundColor: "#ffffff",
      },
      package: "com.tailorkz.euamoeucuido",
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON || "./google-services.json",
      permissions: [
        "android.permission.RECEIVE_BOOT_COMPLETED",
        "android.permission.VIBRATE",
        "android.permission.POST_NOTIFICATIONS",
      ],
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID,
        },
      },
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/logo.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/iconandroid.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
      [
        "expo-notifications",
        {
          icon: "./assets/images/iconandroid.png",
          color: "#1F41BB",
          defaultChannel: "default",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      eas: {
        projectId: "b5eb0f86-1deb-4a4e-a519-874c0cd37fe3",
      },
    },
  },
};
