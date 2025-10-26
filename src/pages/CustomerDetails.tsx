import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface Customer {
  id: number;
  cus_name: string;
  email: string;
  mobile?: string;
  points: number;
  password?: string; // optional, only for update
}

const CustomerDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const { toast } = useToast();

  // Fetch customer on mount
  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        if (!id) return;
        const res = await api.getCustomers(); // fetch all customers
        const cust = res.data.find((c: Customer) => c.id === parseInt(id));
        if (cust) setCustomer(cust);
      } catch (err: any) {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    };
    fetchCustomer();
  }, [id]);

  // Handle update
  const handleUpdate = async () => {
    if (!customer) return;
    setLoading(true);
    try {
      const updatePayload = { ...customer };
      if (!customer.password) delete updatePayload.password; // don't send empty password
      const updated = await api.updateCustomer(customer.id, updatePayload);
      setCustomer(updated.data);
      toast({ title: "Success", description: "Customer updated successfully." });
      setEditing(false);
    } catch (err: any) {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  };

  if (!customer) return <p className="p-4">Loading customer details...</p>;

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h2 className="text-2xl font-bold mb-4">Customer Details</h2>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={customer.cus_name}
            onChange={(e) => setCustomer({ ...customer, cus_name: e.target.value })}
            disabled={!editing}
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={customer.email}
            onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
            disabled={!editing}
          />
        </div>

        <div>
          <Label htmlFor="mobile">Mobile</Label>
          <Input
            id="mobile"
            value={customer.mobile || ""}
            onChange={(e) => setCustomer({ ...customer, mobile: e.target.value })}
            disabled={!editing}
          />
        </div>

        <div>
          <Label htmlFor="password">Password (Leave blank to keep current)</Label>
          <Input
            id="password"
            type="password"
            value={customer.password || ""}
            onChange={(e) => setCustomer({ ...customer, password: e.target.value })}
            disabled={!editing}
          />
        </div>

        {editing ? (
          <div className="flex gap-2">
            <Button onClick={handleUpdate} disabled={loading}>
              {loading ? "Updating..." : "Save Changes"}
            </Button>
            <Button variant="outline" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button onClick={() => setEditing(true)}>Edit Details</Button>
        )}
      </div>
    </div>
  );
};

export default CustomerDetails;
