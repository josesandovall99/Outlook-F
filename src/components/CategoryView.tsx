import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import {
  ArrowLeft,
  Search,
  Filter,
  Download,
  Mail,
  Phone,
  User,
  Users,
  FileSpreadsheet,
  Folder,
  Settings,
  Menu
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department?: string;
}

interface Category {
  id: string;
  name: string;
  count: number;
  color: string;
}

interface CategoryViewProps {
  category: Category;
  onBack: () => void;
}

export function CategoryView({ category, onBack }: CategoryViewProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await fetch("https://outlook-b.onrender.com/contacts-by-category", {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        if (res.ok) {
          const data = await res.json();
          const contactsFromCategory = data[category.name] || [];
          const mappedContacts = contactsFromCategory.map((c: any, idx: number) => ({
            id: c.id || idx.toString(),
            name: c.nombre || "Sin nombre",
            email: c.correo || "Sin email",
            phone: "",
            department: "",
          }));
          setContacts(mappedContacts);
        }
      } catch (error) {
        console.error("Error cargando contactos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, [category]);

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contact.department && contact.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-600">
        <p className="animate-pulse">Cargando contactos de {category.name}...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar fijo en desktop */}
      <div className="hidden lg:block w-64 bg-white shadow-sm border-r border-slate-200 min-h-screen p-4 space-y-2">
        <Button variant="ghost" className="w-full justify-start" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Volver
        </Button>
        <Button variant="default" className="w-full justify-start">
          <Folder className="w-4 h-4 mr-2" /> {category.name}
        </Button>
        <Button variant="ghost" className="w-full justify-start text-slate-600 mt-4">
          <Settings className="w-4 h-4 mr-2" /> Configuración
        </Button>
      </div>

      {/* Sidebar móvil con trigger */}
      <div className="lg:hidden bg-white border-b border-slate-200 p-4 sticky top-0 z-20 flex justify-between items-center w-full">
        <h1 className="text-slate-800">{category.name}</h1>
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="p-4 border-b">
              <SheetTitle>Menú</SheetTitle>
            </SheetHeader>
            <div className="p-4 space-y-2">
              <Button variant="ghost" className="w-full justify-start" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Volver
              </Button>
              <Button variant="default" className="w-full justify-start">
                <Folder className="w-4 h-4 mr-2" /> {category.name}
              </Button>
              <Button variant="ghost" className="w-full justify-start text-slate-600 mt-4">
                <Settings className="w-4 h-4 mr-2" /> Configuración
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 p-4 md:p-6 space-y-6">
        {/* Barra de búsqueda */}
        <Card className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Buscar contactos por nombre, email o departamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        {/* Lista de contactos */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg text-slate-800">Contactos</h2>
            <p className="text-slate-600 text-sm">
              Mostrando {filteredContacts.length} de {contacts.length}
            </p>
          </div>

          {filteredContacts.length > 0 ? (
            <div className="space-y-3">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors gap-3"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                      <User className="w-5 h-5 text-slate-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-slate-800 truncate">{contact.name}</h3>
                      <p className="text-slate-600 text-sm">{contact.department}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm pl-14 sm:pl-0">
                    <div className="flex items-center space-x-2 text-slate-600">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{contact.email}</span>
                    </div>
                    {contact.phone && (
                      <div className="flex items-center space-x-2 text-slate-600">
                        <Phone className="w-4 h-4 flex-shrink-0" />
                        <span>{contact.phone}</span>
                      </div>
                    )}
                    <Button variant="ghost" size="sm" className="self-start sm:self-auto">
                      Ver detalles
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="text-slate-800 mb-1">No se encontraron contactos</h3>
              <p className="text-slate-600 text-sm">Intenta modificar los términos de búsqueda</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
