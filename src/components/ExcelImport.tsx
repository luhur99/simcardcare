import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import * as XLSX from "xlsx";

interface ValidationError {
  row: number;
  field: string;
  message: string;
  value: any;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: ValidationError[];
  duplicates: string[];
}

interface ExcelImportProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any[]) => Promise<ImportResult>;
  templateColumns: { key: string; label: string; example: string }[];
  entityName: string;
  downloadTemplateName: string;
}

export function ExcelImport({
  isOpen,
  onClose,
  onImport,
  templateColumns,
  entityName,
  downloadTemplateName,
}: ExcelImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile) return;

    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv"
    ];

    if (!validTypes.includes(selectedFile.type)) {
      alert("Please upload a valid Excel file (.xlsx, .xls, .csv)");
      return;
    }

    setFile(selectedFile);
    setImportResult(null);
    parseExcelFile(selectedFile);
  };

  const parseExcelFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        
        setPreviewData(jsonData.slice(0, 5)); // Show first 5 rows as preview
      } catch (error) {
        alert("Error reading Excel file. Please check the format.");
        console.error(error);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: "binary" });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);

          const result = await onImport(jsonData);
          setImportResult(result);
        } catch (error) {
          alert("Error processing import. Please try again.");
          console.error(error);
        } finally {
          setImporting(false);
        }
      };
      reader.readAsBinaryString(file);
    } catch (error) {
      setImporting(false);
      alert("Error importing data. Please try again.");
      console.error(error);
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      templateColumns.reduce((acc, col) => {
        acc[col.label] = col.example;
        return acc;
      }, {} as any)
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, `${downloadTemplateName}_template.xlsx`);
  };

  const resetImport = () => {
    setFile(null);
    setPreviewData([]);
    setImportResult(null);
  };

  const handleClose = () => {
    resetImport();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Import {entityName} from Excel
          </DialogTitle>
          <DialogDescription>
            Upload an Excel file to import multiple {entityName.toLowerCase()} at once. Download the template first for the correct format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Download Template Button */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadTemplate}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download Template
            </Button>
          </div>

          {/* File Upload Area */}
          {!importResult && (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {!file ? (
                <>
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm font-medium mb-2">
                    Drag and drop your Excel file here, or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Supported formats: .xlsx, .xls, .csv
                  </p>
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("file-upload")?.click()}
                  >
                    Browse Files
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <FileSpreadsheet className="h-8 w-8 text-primary" />
                    <div className="text-left">
                      <p className="font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetImport}
                  >
                    Change File
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Preview Data */}
          {previewData.length > 0 && !importResult && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Preview (First 5 rows)</h4>
              <div className="border rounded-lg overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      {Object.keys(previewData[0]).map((key) => (
                        <th key={key} className="px-4 py-2 text-left font-medium">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, idx) => (
                      <tr key={idx} className="border-t">
                        {Object.values(row).map((value: any, cellIdx) => (
                          <td key={cellIdx} className="px-4 py-2">
                            {String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Import Result */}
          {importResult && (
            <div className="space-y-4">
              {/* Success Summary */}
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Import Complete!</strong>
                  <br />
                  Successfully imported: <strong>{importResult.success}</strong> {entityName.toLowerCase()}
                  {importResult.failed > 0 && (
                    <>
                      <br />
                      Failed to import: <strong>{importResult.failed}</strong> {entityName.toLowerCase()}
                    </>
                  )}
                </AlertDescription>
              </Alert>

              {/* Duplicates Warning */}
              {importResult.duplicates.length > 0 && (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    <strong>Duplicate entries found:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      {importResult.duplicates.slice(0, 10).map((dup, idx) => (
                        <li key={idx} className="text-sm">{dup}</li>
                      ))}
                      {importResult.duplicates.length > 10 && (
                        <li className="text-sm">... and {importResult.duplicates.length - 10} more</li>
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Error Details */}
              {importResult.errors.length > 0 && (
                <Alert className="border-red-200 bg-red-50">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <strong>Errors found:</strong>
                    <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                      {importResult.errors.slice(0, 10).map((error, idx) => (
                        <div key={idx} className="text-sm border-l-2 border-red-300 pl-2">
                          <strong>Row {error.row}:</strong> {error.message}
                          {error.field && <span className="text-xs"> (Field: {error.field})</span>}
                        </div>
                      ))}
                      {importResult.errors.length > 10 && (
                        <p className="text-sm">... and {importResult.errors.length - 10} more errors</p>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          {!importResult ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={!file || importing}
                className="gap-2"
              >
                {importing ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Import Data
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={resetImport}>
                Import Another File
              </Button>
              <Button onClick={handleClose}>
                Close
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}