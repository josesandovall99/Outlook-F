import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Progress } from "./ui/progress";
import {
  ArrowLeft,
  Upload,
  FileSpreadsheet,
  CheckCircle,
  Merge,
  Loader2,
  Download,
  AlertCircle,
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
  const [currentStep, setCurrentStep] = useState<
    "setup" | "upload" | "merge" | "result"
  >("setup");
  const token = localStorage.getItem("accessToken");

  // 📂 Subida de archivos
  const handleFileUpload = (
    fileNumber: 1 | 2,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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

  // 🔁 Unificar archivos
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

  // 📥 Descargar CSV
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

  // 🔄 Reiniciar
  const handleStartOver = () => {
    setCategoryName("");
    setFile1(null);
    setFile2(null);
    setCsvPath(null);
    setTotalRegistros(null);
    setMessage(null);
    setCurrentStep("setup");
  };

  const getStepProgress = () => {
    switch (currentStep) {
      case "setup":
        return 25;
      case "upload":
        return 50;
      case "merge":
        return 75;
      case "result":
        return 100;
      default:
        return 0;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-slate-600">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-slate-800 text-lg md:text-xl">
              Crear Nueva Categoría
            </h1>
            <p className="text-slate-600 text-sm">
              Unifica estudiantes de dos plataformas universitarias
            </p>
          </div>
        </div>
        {currentStep !== "setup" && (
          <Button
            variant="outline"
            onClick={handleStartOver}
            disabled={isProcessing}
            className="w-full sm:w-auto"
          >
            Comenzar de nuevo
          </Button>
        )}
      </div>

      {/* Progreso */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-600">Progreso</span>
          <span className="text-sm text-slate-600">{getStepProgress()}%</span>
        </div>
        <Progress value={getStepProgress()} className="h-2" />
      </Card>

      {/* Paso 1 */}
      {currentStep === "setup" && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg text-slate-800">Nueva Categoría</h2>
              <p className="text-slate-600 text-sm">
                Define el nombre de la categoría que se creará
              </p>
            </div>
          </div>

          <div>
            <Label>Nombre de la categoría</Label>
            <Input
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Ej: INTEGRA2025-II"
            />
          </div>

          <Button
            onClick={() => setCurrentStep("upload")}
            disabled={!categoryName.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Continuar con la carga de archivos
          </Button>
        </Card>
      )}

      {/* Paso 2 */}
      {currentStep === "upload" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[file1, file2].map((fileData, i) => (
            <Card key={i} className="p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    i === 0 ? "bg-blue-100" : "bg-purple-100"
                  }`}
                >
                  <FileSpreadsheet
                    className={`w-5 h-5 ${
                      i === 0 ? "text-blue-600" : "text-purple-600"
                    }`}
                  />
                </div>
                <div>
                  <h2 className="text-lg text-slate-800">
                    Plataforma {i === 0 ? "A" : "B"}
                  </h2>
                  <p className="text-slate-600 text-sm">
                    {i === 0 ? "Sistema académico" : "Sistema de seguimiento"}
                  </p>
                </div>
              </div>

              {!fileData ? (
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                  {isProcessing ? (
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                      <p className="text-slate-700 mb-2">Sube un archivo Excel (.xlsx)</p>
                      <input
                        type="file"
                        accept=".xlsx"
                        id={`file-${i}`}
                        className="hidden"
                        onChange={(e) => handleFileUpload(i === 0 ? 1 : 2, e)}
                      />
                      <label htmlFor={`file-${i}`}>
                        <Button variant="outline" className="cursor-pointer">
                          Seleccionar archivo
                        </Button>
                      </label>
                    </>
                  )}
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => (i === 0 ? setFile1(null) : setFile2(null))}
                    >
                      Cambiar
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Unificar */}
      {currentStep === "upload" && file1 && file2 && (
        <Card className="p-6 text-center">
          <Button
            onClick={handleMergeFiles}
            disabled={isProcessing}
            className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Merge className="w-4 h-4 mr-2" />
            )}
            {isProcessing ? "Procesando..." : "Unificar archivos"}
          </Button>
        </Card>
      )}

      {/* Resultado */}
      {currentStep === "result" && (
        <Card className="p-6 text-center space-y-4">
          <CheckCircle className="w-10 h-10 text-green-600 mx-auto" />
          <h2 className="text-xl text-slate-800 font-medium">
            CSV generado para "{categoryName}"
          </h2>
          {totalRegistros && (
            <p className="text-slate-600">Total de registros: {totalRegistros}</p>
          )}
          {message && <p className="text-green-700">{message}</p>}

          <div className="flex flex-col sm:flex-row justify-center gap-3 mt-4">
            <Button
              onClick={handleDownloadCSV}
              className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
            >
              <Download className="w-4 h-4 mr-2" />
              Descargar CSV
            </Button>
            <Button
              onClick={handleStartOver}
              variant="outline"
              className="w-full sm:w-auto"
            >
              Crear nueva categoría
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
