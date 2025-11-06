// ❌ Si usas React con Vite o Create React App, elimina la siguiente línea.
// ✅ Si usas Next.js con el App Router, mantenla:
"use client";

import { useEffect } from "react";

type TokenCallbackProps = {
  setAppState: (state: "checking" | "login" | "permissions" | "dashboard") => void;
};

export function TokenCallback({ setAppState }: TokenCallbackProps) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    console.log("🔑 Token recibido en TokenCallback:", token);

    if (token) {
      // Guardar el token en localStorage
      localStorage.setItem("accessToken", token);

      // 🔁 Reiniciar la app para que App.tsx valide sesión correctamente
      window.location.replace("/");
    } else {
      console.error("❌ No se recibió token en la URL");
      setAppState("login");
    }
  }, [setAppState]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <p className="text-gray-700 text-lg font-medium animate-pulse">
        Procesando autenticación...
      </p>
    </div>
  );
}
