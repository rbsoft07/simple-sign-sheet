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

interface FormData {
  name: string;
  lastname: string;
  phone: string;
  email: string;
  tipo: "fundador" | "comprado" | "herdero";
  signature: string;
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
    tipo: "" as "fundador" | "comprado" | "herdero" | "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const signatureRef = useRef<SignatureCanvas>(null);
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!formData.lastname.trim()) {
      newErrors.lastname = "Last name is required";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone format";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.tipo) {
      newErrors.tipo = "Type is required";
    }
    if (signatureRef.current?.isEmpty()) {
      newErrors.signature = "Signature is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill all required fields correctly",
      });
      return;
    }

    const signature = signatureRef.current?.toDataURL() || "";
    onSubmit({ ...formData, signature } as FormData);

    // Reset form
    setFormData({ name: "", lastname: "", phone: "", email: "", tipo: "" as "" });
    signatureRef.current?.clear();
    setErrors({});

    toast({
      title: "Success!",
      description: "Registration saved successfully",
    });
  };

  const clearSignature = () => {
    signatureRef.current?.clear();
    setErrors((prev) => ({ ...prev, signature: "" }));
  };

  return (
    <Card className="w-full shadow-lg border-border/50">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-foreground">Registration Form</CardTitle>
        <CardDescription>Fill in your information and sign below</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={errors.name ? "border-destructive" : ""}
                placeholder="Enter your name"
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastname">Last Name *</Label>
              <Input
                id="lastname"
                value={formData.lastname}
                onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                className={errors.lastname ? "border-destructive" : ""}
                placeholder="Enter your last name"
              />
              {errors.lastname && <p className="text-sm text-destructive">{errors.lastname}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
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
                placeholder="your.email@example.com"
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value: "fundador" | "comprado" | "herdero") =>
                  setFormData({ ...formData, tipo: value })
                }
              >
                <SelectTrigger
                  id="tipo"
                  className={errors.tipo ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Select tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fundador">Fundador</SelectItem>
                  <SelectItem value="comprado">Comprado</SelectItem>
                  <SelectItem value="herdero">Herdero</SelectItem>
                </SelectContent>
              </Select>
              {errors.tipo && <p className="text-sm text-destructive">{errors.tipo}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <PenTool className="h-4 w-4" />
                Signature *
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearSignature}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Clear
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
            Submit Registration
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
