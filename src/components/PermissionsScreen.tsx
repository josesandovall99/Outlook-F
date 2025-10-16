import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { CheckCircle, Mail, Users, Shield } from "lucide-react";

type PermissionsScreenProps = {
  onAccept: () => void;
};

export function PermissionsScreen({ onAccept }: PermissionsScreenProps) {
  const permissions = [
    {
      icon: Mail,
      title: "Acceder a categorías del correo",
      description: "Leer y organizar las categorías configuradas en tu Outlook",
    },
    {
      icon: Users,
      title: "Acceder a contactos por categoría",
      description: "Visualizar y gestionar contactos organizados por categorías",
    },
    {
      icon: Shield,
      title: "Integración segura",
      description: "Conexión protegida con protocolos de seguridad Microsoft",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="p-8 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl text-slate-800 mb-2">
              Permisos de Acceso
            </h1>
            <p className="text-slate-600">
              Esta aplicación necesita los siguientes permisos para funcionar correctamente.
            </p>
          </div>

          <div className="space-y-4 mb-8">
            {permissions.map((p, i) => (
              <div key={i} className="flex items-start space-x-4 p-4 bg-slate-50 rounded-lg">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <p.icon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-slate-800 mb-1">{p.title}</h3>
                  <p className="text-slate-600 text-sm">{p.description}</p>
                </div>
                <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
              </div>
            ))}
          </div>

          <Button
            onClick={onAccept}
            className="w-full bg-[#0078d4] hover:bg-[#106ebe] text-white py-3"
          >
            Aceptar y continuar
          </Button>
        </Card>
      </div>
    </div>
  );
}

