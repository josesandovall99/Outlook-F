import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import {
  ArrowLeft,
  RefreshCcw,
  Download,
  Loader2,
  User,
  Mail,
  Phone,
  Building2,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  color: string;
}

interface Contact {
  id: string;
  givenName: string;
  surname: string;
  emailAddresses: { address: string }[];
  businessPhones: string[];
  companyName: string;
}

interface CategoryViewProps {
  category: Category;
  onBack: () => void;
}

export function CategoryView({ category, onBack }: CategoryViewProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    fetchContacts();
  }, [category]);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://outlook-b.onrender.com/contacts-by-category/${category.id}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setContacts(data);
        setFilteredContacts(data);
      }
    } catch (error) {
      console.error("Error cargando contactos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = contacts.filter(
      (contact) =>
        contact.givenName?.toLowerCase().includes(value) ||
        contact.surname?.toLowerCase().includes(value) ||
        contact.emailAddresses?.[0]?.address?.toLowerCase().includes(value)
    );
    setFilteredContacts(filtered);
  };

  const handleDownloadCSV = async () => {
    try {
      const res = await fetch(
        `https://outlook-b.onrender.com/export-category/${category.id}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!res.ok) throw new Error("Error al exportar CSV");

      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `${category.name}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error al descargar CSV:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-slate-600">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-slate-800 text-lg md:text-xl">
              Categoría: {category.name}
            </h1>
            <p className="text-slate-600 text-sm">Lista de contactos</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={fetchContacts}
            disabled={loading}
            className="flex items-center"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCcw className="w-4 h-4 mr-2" />
            )}
            Actualizar
          </Button>

          <Button
            onClick={handleDownloadCSV}
            variant="default"
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <Card className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <Input
            placeholder="Buscar por nombre o correo..."
            value={searchTerm}
            onChange={handleSearch}
            className="flex-1"
          />
          <span className="text-slate-600 text-sm">
            {filteredContacts.length} contacto(s)
          </span>
        </div>
      </Card>

      {/* Listado de contactos */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-10 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Cargando contactos...
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="col-span-full text-center text-slate-500 py-10">
            No se encontraron contactos.
          </div>
        ) : (
          filteredContacts.map((contact) => (
            <Card
              key={contact.id}
              className="p-4 flex flex-col justify-between hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${category.color}`}
                >
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-slate-800 font-medium">
                    {contact.givenName} {contact.surname}
                  </h3>
                  <p className="text-slate-600 text-sm">
                    {contact.companyName || "Sin empresa"}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm text-slate-700">
                {contact.emailAddresses?.[0]?.address && (
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-slate-500" />
                    <span className="truncate">{contact.emailAddresses[0].address}</span>
                  </div>
                )}
                {contact.businessPhones?.[0] && (
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-slate-500" />
                    <span>{contact.businessPhones[0]}</span>
                  </div>
                )}
                {contact.companyName && (
                  <div className="flex items-center">
                    <Building2 className="w-4 h-4 mr-2 text-slate-500" />
                    <span>{contact.companyName}</span>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
