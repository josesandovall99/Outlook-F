import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import {
  Users,
  FileSpreadsheet,
  Folder,
  Settings,
  Menu,
  GraduationCap,
  ChevronRight,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { CategoryView } from "./CategoryView";
import { CourseManagement } from "./CourseManagement";

interface DashboardProps {
  onLogout?: () => void;
}

interface Category {
  id: string;
  name: string;
  count: number;
  color: string;
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [activeView, setActiveView] = useState<"home" | "category" | "courses">("home");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [outlookCategories, setOutlookCategories] = useState<Category[]>([]);
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const token = localStorage.getItem("accessToken");

  // Detectar si estamos en móvil o desktop
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Cerrar menú al pasar a desktop
  useEffect(() => {
    if (!isMobile) setMobileMenuOpen(false);
  }, [isMobile]);

  // Verificar sesión y cargar categorías
  useEffect(() => {
    const checkSession = async () => {
      try {
        const userRes = await fetch("https://outlook-b.onrender.com/me", {
          credentials: "include",
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
        const userData = await userRes.json();
        setUserName(userData.displayName || userData.mail || "Usuario");
        await fetchCategories();
      } catch (err) {
        console.error("Error verificando sesión:", err);
        window.location.href = "/";
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("https://outlook-b.onrender.com/contacts-by-category", {
        method: "GET",
        credentials: "include",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        const categoriesArray: Category[] = Object.keys(data).map((key, idx) => ({
          id: key,
          name: key,
          count: data[key].length,
          color: ["bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-red-500"][idx % 4],
        }));
        setOutlookCategories(categoriesArray);
      } else console.error("Error cargando categorías");
    } catch (err) {
      console.error(err);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setActiveView("category");
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await fetch("https://outlook-b.onrender.com/logout", {
        method: "POST",
        credentials: "include",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      onLogout ? onLogout() : (window.location.href = "/");
    }
  };

  const renderContent = () => {
    if (activeView === "category" && selectedCategory) {
      const category = outlookCategories.find((c) => c.id === selectedCategory);
      return <CategoryView category={category!} onBack={() => setActiveView("home")} />;
    }
    if (activeView === "courses") {
      return <CourseManagement onBack={() => setActiveView("home")} />;
    }
    return (
      <div className="space-y-6">
        <Card className="p-4 md:p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="mb-1 text-lg md:text-xl">Bienvenido, {userName}</h2>
              <p className="text-blue-100 text-sm">
                Selecciona una categoría o gestiona tus cursos.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-slate-800 mb-4">Categorías de Contactos</h3>
          {outlookCategories.length === 0 ? (
            <p className="text-slate-500">No hay categorías disponibles.</p>
          ) : (
            <div className="space-y-3">
              {outlookCategories.map((category) => (
                <div
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                    <div>
                      <h4 className="text-slate-800">{category.name}</h4>
                      <p className="text-slate-600 text-sm">
                        {category.count} contactos
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    );
  };

  const NavigationContent = () => (
    <>
      <div className="p-6 border-b border-slate-200">
        <h1 className="text-slate-800 text-lg">Sistema de Gestión</h1>
        <p className="text-slate-600 text-sm">Contactos y Estudiantes</p>
      </div>

      <nav className="p-4 space-y-2">
        <Button
          variant={activeView === "home" ? "default" : "ghost"}
          className="w-full justify-start"
          onClick={() => {
            setActiveView("home");
            setMobileMenuOpen(false);
          }}
        >
          <Users className="w-4 h-4 mr-2" />
          Dashboard
        </Button>

        <div className="pt-4">
          <p className="text-xs text-slate-500 mb-2 px-3">CATEGORÍAS OUTLOOK</p>
          {outlookCategories.map((category) => (
            <Button
              key={category.id}
              variant="ghost"
              className="w-full justify-start text-sm"
              onClick={() => handleCategorySelect(category.id)}
            >
              <Folder className="w-4 h-4 mr-2" />
              <span className="truncate">{category.name}</span>
            </Button>
          ))}
        </div>

        <div className="pt-4">
          <p className="text-xs text-slate-500 mb-2 px-3">HERRAMIENTAS</p>
          <Button
            variant={activeView === "courses" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => {
              setActiveView("courses");
              setMobileMenuOpen(false);
            }}
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Gestión de Cursos
          </Button>
        </div>
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <Button variant="ghost" className="w-full justify-start text-slate-600" onClick={handleLogout}>
          <Settings className="w-4 h-4 mr-2" />
          Cerrar Sesión
        </Button>
      </div>
    </>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-600 bg-slate-100">
        <p className="animate-pulse text-lg">Cargando tu información...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar visible siempre en desktop */}
      <div className="hidden lg:block w-64 bg-white shadow-sm border-r border-slate-200 min-h-screen">
        <NavigationContent />
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col">
        {/* Header móvil */}
        <div className="lg:hidden bg-white border-b border-slate-200 p-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-slate-800 text-base font-medium">Sistema de Gestión</h1>
              <p className="text-slate-600 text-xs">Contactos y Estudiantes</p>
            </div>

            {/* Menú solo en móvil */}
            {isMobile && (
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" aria-label="Abrir menú">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  <div>
                    <h2 className="sr-only">Menú de navegación</h2>
                    <p className="sr-only">Opciones del sistema</p>
                    <NavigationContent />
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>

        {/* Contenido dinámico */}
        <div className="flex-1 p-4 md:p-6">{renderContent()}</div>
      </div>
    </div>
  );
}
