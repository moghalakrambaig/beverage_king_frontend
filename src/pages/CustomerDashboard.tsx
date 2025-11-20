import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

interface Customer {
  id: number;
  name: string;
  email: string;
  earnedPoints: number;
  phone?: string;
}

interface Deal {
  id: number;
  title: string;
  description: string;
  discount: string;
}

const CustomerDashboard = () => {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        if (!id) return;
        const res = await api.getCustomerById(id);
        setCustomer(res);

        // Example: Fetch exclusive deals (replace with real API if exists)
        const dealsRes = [
  { 
    id: 1, 
    title: "Bourbon Bliss 10% Off", 
    description: "Savor your favorite bourbons with a 10% discount this week only!", 
    discount: "10%" 
  },
  { 
    id: 2, 
    title: "Double Barrel Offer", 
    description: "Buy a bottle of select bourbon and get a second one on the house.", 
    discount: "B1G1" 
  },
  { 
    id: 3, 
    title: "Smooth Delivery", 
    description: "Get free shipping on bourbon orders above $100 – enjoy the pour at home!", 
    discount: "Free Delivery" 
  }
];

        setDeals(dealsRes);
      } catch (err) {
        console.error(err);
        navigate("/"); // fallback if customer not found
      }
    };

    fetchCustomer();
  }, [id]);

  if (!customer)
    return <p className="p-8 text-center text-yellow-400 font-semibold">Loading...</p>;

  return (
    <div className="min-h-screen bg-black p-8 text-yellow-400">
      {/* Welcome Section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-yellow-400 mb-2">
          Welcome, {customer.name}!
        </h1>
        <p className="text-yellow-300 text-lg">
          Here’s your account overview
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
        {/* Points Card */}
        <div className="bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 text-black rounded-3xl shadow-lg p-8 flex flex-col items-center justify-center">
          <h2 className="text-2xl font-semibold mb-2">Total Points</h2>
          <p className="text-5xl font-bold">{customer.earnedPoints}</p>
          <p className="mt-2 font-medium">Points earned so far</p>
        </div>

        {/* Customer Details Card */}
        <div className="bg-gray-900 text-yellow-400 rounded-3xl shadow-lg p-8 border border-yellow-600">
          <h2 className="text-2xl font-semibold mb-4">Your Details</h2>
          <p className="mb-2">
            <strong>Name:</strong> {customer.name}
          </p>
          <p className="mb-2">
            <strong>Email:</strong> {customer.email}
          </p>
          <p className="mb-2">
            <strong>Mobile:</strong> {customer.phone || "N/A"}
          </p>
        </div>
      </div>

      {/* Exclusive Deals Section */}
      <div className="max-w-4xl mx-auto mt-12">
        <h2 className="text-3xl font-bold text-yellow-400 mb-4 text-center">Exclusive Deals</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {deals.map((deal) => (
            <div key={deal.id} className="bg-gray-800 text-yellow-300 p-6 rounded-2xl shadow-lg border border-yellow-600 flex flex-col justify-between">
              <h3 className="text-xl font-semibold mb-2">{deal.title}</h3>
              <p className="mb-2">{deal.description}</p>
              <span className="font-bold text-yellow-400">{deal.discount}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Logout Button */}
      <div className="max-w-md mx-auto mt-12">
        <Button
          className="w-full py-3 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 text-black font-semibold rounded-3xl shadow-lg hover:from-yellow-400 hover:to-yellow-600"
          onClick={() => {
            sessionStorage.removeItem("user");
            navigate("/");
          }}
        >
          Log Out
        </Button>
      </div>
    </div>
  );
};

export default CustomerDashboard;
