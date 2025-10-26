const BASE_URL = "http://localhost:8083/api";

export const api = {
  // =========================
  // CUSTOMER APIs
  // =========================

  // 🟢 SIGN UP (no authentication required)
  signup: async (username: string, email: string, password: string) => {
    const response = await fetch(`${BASE_URL}/customers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cus_name: username, email, password }),
      credentials: "include",
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || `Failed to sign up (${response.status})`);
    }

    return response.json();
  },

  // 🟢 CUSTOMER LOGIN (if you want separate login for customers)
  login: async (email: string, password: string) => {
  const response = await fetch(`${BASE_URL}/auth/customer-login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    credentials: "include",
    body: new URLSearchParams({ email, password }),
  });

  // Handle failure
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "Invalid customer credentials");
  }

  // Only return data on success
  return response.json();
},



  // =========================
  // ADMIN APIs
  // =========================

  // 🟢 ADMIN LOGIN
  adminLogin: async (email: string, password: string) => {
    const response = await fetch(`${BASE_URL}/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      credentials: "include",
      body: new URLSearchParams({ email, password }), // must match SecurityConfig usernameParameter/passwordParameter
    });

    if (!response.ok) {
      throw new Error("Invalid admin credentials");
    }

    return response.json().catch(() => ({ message: "Login successful" }));
  },

  // 🟢 GET ALL CUSTOMERS (admin only, session-based)
  getCustomers: async () => {
    const response = await fetch(`${BASE_URL}/customers`, {
      credentials: "include", // session cookie handles auth
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch customers (${response.status})`);
    }

    const jsonResponse = await response.json();
    return jsonResponse.data;
  },

  // 🟢 ADD CUSTOMER (admin only)
  addCustomer: async (customer: any) => {
    const response = await fetch(`${BASE_URL}/customers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(customer),
      credentials: "include",
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || "Failed to add customer");
    }

    return response.json();
  },

  // 🟢 UPDATE CUSTOMER (admin only)
  updateCustomer: async (id: number, customer: any) => {
    const response = await fetch(`${BASE_URL}/customers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(customer),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to update customer (${response.status})`);
    }

    return response.json();
  },

  // 🟢 DELETE CUSTOMER (admin only)
  deleteCustomer: async (id: number) => {
    const response = await fetch(`${BASE_URL}/customers/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to delete customer (${response.status})`);
    }

    return { message: "Customer deleted successfully." };
  },

  // =========================
  // PASSWORD RESET (optional)
  // =========================

  forgotPassword: async (email: string) => {
    const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
      credentials: "include",
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || "Failed to send reset link");
    }

    return response.json().catch(() => ({
      message: "Reset link sent (check backend logs if no email).",
    }));
  },

  resetPassword: async (token: string, newPassword: string) => {
    const response = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
      credentials: "include",
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || "Failed to reset password");
    }

    return response.json().catch(() => ({
      message: "Password reset successfully.",
    }));
  },
};
