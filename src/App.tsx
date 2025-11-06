import { useEffect, useState } from "react";
import { LoginScreen } from "./components/LoginScreen";
import { PermissionsScreen } from "./components/PermissionsScreen";
import { Dashboard } from "./components/Dashboard";
import { TokenCallback } from "./components/token-callback";

type AppState = "checking" | "login" | "permissions" | "dashboard";

export default function App() {
  const [appState, setAppState] = useState<AppState>("checking");

  useEffect(() => {
    // 🧠 Si la ruta actual contiene /token-callback, montamos TokenCallback
    if (window.location.pathname.includes("/token-callback")) {
      setAppState("checking"); // transitorio mientras se procesa el token
      return;
    }

    // 🧠 Revisar si hay token guardado
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setAppState("login");
      return;
    }

    // 🧠 Verificar token contra el backend
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

  const handleAcceptPermissions = () => setAppState("dashboard");

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setAppState("login");
  };

  const renderCurrentScreen = () => {
    switch (appState) {
      case "checking":
        // 🔁 Mostramos TokenCallback si viene del login
        if (window.location.pathname.includes("/token-callback")) {
          return <TokenCallback setAppState={setAppState} />;
        }
        return <p className="text-center mt-10">Verificando sesión...</p>;

      case "login":
        return <LoginScreen setAppState={setAppState} />;

      case "permissions":
        return <PermissionsScreen onAccept={handleAcceptPermissions} />;

      case "dashboard":
        return <Dashboard onLogout={handleLogout} />;

      default:
        return <p className="text-center mt-10">Cargando...</p>;
    }
  };

  return <div className="min-h-screen bg-gray-50">{renderCurrentScreen()}</div>;
}
