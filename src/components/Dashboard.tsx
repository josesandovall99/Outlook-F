import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "./ui/sheet";
import {
  Users, FileSpreadsheet, Folder, Settings,
  Mail, GraduationCap, ChevronRight, Menu
} from "lucide-react";
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
  const [activeView, setActiveView] = useState<'home' | 'category' | 'courses'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [outlookCategories, setOutlookCategories] = useState<Category[]>([]);
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const token = localStorage.getItem("accessToken");

  // 🔹 Verificar sesión y cargar datos
  useEffect(() => {
    const checkSession = async () => {
      try {
        const userRes = await fetch("https://outlook-b.onrender.com/me", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        if (!userRes.ok) throw new Error("No autenticado");
        const userData = await userRes.json();
        setUserName(userData.graph?.displayName || userData.graph?.mail || "Usuario");

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

  // 🔹 Cargar categorías
  const fetchCategories = async () => {
    try {
      const res = await fetch("https://outlook-b.onrender.com/contacts-by-category", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
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
      }
    } catch (err) {
      console.error("Error cargando categorías:", err);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setActiveView("category");
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    if (onLogout) onLogout();
    else window.location.href = "/";
  };

  // 🔹 Renderiza contenido según vista activa
  const renderContent = () => {
    if (activeView === "category" && selectedCategory) {
      const category = outlookCategories.find(c => c.id === selectedCategory);
      return <CategoryView category={category!} onBack={() => setActiveView("home")} />;
    }
    if (activeView === "courses") return <CourseManagement onBack={() => setActiveView("home")} />;

    return (
      <div className="space-y-6">
        {/* Tarjeta bienvenida */}
        <Card className="p-4 md:p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="mb-1">Bienvenido, {userName}</h2>
              <p className="text-blue-100 text-sm">Selecciona una categoría o gestiona tus cursos.</p>
            </div>
          </div>
        </Card>

        {/* Acciones rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-slate-800">Categorías de Outlook</h3>
                  <p className="text-slate-600 text-sm">Gestiona contactos por categoría</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </div>
            <div className="text-2xl text-slate-800 mb-2">{outlookCategories.length}</div>
            <p className="text-slate-600 text-sm">categorías disponibles</p>
          </Card>

          <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setActiveView("courses")}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-slate-800">Gestión de Cursos</h3>
                  <p className="text-slate-600 text-sm">Unificar archivos Excel</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </div>
            <div className="text-2xl text-slate-800 mb-2">0</div>
            <p className="text-slate-600 text-sm">archivos procesados</p>
          </Card>
        </div>

        {/* Lista de categorías */}
        <Card className="p-6">
          <h3 className="text-slate-800 mb-4">Categorías de Contactos</h3>
          <div className="space-y-3">
            {outlookCategories.map((category) => (
              <div key={category.id}
                   className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                   onClick={() => handleCategorySelect(category.id)}>
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                  <div>
                    <h4 className="text-slate-800">{category.name}</h4>
                    <p className="text-slate-600 text-sm">{category.count} contactos</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  };

  const NavigationContent = () => (
    <>
      <div className="p-6 border-b border-slate-200">
        <h1 className="text-slate-800">Sistema de Gestión</h1>
        <p className="text-slate-600 text-sm">Contactos y Estudiantes</p>
      </div>
      <nav className="p-4 space-y-2">
        <Button
          variant={activeView === "home" ? "default" : "ghost"}
          className="w-full justify-start"
          onClick={() => setActiveView("home")}
        >
          <Users className="w-4 h-4 mr-2" /> Dashboard
        </Button>
        <div className="pt-4">
          <p className="text-xs text-slate-500 mb-2 px-3">CATEGORÍAS OUTLOOK</p>
          {outlookCategories.map((category) => (
            <Button key={category.id}
                    variant="ghost"
                    className="w-full justify-start text-sm"
                    onClick={() => handleCategorySelect(category.id)}>
                              <Folder className="w-4 h-4 mr-2" />
              {category.name}
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
        <Button
          variant="ghost"
          className="w-full justify-start text-slate-600"
          onClick={handleLogout}
        >
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
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        {/* Sidebar Desktop */}
        <div className="hidden lg:block w-64 bg-white shadow-sm border-r border-slate-200 min-h-screen">
          <NavigationContent />
        </div>

        {/* Contenido principal */}
        <div className="flex-1 flex flex-col">
          {/* Header móvil */}
          <div className="lg:hidden bg-white border-b border-slate-200 p-4 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-slate-800">Sistema de Gestión</h1>
                <p className="text-slate-600 text-xs">Contactos y Estudiantes</p>
              </div>
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  <SheetHeader>
                    <SheetTitle>Menú de navegación</SheetTitle>
                  </SheetHeader>
                  <NavigationContent />
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Contenido dinámico */}
          <div className="flex-1 p-4 md:p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
