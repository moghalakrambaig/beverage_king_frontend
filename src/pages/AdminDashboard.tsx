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

import {api} from "@/lib/api.ts";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [customers, setCustomers] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // =============================
  // FETCH CUSTOMERS ON LOAD
  // =============================
  useEffect(() => {
    const loadData = async () => {
      const logged = sessionStorage.getItem("email");
      if (!logged) {
        navigate("/login");
        return;
      }

      try {
        const data = await api.getCustomers();

        if (Array.isArray(data) && data.length > 0) {
          setCustomers(data);

          if (data[0].dynamicFields) {
            setColumns(Object.keys(data[0].dynamicFields));
          }
        } else {
          setError("Invalid data from server.");
        }
      } catch (e) {
        console.error(e);
        setError("Failed to fetch customers.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  // =============================
  // UPLOAD CSV
  // =============================
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const response = await api.uploadCsv(file);
      const data = response.data ?? response;

      if (Array.isArray(data) && data.length > 0) {
        setCustomers(data);
        setColumns(Object.keys(data[0].dynamicFields));
      }
    } catch (err) {
      console.error(err);
      alert("CSV upload failed");
    }
  };

  // =============================
  // DELETE
  // =============================
  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this customer?")) return;

    try {
      await api.deleteCustomer(id);
      setCustomers(customers.filter((c) => (c.id ?? c._id) !== id));
    } catch (err) {
      alert("Failed to delete customer");
    }
  };

  // =============================
  // EDIT
  // =============================
  const openEditModal = (customer: any) => {
    setEditingCustomer(JSON.parse(JSON.stringify(customer)));
    setIsEditModalOpen(true);
  };

  const saveEdit = async () => {
    if (!editingCustomer) return;

    const id = editingCustomer.id ?? editingCustomer._id;

    try {
      const updated = await api.updateCustomer(id, editingCustomer);
      setCustomers(customers.map((c) => ((c.id ?? c._id) === id ? updated : c)));
      setIsEditModalOpen(false);
    } catch (err) {
      alert("Failed to update");
    }
  };

  // =============================
  // LOGOUT
  // =============================
  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-5 text-gray-900">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>

        <div className="flex gap-3">
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="secondary"
          >
            Upload CSV
          </Button>
          <Button variant="destructive" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white shadow rounded">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>

              {columns.map((col) => (
                <TableHead key={col}>{col}</TableHead>
              ))}

              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {customers.map((c) => (
              <TableRow key={c.id ?? c._id}>
                <TableCell>{c.id ?? c._id}</TableCell>

                {columns.map((col) => (
                  <TableCell key={col}>{c.dynamicFields?.[col] ?? ""}</TableCell>
                ))}

                <TableCell>
                  <div className="flex gap-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditModal(c)}
                    >
                      Update
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        handleDelete(c.id ?? c._id)
                      }
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

      {/* EDIT MODAL */}
      {isEditModalOpen && editingCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-5">
          <div className="bg-white p-6 rounded shadow-xl w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">Edit Customer</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(editingCustomer.dynamicFields).map(
                ([key, value]: any) => (
                  <div key={key}>
                    <label className="block text-gray-600 text-sm mb-1">
                      {key}
                    </label>
                    <input
                      className="w-full p-2 border rounded"
                      value={value}
                      onChange={(e) =>
                        setEditingCustomer({
                          ...editingCustomer,
                          dynamicFields: {
                            ...editingCustomer.dynamicFields,
                            [key]: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                )
              )}
            </div>

            <div className="flex justify-end mt-6 gap-3">
              <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveEdit}>Save Changes</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
