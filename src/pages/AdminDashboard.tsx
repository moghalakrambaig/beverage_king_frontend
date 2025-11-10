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
          // Ensure default values to avoid null issues
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
    return dateStr ? new Date(dateStr).toLocaleDateString() : "";
  };

  const handleExportCSV = () => {
    if (!customers.length) return alert("No customers to export");

    const headers = [
      "ID",
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
      if (response.data) {
        const sanitized = response.data.map((c: any) => ({
          ...c,
          earnedPoints: c.earnedPoints ?? 0,
          totalVisits: c.totalVisits ?? 0,
          totalSpend: c.totalSpend ?? 0,
          isEmployee: c.isEmployee ?? false,
        }));
        setCustomers(sanitized);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to upload CSV");
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

        <Button>Add Customer</Button>
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
                  <Button variant="outline" size="sm" className="mr-2">Update</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(customer.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

export default AdminDashboard;
