import { useState } from "react";
import {
  ArrowLeft,
  Upload,
  FileSpreadsheet,
  CheckCircle,
  Merge,
  Loader2,
  Download
} from "lucide-react";

interface CourseManagementProps {
  onBack: () => void;
}

interface FileUpload {
  name: string;
  size: string;
  uploaded: boolean;
  records: number;
  file?: File;
}

export function CourseManagement({ onBack }: CourseManagementProps) {
  const [categoryName, setCategoryName] = useState("");
  const [file1, setFile1] = useState<FileUpload | null>(null);
  const [file2, setFile2] = useState<FileUpload | null>(null);
  const [csvPath, setCsvPath] = useState<string | null>(null);
  const [totalRegistros, setTotalRegistros] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<"setup" | "upload" | "merge" | "result">("setup");
  const token = localStorage.getItem("accessToken");

  const handleFileUpload = (fileNumber: 1 | 2, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileData: FileUpload = {
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      uploaded: true,
      records: Math.floor(Math.random() * 200) + 50,
      file,
    };
    if (fileNumber === 1) setFile1(fileData);
    else setFile2(fileData);
  };

  const handleMergeFiles = async () => {
    if (!file1 || !file2 || !categoryName.trim()) {
      setMessage("⚠️ Debes ingresar la categoría y subir ambos archivos.");
      return;
    }
    setIsProcessing(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append("categoryName", categoryName);
      formData.append("files", file1.file!);
      formData.append("files", file2.file!);

      const response = await fetch("https://outlook-b.onrender.com/merge-files", {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Error al unificar archivos");

      setCsvPath(data.csvPath);
      setTotalRegistros(data.totalRegistros);
      setMessage("✅ Archivos unificados correctamente");
      setCurrentStep("result");
    } catch (error: any) {
      console.error("❌ Error al unificar archivos:", error);
      setMessage("❌ Error al unificar archivos. Verifica los formatos o el servidor.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!csvPath) return;
    const cleanPath = csvPath.startsWith("/") ? csvPath.slice(1) : csvPath;
    const fileName = cleanPath.split("/").pop() || "categoria.csv";
    const link = document.createElement("a");
    link.href = `https://outlook-b.onrender.com/${cleanPath}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Botón volver */}
      <button
        onClick={onBack}
        className="flex items-center text-slate-600 hover:text-slate-800"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Volver
      </button>

      {/* Paso 1 */}
      {currentStep === "setup" && (
        <div className="p-6 bg-white rounded-lg shadow space-y-4">
          <label className="block text-slate-700">Nombre de la categoría</label>
          <input
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Ej: INTEGRA2025-II"
            className="w-full border rounded px-3 py-2"
          />
          <button
            onClick={() => setCurrentStep("upload")}
            disabled={!categoryName.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
          >
            Continuar
          </button>
        </div>
      )}

      {/* Paso 2 */}
      {currentStep === "upload" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[file1, file2].map((fileData, i) => (
            <div key={i} className="p-6 bg-white rounded-lg shadow">
              <div className="flex items-center space-x-3 mb-4">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg text-slate-800 font-medium">
                  Plataforma {i === 0 ? "A (Moodle)" : "B (Galileo)"}
                </h2>
              </div>
              {!fileData ? (
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600 mb-4">Sube un archivo Excel</p>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    id={`file-${i}`}
                    className="hidden"
                    onChange={(e) => handleFileUpload(i === 0 ? 1 : 2, e)}
                  />
                  <label htmlFor={`file-${i}`} className="cursor-pointer">
                    <span className="px-4 py-2 border rounded bg-slate-50 hover:bg-slate-100">
                      Seleccionar archivo
                    </span>
                  </label>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div>
                        <h3 className="text-green-800">{fileData.name}</h3>
                        <p className="text-green-600 text-sm">{fileData.size}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => (i === 0 ? setFile1(null) : setFile2(null))}
                      className="text-slate-600 hover:text-slate-800 text-sm"
                    >
                      Cambiar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Paso 3 */}
      {currentStep === "upload" && file1 && file2 && (
        <div className="p-6 bg-white rounded-lg shadow text-center">
          <button
            onClick={handleMergeFiles}
            disabled={isProcessing}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded w-full sm:w-auto"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Procesando...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <Merge className="w-4 h-4 mr-2" /> Unificar archivos
              </span>
            )}
          </button>
        </div>
      )}

              {/* Paso 4 */}
        {currentStep === "result" && (
          <div className="p-6 bg-white rounded-lg shadow text-center space-y-4">
            <CheckCircle className="w-10 h-10 text-green-600 mx-auto" />
            <h2 className="text-xl text-slate-800 font-medium">
              CSV generado para la categoría "{categoryName}"
            </h2>
            {totalRegistros && (
              <p className="text-slate-600">Total de registros: {totalRegistros}</p>
            )}
            {message && <p className="text-green-700">{message}</p>}

            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <button
                onClick={handleDownloadCSV}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full sm:w-auto"
              >
                <Download className="w-4 h-4 mr-2 inline" /> Descargar CSV
              </button>
              <button
                onClick={() => {
                  setCategoryName("");
                  setFile1(null);
                  setFile2(null);
                  setCsvPath(null);
                  setTotalRegistros(null);
                  setCurrentStep("setup");
                }}
                className="border px-4 py-2 rounded w-full sm:w-auto hover:bg-slate-100"
              >
                Reiniciar
              </button>
            </div>
          </div>
        )}
      </div>
    
  );
}
