const BASE_URL = "http://localhost:8083/api";

export const api = {
  // =========================
  // CUSTOMER APIs
  // =========================

  // 🟢 SIGN UP
  signup: async (username: string, email: string, password: string, mobile: string) => {
    const response = await fetch(`${BASE_URL}/customers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cus_name: username, email, password, mobile }),
      credentials: "include",
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || `Failed to sign up (${response.status})`);
    }

    return response.json();
  },

  // 🟢 CUSTOMER LOGIN
  login: async (email: string, password: string) => {
    const response = await fetch(`${BASE_URL}/auth/customer-login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      credentials: "include",
      body: new URLSearchParams({ email, password }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || "Invalid customer credentials");
    }

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
      body: new URLSearchParams({ email, password }),
    });

    if (!response.ok) {
      throw new Error("Invalid admin credentials");
    }

    return response.json().catch(() => ({ message: "Login successful" }));
  },

  // 🟢 GET ALL CUSTOMERS
  getCustomers: async () => {
    const response = await fetch(`${BASE_URL}/customers`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch customers (${response.status})`);
    }

    const jsonResponse = await response.json().catch(() => []);
    return jsonResponse.data || jsonResponse;
  },

  // 🟢 GET CUSTOMER BY ID
  getCustomerById: async (id: string) => {
    const response = await fetch(`${BASE_URL}/customers/${id}`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch customer (${response.status})`);
    }

    const jsonResponse = await response.json();
    return jsonResponse.data;
  },

  // 🟢 ADD CUSTOMER
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

  // 🟢 UPDATE CUSTOMER
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

  // 🟢 DELETE SINGLE CUSTOMER
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

  // 🟢 UPLOAD CSV
  uploadCsv: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${BASE_URL}/customers/upload-csv`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    let data: any;
    try {
      data = await response.json();
    } catch {
      data = await response.text();
    }

    console.log("📦 CSV Upload Response:", data);

    if (!response.ok) {
      throw new Error(
        (typeof data === "object" ? data.message : data) || "Failed to upload CSV"
      );
    }

    return typeof data === "object"
      ? data
      : { message: data || "Upload successful", success: true };
  },

  // =========================
  // PASSWORD RESET
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
