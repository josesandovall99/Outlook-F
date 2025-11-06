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
      localStorage.setItem("accessToken", token);

      // 🔁 Recarga la app para que App.tsx valide sesión correctamente
      window.location.replace("/");
    } else {
      console.error("❌ No se recibió token");
      setAppState("login");
    }
  }, [setAppState]);

  return (
    <p className="text-center mt-10 text-slate-700">
      Procesando autenticación...
    </p>
  );
}
