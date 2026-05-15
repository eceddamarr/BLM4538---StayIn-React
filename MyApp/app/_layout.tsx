import { AuthProvider } from "@/context/AuthContext";
import { AlertProvider } from "@/context/AlertContext";
import AlertModal from "@/components/AlertModal";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <AuthProvider>
      <AlertProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
        <AlertModal />
      </AlertProvider>
    </AuthProvider>
  );
}
