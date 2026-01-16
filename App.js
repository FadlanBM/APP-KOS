import React from "react";
import { useColorScheme } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from "react-native-paper";
import { Search, Heart, Home, User } from "lucide-react-native";

// Import Screens
import CariScreen from "./screens/bottom-navigation/CariScreen";
import FavoritScreen from "./screens/bottom-navigation/FavoritScreen";
import KosSayaScreen from "./screens/bottom-navigation/KosSayaScreen";
import AccountScreen from "./screens/bottom-navigation/AccountScreen";
import LoginScreen from "./screens/auth/LoginScreen";
import { useAuthStore } from "./store/authStore";
import WelcomeScreen from "./screens/auth/WelcomeScreen";
import SignUpScreen from "./screens/auth/SignUpScreen";
import CompleteProfileScreen from "./screens/auth/CompleteProfileScreen";
import api from "./utils/api";

const LightColors = {
  radius: 10,
  background: "#ffffff",
  foreground: "#111827",
  card: "#ffffff",
  cardForeground: "#111827",
  popover: "#ffffff",
  popoverForeground: "#111827",
  primary: "#111827",
  primaryForeground: "#f9fafb",
  secondary: "#f9fafb",
  secondaryForeground: "#111827",
  muted: "#f3f4f6",
  mutedForeground: "#6b7280",
  accent: "#f3f4f6",
  accentForeground: "#111827",
  destructive: "#f97373",
  border: "#e5e7eb",
  input: "#e5e7eb",
  ring: "#e5e7eb",
};

const DarkColors = {
  radius: 10,
  background: "#111827",
  foreground: "#f9fafb",
  card: "#111827",
  cardForeground: "#f9fafb",
  popover: "#111827",
  popoverForeground: "#f9fafb",
  primary: "#e5e7eb",
  primaryForeground: "#111827",
  secondary: "#1f2937",
  secondaryForeground: "#f9fafb",
  muted: "#1f2937",
  mutedForeground: "#9ca3af",
  accent: "#1f2937",
  accentForeground: "#f9fafb",
  destructive: "#f97373",
  border: "#111827",
  input: "#1f2937",
  ring: "#9ca3af",
};

const AppLightTheme = {
  ...MD3LightTheme,
  roundness: LightColors.radius,
  colors: {
    ...MD3LightTheme.colors,
    background: LightColors.background,
    surface: LightColors.card,
    primary: LightColors.primary,
    secondary: LightColors.secondary,
    onPrimary: LightColors.primaryForeground,
    onSecondary: LightColors.secondaryForeground,
    onSurface: LightColors.foreground,
    surfaceVariant: LightColors.muted,
    outline: LightColors.border,
  },
};

const AppDarkTheme = {
  ...MD3DarkTheme,
  roundness: DarkColors.radius,
  colors: {
    ...MD3DarkTheme.colors,
    background: DarkColors.background,
    surface: DarkColors.card,
    primary: DarkColors.primary,
    secondary: DarkColors.secondary,
    onPrimary: DarkColors.primaryForeground,
    onSecondary: DarkColors.secondaryForeground,
    onSurface: DarkColors.foreground,
    surfaceVariant: DarkColors.muted,
    outline: DarkColors.border,
  },
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function AppTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="Cari"
        component={CariScreen}
        options={{
          title: "Cari",
          tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Favorit"
        component={FavoritScreen}
        options={{
          title: "Favorit",
          tabBarIcon: ({ color, size }) => <Heart color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Kos Saya"
        component={KosSayaScreen}
        options={{
          title: "Kos Saya",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          title: "Account",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const token = useAuthStore((state) => state.token);
  const hasProfile = useAuthStore((state) => state.hasProfile);
  const setHasProfile = useAuthStore((state) => state.setHasProfile);
  const isLoading = useAuthStore((state) => state.isLoading);
  const initialize = useAuthStore((state) => state.initialize);

  React.useEffect(() => {
    initialize();
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token ? (
        !hasProfile ? (
          <Stack.Screen
            name="CompleteProfile"
            component={CompleteProfileScreen}
          />
        ) : (
          <Stack.Screen name="AppTabs" component={AppTabs} />
        )
      ) : (
        <>
          <Stack.Screen name="welcome" component={WelcomeScreen} />
          <Stack.Screen name="login" component={LoginScreen} />
          <Stack.Screen name="register" component={SignUpScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? AppDarkTheme : AppLightTheme;

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
}
