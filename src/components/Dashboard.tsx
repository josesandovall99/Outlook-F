import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "../components/ui/sheet"; // <-- usa ruta relativa
import { Menu } from "lucide-react";
import { CategoryView } from "./CategoryView";
import { CourseManagement } from "./CourseManagement";

type DashboardProps = {
  onLogout: () => void;
};

export function Dashboard({ onLogout }: DashboardProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState<"category" | "courses">("category");
  const [user, setUser] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // detectar cambio de tamaño
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // cargar usuario
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("⚠️ No se encontró token. Redirigiendo a login...");
      onLogout();
      return;
    }

    fetch("https://outlook-b.onrender.com/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          console.error("❌ Token inválido. Cerrando sesión...");
          onLogout();
        }
      })
      .catch((err) => {
        console.error("Error verificando sesión:", err);
        onLogout();
      });
  }, [onLogout]);

  const NavigationContent = () => (
    <div className="flex flex-col space-y-2 p-4 text-sm">
      <button
        onClick={() => {
          setActiveView("category");
          setMobileMenuOpen(false);
        }}
        className={`rounded-md px-3 py-2 text-left font-medium transition-colors ${
          activeView === "category"
            ? "bg-blue-100 text-blue-700"
            : "hover:bg-gray-100 text-gray-800"
        }`}
      >
        Categorías
      </button>
      <button
        onClick={() => {
          setActiveView("courses");
          setMobileMenuOpen(false);
        }}
        className={`rounded-md px-3 py-2 text-left font-medium transition-colors ${
          activeView === "courses"
            ? "bg-blue-100 text-blue-700"
            : "hover:bg-gray-100 text-gray-800"
        }`}
      >
        Cursos
      </button>
      <button
        onClick={onLogout}
        className="mt-4 rounded-md bg-red-500 px-3 py-2 text-white hover:bg-red-600 transition-colors"
      >
        Cerrar sesión
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar fija en escritorio */}
      <aside className="hidden lg:block w-64 bg-white shadow-md border-r">
        <div className="p-4 border-b">
          <h1 className="text-lg font-semibold text-blue-700">Panel UDES</h1>
          {user && (
            <p className="text-sm text-gray-500 mt-1 truncate">
              {user.displayName || user.mail}
            </p>
          )}
        </div>
        <NavigationContent />
      </aside>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col">
        {/* Header móvil */}
        {isMobile && (
          <header className="sticky top-0 z-40 flex items-center justify-between bg-white border-b p-4 shadow-sm">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <button className="rounded-md p-2 text-gray-700 hover:bg-gray-100">
                  <Menu className="h-6 w-6" />
                </button>
              </SheetTrigger>

              <SheetContent side="left" className="p-0 w-64">
                {/* Accesibilidad */}
                <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
                <SheetDescription className="sr-only">
                  Opciones principales del sistema
                </SheetDescription>

                <div className="border-b p-4">
                  <h1 className="text-lg font-semibold text-blue-700">
                    Panel UDES
                  </h1>
                  {user && (
                    <p className="text-sm text-gray-500 mt-1 truncate">
                      {user.displayName || user.mail}
                    </p>
                  )}
                </div>
                <NavigationContent />
              </SheetContent>
            </Sheet>
            <h2 className="text-base font-semibold text-gray-800">Panel</h2>
          </header>
        )}

        {/* Contenido dinámico */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {activeView === "category" && (
            <CategoryView category={null} onBack={() => {}} />
          )}
          {activeView === "courses" && <CourseManagement onBack={() => {}} />}
        </main>
      </div>
    </div>
  );
}
