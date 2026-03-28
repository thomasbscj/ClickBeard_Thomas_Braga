import axios, { AxiosInstance } from "axios";
/**
 * API Calls Module using Axios
 *
 * This module contains all the functions to make requests to the backend API.
 * Credentials (cookies) are automatically included in all requests.
 *
 * Configuration:
 * - API Base URL is loaded from NEXT_PUBLIC_API_URL environment variable
 * - Falls back to http://localhost:3000/api if not set
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

/**
 * Create an Axios instance with default configuration
 * @param includeCredentials - Whether to include credentials (cookies)
 */
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

/**
 * Default Axios instance with credentials
 */
const apiInstance = createAxiosInstance(true);

/**
 * Axios instance without credentials for public endpoints
 */
const publicInstance = createAxiosInstance(false);

/**
 * Handle Axios errors
 */
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

// ============================================================================
// AUTHENTICATION ENDPOINTS
// ============================================================================

/**
 * Register a new user
 * @param name - User full name
 * @param email - User email
 * @param password - User password
 */
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

/**
 * Login user
 * Sets accessToken and refreshToken cookies automatically
 * @param email - User email
 * @param password - User password
 */
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

/**
 * Refresh access token
 * Uses the refreshToken from cookies
 * @param refreshToken - Refresh token
 */
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

/**
 * Logout from current session
 * Clears accessToken and refreshToken cookies
 * @param refreshToken - Refresh token to revoke
 */
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

/**
 * Logout from all sessions
 * Revokes all refresh tokens and clears cookies
 */
export async function logoutAll() {
  try {
    const response = await apiInstance.post("/auth/logout-all");
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

// ============================================================================
// USER ENDPOINTS (ADMIN ONLY)
// ============================================================================

/**
 * Get user by ID
 * @param id - User ID
 */
export async function getUser(id: number) {
  try {
    const response = await apiInstance.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

/**
 * Get all users with pagination
 * @param limit - Number of records per page (default: 10)
 * @param offset - Number of records to skip (default: 0)
 */
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

/**
 * Update user
 * @param id - User ID
 * @param data - User data to update
 */
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

/**
 * Delete user
 * @param id - User ID
 */
export async function deleteUser(id: number) {
  try {
    const response = await apiInstance.delete(`/users/${id}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

// ============================================================================
// BARBER ENDPOINTS
// ============================================================================

/**
 * Get barber by ID
 * @param id - Barber ID
 */
export async function getBarber(id: number) {
  try {
    const response = await apiInstance.get(`/barbers/${id}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

/**
 * Get all barbers with pagination
 * @param limit - Number of records per page (default: 10)
 * @param offset - Number of records to skip (default: 0)
 */
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

/**
 * Create a new barber
 * @param data - Barber data
 */
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

/**
 * Update barber
 * @param id - Barber ID
 * @param data - Barber data to update
 */
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

/**
 * Delete barber
 * @param id - Barber ID
 */
export async function deleteBarber(id: number) {
  try {
    const response = await apiInstance.delete(`/barbers/${id}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

// ============================================================================
// SPECIALTY ENDPOINTS
// ============================================================================

/**
 * Get specialty by name
 * @param name - Specialty name
 */
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

/**
 * Get all specialties with pagination
 * @param limit - Number of records per page (default: 10)
 * @param offset - Number of records to skip (default: 0)
 */
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

/**
 * Create a new specialty
 * @param data - Specialty data
 */
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

/**
 * Update specialty
 * @param name - Specialty name
 * @param data - Specialty data to update
 */
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

/**
 * Delete specialty
 * @param name - Specialty name
 */
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

// ============================================================================
// APPOINTMENT ENDPOINTS
// ============================================================================

/**
 * Create a new appointment
 * @param data - Appointment data
 */
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

/**
 * Cancel an appointment
 * @param id - Appointment ID
 */
export async function cancelAppointment(id: number) {
  try {
    const response = await apiInstance.post(`/appointments/${id}/cancel`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

/**
 * Get user's own appointments with pagination
 * @param limit - Number of records per page (default: 10)
 * @param offset - Number of records to skip (default: 0)
 */
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

/**
 * Get past appointments (ADMIN ONLY)
 * @param limit - Number of records per page (default: 10)
 * @param offset - Number of records to skip (default: 0)
 */
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

/**
 * Get upcoming appointments (ADMIN ONLY)
 * @param limit - Number of records per page (default: 10)
 * @param offset - Number of records to skip (default: 0)
 */
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

/**
 * Get appointment by ID (ADMIN ONLY)
 * @param id - Appointment ID
 */
export async function getAppointment(id: number) {
  try {
    const response = await apiInstance.get(`/appointments/${id}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

/**
 * Delete appointment (ADMIN ONLY)
 * @param id - Appointment ID
 */
export async function deleteAppointment(id: number) {
  try {
    const response = await apiInstance.delete(`/appointments/${id}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

// ============================================================================
// HEALTH CHECK ENDPOINT
// ============================================================================

/**
 * Health check - verify API is running
 */
export async function healthCheck() {
  try {
    const response = await publicInstance.get("/health");
    return response.data;
  } catch (error) {
    handleError(error);
  }
}
