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
    if (!file) {
      console.warn("No file selected");
      return;
    }

    console.log("📤 Uploading file:", file.name, "Size:", file.size, "Type:", file.type);

    try {
      const response = await api.uploadCsv(file);
      console.log("✅ Upload successful, full response:", response);
      console.log("📊 Response type:", typeof response);
      console.log("📊 Response constructor:", response?.constructor?.name);
      console.log("📊 Response JSON:", JSON.stringify(response, null, 2));
      
      // Try multiple possible response structures
      let customersArray: any[] = [];
      let foundIn: string = "unknown";
      
      // Structure 1: response.data is array
      if (Array.isArray(response?.data)) {
        customersArray = response.data;
        foundIn = "response.data";
      }
      // Structure 2: response itself is array
      else if (Array.isArray(response)) {
        customersArray = response;
        foundIn = "response (direct array)";
      }
      // Structure 3: response.customers is array
      else if (Array.isArray(response?.customers)) {
        customersArray = response.customers;
        foundIn = "response.customers";
      }
      // Structure 4: response.result is array
      else if (Array.isArray(response?.result)) {
        customersArray = response.result;
        foundIn = "response.result";
      }
      // Structure 5: response.rows is array
      else if (Array.isArray(response?.rows)) {
        customersArray = response.rows;
        foundIn = "response.rows";
      }
      // Structure 6: response.body is array (sometimes wrapped)
      else if (Array.isArray(response?.body)) {
        customersArray = response.body;
        foundIn = "response.body";
      }
      // Structure 7: Deep search - check all top-level arrays
      else {
        for (const [key, value] of Object.entries(response || {})) {
          if (Array.isArray(value) && value.length > 0) {
            // Check if it looks like customer data (has id or email)
            if (value[0]?.id || value[0]?.email || value[0]?.name) {
              customersArray = value;
              foundIn = `response.${key}`;
              break;
            }
          }
        }
      }
      
      console.log(`📈 Total customers found from API: ${customersArray.length} (in: ${foundIn})`);
      
      // Fallback: If no customers found, try parsing CSV client-side
      if (customersArray.length === 0) {
        console.warn("⚠️ No customers from API response, attempting client-side CSV parsing...");
        customersArray = await parseCSVClientSide(file);
        foundIn = "client-side CSV parse (fallback)";
        console.log(`📈 Total customers from client-side parse: ${customersArray.length}`);
      }
      
      if (customersArray.length > 0) {
        console.log("✅ Sample customer data:", customersArray[0]);
        console.log("📋 Sample raw keys:", Object.keys(customersArray[0]));
        console.log("🔍 DETAILED FIRST ROW INSPECTION:");
        const firstRow = customersArray[0];
        for (const [key, value] of Object.entries(firstRow)) {
          console.log(`   "${key}": "${value}" (type: ${typeof value})`);
        }
        
        const sanitized = customersArray.map((c: any, idx: number) => {
          if (idx === 0) {
            console.log(`\n🔄 DETAILED PROCESSING ROW 0:`);
            console.log(`Raw object:`, JSON.stringify(c, null, 2));
          }
          
          // Helper: normalize key (lowercase, remove spaces/underscores)
          const normalize = (key: string) => key?.toLowerCase?.()?.replace(/[\s_-]/g, "") || "";
          
          // Create normalized lookup for all possible variations
          const lookup: { [key: string]: any } = {};
          for (const [key, value] of Object.entries(c || {})) {
            const normalized = normalize(key);
            lookup[normalized] = value;
            if (idx === 0) {
              console.log(`   Normalize "${key}" -> "${normalized}" = "${value}"`);
            }
          }
          
          // Map common field variations
          const processed = {
            // Required identifiers
            id: c.id ?? lookup.id ?? idx,
            
            // Rank & Display
            currentRank: c.currentRank ?? lookup.currentrank ?? lookup.rank ?? "",
            displayId: c.displayId ?? lookup.displayid ?? "",
            
            // Customer Info
            name: c.name ?? lookup.name ?? lookup.cusname ?? lookup.username ?? lookup.customername ?? "",
            phone: c.phone ?? lookup.phone ?? lookup.mobile ?? lookup.phoneno ?? lookup.phonenumber ?? "",
            email: c.email ?? lookup.email ?? lookup.emailaddress ?? "",
            
            // Dates
            signUpDate: c.signUpDate ?? lookup.signupdate ?? lookup.createddate ?? lookup.registrationdate ?? "",
            lastPurchaseDate: c.lastPurchaseDate ?? lookup.lastpurchasedate ?? lookup.lastvisitdate ?? "",
            startDate: c.startDate ?? lookup.startdate ?? "",
            endDate: c.endDate ?? lookup.enddate ?? "",
            
            // Points & Visits
            earnedPoints: (() => {
              const v = c.earnedPoints ?? lookup.earnedpoints ?? lookup.points ?? lookup.pointsearned ?? 0;
              const num = parseInt(String(v));
              return isNaN(num) ? 0 : num;
            })(),
            totalVisits: (() => {
              const v = c.totalVisits ?? lookup.totalvisits ?? lookup.visits ?? lookup.visitcount ?? 0;
              const num = parseInt(String(v));
              return isNaN(num) ? 0 : num;
            })(),
            totalSpend: (() => {
              const v = c.totalSpend ?? lookup.totalspend ?? lookup.spend ?? lookup.totalpurchase ?? 0;
              const num = parseFloat(String(v));
              return isNaN(num) ? 0 : num;
            })(),
            
            // Employee Flag
            isEmployee: c.isEmployee === true || 
                       c.isEmployee === "true" || 
                       c.isEmployee === "yes" ||
                       lookup.isemployee === true ||
                       lookup.isemployee === "true" ||
                       lookup.isemployee === "yes",
            
            // Internal ID
            internalLoyaltyCustomerId: c.internalLoyaltyCustomerId ?? lookup.internalloyaltycustomerid ?? lookup.loyaltyid ?? "",
          };
          
          if (idx === 0) {
            console.log(`✅ Processed row 0 (final):`, processed);
            console.log(`   Lookup mapping:`, lookup);
          }
          return processed;
        });
        
        console.log("✅ All sanitized data:", sanitized);
        setCustomers(sanitized);
        alert(`✅ Successfully uploaded ${sanitized.length} customers from ${foundIn}!`);
      } else {
        console.error("❌ No customers found in any response structure!");
        console.error("Response keys:", Object.keys(response || {}));
        console.error("Full response dump:", response);
        alert("❌ File uploaded but no customer data found.\n\nCheck browser console (F12) for details.\n\nThe backend response may be in an unexpected format.");
      }
      
      // Reset file input
      event.target.value = "";
    } catch (error: any) {
      console.error("❌ Upload failed:", error);
      console.error("Error stack:", error.stack);
      alert(`Upload failed: ${error.message || "Unknown error"}`);
      // Reset file input
      event.target.value = "";
    }
  };

  // Client-side CSV parser as fallback with better handling
  const parseCSVClientSide = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csv = e.target?.result as string;
          console.log("📄 Raw CSV content preview (first 500 chars):", csv.substring(0, 500));
          
          // Split by newline and filter empty lines
          const lines = csv
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(line => line.length > 0);
          
          console.log(`📊 Total lines in CSV: ${lines.length}`);
          
          if (lines.length < 2) {
            console.warn("⚠️ CSV has no data rows (header only or empty)");
            resolve([]);
            return;
          }

          // Parse header - handle quoted and unquoted fields
          const headerLine = lines[0];
          console.log("📋 Header line:", headerLine);
          
          const headers = parseCSVLine(headerLine).map(h => h.toLowerCase().trim());
          console.log("📋 Parsed headers:", headers);
          console.log(`   Header count: ${headers.length}`);
          headers.forEach((h, i) => console.log(`   Header[${i}]: "${h}"`));

          // Parse data rows
          const rows: any[] = [];
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            if (!line.trim()) continue; // Skip empty lines
            
            const values = parseCSVLine(line);
            console.log(`\n📊 Row ${i}: parsed ${values.length} values from line: "${line.substring(0, 100)}..."`);
            console.log(`   Values:`, values);
            
            const row: any = {};
            let hasData = false;
            
            headers.forEach((header, idx) => {
              const value = values[idx] || "";
              row[header] = value;
              
              // Log first few rows in detail
              if (i <= 2) {
                console.log(`     [${idx}] "${header}" = "${value}"`);
              }
              
              // Check if any column has actual data
              if (value.trim()) {
                hasData = true;
              }
            });
            
            // Only add rows that have at least some data
            if (hasData) {
              rows.push(row);
              if (i <= 2) console.log(`✅ Row ${i} added:`, row);
            } else {
              console.warn(`⚠️ Row ${i} skipped (empty)`);
            }
          }

          console.log(`📈 Total valid customer rows parsed: ${rows.length}`);
          if (rows.length > 0) {
            console.log("📋 First row data:", rows[0]);
            console.log("📋 All rows:", rows);
          }
          resolve(rows);
        } catch (err) {
          console.error("❌ CSV parsing error:", err);
          reject(err);
        }
      };
      reader.onerror = (err) => {
        console.error("❌ File read error:", err);
        reject(err);
      };
      reader.readAsText(file);
    });
  };

  // Helper to parse CSV line handling quoted fields
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let insideQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"') {
        // Handle escaped quotes
        if (insideQuotes && nextChar === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    
    // Debug first line parsing
    if (line.startsWith("ID") || line.toLowerCase().includes("name") || line.toLowerCase().includes("phone")) {
      console.log(`🔍 parseCSVLine debug: input="${line.substring(0, 100)}..."`);
      console.log(`   Split into ${result.length} fields:`, result);
    }
    
    return result;
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

            <Button 
              variant="destructive" 
              onClick={handleDeleteAll}
              className="ml-auto"
            >
              Delete All
            </Button>
          </div>

          {/* Content Card */}
          {customers.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-12 text-center shadow-sm">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold">No Customers Found</h3>
              <p className="text-muted-foreground mt-2">Your customer list is currently empty.</p>
              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="mt-6 bg-primary hover:bg-primary/90"
              >
                Upload Your First CSV
              </Button>
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-b border-border">
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
                      <TableRow key={customer.id} className="hover:bg-muted/50 border-b border-border/50">
                        <TableCell className="font-medium">{customer.id}</TableCell>
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
                              className="border-primary/30 hover:bg-primary/10"
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
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Edit Modal - Styled consistently */}
      {showModal && editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-xl bg-card border border-border p-8 shadow-xl">
            <h2 className="text-2xl font-extrabold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Edit Customer
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-foreground mb-2">Current Rank</label>
                <input
                  className="p-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={editingCustomer.currentRank}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, currentRank: e.target.value })}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-foreground mb-2">Display ID</label>
                <input
                  className="p-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={editingCustomer.displayId}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, displayId: e.target.value })}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-foreground mb-2">Name</label>
                <input
                  className="p-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={editingCustomer.name}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-foreground mb-2">Phone</label>
                <input
                  className="p-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={editingCustomer.phone}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-foreground mb-2">Email</label>
                <input
                  type="email"
                  className="p-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={editingCustomer.email}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-foreground mb-2">Sign Up Date</label>
                <input
                  type="date"
                  className="p-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={editingCustomer.signUpDate}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, signUpDate: e.target.value })}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-foreground mb-2">Last Purchase Date</label>
                <input
                  type="date"
                  className="p-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={editingCustomer.lastPurchaseDate}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, lastPurchaseDate: e.target.value })}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-foreground mb-2">Earned Points</label>
                <input
                  type="number"
                  className="p-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={editingCustomer.earnedPoints}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, earnedPoints: Number(e.target.value) })}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-foreground mb-2">Total Visits</label>
                <input
                  type="number"
                  className="p-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={editingCustomer.totalVisits}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, totalVisits: Number(e.target.value) })}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-foreground mb-2">Total Spend</label>
                <input
                  type="number"
                  step="0.01"
                  className="p-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={editingCustomer.totalSpend}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, totalSpend: Number(e.target.value) })}
                />
              </div>

              <div className="flex items-center gap-3 p-2">
                <input
                  type="checkbox"
                  id="isEmployee"
                  checked={!!editingCustomer.isEmployee}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, isEmployee: e.target.checked })}
                  className="w-4 h-4 rounded border-border cursor-pointer"
                />
                <label htmlFor="isEmployee" className="text-sm font-medium text-foreground cursor-pointer">
                  Is Employee
                </label>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-foreground mb-2">Start Date</label>
                <input
                  type="date"
                  className="p-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={editingCustomer.startDate}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, startDate: e.target.value })}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-foreground mb-2">End Date</label>
                <input
                  type="date"
                  className="p-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={editingCustomer.endDate}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, endDate: e.target.value })}
                />
              </div>

              <div className="flex flex-col md:col-span-2">
                <label className="text-sm font-medium text-foreground mb-2">Internal Loyalty Customer ID</label>
                <input
                  className="p-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={editingCustomer.internalLoyaltyCustomerId}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, internalLoyaltyCustomerId: e.target.value })}
                />
              </div>

              <div className="flex flex-col md:col-span-2">
                <label className="text-sm font-medium text-foreground mb-2">Password (leave blank to keep current)</label>
                <input
                  type="password"
                  className="p-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
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
