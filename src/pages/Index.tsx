import { useState, useEffect } from "react";
import { RegistrationForm } from "@/components/RegistrationForm";
import { RegistrationTable } from "@/components/RegistrationTable";
import { FileSignature, LogOut, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface Registration {
  id: string;
  name: string;
  lastname: string;
  cedula: string;
  phone: string;
  email: string;
  tipo: "fundador" | "comprador" | "heredero" | "comprado";
  signature: string;
  timestamp: string;
  bought_from_name?: string | null;
  bought_from_lastname?: string | null;
  inherited_from_name?: string | null;
  inherited_from_lastname?: string | null;
  inherited_from_signature?: string | null;
}

const Index = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const { toast } = useToast();
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

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
        cedula: formData.cedula,
        phone: formData.phone,
        email: formData.email,
        tipo: formData.tipo,
        signature: formData.signature,
        bought_from_name: formData.bought_from_name || null,
        bought_from_lastname: formData.bought_from_lastname || null,
        inherited_from_name: formData.inherited_from_name || null,
        inherited_from_lastname: formData.inherited_from_lastname || null,
        inherited_from_signature: formData.inherited_from_signature || null,
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
    if (!isAdmin) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You must be an admin to delete registrations",
      });
      navigate("/auth");
      return;
    }

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

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-xl">
                <FileSignature className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <span className="text-sm text-muted-foreground">
                    {user.email} {isAdmin && "(Admin)"}
                  </span>
                  <Button onClick={handleSignOut} variant="outline" size="sm" className="gap-2">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button onClick={() => navigate("/auth")} variant="outline" size="sm" className="gap-2">
                  <LogIn className="h-4 w-4" />
                  Admin Login
                </Button>
              )}
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Registro Firma Patronato de Maestro Banilejos
            </h1>
          </div>
        </header>

        <div className="space-y-8">
          <RegistrationForm onSubmit={handleSubmit} />
          <RegistrationTable 
            registrations={registrations} 
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
