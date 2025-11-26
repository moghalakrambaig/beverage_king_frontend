import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/lib/api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, AlertCircle, Loader } from "lucide-react";

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

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      const isLoggedIn = sessionStorage.getItem("email");
      if (!isLoggedIn) {
        navigate("/login");
        return;
      }
      try {
        const data = await api.getCustomers();
        if (Array.isArray(data)) {
          setCustomers(data);
          if (data.length > 0) setColumns(Object.keys(data[0]));
        } else {
          setError("Invalid data format from server.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load customers. Are you logged in?");
      } finally {
        setLoading(false);
      }
    };
    checkAuthAndFetchData();
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("email");
    navigate("/login");
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const response = await api.uploadCsv(file);
      const data = response.data ?? response;
      if (Array.isArray(data) && data.length > 0) {
        setCustomers(data);
        setColumns(Object.keys(data[0]));
      } else {
        setCustomers([]);
        setColumns([]);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to upload CSV");
    }
  };

  const handleDelete = async (id: any) => {
    if (!id) return;
    try {
      await api.deleteCustomer(id);
      setCustomers(customers.filter((c) => c._id !== id && c.id !== id));
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

  const handleExportCSV = () => {
    if (!customers.length || !columns.length) return alert("No data to export");
    const rows = customers.map((c) => columns.map((col) => c[col] ?? ""));
    const csvContent = [columns, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "customers.csv");
  };

  const handleExportExcel = () => {
    if (!customers.length || !columns.length) return alert("No data to export");
    const worksheet = XLSX.utils.json_to_sheet(customers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "customers.xlsx");
  };

  const openEditModal = (c: any) => {
    setEditingCustomer(c);
    setShowModal(true);
  };

  const handleUpdateSave = async () => {
    if (!editingCustomer) return;
    setSaving(true);

    const id = editingCustomer._id ?? editingCustomer.id;
    if (!id) return alert("No id to update this document");

    try {
      const res = await api.updateCustomer(id, editingCustomer);
      const updated = res.data ?? res;
      setCustomers((prev) =>
        prev.map((r) => (r._id === id || r.id === id ? updated : r))
      );
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update customer");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen flex-col">
        <Loader className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading customers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen flex-col bg-destructive/10">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="mt-4 text-destructive-foreground font-semibold">{error}</p>
        <Button onClick={() => navigate("/login")} variant="destructive" className="mt-6">
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 bg-white/95 backdrop-blur-sm rounded-lg p-6 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button onClick={handleLogout}>Logout</Button>
      </div>

      <div className="flex justify-end mb-4 space-x-2">
        <input
          type="file"
          accept=".csv,.xlsx"
          style={{ display: "none" }}
          ref={fileInputRef}
          onChange={handleFileUpload}
        />
        <Button onClick={() => fileInputRef.current?.click()}>Upload File</Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center">
              Export
              <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleExportCSV}>Export as CSV</DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportExcel}>Export as Excel</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="destructive" onClick={handleDeleteAll}>Delete All</Button>
      </div>

      {customers.length === 0 ? (
        <div className="text-center py-20 bg-muted/20 rounded-lg">
          <h3 className="text-xl font-semibold">No Customers Found</h3>
          <p className="text-muted-foreground mt-2">Your customer list is currently empty.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col}>{col}</TableHead>
              ))}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer, idx) => (
              <TableRow key={idx}>
                {columns.map((col) => (
                  <TableCell key={col}>{customer[col]?.toString() ?? ""}</TableCell>
                ))}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(customer)}
                    >
                      Update
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(customer._id ?? customer.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Edit Modal */}
      {showModal && editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 text-gray-900 shadow-xl">
            <h2 className="text-2xl font-semibold mb-4">Edit Customer</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {columns.map((col) => (
                <div className="flex flex-col" key={col}>
                  <label className="text-sm text-gray-600">{col}</label>
                  <input
                    className="p-2 rounded border border-gray-300 text-gray-900"
                    value={editingCustomer[col] ?? ""}
                    onChange={(e) =>
                      setEditingCustomer({ ...editingCustomer, [col]: e.target.value })
                    }
                  />
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                onClick={() => setShowModal(false)}
                className="bg-yellow-400 text-black hover:bg-yellow-400"
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
