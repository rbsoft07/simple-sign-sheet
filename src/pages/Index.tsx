import { useState, useEffect } from "react";
import { RegistrationForm } from "@/components/RegistrationForm";
import { RegistrationTable } from "@/components/RegistrationTable";
import { FileSignature } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Registration {
  id: string;
  name: string;
  lastname: string;
  phone: string;
  email: string;
  tipo: "fundador" | "comprador" | "herdero";
  signature: string;
  timestamp: string;
}

const Index = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const { toast } = useToast();

  // Load registrations from database on mount
  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    const { data, error } = await supabase
      .from("registrations")
      .select("*")
      .order("timestamp", { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error loading registrations",
        description: error.message,
      });
      return;
    }

    if (data) {
      setRegistrations(data);
    }
  };

  const handleSubmit = async (formData: Omit<Registration, "id" | "timestamp">) => {
    const { error } = await supabase.from("registrations").insert([
      {
        name: formData.name,
        lastname: formData.lastname,
        phone: formData.phone,
        email: formData.email,
        tipo: formData.tipo,
        signature: formData.signature,
      },
    ]);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error saving registration",
        description: error.message,
      });
      return;
    }

    // Refresh the list
    fetchRegistrations();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("registrations").delete().eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error deleting registration",
        description: error.message,
      });
      return;
    }

    toast({
      title: "Deleted",
      description: "Registration deleted successfully",
    });

    // Refresh the list
    fetchRegistrations();
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
