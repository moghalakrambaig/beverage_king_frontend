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
import { ChevronDown, AlertCircle, Loader, LogOut, Upload, Download } from "lucide-react";
import bkLogo from "@/assets/bk-logo.jpg";

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const response = await api.uploadCsv(file);
      // depending on backend response shape: either response.data or response itself
      const data = response.data ?? response;
      if (Array.isArray(data)) {
        const sanitized = data.map((c: any) => ({
          ...c,
          earnedPoints: c.earnedPoints ?? 0,
          totalVisits: c.totalVisits ?? 0,
          totalSpend: c.totalSpend ?? 0,
          isEmployee: c.isEmployee ?? false,
        }));
        setCustomers(sanitized);
      } else {
        // If backend returns created rows under data property:
        const arr = data.data ?? [];
        if (Array.isArray(arr)) setCustomers(arr);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to upload CSV");
    }
  };

  // Open edit modal with a deep copy so table isn't mutated until save
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading customers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center rounded-lg border border-border bg-card p-8 max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive font-semibold mb-6">{error}</p>
          <Button 
            onClick={() => navigate("/login")} 
            className="bg-primary hover:bg-primary/90"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Matches home page design */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <img
              src={bkLogo}
              alt="BEVERAGE KING"
              className="w-12 h-12 object-contain rounded-lg shadow-lg transition-transform duration-300 hover:scale-110"
            />
            <span className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Admin Dashboard
            </span>
          </div>

          {/* Logout Button */}
          <Button 
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="border-primary/30 hover:bg-primary/10"
          >
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-8 px-4">
        <div className="container mx-auto">
          {/* Title Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold mb-2">Manage Customers</h1>
            <p className="text-muted-foreground">Upload, view, and manage customer data</p>
          </div>

          {/* Action Buttons - Styled consistently */}
          <div className="flex flex-wrap gap-3 mb-8">
            <input
              type="file"
              accept=".csv,.xlsx"
              style={{ display: "none" }}
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <Button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2"
            >
              <Upload className="w-4 h-4" /> Upload File
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="border-primary/30 hover:bg-primary/10 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> Export
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportCSV}>Export as CSV</DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportExcel}>Export as Excel</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

        <Button variant="destructive" onClick={handleDeleteAll}>
          Delete All
        </Button>
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
              <TableHead>ID</TableHead>
              <TableHead>CurrentRank</TableHead>
              <TableHead>DisplayID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>SignUpDate</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>TotalVisits</TableHead>
              <TableHead>TotalSpend</TableHead>
              <TableHead>LastPurchaseDate</TableHead>
              <TableHead>IsEmployee</TableHead>
              <TableHead>StartDate</TableHead>
              <TableHead>EndDate</TableHead>
              <TableHead>InternalLoyaltyCustomerId</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>{customer.id}</TableCell>
                <TableCell>{customer.currentRank}</TableCell>
                <TableCell>{customer.displayId}</TableCell>
                <TableCell>{customer.name}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{formatDate(customer.signUpDate)}</TableCell>
                <TableCell>{customer.earnedPoints}</TableCell>
                <TableCell>{customer.totalVisits}</TableCell>
                <TableCell>{customer.totalSpend}</TableCell>
                <TableCell>{formatDate(customer.lastPurchaseDate)}</TableCell>
                <TableCell>{customer.isEmployee ? "Yes" : "No"}</TableCell>
                <TableCell>{formatDate(customer.startDate)}</TableCell>
                <TableCell>{formatDate(customer.endDate)}</TableCell>
                <TableCell>{customer.internalLoyaltyCustomerId}</TableCell>
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
                      onClick={() => handleDelete(customer.id)}
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

      {/* Edit Modal - Styled consistently */}
      {showModal && editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 text-gray-900 shadow-xl">
            <h2 className="text-2xl font-semibold mb-4">Edit Customer</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label className="text-sm text-gray-600">Current Rank</label>
                <input
                  className="p-2 rounded border border-gray-300 text-gray-900"
                  value={editingCustomer.currentRank}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, currentRank: e.target.value })}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-gray-600">Display ID</label>
                <input
                  className="p-2 rounded border border-gray-300 text-gray-900"
                  value={editingCustomer.displayId}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, displayId: e.target.value })}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-gray-600">Name</label>
                <input
                  className="p-2 rounded border border-gray-300 text-gray-900"
                  value={editingCustomer.name}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-gray-600">Phone</label>
                <input
                  className="p-2 rounded border border-gray-300 text-gray-900"
                  value={editingCustomer.phone}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-gray-600">Email</label>
                <input
                  type="email"
                  className="p-2 rounded border border-gray-300 text-gray-900"
                  value={editingCustomer.email}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-gray-600">Sign Up Date</label>
                <input
                  type="date"
                  className="p-2 rounded border border-gray-300 text-gray-900"
                  value={editingCustomer.signUpDate}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, signUpDate: e.target.value })}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-gray-600">Last Purchase Date</label>
                <input
                  type="date"
                  className="p-2 rounded border border-gray-300 text-gray-900"
                  value={editingCustomer.lastPurchaseDate}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, lastPurchaseDate: e.target.value })}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-gray-600">Earned Points</label>
                <input
                  type="number"
                  className="p-2 rounded border border-gray-300 text-gray-900"
                  value={editingCustomer.earnedPoints}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, earnedPoints: Number(e.target.value) })}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-gray-600">Total Visits</label>
                <input
                  type="number"
                  className="p-2 rounded border border-gray-300 text-gray-900"
                  value={editingCustomer.totalVisits}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, totalVisits: Number(e.target.value) })}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-gray-600">Total Spend</label>
                <input
                  type="number"
                  step="0.01"
                  className="p-2 rounded border border-gray-300 text-gray-900"
                  value={editingCustomer.totalSpend}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, totalSpend: Number(e.target.value) })}
                />
              </div>

              <div className="flex items-center gap-2 p-2">
                <input
                  type="checkbox"
                  checked={!!editingCustomer.isEmployee}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, isEmployee: e.target.checked })}
                  className="w-4 h-4"
                />
                <label className="text-sm text-gray-700">Is Employee</label>
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-gray-600">Start Date</label>
                <input
                  type="date"
                  className="p-2 rounded border border-gray-300 text-gray-900"
                  value={editingCustomer.startDate}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, startDate: e.target.value })}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-gray-600">End Date</label>
                <input
                  type="date"
                  className="p-2 rounded border border-gray-300 text-gray-900"
                  value={editingCustomer.endDate}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, endDate: e.target.value })}
                />
              </div>

              <div className="flex flex-col md:col-span-2">
                <label className="text-sm text-gray-600">Internal Loyalty Customer ID</label>
                <input
                  className="p-2 rounded border border-gray-300 text-gray-900"
                  value={editingCustomer.internalLoyaltyCustomerId}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, internalLoyaltyCustomerId: e.target.value })}
                />
              </div>

              <div className="flex flex-col md:col-span-2">
                <label className="text-sm text-gray-600">Password (leave blank to keep current)</label>
                <input
                  type="password"
                  className="p-2 rounded border border-gray-300 text-gray-900"
                  value={editingCustomer.password}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, password: e.target.value })}
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <Button
                onClick={() => setShowModal(false)}
                variant="outline"
                className="border-border hover:bg-muted"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateSave} 
                disabled={saving}
                className="bg-primary hover:bg-primary/90"
              >
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
