import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [message, setMessage] = useState("");

  const handleSignup = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          password, 
          mobile,
          cus_name: email.split('@')[0], // Default name from email
          points: 0 // Initialize points to 0
        }),
      });

      if (response.ok) {
        setMessage("Signup successful!");
      } else {
        const error = await response.text();
        setMessage(error);
      }
    } catch (err) {
      setMessage("Signup failed");
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-yellow-50">
      <div className="p-6 bg-white rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-yellow-800 mb-4">Sign Up</h2>
        <Label>Email</Label>
        <Input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-3"
        />
        <Label>Password</Label>
        <Input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-3"
        />
        <Label>Mobile Number</Label>
        <Input
          type="tel"
          placeholder="Enter mobile number"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          className="mb-3"
          pattern="[0-9]*"
        />
        <Button onClick={handleSignup} className="w-full bg-yellow-500">
          Sign Up
        </Button>
        {message && <p className="mt-3 text-sm text-center">{message}</p>}
      </div>
    </div>
  );
}
