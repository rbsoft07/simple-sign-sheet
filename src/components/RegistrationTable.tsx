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
import { Download, FileSpreadsheet, FileText, Trash2, Filter } from "lucide-react";
import { useState } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Registration {
  id: string;
  name: string;
  lastname: string;
  phone: string;
  email: string;
  tipo: string;
  signature: string;
  timestamp: string;
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

  const exportToExcel = () => {
    const dataForExport = filteredRegistrations.map((reg) => ({
      Name: reg.name,
      "Last Name": reg.lastname,
      Phone: reg.phone,
      Email: reg.email,
      Tipo: reg.tipo,
      Date: new Date(reg.timestamp).toLocaleString(),
      Signature: reg.signature ? "Signed" : "Not signed",
    }));

    const ws = XLSX.utils.json_to_sheet(dataForExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registrations");
    const fileName = filterTipo === "all" 
      ? `registrations_${Date.now()}.xlsx`
      : `registrations_${filterTipo}_${Date.now()}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Title
    doc.setFontSize(18);
    doc.setFont(undefined, "bold");
    const title = filterTipo === "all" 
      ? "Registration Records" 
      : `Registration Records - ${filterTipo.charAt(0).toUpperCase() + filterTipo.slice(1)}`;
    doc.text(title, pageWidth / 2, 15, { align: "center" });
    
    // Prepare table data without signature column (we'll add signatures via didDrawCell)
    const tableData = filteredRegistrations.map((reg) => [
      reg.name,
      reg.lastname,
      reg.phone,
      reg.email,
      reg.tipo,
      new Date(reg.timestamp).toLocaleDateString(),
      "", // Empty cell for signature
    ]);

    autoTable(doc, {
      head: [["Name", "Last Name", "Phone", "Email", "Tipo", "Date", "Signature"]],
      body: tableData,
      startY: 25,
      theme: 'grid',
      styles: {
        cellPadding: 4,
        fontSize: 10,
        lineColor: [200, 200, 200],
        lineWidth: 0.5,
        halign: 'left',
        valign: 'middle',
      },
      headStyles: {
        fillColor: [66, 66, 66],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 25 },
        2: { cellWidth: 28 },
        3: { cellWidth: 40 },
        4: { cellWidth: 20 },
        5: { cellWidth: 20 },
        6: { cellWidth: 30, minCellHeight: 20 },
      },
      didDrawCell: (data) => {
        // Draw signature images in the signature column
        if (data.column.index === 6 && data.cell.section === "body") {
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
      margin: { top: 25, left: 10, right: 10 },
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
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="fundador">Fundador</SelectItem>
                <SelectItem value="comprador">Comprador</SelectItem>
                <SelectItem value="herdero">Herdero</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={exportToExcel}
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={filteredRegistrations.length === 0}
            >
              <FileSpreadsheet className="h-4 w-4" />
              Excel
            </Button>
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
                  <TableHead>Name</TableHead>
                  <TableHead>Last Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Signature</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegistrations.map((reg) => (
                  <TableRow key={reg.id}>
                    <TableCell className="font-medium">{reg.name}</TableCell>
                    <TableCell>{reg.lastname}</TableCell>
                    <TableCell>{reg.phone}</TableCell>
                    <TableCell>{reg.email}</TableCell>
                    <TableCell className="capitalize">{reg.tipo}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(reg.timestamp).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {reg.signature && (
                        <img
                          src={reg.signature}
                          alt="Signature"
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
