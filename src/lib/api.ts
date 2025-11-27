const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const api = {
  // ==============================
  // GET ALL CUSTOMERS
  // ==============================
  getCustomers: async () => {
    const response = await fetch(`${BASE_URL}/api/customers`, {
      credentials: "include",
    });

    if (!response.ok)
      throw new Error(`Failed to fetch customers (${response.status})`);

    const json = await response.json().catch(() => []);
    return json.data || json; // Support both response formats
  },

  // ==============================
  // GET CUSTOMER BY ID
  // ==============================
  getCustomerById: async (id: string) => {
    const response = await fetch(`${BASE_URL}/api/customers/${id}`, {
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to fetch customer");
    const json = await response.json();
    return json.data || json;
  },

  // ==============================
  // UPDATE CUSTOMER (DYNAMIC)
  // ==============================
  updateCustomer: async (id: string, customer: any) => {
    const payload = {
      dynamicFields: customer.dynamicFields, // send only dynamic fields
      password: customer.password || undefined,
    };

    const response = await fetch(`${BASE_URL}/api/customers/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) throw new Error(data.message || "Failed to update");

    return data;
  },

  // ==============================
  // DELETE CUSTOMER
  // ==============================
  deleteCustomer: async (id: string) => {
    const response = await fetch(`${BASE_URL}/api/customers/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to delete customer");

    return { message: "Deleted successfully" };
  },

  deleteAllCustomers: async () => {
    const response = await fetch(`${BASE_URL}/api/customers`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to delete all");

    return { message: "All customers deleted" };
  },

  // ==============================
  // UPLOAD CSV (DYNAMIC)
  // ==============================
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

    if (!response.ok)
      throw new Error(
        (typeof data === "object" ? data.message : data) ||
          "Failed to upload CSV"
      );

    return data; // customers array with dynamicFields
  },

  // ==============================
  // LOGIN / SIGNUP
  // ==============================
  login: async (email: string, password: string) => {
    const response = await fetch(`${BASE_URL}/api/auth/customer-login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      credentials: "include",
      body: new URLSearchParams({ email, password }),
    });

    if (!response.ok) throw new Error("Invalid customer login");

    return response.json();
  },

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
      credentials: "include",
      body: JSON.stringify({
        name,
        email,
        phone,
        password,
        isEmployee,
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || "Signup failed");
    }

    return response.json();
  },

  // ==============================
  // ADMIN LOGIN
  // ==============================
  adminLogin: async (email: string, password: string) => {
    const response = await fetch(`${BASE_URL}/api/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      credentials: "include",
      body: new URLSearchParams({ email, password }),
    });

    if (!response.ok) throw new Error("Invalid admin login");

    return response.json().catch(() => ({ message: "Login OK" }));
  },

  // ==============================
  // PASSWORD RESET
  // ==============================
  forgotPassword: async (email: string) => {
    const response = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email }),
    });

    if (!response.ok)
      throw new Error("Failed to send password reset email");

    return response.json();
  },

  resetPassword: async (token: string, newPassword: string) => {
    const response = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ token, newPassword }),
    });

    if (!response.ok) throw new Error("Password reset failed");

    return response.json();
  },
};
