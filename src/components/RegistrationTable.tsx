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
import autoTable from "jspdf-autotable";

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
    
    const tableData = registrations.map((reg) => [
      reg.name,
      reg.lastname,
      reg.phone,
      reg.email,
      new Date(reg.timestamp).toLocaleDateString(),
      reg.signature || "",
    ]);

    autoTable(doc, {
      head: [["Name", "Last Name", "Phone", "Email", "Date", "Signature"]],
      body: tableData,
      startY: 25,
      styles: {
        cellPadding: 3,
        fontSize: 9,
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [66, 66, 66],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      columnStyles: {
        5: { cellWidth: 35 },
      },
      didDrawCell: (data) => {
        if (data.column.index === 5 && data.cell.section === "body") {
          const signature = registrations[data.row.index].signature;
          if (signature) {
            try {
              const imgWidth = 30;
              const imgHeight = 15;
              const xPos = data.cell.x + 2;
              const yPos = data.cell.y + 2;
              doc.addImage(signature, "PNG", xPos, yPos, imgWidth, imgHeight);
            } catch (error) {
              console.error("Error adding signature to PDF:", error);
            }
          }
        }
      },
      margin: { top: 25 },
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
