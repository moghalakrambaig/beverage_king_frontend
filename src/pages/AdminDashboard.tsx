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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit modal states
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

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
          const sanitized = data.map((c: any) => ({
            ...c,
            earnedPoints: c.earnedPoints ?? 0,
            totalVisits: c.totalVisits ?? 0,
            totalSpend: c.totalSpend ?? 0,
            isEmployee: c.isEmployee ?? false,
          }));
          setCustomers(sanitized);
        } else {
          setError("Received invalid data format from server.");
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

  const handleDelete = async (id: number) => {
    try {
      await api.deleteCustomer(id);
      setCustomers(customers.filter((c) => c.id !== id));
    } catch (error) {
      console.error(error);
      alert("Failed to delete customer");
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm("Are you sure you want to delete ALL customers?")) return;

    try {
      await api.deleteAllCustomers();
      setCustomers([]);
      alert("All customers deleted successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to delete all customers");
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    // backend may return ISO dates; show yyyy-mm-dd for form compatibility
    try {
      return new Date(dateStr).toISOString().slice(0, 10);
    } catch {
      return dateStr;
    }
  };

  // Export functions (CSV/Excel)
  const handleExportCSV = () => {
    if (!customers.length) return alert("No customers to export");

    const headers = [
      "ID",
      "CurrentRank",
      "DisplayID",
      "Name",
      "Phone",
      "Email",
      "SignUpDate",
      "EarnedPoints",
      "TotalVisits",
      "TotalSpend",
      "LastPurchaseDate",
      "IsEmployee",
      "StartDate",
      "EndDate",
      "InternalLoyaltyCustomerId",
    ];

    const rows = customers.map((c) => [
      c.id,
      c.currentRank,
      c.displayId,
      c.name,
      c.phone,
      c.email,
      formatDate(c.signUpDate),
      c.earnedPoints,
      c.totalVisits,
      c.totalSpend,
      formatDate(c.lastPurchaseDate),
      c.isEmployee ? "Yes" : "No",
      formatDate(c.startDate),
      formatDate(c.endDate),
      c.internalLoyaltyCustomerId,
    ]);

    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "customers.csv");
  };

  const handleExportExcel = () => {
    if (!customers.length) return alert("No customers to export");

    const worksheet = XLSX.utils.json_to_sheet(
      customers.map((c) => ({
        ID: c.id,
        CurrentRank: c.currentRank,
        DisplayID: c.displayId,
        Name: c.name,
        Phone: c.phone,
        Email: c.email,
        SignUpDate: formatDate(c.signUpDate),
        EarnedPoints: c.earnedPoints,
        TotalVisits: c.totalVisits,
        TotalSpend: c.totalSpend,
        LastPurchaseDate: formatDate(c.lastPurchaseDate),
        IsEmployee: c.isEmployee ? "Yes" : "No",
        StartDate: formatDate(c.startDate),
        EndDate: formatDate(c.endDate),
        InternalLoyaltyCustomerId: c.internalLoyaltyCustomerId,
      }))
    );

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
    setEditingCustomer({
      id: c.id,
      currentRank: c.currentRank ?? "",
      displayId: c.displayId ?? "",
      name: c.name ?? "",
      phone: c.phone ?? "",
      email: c.email ?? "",
      signUpDate: formatDate(c.signUpDate) || "",
      earnedPoints: c.earnedPoints ?? 0,
      totalVisits: c.totalVisits ?? 0,
      totalSpend: c.totalSpend ?? 0,
      lastPurchaseDate: formatDate(c.lastPurchaseDate) || "",
      isEmployee: !!c.isEmployee,
      startDate: formatDate(c.startDate) || "",
      endDate: formatDate(c.endDate) || "",
      internalLoyaltyCustomerId: c.internalLoyaltyCustomerId ?? "",
      password: "", // optional
    });
    setShowModal(true);
  };

  const handleUpdateSave = async () => {
    if (!editingCustomer) return;
    setSaving(true);

    // Build payload — include all fields your backend expects.
    const payload = {
      displayId: editingCustomer.displayId || null,
      currentRank: editingCustomer.currentRank || null,
      name: editingCustomer.name || null,
      phone: editingCustomer.phone || null,
      email: editingCustomer.email || null,
      signUpDate: editingCustomer.signUpDate || null, // format yyyy-mm-dd
      earnedPoints: Number(editingCustomer.earnedPoints) || 0,
      totalVisits: Number(editingCustomer.totalVisits) || 0,
      totalSpend: Number(editingCustomer.totalSpend) || 0.0,
      lastPurchaseDate: editingCustomer.lastPurchaseDate || null,
      isEmployee: !!editingCustomer.isEmployee,
      startDate: editingCustomer.startDate || null,
      endDate: editingCustomer.endDate || null,
      internalLoyaltyCustomerId: editingCustomer.internalLoyaltyCustomerId || null,
      // send password only if provided
      ...(editingCustomer.password ? { password: editingCustomer.password } : {}),
    };

    try {
      const res = await api.updateCustomer(editingCustomer.id, payload);
      // backend returns { message, data } or data directly. Normalize:
      const updated = res.data ?? res;
      // update table row
      setCustomers((prev) => prev.map((r) => (r.id === editingCustomer.id ? updated : r)));
      setShowModal(false);
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update customer: " + (err.message ?? err));
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
    <div className="container mx-auto py-10">
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

      {/* Edit Modal */}
      {showModal && editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
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
