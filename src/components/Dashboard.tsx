import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import {
  Users, FileSpreadsheet, Folder, Settings,
  GraduationCap, ChevronRight
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
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    const checkSession = async () => {
      try {
        const userRes = await fetch("https://outlook-b.onrender.com/me", {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
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
      } else {
        console.error("Error cargando categorías");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setActiveView("category");
  };

  const handleLogout = async () => {
    try {
      await fetch("https://outlook-b.onrender.com/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      if (onLogout) onLogout();
      else window.location.href = "/";
    }
  };

  const renderContent = () => {
    if (activeView === "category" && selectedCategory) {
      const category = outlookCategories.find(c => c.id === selectedCategory);
      return <CategoryView category={category!} onBack={() => setActiveView("home")} />;
    }

    if (activeView === "courses") {
      return <CourseManagement onBack={() => setActiveView("home")} />;
    }

    // Vista "home" (cuerpo del dashboard)
    return (
      <div className="space-y-6">
        {/* Tarjeta bienvenida con botón verde para gestión de cursos */}
        <Card className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl mb-1">Bienvenido, {userName}</h2>
                <p className="text-blue-100">
                  Selecciona una categoría o gestiona tus cursos.
                </p>
              </div>
            </div>
            {/* Botón verde para ir a Gestión de Cursos (visible también en móvil/tablet) */}
            <Button
              onClick={() => setActiveView("courses")}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" /> Ir a Gestión de Cursos
            </Button>
          </div>
        </Card>

        {/* Lista de categorías */}
        <Card className="p-6">
          <h3 className="text-slate-800 mb-4">Categorías de Contactos</h3>
          {outlookCategories.length === 0 ? (
            <p className="text-slate-500">No hay categorías disponibles.</p>
          ) : (
            <div className="space-y-3">
              {outlookCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer"
                  onClick={() => handleCategorySelect(category.id)}
                >
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
          )}
        </Card>
      </div>
    );
  };

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
        {/* Sidebar SOLO en desktop */}
        <div className="hidden lg:block w-64 bg-white shadow-sm border-r border-slate-200 min-h-screen relative">
          <div className="p-6 border-b border-slate-200">
            <h1 className="text-xl text-slate-800">Sistema de Gestión</h1>
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
                <Button
                  key={category.id}
                  variant="ghost"
                  className="w-full justify-start text-sm"
                  onClick={() => handleCategorySelect(category.id)}
                >
                  <Folder className="w-4 h-4 mr-2" /> {category.name}
                </Button>
              ))}
            </div>

            <div className="pt-4">
              <p className="text-xs text-slate-500 mb-2 px-3">HERRAMIENTAS</p>
              {/* Botón verde en el sidebar para Gestión de Cursos */}
              <Button
                className="w-full justify-start bg-green-600 hover:bg-green-700 text-white"
                onClick={() => setActiveView("courses")}
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" /> Gestión de Cursos
              </Button>
            </div>
          </nav>

          <div className="absolute bottom-4 left-4 right-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-600"
              onClick={handleLogout}
            >
              <Settings className="w-4 h-4 mr-2" /> Cerrar Sesión
            </Button>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 p-4 md:p-6">{renderContent()}</div>
      </div>
    </div>
  );
}
