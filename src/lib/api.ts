const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const api = {
  // ==============================
  // CUSTOMER APIs
  // ==============================

  getCustomers: async () => {
    const response = await fetch(`${BASE_URL}/api/customers`, {
      credentials: "include",
    });

    if (!response.ok)
      throw new Error(`Failed to fetch customers (${response.status})`);

    const json = await response.json().catch(() => []);
    return json.data || json;
  },

  getCustomerById: async (id: string) => {
    const response = await fetch(`${BASE_URL}/api/customers/${id}`, {
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to fetch customer");
    const json = await response.json();
    return json.data || json;
  },

  addCustomer: async (customer: any) => {
    const payload = {
      dynamicFields: customer.dynamicFields,
      password: customer.password,
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

  updateCustomer: async (id: string, customer: any) => {
    const payload: any = {
      dynamicFields: customer.dynamicFields,
    };

    // Only include password when it exists (for special password update flow)
    if (customer.password) {
      payload.password = customer.password;
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
        typeof data === "object"
          ? data.message || "Failed to update customer"
          : data
      );
    }

    return data;
  },

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

    if (!response.ok) throw new Error("Failed to delete all customers");
    return { message: "All customers deleted successfully" };
  },

  uploadCsv: async (file: File): Promise<Array<{ id: string; dynamicFields: Record<string, string> }>> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${BASE_URL}/api/customers/upload-csv`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    const resJson = await response.json();

    if (!response.ok) {
      throw new Error(resJson?.message || "Failed to upload CSV");
    }

    // ✅ Ensure we always return an array, even if empty
    return Array.isArray(resJson?.data) ? resJson.data : [];
  },



  // ==============================
  // ADMIN APIs
  // ==============================
  adminLogin: async (email: string, password: string) => {
    const response = await fetch(`${BASE_URL}/api/auth/admin-login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      credentials: "include",
      body: new URLSearchParams({ email, password }),
    });

    if (!response.ok) throw new Error("Invalid admin credentials");
    return response.json().catch(() => ({ message: "Login successful" }));
  },

  // ==============================
  // CUSTOMER LOGIN / SIGNUP
  // ==============================
  login: async (email: string, password: string) => {
    const response = await fetch(`${BASE_URL}/api/auth/customer-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }, // 🔥 JSON
      credentials: "include",
      body: JSON.stringify({ email, password }),        // 🔥 JSON body
    });

    if (!response.ok) {
      const errorText = await response.text();
      let message = "Invalid customer login";
      try {
        const data = JSON.parse(errorText);
        message = data.message || message;
      } catch { }
      throw new Error(message);
    }

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
      body: JSON.stringify({ name, email, phone, password, isEmployee }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || "Signup failed");
    }

    return response.json();
  },

  // ==============================
  // PASSWORD RESET
  // ==============================
  forgotPassword: async (email: string) => {
    const response = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) throw new Error("Failed to send reset link");
    return response.json();
  },

  resetPassword: async (token: string, newPassword: string) => {
    const response = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to reset password");
    return response.json();
  },
};
