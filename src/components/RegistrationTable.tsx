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
import { Download, FileSpreadsheet, FileText, Trash2 } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

interface Registration {
  id: string;
  name: string;
  lastname: string;
  phone: string;
  email: string;
  signature: string;
  timestamp: string;
}

interface RegistrationTableProps {
  registrations: Registration[];
  onDelete: (id: string) => void;
}

export const RegistrationTable = ({ registrations, onDelete }: RegistrationTableProps) => {
  const exportToExcel = () => {
    const dataForExport = registrations.map((reg) => ({
      Name: reg.name,
      "Last Name": reg.lastname,
      Phone: reg.phone,
      Email: reg.email,
      Date: new Date(reg.timestamp).toLocaleString(),
      Signature: reg.signature ? "Signed" : "Not signed",
    }));

    const ws = XLSX.utils.json_to_sheet(dataForExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registrations");
    XLSX.writeFile(wb, `registrations_${Date.now()}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFontSize(18);
    doc.text("Registration Records", pageWidth / 2, 15, { align: "center" });
    
    let yPosition = 30;
    const lineHeight = 8;
    const sectionSpacing = 15;
    const pageHeight = doc.internal.pageSize.getHeight();

    registrations.forEach((reg, index) => {
      // Check if we need a new page
      if (yPosition + 80 > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      doc.text(`Registration #${index + 1}`, 15, yPosition);
      yPosition += lineHeight;

      doc.setFont(undefined, "normal");
      doc.setFontSize(10);
      doc.text(`Name: ${reg.name} ${reg.lastname}`, 15, yPosition);
      yPosition += lineHeight;
      doc.text(`Phone: ${reg.phone}`, 15, yPosition);
      yPosition += lineHeight;
      doc.text(`Email: ${reg.email}`, 15, yPosition);
      yPosition += lineHeight;
      doc.text(`Date: ${new Date(reg.timestamp).toLocaleString()}`, 15, yPosition);
      yPosition += lineHeight;

      // Add signature if available
      if (reg.signature) {
        doc.text("Signature:", 15, yPosition);
        yPosition += lineHeight;
        try {
          doc.addImage(reg.signature, "PNG", 15, yPosition, 60, 20);
          yPosition += 25;
        } catch (error) {
          console.error("Error adding signature to PDF:", error);
          yPosition += 5;
        }
      }

      yPosition += sectionSpacing;
    });

    doc.save(`registrations_${Date.now()}.pdf`);
  };

  return (
    <Card className="w-full shadow-lg border-border/50">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold text-foreground">Registrations</CardTitle>
            <CardDescription>
              Total records: {registrations.length}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={exportToExcel}
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={registrations.length === 0}
            >
              <FileSpreadsheet className="h-4 w-4" />
              Excel
            </Button>
            <Button
              onClick={exportToPDF}
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={registrations.length === 0}
            >
              <FileText className="h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {registrations.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Download className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No registrations yet</p>
            <p className="text-sm">Submit the form above to add your first registration</p>
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
                  <TableHead>Date</TableHead>
                  <TableHead>Signature</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrations.map((reg) => (
                  <TableRow key={reg.id}>
                    <TableCell className="font-medium">{reg.name}</TableCell>
                    <TableCell>{reg.lastname}</TableCell>
                    <TableCell>{reg.phone}</TableCell>
                    <TableCell>{reg.email}</TableCell>
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
