import { useEffect } from "react";

type TokenCallbackProps = {
  setAppState: (state: "checking" | "login" | "permissions" | "dashboard") => void;
};

export function TokenCallback({ setAppState }: TokenCallbackProps) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("accessToken", token);
      setAppState("permissions");
    } else {
      console.error("❌ No se recibió token");
      setAppState("login");
    }
  }, []);

  return <p className="text-center mt-10">Procesando autenticación...</p>;
}
