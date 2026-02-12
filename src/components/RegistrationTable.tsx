import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, FileText, Trash2, Filter } from "lucide-react";
import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Registration {
  id: string;
  name: string;
  lastname: string;
  cedula: string;
  phone: string;
  email: string;
  tipo: string;
  signature: string;
  timestamp: string;
  bought_from_name?: string | null;
  bought_from_lastname?: string | null;
  inherited_from_name?: string | null;
  inherited_from_lastname?: string | null;
}

interface RegistrationTableProps {
  registrations: Registration[];
  onDelete: (id: string) => void;
}

export const RegistrationTable = ({ registrations, onDelete }: RegistrationTableProps) => {
  const [filterTipo, setFilterTipo] = useState<string>("all");

  const filteredRegistrations = filterTipo === "all" 
    ? registrations 
    : registrations.filter(reg => reg.tipo === filterTipo);

  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Header background bar
    doc.setFillColor(30, 58, 95);
    doc.rect(0, 0, pageWidth, 28, 'F');
    
    // Accent line
    doc.setFillColor(212, 175, 55);
    doc.rect(0, 28, pageWidth, 1.5, 'F');
    
    // Title
    doc.setFontSize(16);
    doc.setFont(undefined, "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("Registro Firma Patronato de Maestro Banilejos", pageWidth / 2, 12, { align: "center" });
    
    // Subtitle
    doc.setFontSize(9);
    doc.setFont(undefined, "normal");
    doc.setTextColor(200, 210, 225);
    const subtitle = filterTipo === "all" 
      ? `Total de registros: ${filteredRegistrations.length}`
      : `Tipo: ${filterTipo.charAt(0).toUpperCase() + filterTipo.slice(1)} — ${filteredRegistrations.length} registro(s)`;
    doc.text(subtitle, pageWidth / 2, 19, { align: "center" });
    
    // Date
    doc.setFontSize(8);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-DO', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth / 2, 25, { align: "center" });
    
    doc.setTextColor(0, 0, 0);
    
    const tableData = filteredRegistrations.map((reg) => [
      reg.name,
      reg.lastname,
      reg.cedula,
      reg.phone,
      reg.email,
      reg.tipo.charAt(0).toUpperCase() + reg.tipo.slice(1),
      reg.bought_from_name || '-',
      reg.bought_from_lastname || '-',
      reg.inherited_from_name || '-',
      reg.inherited_from_lastname || '-',
      new Date(reg.timestamp).toLocaleDateString('es-DO'),
      "",
    ]);

    autoTable(doc, {
      head: [["Nombre", "Apellido", "Cédula", "Teléfono", "Email", "Tipo", "Comprado a\n(Nombre)", "Comprado a\n(Apellido)", "Heredado de\n(Nombre)", "Heredado de\n(Apellido)", "Fecha", "Firma"]],
      body: tableData,
      startY: 33,
      theme: 'striped',
      styles: {
        cellPadding: 4,
        fontSize: 8,
        lineColor: [220, 220, 220],
        lineWidth: 0.3,
        halign: 'left',
        valign: 'middle',
        textColor: [40, 40, 40],
      },
      headStyles: {
        fillColor: [30, 58, 95],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: 'center',
        fontSize: 7.5,
        cellPadding: 5,
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250],
      },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 22 },
        2: { cellWidth: 24 },
        3: { cellWidth: 22 },
        4: { cellWidth: 32 },
        5: { cellWidth: 18 },
        6: { cellWidth: 20 },
        7: { cellWidth: 20 },
        8: { cellWidth: 20 },
        9: { cellWidth: 20 },
        10: { cellWidth: 18 },
        11: { cellWidth: 24, minCellHeight: 22 },
      },
      didDrawCell: (data) => {
        if (data.column.index === 11 && data.cell.section === "body") {
          const signature = filteredRegistrations[data.row.index]?.signature;
          if (signature) {
            try {
              const imgWidth = 28;
              const imgHeight = 14;
              const xPos = data.cell.x + 1;
              const yPos = data.cell.y + (data.cell.height - imgHeight) / 2;
              doc.addImage(signature, "PNG", xPos, yPos, imgWidth, imgHeight);
            } catch (error) {
              console.error("Error adding signature to PDF:", error);
            }
          }
        }
      },
      didDrawPage: () => {
        doc.setFillColor(212, 175, 55);
        doc.rect(10, pageHeight - 12, pageWidth - 20, 0.5, 'F');
        doc.setFontSize(7);
        doc.setTextColor(130, 130, 130);
        doc.text("Patronato de Maestro Banilejos — Documento generado automáticamente", pageWidth / 2, pageHeight - 7, { align: "center" });
      },
      margin: { top: 33, left: 8, right: 8, bottom: 15 },
    });

    const fileName = filterTipo === "all" 
      ? `registrations_${Date.now()}.pdf`
      : `registrations_${filterTipo}_${Date.now()}.pdf`;
    doc.save(fileName);
  };

  return (
    <Card className="w-full shadow-lg border-border/50">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold text-foreground">Registrations</CardTitle>
            <CardDescription>
              Total records: {registrations.length} {filterTipo !== "all" && `(Showing ${filteredRegistrations.length} ${filterTipo})`}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="fundador">Fundador</SelectItem>
                <SelectItem value="comprador">Comprador</SelectItem>
                <SelectItem value="heredero">Heredero</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={exportToPDF}
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={filteredRegistrations.length === 0}
            >
              <FileText className="h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredRegistrations.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Download className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{filterTipo === "all" ? "No registrations yet" : `No ${filterTipo} registrations found`}</p>
            <p className="text-sm">{filterTipo === "all" ? "Submit the form above to add your first registration" : "Try selecting a different filter"}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Apellido</TableHead>
                  <TableHead>Cédula</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Comprado a</TableHead>
                  <TableHead>Heredado de</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Firma</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegistrations.map((reg) => (
                  <TableRow key={reg.id}>
                    <TableCell className="font-medium">{reg.name}</TableCell>
                    <TableCell>{reg.lastname}</TableCell>
                    <TableCell>{reg.cedula}</TableCell>
                    <TableCell>{reg.phone}</TableCell>
                    <TableCell>{reg.email}</TableCell>
                    <TableCell className="capitalize">{reg.tipo}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {reg.bought_from_name ? (
                        <span>{reg.bought_from_name} {reg.bought_from_lastname}</span>
                      ) : (
                        <span className="text-muted-foreground/50">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {reg.inherited_from_name ? (
                        <span>{reg.inherited_from_name} {reg.inherited_from_lastname}</span>
                      ) : (
                        <span className="text-muted-foreground/50">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(reg.timestamp).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {reg.signature && (
                        <img
                          src={reg.signature}
                          alt="Firma"
                          className="h-8 border border-border rounded"
                        />
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(reg.id)}
                        className="gap-2 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
