import { useState, useEffect } from "react";
import { RegistrationForm } from "@/components/RegistrationForm";
import { RegistrationTable } from "@/components/RegistrationTable";
import { FileSignature } from "lucide-react";

interface Registration {
  id: string;
  name: string;
  lastname: string;
  phone: string;
  email: string;
  signature: string;
  timestamp: string;
}

const STORAGE_KEY = "registrations";

const Index = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);

  // Load registrations from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setRegistrations(JSON.parse(stored));
      } catch (error) {
        console.error("Error loading registrations:", error);
      }
    }
  }, []);

  // Save to localStorage whenever registrations change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(registrations));
  }, [registrations]);

  const handleSubmit = (formData: Omit<Registration, "id" | "timestamp">) => {
    const newRegistration: Registration = {
      ...formData,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    setRegistrations([newRegistration, ...registrations]);
  };

  const handleDelete = (id: string) => {
    setRegistrations(registrations.filter((reg) => reg.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <FileSignature className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Registration System
          </h1>
          <p className="text-muted-foreground text-lg">
            Capture registrations with digital signatures
          </p>
        </header>

        <div className="space-y-8">
          <RegistrationForm onSubmit={handleSubmit} />
          <RegistrationTable registrations={registrations} onDelete={handleDelete} />
        </div>
      </div>
    </div>
  );
};

export default Index;
