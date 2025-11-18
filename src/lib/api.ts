const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://beveragekingbackend-production.up.railway.app";

export const api = {
  // =========================
  // CUSTOMER APIs
  // =========================

  // 🟢 SIGN UP
  signup: async (
    name: string,
    email: string,
    password: string,
    phone: string,
    isEmployee: boolean = false
  ) => {
    const response = await fetch(`${BASE_URL}/api/customers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, phone, isEmployee }),
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
    const response = await fetch(`${BASE_URL}/api/auth/customer-login`, {
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
  // PASSWORD RESET
  // =========================

  /** 🔵 SEND RESET PASSWORD LINK */
  forgotPassword: async (email: string) => {
    const response = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
      credentials: "include",
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || "Failed to send reset link");
    }

    return response.json();
  },

  /** 🔵 RESET PASSWORD USING TOKEN */
  resetPassword: async (token: string, newPassword: string) => {
    const response = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
      credentials: "include",
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || "Failed to reset password");
    }

    return response.json();
  },

  // =========================
  // CUSTOMER CRUD
  // =========================

  getCustomers: async () => {
    const response = await fetch(`${BASE_URL}/api/customers`, {
      credentials: "include",
    });
    if (!response.ok) throw new Error(`Failed to fetch customers (${response.status})`);
    const jsonResponse = await response.json().catch(() => []);
    return jsonResponse.data || jsonResponse;
  },

  getCustomerById: async (id: string) => {
    const response = await fetch(`${BASE_URL}/api/customers/${id}`, {
      credentials: "include",
    });
    if (!response.ok) throw new Error(`Failed to fetch customer (${response.status})`);
    const jsonResponse = await response.json();
    return jsonResponse.data;
  },

  addCustomer: async (customer: any) => {
    const payload = {
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      password: customer.password,
      isEmployee: customer.isEmployee || false,
      displayId: customer.displayId,
      startDate: customer.startDate,
      endDate: customer.endDate,
      earnedPoints: customer.earnedPoints,
      totalVisits: customer.totalVisits,
      totalSpend: customer.totalSpend,
      lastPurchaseDate: customer.lastPurchaseDate,
      internalLoyaltyCustomerId: customer.internalLoyaltyCustomerId,
      signUpDate: customer.signUpDate,
    };

    const response = await fetch(`${BASE_URL}/api/customers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || "Failed to add customer");
    }

    return response.json();
  },

  updateCustomer: async (id: number, customer: any) => {
    const payload: any = {};
    const allowedFields = [
      "name",
      "email",
      "phone",
      "password",
      "isEmployee",
      "displayId",
      "startDate",
      "endDate",
      "earnedPoints",
      "totalVisits",
      "totalSpend",
      "lastPurchaseDate",
      "internalLoyaltyCustomerId",
      "signUpDate",
      "currentRank",
    ];

    for (const key of allowedFields) {
      if (customer[key] !== undefined && customer[key] !== null) {
        payload[key] = customer[key];
      }
    }

    const response = await fetch(`${BASE_URL}/api/customers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
    });

    let data: any;
    try {
      data = await response.json();
    } catch {
      data = await response.text();
    }

    if (!response.ok) {
      throw new Error(
        typeof data === "object" ? data.message || "Failed to update customer" : data
      );
    }

    return typeof data === "object"
      ? data
      : { message: data || "Customer updated successfully", success: true };
  },

  deleteCustomer: async (id: number) => {
    const response = await fetch(`${BASE_URL}/api/customers/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!response.ok) throw new Error(`Failed to delete customer (${response.status})`);
    return { message: "Customer deleted successfully." };
  },

  deleteAllCustomers: async () => {
    const response = await fetch(`${BASE_URL}/api/customers`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!response.ok) throw new Error(`Failed to delete all customers (${response.status})`);
    return { message: "All customers deleted successfully." };
  },

  uploadCsv: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${BASE_URL}/api/customers/upload-csv`, {
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
  // ADMIN LOGIN
  // =========================

  adminLogin: async (email: string, password: string) => {
    const response = await fetch(`${BASE_URL}/api/auth/signin`, {
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
};
