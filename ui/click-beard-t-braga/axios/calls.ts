import axios, { AxiosInstance } from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

function createAxiosInstance(
  includeCredentials: boolean = true,
): AxiosInstance {
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: includeCredentials,
  });
}

const apiInstance = createAxiosInstance(true);
const publicInstance = createAxiosInstance(false);
function handleError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const message =
      error.response?.data?.error || error.message || "Erro na requisição";
    console.error("Axios Error:", {
      message,
      status: error.response?.status,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      method: error.config?.method,
    });
    throw new Error(message);
  }
  console.error("Unknown Error:", error);
  throw error;
}

export async function register(name: string, email: string, password: string) {
  try {
    const response = await apiInstance.post("/auth/register", {
      name,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

export async function login(email: string, password: string) {
  try {
    const response = await apiInstance.post("/auth/login", {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

export async function refreshAccessToken(refreshToken: string) {
  try {
    const response = await apiInstance.post("/auth/refresh", {
      refreshToken,
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

export async function logout(refreshToken: string) {
  try {
    const response = await apiInstance.post("/auth/logout", {
      refreshToken,
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

export async function logoutAll() {
  try {
    const response = await apiInstance.post("/auth/logout-all");
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

export async function getUser(id: number) {
  try {
    const response = await apiInstance.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

export async function getAllUsers(limit = 10, offset = 0) {
  try {
    const response = await apiInstance.get("/users", {
      params: { limit, offset },
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

export async function updateUser(
  id: number,
  data: {
    Name?: string;
    email?: string;
    Role?: "USER" | "ADMIN";
  },
) {
  try {
    const response = await apiInstance.put(`/users/${id}`, data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

export async function deleteUser(id: number) {
  try {
    const response = await apiInstance.delete(`/users/${id}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

export async function getBarber(id: number) {
  try {
    const response = await apiInstance.get(`/barbers/${id}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

export async function getAllBarbers(limit = 10, offset = 0) {
  try {
    const response = await apiInstance.get("/barbers", {
      params: { limit, offset },
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

export async function createBarber(data: {
  name: string;
  bornAt: number;
  hiredAt: string;
  specialties: string[];
}) {
  try {
    const response = await apiInstance.post("/barbers", data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

export async function updateBarber(
  id: number,
  data: {
    name?: string;
    bornAt?: string;
    hiredAt?: string;
    specialties?: string[];
  },
) {
  try {
    const response = await apiInstance.put(`/barbers/${id}`, data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

export async function deleteBarber(id: number) {
  try {
    const response = await apiInstance.delete(`/barbers/${id}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

export async function getSpecialty(name: string) {
  try {
    const response = await apiInstance.get(
      `/specialties/${encodeURIComponent(name)}`,
    );
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

export async function getAllSpecialties(limit = 10, offset = 0) {
  try {
    const response = await apiInstance.get("/specialties", {
      params: { limit, offset },
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

export async function createSpecialty(data: {
  name: string;
  description: string;
}) {
  try {
    const response = await apiInstance.post("/specialties", data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

export async function updateSpecialty(
  name: string,
  data: {
    name?: string;
    description?: string;
  },
) {
  try {
    const response = await apiInstance.put(
      `/specialties/${encodeURIComponent(name)}`,
      data,
    );
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

export async function deleteSpecialty(name: string) {
  try {
    const response = await apiInstance.delete(
      `/specialties/${encodeURIComponent(name)}`,
    );
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

export async function createAppointment(data: {
  barberId: number;
  datetime: string;
  specialtyName: string;
}) {
  try {
    const response = await apiInstance.post("/appointments", data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

export async function cancelAppointment(id: number) {
  try {
    const response = await apiInstance.post(`/appointments/${id}/cancel`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

export async function getMyAppointments(limit = 10, offset = 0) {
  try {
    const response = await apiInstance.get("/appointments/my-appointments", {
      params: { limit, offset },
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

export async function getPastAppointments(limit = 10, offset = 0) {
  try {
    const response = await apiInstance.get("/appointments", {
      params: { limit, offset },
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

export async function getUpcomingAppointments(limit = 10, offset = 0) {
  try {
    const response = await apiInstance.get("/appointments", {
      params: { limit, offset },
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

export async function getAppointment(id: number) {
  try {
    const response = await apiInstance.get(`/appointments/${id}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

export async function deleteAppointment(id: number) {
  try {
    const response = await apiInstance.delete(`/appointments/${id}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

export async function healthCheck() {
  try {
    const response = await publicInstance.get("/health");
    return response.data;
  } catch (error) {
    handleError(error);
  }
}
