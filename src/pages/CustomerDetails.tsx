import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface Customer {
  id: number;
  displayId?: string;
  name: string;
  phone?: string;
  email: string;
  signUpDate?: string;
  earnedPoints?: number;
  totalVisits?: number;
  totalSpend?: number;
  lastPurchaseDate?: string;
  isEmployee?: boolean;
  startDate?: string;
  endDate?: string;
  internalLoyaltyCustomerId?: string;
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
      const updatePayload = { ...customer };
      if (!customer.password) delete updatePayload.password;
      const updated = await api.updateCustomer(customer.id, updatePayload);
      setCustomer(updated.data);
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
      <div className="space-y-4">
        <div>
          <Label htmlFor="displayId">Display ID</Label>
          <Input
            id="displayId"
            value={customer.displayId || ""}
            onChange={(e) => setCustomer({ ...customer, displayId: e.target.value })}
            disabled={!editing}
          />
        </div>

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

        <div>
          <Label htmlFor="signUpDate">Sign Up Date</Label>
          <Input id="signUpDate" value={customer.signUpDate || ""} disabled />
        </div>

        <div>
          <Label htmlFor="earnedPoints">Earned Points</Label>
          <Input
            id="earnedPoints"
            type="number"
            value={customer.earnedPoints || 0}
            onChange={(e) => setCustomer({ ...customer, earnedPoints: parseInt(e.target.value) })}
            disabled={!editing}
          />
        </div>

        <div>
          <Label htmlFor="totalVisits">Total Visits</Label>
          <Input
            id="totalVisits"
            type="number"
            value={customer.totalVisits || 0}
            onChange={(e) => setCustomer({ ...customer, totalVisits: parseInt(e.target.value) })}
            disabled={!editing}
          />
        </div>

        <div>
          <Label htmlFor="totalSpend">Total Spend</Label>
          <Input
            id="totalSpend"
            type="number"
            value={customer.totalSpend || 0}
            onChange={(e) => setCustomer({ ...customer, totalSpend: parseFloat(e.target.value) })}
            disabled={!editing}
          />
        </div>

        <div>
          <Label htmlFor="lastPurchaseDate">Last Purchase Date</Label>
          <Input
            id="lastPurchaseDate"
            type="date"
            value={customer.lastPurchaseDate || ""}
            onChange={(e) => setCustomer({ ...customer, lastPurchaseDate: e.target.value })}
            disabled={!editing}
          />
        </div>

        <div>
          <Label htmlFor="isEmployee">Is Employee</Label>
          <Input
            id="isEmployee"
            type="checkbox"
            checked={customer.isEmployee || false}
            onChange={(e) => setCustomer({ ...customer, isEmployee: e.target.checked })}
            disabled={!editing}
          />
        </div>

        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={customer.startDate || ""}
            onChange={(e) => setCustomer({ ...customer, startDate: e.target.value })}
            disabled={!editing}
          />
        </div>

        <div>
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            value={customer.endDate || ""}
            onChange={(e) => setCustomer({ ...customer, endDate: e.target.value })}
            disabled={!editing}
          />
        </div>

        <div>
          <Label htmlFor="internalLoyaltyCustomerId">Internal Loyalty Customer ID</Label>
          <Input
            id="internalLoyaltyCustomerId"
            value={customer.internalLoyaltyCustomerId || ""}
            onChange={(e) => setCustomer({ ...customer, internalLoyaltyCustomerId: e.target.value })}
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