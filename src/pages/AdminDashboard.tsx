import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { ChevronDown, AlertCircle, Loader, LogOut, Upload, Download, MoreVertical } from "lucide-react";
import bkLogo from "@/assets/bk-logo.jpg";

// utility to format ISO / Date string
const formatDate = (date: string | Date) => {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString();
};

export function AdminDashboard() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // ========================== Load customers
  useEffect(() => {
    const fetchData = async () => {
      const email = sessionStorage.getItem("email");
      if (!email) return navigate("/login");

      try {
        const data = await api.getCustomers();
        setCustomers(data);

        // compute all unique dynamic fields
        const allCols = Array.from(
          new Set(
            data.flatMap((c: any) => Object.keys(c.dynamicFields || {}))
          )
        ) as string[];
        setColumns(allCols);
      } catch (err) {
        console.error(err);
        setError("Failed to load customers. Are you logged in?");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("email");
    navigate("/login");
  };

  // ========================== File Upload =========================
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // ✅ Cast to correct type
      const data: any[] = await api.uploadCsv(file);

      setCustomers(data);

      // Extract all dynamic field keys safely
      const allCols = Array.from(
        new Set(
          data.flatMap((c) =>
            c.dynamicFields ? Object.keys(c.dynamicFields) : []
          )
        )
      ) as string[];

      setColumns(allCols);

    } catch (err) {
      console.error(err);
      alert("Failed to upload CSV");
    }
  };

  // ========================== Delete
  const handleDelete = async (id: any) => {
    if (!id) return;
    try {
      await api.deleteCustomer(id);
      setCustomers(customers.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete customer");
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm("Are you sure you want to delete ALL customers?")) return;
    try {
      await api.deleteAllCustomers();
      setCustomers([]);
      setColumns([]);
      alert("All customers deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to delete all customers");
    }
  };

  // ========================== Export
  const handleExportCSV = () => {
    if (!customers.length || !columns.length) return alert("No data to export");
    const rows = customers.map(c => columns.map(col => c.dynamicFields[col] ?? ""));
    const csvContent = [columns, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "customers.csv");
  };

  const handleExportExcel = () => {
    if (!customers.length || !columns.length) return alert("No data to export");
    const worksheetData = customers.map(c => ({ id: c.id, ...c.dynamicFields }));
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), "customers.xlsx");
  };

  // ========================== Edit modal
  const openEditModal = (c: any) => {
    setEditingCustomer(JSON.parse(JSON.stringify(c))); // deep copy
    setShowModal(true);
  };

  const handleUpdateSave = async () => {
    if (!editingCustomer) return;
    setSaving(true);

    try {
      await api.updateCustomer(editingCustomer.id, editingCustomer);

      setCustomers((prev: any[]) =>
        prev.map((c: any) =>
          c.id === editingCustomer.id ? editingCustomer : c
        )
      );

      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update customer");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <div className="min-h-screen flex items-center justify-center"><Loader className="animate-spin w-12 h-12 text-primary" /></div>;

  if (error)
    return <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center p-6 bg-card border rounded-lg">
        <AlertCircle className="w-12 h-12 mx-auto text-destructive" />
        <p className="text-destructive font-semibold my-4">{error}</p>
        <Button onClick={() => navigate("/login")}>Go to Login</Button>
      </div>
    </div>;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-b p-4 flex justify-between items-center z-50">
        <div className="flex items-center gap-3">
          <img src={bkLogo} alt="BEVERAGE KING" className="w-12 h-12 object-contain rounded-lg" />
          <span className="text-xl sm:text-3xl font-extrabold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">Admin Dashboard</span>
        </div>

        <div className="flex items-center gap-3">
          <input type="file" accept=".csv,.xlsx" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />

          <div className="hidden sm:flex items-center gap-2">
            <Button onClick={() => fileInputRef.current?.click()} size="sm"><Upload className="w-4 h-4 mr-1" /> Upload</Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline"><Download className="w-4 h-4 mr-1" /> Export <ChevronDown className="w-3 h-3 ml-1" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportCSV}>Export as CSV</DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportExcel}>Export as Excel</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button size="sm" variant="destructive" onClick={handleDeleteAll}>Delete All</Button>
          </div>

          <div className="sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" aria-label="Open menu"><MoreVertical className="w-5 h-5" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>Upload File</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleExportCSV}>Export as CSV</DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportExcel}>Export as Excel</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDeleteAll}>Delete All</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="hidden sm:block">
            <Button onClick={handleLogout} variant="outline"><LogOut className="w-4 h-4 mr-2" /> Logout</Button>
          </div>
        </div>
      </header>

      <main className="pt-24 px-4 pb-8 container mx-auto">
        <div className="mb-6" />

        {customers.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-lg">
            <h3 className="text-xl font-semibold">No Customers Found</h3>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                {columns.map((col) => (
                  <TableHead key={col}>{col}</TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {customers.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.id}</TableCell>
                  {columns.map((col) => (
                    <TableCell key={col}>
                      {c.dynamicFields && c.dynamicFields[col] !== undefined
                        ? String(c.dynamicFields[col])
                        : "-"}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {showModal && editingCustomer && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/70 p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-xl">

              <h2 className="text-2xl font-semibold mb-4">Edit Customer</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {columns.map((col) => (
                  <div key={col} className="flex flex-col">
                    <label className="text-sm text-gray-600">{col}</label>
                    <input
                      className="p-2 rounded border border-gray-300"
                      value={editingCustomer.dynamicFields?.[col] ?? ""}
                      onChange={(e) =>
                        setEditingCustomer((prev) => ({
                          ...prev,
                          dynamicFields: {
                            ...prev.dynamicFields,
                            [col]: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                ))}

                <div className="flex flex-col md:col-span-2">
                  <label>Password (leave blank to keep current)</label>
                  <input
                    type="password"
                    className="p-2 border rounded"
                    value={editingCustomer.password ?? ""}
                    onChange={(e) =>
                      setEditingCustomer((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button onClick={handleUpdateSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
