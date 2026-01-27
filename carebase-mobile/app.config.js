// Dynamic Expo config - allows environment variables and custom configuration
module.exports = {
  expo: {
    name: "Carebase",
    slug: "carebase-mobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    scheme: "carebase",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#0066CC"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.carebase.app"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#0066CC"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "com.carebase.app"
    },
    web: {
      favicon: "./assets/favicon.png",
      bundler: "metro"
    },
    plugins: [
      "expo-router",
      "expo-secure-store",
      [
        "expo-camera",
        {
          cameraPermission: "Allow Carebase to access your camera for taking photos."
        }
      ],
      [
        "expo-image-picker",
        {
          photosPermission: "Allow Carebase to access your photos for uploading images."
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      // API URL configuration
      // For iOS Simulator: http://localhost:3000 (default)
      // For Android Emulator: http://10.0.2.2:3000 (handled automatically)
      // For physical device: Set your computer's IP address, e.g., http://192.168.1.100:3000
      apiUrl: process.env.API_URL || null,

      // EAS configuration (for production builds)
      eas: {
        projectId: "your-project-id"
      }
    }
  }
};
