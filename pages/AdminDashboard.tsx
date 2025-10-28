import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { ChevronDown, AlertCircle, Loader, PlusCircle, MinusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AdminDashboard() {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ cus_name: "", mobile: "", email: "", points: 0 });
  const [updatingId, setUpdatingId] = useState<number | null>(null);
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
        console.log("Fetched data:", data);
        if (Array.isArray(data)) {
          setCustomers(data);
        } else {
          console.error("Fetched data is not an array:", data);
          setError("Received invalid data format from server.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load customers. Are you logged in?");
        // Optional: navigate to login after a delay
        // setTimeout(() => navigate("/login"), 5000);
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

  const handleAdjustPoints = (customerId: number, delta: number) => {
    const cust = customers.find((c) => c.id === customerId);
    if (!cust) return;
    const newPoints = Math.max(0, (cust.points || 0) + delta);
    
    // Only update the UI, don't make API call
    setCustomers((curr) => curr.map((c) =>
      c.id === customerId ? { ...c, points: newPoints } : c
    ));
  };

  const handleExportCSV = () => {
    if (!customers.length) return alert("No customers to export");
    const headers = ["ID", "Name", "Mobile", "Email", "Points"];
    const rows = customers.map((c) => [c.id, c.cus_name, c.mobile, c.email, c.points]);
    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "customers.csv");
  };

  const handleExportExcel = () => {
    if (!customers.length) return alert("No customers to export");
    const worksheet = XLSX.utils.json_to_sheet(
      customers.map((c) => ({ ID: c.id, Name: c.cus_name, Mobile: c.mobile, Email: c.email, Points: c.points }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "customers.xlsx");
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen flex-col">
        <Loader className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading customers...</p>
      </div>
    );
  }

  // Error State
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
        <div className="flex gap-2 items-center">
          <Button variant="outline" onClick={() => navigate("/")}>Home</Button>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
        <Button onClick={handleLogout}>Logout</Button>
      </div>

      <div className="flex justify-end mb-4 space-x-2">
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
        <Button onClick={() => setShowAddForm((s) => !s)}>{showAddForm ? "Close" : "Add Customer"}</Button>
      </div>

      {showAddForm && (
        <div className="mb-6 p-4 border rounded-lg bg-muted/5">
          <h3 className="text-lg font-medium mb-2">Add Customer</h3>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setAdding(true);
              try {
                const created = await api.addCustomer(newCustomer);
                // server may return created customer; if not, optimistically append
                setCustomers((curr) => (created?.data ? [created.data, ...curr] : [{ ...newCustomer, id: Date.now() }, ...curr]));
                setNewCustomer({ cus_name: "", mobile: "", email: "", points: 0 });
                setShowAddForm(false);
              } catch (err) {
                console.error(err);
                alert("Failed to add customer");
              } finally {
                setAdding(false);
              }
            }}
            className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end"
          >
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={newCustomer.cus_name} onChange={(e) => setNewCustomer({ ...newCustomer, cus_name: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="mobile">Mobile</Label>
              <Input id="mobile" value={newCustomer.mobile} onChange={(e) => setNewCustomer({ ...newCustomer, mobile: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={newCustomer.email} onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="points">Points</Label>
              <Input id="points" type="number" min={0} value={newCustomer.points} onChange={(e) => setNewCustomer({ ...newCustomer, points: Number(e.target.value) })} />
            </div>
            <div className="md:col-span-4">
              <Button type="submit" disabled={adding}>{adding ? "Adding..." : "Create Customer"}</Button>
            </div>
          </form>
        </div>
      )}

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
              <TableHead>Name</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>{customer.id}</TableCell>
                <TableCell>{customer.cus_name}</TableCell>
                <TableCell>{customer.mobile}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="ghost" onClick={() => handleAdjustPoints(customer.id, -1)} disabled={updatingId === customer.id}>
                      <MinusCircle className="h-4 w-4" />
                    </Button>
                    <span className="font-medium">{customer.points ?? 0}</span>
                    <Button size="sm" variant="ghost" onClick={() => handleAdjustPoints(customer.id, 1)} disabled={updatingId === customer.id}>
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mr-2"
                    onClick={async () => {
                      setUpdatingId(customer.id);
                      try {
                        const response = await api.updateCustomer(customer.id, customer);
                        if (response?.data) {
                          setCustomers((curr) => curr.map((c) =>
                            c.id === customer.id ? response.data : c
                          ));
                        }
                        toast({
                          title: "Customer Updated",
                          description: `${customer.cus_name}'s information has been updated.`,
                          variant: "default"
                        });
                      } catch (error) {
                        console.error(error);
                        // Revert to original data from server
                        const originalData = await api.getCustomers();
                        setCustomers(originalData);
                        toast({
                          title: "Update Failed",
                          description: "Failed to update customer information.",
                          variant: "destructive"
                        });
                      } finally {
                        setUpdatingId(null);
                      }
                    }}
                    disabled={updatingId === customer.id}
                  >
                    Update
                  </Button>
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