import { useState, useEffect } from "react";
import { Plus, RotateCcw, Trash2 } from "lucide-react";

interface Course {
  id: string;
  name: string;
  category: string;
  credits: number;
  teacher?: string;
}

interface CourseManagementProps {
  onBack: () => void;
}

export function CourseManagement({ onBack }: CourseManagementProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [newCourse, setNewCourse] = useState({
    name: "",
    category: "",
    credits: 0,
    teacher: "",
  });

  // Cargar cursos desde backend
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    setLoading(true);
    fetch("https://outlook-b.onrender.com/api/courses", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setCourses(data);
        } else {
          console.error("Error al obtener cursos");
        }
      })
      .catch((err) => console.error("Error:", err))
      .finally(() => setLoading(false));
  }, []);

  // Crear curso nuevo
  const handleCreateCourse = async () => {
    if (!newCourse.name || !newCourse.category) {
      alert("Por favor completa los campos obligatorios.");
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      const res = await fetch("https://outlook-b.onrender.com/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newCourse),
      });

      if (res.ok) {
        const created = await res.json();
        setCourses((prev) => [...prev, created]);
        setNewCourse({ name: "", category: "", credits: 0, teacher: "" });
      } else {
        console.error("Error al crear curso");
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  // Eliminar curso
  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    if (!confirm("¿Seguro que deseas eliminar este curso?")) return;

    try {
      const res = await fetch(`https://outlook-b.onrender.com/api/courses/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setCourses((prev) => prev.filter((c) => c.id !== id));
      } else {
        console.error("Error al eliminar curso");
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-800">Gestión de Cursos</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => setNewCourse({ name: "", category: "", credits: 0, teacher: "" })}
            className="inline-flex items-center justify-center rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors w-full sm:w-auto"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Comenzar de nuevo
          </button>
          <button
            onClick={handleCreateCourse}
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Crear curso
          </button>
        </div>
      </div>

      {/* Formulario nuevo curso */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 md:p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Nombre del curso</label>
            <input
              type="text"
              value={newCourse.name}
              onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Categoría</label>
            <input
              type="text"
              value={newCourse.category}
              onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Créditos</label>
            <input
              type="number"
              value={newCourse.credits}
              onChange={(e) =>
                setNewCourse({ ...newCourse, credits: parseInt(e.target.value) || 0 })
              }
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Profesor</label>
            <input
              type="text"
              value={newCourse.teacher}
              onChange={(e) => setNewCourse({ ...newCourse, teacher: e.target.value })}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Tabla responsive */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-x-auto -mx-4 md:mx-0">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Nombre</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Categoría</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Créditos</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Profesor</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  Cargando cursos...
                </td>
              </tr>
            ) : courses.length > 0 ? (
              courses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 truncate">{course.name}</td>
                  <td className="px-4 py-3 truncate">{course.category}</td>
                  <td className="px-4 py-3">{course.credits}</td>
                  <td className="px-4 py-3 truncate">
                    {course.teacher || "Sin asignar"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="inline-flex items-center rounded-md bg-red-100 px-2 py-1 text-xs text-red-600 hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  No hay cursos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Botón de regreso (si aplica) */}
      <div className="flex justify-start">
        <button
          onClick={onBack}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100 transition-colors"
        >
          ← Volver
        </button>
      </div>
    </div>
  );
}
