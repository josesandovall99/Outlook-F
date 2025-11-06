import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import {
  Users, FileSpreadsheet, Folder, Settings,
  Mail, GraduationCap, ChevronRight
} from "lucide-react";
import { CategoryView } from "./CategoryView";
import { CourseManagement } from "./CourseManagement";

// Importa tu slide bar
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
} from "./ui/sidebar";

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
    <SidebarProvider>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <Sidebar>
          <SidebarHeader>
            <h1 className="text-xl text-slate-800">Sistema de Gestión</h1>
            <p className="text-slate-600 text-sm">Contactos y Estudiantes</p>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menú</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={activeView === "home"} onClick={() => setActiveView("home")}>
                    <Users className="w-4 h-4" /> Dashboard
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarGroupLabel>Categorías Outlook</SidebarGroupLabel>
                {outlookCategories.map((category) => (
                  <SidebarMenuItem key={category.id}>
                    <SidebarMenuButton onClick={() => handleCategorySelect(category.id)}>
                      <Folder className="w-4 h-4" /> {category.name}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                <SidebarGroupLabel>Herramientas</SidebarGroupLabel>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={activeView === "courses"} onClick={() => setActiveView("courses")}>
                    <FileSpreadsheet className="w-4 h-4" /> Gestión de Cursos
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <Button variant="ghost" className="w-full justify-start text-slate-600" onClick={handleLogout}>
              <Settings className="w-4 h-4 mr-2" /> Cerrar Sesión
            </Button>
          </SidebarFooter>
        </Sidebar>

        {/* Contenido principal */}
        <SidebarInset>
          {/* Header móvil con trigger */}
          <div className="lg:hidden bg-white border-b border-slate-200 p-4 sticky top-0 z-10 flex justify-between items-center">
            <div>
              <h1 className="text-slate-800">Sistema de Gestión</h1>
              <p className="text-slate-600 text-xs">Contactos y Estudiantes</p>
            </div>
            <SidebarTrigger />
          </div>

          {/* Contenido dinámico */}
          <div className="flex-1 p-4 md:p-6">
            {renderContent()}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
