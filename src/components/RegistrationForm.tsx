import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SignatureCanvas from "react-signature-canvas";
import { useToast } from "@/hooks/use-toast";
import { PenTool, RotateCcw } from "lucide-react";

export interface FormData {
  name: string;
  lastname: string;
  phone: string;
  email: string;
  tipo: "fundador" | "comprador" | "heredero";
  signature: string;
  bought_from_name?: string;
  bought_from_lastname?: string;
  inherited_from_name?: string;
  inherited_from_lastname?: string;
  inherited_from_signature?: string;
}

interface RegistrationFormProps {
  onSubmit: (data: FormData) => void;
}

export const RegistrationForm = ({ onSubmit }: RegistrationFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    lastname: "",
    phone: "",
    email: "",
    tipo: "" as "fundador" | "comprador" | "heredero" | "",
    bought_from_name: "",
    bought_from_lastname: "",
    inherited_from_name: "",
    inherited_from_lastname: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const signatureRef = useRef<SignatureCanvas>(null);
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
    }
    if (!formData.lastname.trim()) {
      newErrors.lastname = "El apellido es requerido";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "El teléfono es requerido";
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = "Formato de teléfono inválido";
    }
    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Formato de email inválido";
    }
    if (!formData.tipo) {
      newErrors.tipo = "El tipo es requerido";
    }
    if (signatureRef.current?.isEmpty()) {
      newErrors.signature = "La firma es requerida";
    }

    // Conditional validations
    if (formData.tipo === "comprador") {
      if (!formData.bought_from_name.trim()) {
        newErrors.bought_from_name = "El nombre del vendedor es requerido";
      }
      if (!formData.bought_from_lastname.trim()) {
        newErrors.bought_from_lastname = "El apellido del vendedor es requerido";
      }
    }

    if (formData.tipo === "heredero") {
      if (!formData.inherited_from_name.trim()) {
        newErrors.inherited_from_name = "El nombre de quien heredó es requerido";
      }
      if (!formData.inherited_from_lastname.trim()) {
        newErrors.inherited_from_lastname = "El apellido de quien heredó es requerido";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Error de validación",
        description: "Por favor complete todos los campos requeridos correctamente",
      });
      return;
    }

    const signature = signatureRef.current?.toDataURL() || "";

    const submitData: FormData = {
      name: formData.name,
      lastname: formData.lastname,
      phone: formData.phone,
      email: formData.email,
      tipo: formData.tipo as "fundador" | "comprador" | "heredero",
      signature,
      ...(formData.tipo === "comprador" && {
        bought_from_name: formData.bought_from_name,
        bought_from_lastname: formData.bought_from_lastname,
      }),
      ...(formData.tipo === "heredero" && {
        inherited_from_name: formData.inherited_from_name,
        inherited_from_lastname: formData.inherited_from_lastname,
      }),
    };

    onSubmit(submitData);

    // Reset form
    setFormData({ 
      name: "", 
      lastname: "", 
      phone: "", 
      email: "", 
      tipo: "" as "",
      bought_from_name: "",
      bought_from_lastname: "",
      inherited_from_name: "",
      inherited_from_lastname: "",
    });
    signatureRef.current?.clear();
    setErrors({});

    toast({
      title: "¡Éxito!",
      description: "Registro guardado correctamente",
    });
  };

  const clearSignature = () => {
    signatureRef.current?.clear();
    setErrors((prev) => ({ ...prev, signature: "" }));
  };


  return (
    <Card className="w-full shadow-lg border-border/50">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-foreground">Formulario de Registro</CardTitle>
        <CardDescription>Complete su información y firme abajo</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={errors.name ? "border-destructive" : ""}
                placeholder="Ingrese su nombre"
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastname">Apellido *</Label>
              <Input
                id="lastname"
                value={formData.lastname}
                onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                className={errors.lastname ? "border-destructive" : ""}
                placeholder="Ingrese su apellido"
              />
              {errors.lastname && <p className="text-sm text-destructive">{errors.lastname}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={errors.phone ? "border-destructive" : ""}
                placeholder="+1 234 567 8900"
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={errors.email ? "border-destructive" : ""}
                placeholder="su.email@ejemplo.com"
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value: "fundador" | "comprador" | "heredero") =>
                  setFormData({ ...formData, tipo: value })
                }
              >
                <SelectTrigger
                  id="tipo"
                  className={errors.tipo ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Seleccione tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fundador">Fundador</SelectItem>
                  <SelectItem value="comprador">Comprador</SelectItem>
                  <SelectItem value="heredero">Heredero</SelectItem>
                </SelectContent>
              </Select>
              {errors.tipo && <p className="text-sm text-destructive">{errors.tipo}</p>}
            </div>
          </div>

          {/* Conditional fields for Comprador */}
          {formData.tipo === "comprador" && (
            <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
              <h3 className="font-semibold text-foreground">¿A quién le compró?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bought_from_name">Nombre del vendedor *</Label>
                  <Input
                    id="bought_from_name"
                    value={formData.bought_from_name}
                    onChange={(e) => setFormData({ ...formData, bought_from_name: e.target.value })}
                    className={errors.bought_from_name ? "border-destructive" : ""}
                    placeholder="Nombre del vendedor"
                  />
                  {errors.bought_from_name && <p className="text-sm text-destructive">{errors.bought_from_name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bought_from_lastname">Apellido del vendedor *</Label>
                  <Input
                    id="bought_from_lastname"
                    value={formData.bought_from_lastname}
                    onChange={(e) => setFormData({ ...formData, bought_from_lastname: e.target.value })}
                    className={errors.bought_from_lastname ? "border-destructive" : ""}
                    placeholder="Apellido del vendedor"
                  />
                  {errors.bought_from_lastname && <p className="text-sm text-destructive">{errors.bought_from_lastname}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Conditional fields for Heredero */}
          {formData.tipo === "heredero" && (
            <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
              <h3 className="font-semibold text-foreground">¿De quién heredó?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="inherited_from_name">Nombre de quien heredó *</Label>
                  <Input
                    id="inherited_from_name"
                    value={formData.inherited_from_name}
                    onChange={(e) => setFormData({ ...formData, inherited_from_name: e.target.value })}
                    className={errors.inherited_from_name ? "border-destructive" : ""}
                    placeholder="Nombre de quien heredó"
                  />
                  {errors.inherited_from_name && <p className="text-sm text-destructive">{errors.inherited_from_name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inherited_from_lastname">Apellido de quien heredó *</Label>
                  <Input
                    id="inherited_from_lastname"
                    value={formData.inherited_from_lastname}
                    onChange={(e) => setFormData({ ...formData, inherited_from_lastname: e.target.value })}
                    className={errors.inherited_from_lastname ? "border-destructive" : ""}
                    placeholder="Apellido de quien heredó"
                  />
                  {errors.inherited_from_lastname && <p className="text-sm text-destructive">{errors.inherited_from_lastname}</p>}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <PenTool className="h-4 w-4" />
                Firma *
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearSignature}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Limpiar
              </Button>
            </div>
            <div
              className={`border-2 rounded-lg overflow-hidden ${
                errors.signature ? "border-destructive" : "border-border"
              }`}
            >
            <SignatureCanvas
              ref={signatureRef}
              penColor="#000000"
              canvasProps={{
                className: "w-full h-40 bg-white dark:bg-gray-900",
              }}
            />
            </div>
            {errors.signature && <p className="text-sm text-destructive">{errors.signature}</p>}
          </div>

          <Button type="submit" className="w-full" size="lg">
            Enviar Registro
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};