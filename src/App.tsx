import { useEffect, useState } from "react";
import { LoginScreen } from "./components/LoginScreen";
import { PermissionsScreen } from "./components/PermissionsScreen";
import { Dashboard } from "./components/Dashboard";
import { TokenCallback } from "./components/token-callback"; // 👈 asegúrate de importar correctamente

type AppState = "checking" | "login" | "permissions" | "dashboard" | "token-callback";

export default function App() {
  const [appState, setAppState] = useState<AppState>("checking");

  // ✅ Función para guardar el token si lo necesitas en otros componentes
  const handleToken = (token: string) => {
    localStorage.setItem("accessToken", token);
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setAppState("login");
      return;
    }

    // ✅ Verifica si el token sigue siendo válido
    fetch("https://outlook-b.onrender.com/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then((res) => {
        if (res.ok) {
          setAppState("permissions");
        } else {
          setAppState("login");
        }
      })
      .catch(() => setAppState("login"));
  }, []);

  const handleAcceptPermissions = () => {
    setAppState("dashboard");
  };

  const handleLogout = async () => {
    localStorage.removeItem("accessToken"); // ✅ limpia el token
    setAppState("login");
  };

  const renderCurrentScreen = () => {
    switch (appState) {
      case "checking":
        return <p className="text-center mt-10">Verificando sesión...</p>;
      case "login":
        return <LoginScreen setAppState={setAppState} />;
      case "permissions":
        return <PermissionsScreen onAccept={handleAcceptPermissions} />;
      case "dashboard":
        return <Dashboard onLogout={handleLogout} />;
      case "token-callback":
        return <TokenCallback setAppState={setAppState} />;
    }
  };

  return <div className="size-full">{renderCurrentScreen()}</div>;
}
