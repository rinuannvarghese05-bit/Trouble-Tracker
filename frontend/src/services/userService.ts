import axios from 'axios';

// IMPORTANT: In the Canvas environment, external calls to localhost:5000 
// often fail due to sandbox restrictions. In a real-world setting, 
// replace this with a live, accessible API endpoint or use Firestore 
// for persistent data storage.
const API_URL = 'http://localhost:5000/api/users';

// Type definition for user data expected in updates/adds
interface UserPayload {
  name?: string;
  email?: string;
  role?: 'admin' | 'student';
  category?: string;
  room?: string;
  password?: string;
  // Add other fields as needed
}

const UserService = {
  /** Fetches all users from the API. */
  getAll: async () => {
    const res = await axios.get(API_URL);
    return res.data;
  },

  /** Fetches a single user by their ID. */
  getById: async (id: string) => {
    const res = await axios.get(`${API_URL}/${id}`);
    return res.data;
  },

  /** Adds a new user. */
  add: async (user: UserPayload) => {
    const res = await axios.post(API_URL, user);
    return res.data;
  },

  /** Updates an existing user by ID. */
  update: async (id: string, user: UserPayload) => {
    // Using PATCH is standard for partial updates, PUT can be used for full replacement.
    const res = await axios.patch(`${API_URL}/${id}`, user);
    return res.data;
  },

  /** Deletes a user by ID. */
  delete: async (id: string) => {
    await axios.delete(`${API_URL}/${id}`);
    return true;
  },

  /** Toggles a user's active status (e.g., active/inactive, or banned). */
  updateStatus: async (id: string) => {
    const res = await axios.patch(`${API_URL}/${id}/toggle-status`);
    return res.data;
  },
};

// Default export: This allows 'import userService from...' to work, 
// but is generally discouraged when using named exports for every function.
// Keeping it for backward compatibility if other pages rely on it.
export default UserService;

// FIX: Exporting the functions using the exact, intuitive names (like getById, getAll)
// This is the cleanest pattern and will resolve the 'is not a function' errors 
// when using 'import * as userService from...' in SuperAdminDashboard.tsx.
export const addUser = UserService.add;
export const getAll = UserService.getAll; // Renamed export from getUsers to getAll
export const getById = UserService.getById; // Renamed export from getUser to getById
export const updateUser = UserService.update;
export const deleteUser = UserService.delete;
export const updateUserStatus = UserService.updateStatus; // Keeping this one

// Note: If you use 'import * as userService from...' in SuperAdminDashboard.tsx 
// you can now consistently call: userService.getById, userService.updateUser, etc.