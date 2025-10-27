import { useEffect, useState } from "react";
import { LoginScreen } from "./components/LoginScreen";
import { PermissionsScreen } from "./components/PermissionsScreen";
import { Dashboard } from "./components/Dashboard";

type AppState = "checking" | "login" | "permissions" | "dashboard";

type LoginScreenProps = {
  setAppState: (state: "checking" | "login" | "permissions" | "dashboard") => void;
};

export default function App() {
  const [appState, setAppState] = useState<AppState>("checking");

  useEffect(() => {
    // Verificar si ya hay sesión activa en backend
    fetch("https://outlook-b.onrender.com/me", { credentials: "include" })
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
    try {
      await fetch("https://outlook-b.onrender.com/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      setAppState("login");
    }
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
    }
  };

  return <div className="size-full">{renderCurrentScreen()}</div>;
}
