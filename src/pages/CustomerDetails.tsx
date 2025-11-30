import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface Customer {
  id: number;
  name: string;
  phone?: string;
  email: string;
  password?: string;
}

const CustomerDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCustomer = async () => {
      setLoading(true);
      try {
        if (!id) return;
        const cust = await api.getCustomerById(id);
        if (cust) {
          setCustomer(cust);
        } else {
          toast({ title: "Error", description: "Customer not found", variant: "destructive" });
        }
      } catch (err: any) {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchCustomer();
  }, [id, toast]);

  const handleUpdate = async () => {
    if (!customer) return;
    setLoading(true);
    try {
      // Only send core editable profile fields
      const updatePayload: any = {
        name: customer.name || null,
        phone: customer.phone || null,
        email: customer.email || null,
      };
      if (customer.password) updatePayload.password = customer.password;

      const updated = await api.updateCustomer(customer.id, updatePayload);
      setCustomer(updated.data ?? updated);
      toast({ title: "Success", description: "Customer updated successfully." });
      setEditing(false);
    } catch (err: any) {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen flex-col">
        <p className="mt-4 text-muted-foreground">loading please wait</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex items-center justify-center min-h-screen flex-col">
        <p className="mt-4 text-muted-foreground">Customer not found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h2 className="text-2xl font-bold mb-4">Customer Details</h2>
      <div className="space-y-6">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={customer.name}
            onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
            disabled={!editing}
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={customer.phone || ""}
            onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
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

        {/* removed signup/points/visits/spend/lastPurchase fields per request */}

        {/* removed isEmployee, internal loyalty id and other admin fields per request */}

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
            <Button onClick={handleUpdate} disabled={loading} className="w-full">
              {loading ? "Updating..." : "Save Changes"}
            </Button>
            <Button variant="outline" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button onClick={() => setEditing(true)} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-lg rounded-xl">
            Edit Profile
          </Button>
        )}
      </div>
    </div>

  );
};

export default CustomerDetails; 