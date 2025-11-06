import { useEffect, useState } from "react";
import { LoginScreen } from "./components/LoginScreen";
import { PermissionsScreen } from "./components/PermissionsScreen";
import { Dashboard } from "./components/Dashboard";
import { TokenCallback } from "./components/token-callback";

type AppState = "checking" | "login" | "permissions" | "dashboard" | "token-callback";

export default function App() {
  const [appState, setAppState] = useState<AppState>("checking");

  useEffect(() => {
    const currentPath = window.location.pathname;

    // ✅ Si la URL es /token-callback, monta ese componente
    if (currentPath === "/token-callback") {
      setAppState("token-callback");
      return;
    }

    // ✅ Si ya hay token guardado, verifica si es válido
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setAppState("login");
      return;
    }

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
          localStorage.removeItem("accessToken");
          setAppState("login");
        }
      })
      .catch(() => {
        localStorage.removeItem("accessToken");
        setAppState("login");
      });
  }, []);

  const handleAcceptPermissions = () => {
    setAppState("dashboard");
  };

  const handleLogout = async () => {
    localStorage.removeItem("accessToken");
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
