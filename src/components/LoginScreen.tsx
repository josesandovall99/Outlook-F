import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { ImageWithFallback } from "./figma/ImageWithFallback";

type LoginScreenProps = {
  setAppState: (state: "checking" | "login" | "permissions" | "dashboard") => void;
};

export function LoginScreen({ setAppState }: LoginScreenProps) {
  const [loading, setLoading] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);

  // 🔍 Verifica si ya existe una sesión activa
  useEffect(() => {
    fetch("https://outlook-b.onrender.com/session-check", {
      method: "GET",
      credentials: "include", // 👈 Permite enviar cookies
      headers: {
        "Accept": "application/json",
        "Cache-Control": "no-cache",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Respuesta HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data?.token) {
          setSessionActive(true);
          console.log("✅ Sesión activa detectada");
        } else {
          console.log("🚪 No hay sesión activa");
        }
      })
      .catch((err) => console.error("❌ Error comprobando sesión:", err));
  }, []);

  // 🔑 Manejar clic de inicio de sesión
  const handleLoginClick = () => {
    setLoading(true);
    window.location.href = "https://outlook-b.onrender.com/auth/login";
  };

  // 🧭 Si ya hay sesión activa (opcional)
  useEffect(() => {
    if (sessionActive) {
      console.log("🟢 Redirigiendo a Dashboard...");
       setAppState("dashboard");// Descomenta si lo deseas
    }
  }, [sessionActive]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Imagen y título */}
        <div className="text-center mb-8">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1671944378859-08bcfa15a280?..."
            alt="Corporate branding"
            className="w-32 h-32 mx-auto rounded-2xl shadow-lg object-cover mb-6"
          />
          <h1 className="text-3xl text-slate-800 mb-2">Sistema de Gestión</h1>
          <p className="text-slate-600">Contactos y Estudiantes</p>
        </div>

        <Card className="p-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <div className="text-center space-y-6">
            {!sessionActive ? (
              <>
                <h2 className="text-xl text-slate-800 mb-3">Bienvenido</h2>
                <p className="text-slate-600 leading-relaxed">
                  Accede con tu cuenta institucional o personal para gestionar contactos y estudiantes.
                </p>

                <Button
                  onClick={handleLoginClick}
                  disabled={loading}
                  className="w-full bg-[#0078d4] hover:bg-[#106ebe] text-white py-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <span className="animate-pulse">Redirigiendo...</span>
                  ) : (
                    <div className="flex items-center justify-center space-x-3">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z" />
                      </svg>
                      <span>Iniciar sesión con Microsoft</span>
                    </div>
                  )}
                </Button>
              </>
            ) : (
              <div className="text-slate-700">
                <p>✅ Ya tienes una sesión activa.</p>
                <Button
                  onClick={() => (setAppState("dashboard"))}
                  className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-6 rounded-lg"
                >
                  Ir al Dashboard
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}