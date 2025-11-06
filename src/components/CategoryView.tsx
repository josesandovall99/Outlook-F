import { useState, useEffect } from "react";
import { Download, Filter } from "lucide-react";

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface CategoryViewProps {
  category: Category | null;
  onBack: () => void;
}

export function CategoryView({ category, onBack }: CategoryViewProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filtered, setFiltered] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Cargar categorías desde backend
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    fetch("https://outlook-b.onrender.com/api/categories", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
          setFiltered(data);
        } else {
          console.error("Error cargando categorías");
        }
      })
      .catch((err) => console.error("Error:", err));
  }, []);

  // Filtrar categorías
  useEffect(() => {
    if (!searchTerm) {
      setFiltered(categories);
    } else {
      const filteredList = categories.filter((cat) =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFiltered(filteredList);
    }
  }, [searchTerm, categories]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-800">
          Categorías disponibles
        </h1>

        {/* Controles (filtros / exportar) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1 sm:flex-none">
            <input
              type="text"
              placeholder="Buscar categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Filter className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
          <button className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </button>
        </div>
      </div>

      {/* Grid responsive de categorías */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((cat) => (
          <div
            key={cat.id}
            className="flex flex-col justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-gray-900">
                {cat.name}
              </h2>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {cat.description || "Sin descripción"}
              </p>
            </div>
            <button
              onClick={() => console.log("Seleccionar categoría:", cat.id)}
              className="mt-4 rounded-md bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-600 transition-colors"
            >
              Ver más
            </button>
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="text-gray-500 text-sm sm:col-span-2 lg:col-span-3">
            No se encontraron categorías.
          </p>
        )}
      </div>

      {/* Botón de regreso (si aplica) */}
      {category && (
        <button
          onClick={onBack}
          className="self-start rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100 transition-colors"
        >
          ← Volver
        </button>
      )}
    </div>
  );
}
