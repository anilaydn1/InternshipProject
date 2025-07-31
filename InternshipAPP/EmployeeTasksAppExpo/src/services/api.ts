import axios, { AxiosInstance, AxiosResponse } from 'axios';
import StorageService from '../utils/storage';
import {
  AuthResponse,
  TaskResponse,
  LoginCredentials,
  RegisterCredentials,
  CreateTaskData,
  UpdateTaskData,
  AssignTaskData,
  User,
  Task,
  Chat,
  CreateChatData
} from '../types';

class ApiService {
  private api: AxiosInstance;
  private baseURL = 'http://192.168.0.14:8000/api'; // Laravel backend URL

  constructor() {
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000, // 10 seconds timeout
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await StorageService.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid, clear stored token
          await StorageService.deleteItem('auth_token');
          await StorageService.deleteItem('user_data');
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('Login attempt with:', credentials);
      console.log('API base URL:', this.api.defaults.baseURL);
      const response: AxiosResponse<AuthResponse> = await this.api.post('/login', credentials);
      console.log('Login response:', response.data);

      if (response.data.success && response.data.token) {
        // Store token and user data securely
        await StorageService.setItem('auth_token', response.data.token);
        if (response.data.user) {
          await StorageService.setItem('user_data', JSON.stringify(response.data.user));
        }
      }

      return response.data;
    } catch (error: any) {
      console.error('Login error details:', error);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      console.error('Error response:', error.response);
      if (error.response?.data) {
        return error.response.data;
      }
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        return {
          success: false,
          message: 'Cannot connect to server. Please check if the backend is running.',
        };
      }
      if (error.code === 'ENOTFOUND') {
        return {
          success: false,
          message: 'Server not found. Please check the server address.',
        };
      }
      return {
        success: false,
        message: `Network error: ${error.message || 'Please check your connection.'}`,
      };
    }
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await this.api.post('/register', credentials);

      if (response.data.success && response.data.token) {
        // Store token and user data securely
        await StorageService.setItem('auth_token', response.data.token);
        if (response.data.user) {
          await StorageService.setItem('user_data', JSON.stringify(response.data.user));
        }
      }

      return response.data;
    } catch (error: any) {
      console.error('Register error:', error);
      if (error.response?.data) {
        return error.response.data;
      }
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        return {
          success: false,
          message: 'Cannot connect to server. Please check if the backend is running.',
        };
      }
      if (error.code === 'ENOTFOUND') {
        return {
          success: false,
          message: 'Server not found. Please check the server address.',
        };
      }
      return {
        success: false,
        message: `Network error: ${error.message || 'Please check your connection.'}`,
      };
    }
  }

  async logout(): Promise<void> {
    try {
      await this.api.post('/logout');
    } catch (error) {
      console.log('Logout error:', error);
    } finally {
      // Always clear local storage
      await StorageService.deleteItem('auth_token');
      await StorageService.deleteItem('user_data');
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response: AxiosResponse<{ success: boolean; data: User }> = await this.api.get('/user');
      return response.data.success ? response.data.data : null;
    } catch (error) {
      return null;
    }
  }

  async getUsers(): Promise<User[]> {
    try {
      const response: AxiosResponse<{ success: boolean; data: User[] }> = await this.api.get('/users');
      return response.data.success && Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error) {
      console.error('Get users error:', error);
      return [];
    }
  }

  // Task endpoints
  async getTasks(): Promise<Task[]> {
    try {
      const response: AxiosResponse<TaskResponse> = await this.api.get('/tasks');
      return response.data.success && Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error) {
      console.error('Get tasks error:', error);
      return [];
    }
  }

  async getTask(taskId: number): Promise<Task> {
    try {
      const response: AxiosResponse<TaskResponse> = await this.api.get(`/tasks/${taskId}`);
      if (response.data.success && response.data.data && !Array.isArray(response.data.data)) {
        return response.data.data;
      }
      throw new Error('Task not found');
    } catch (error) {
      console.error('Get task error:', error);
      throw error;
    }
  }

  async createTask(taskData: CreateTaskData): Promise<TaskResponse> {
    try {
      const response: AxiosResponse<TaskResponse> = await this.api.post('/tasks', taskData);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  }

  async assignTask(taskData: AssignTaskData): Promise<TaskResponse> {
    try {
      const response: AxiosResponse<TaskResponse> = await this.api.post('/tasks/assign', taskData);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  }

  // Chat methods
  async getChats(): Promise<Chat[]> {
    try {
      const response = await this.api.get('/chats');
      return response.data;
    } catch (error) {
      console.error('Get chats error:', error);
      throw error;
    }
  }

  async sendMessage(data: CreateChatData): Promise<Chat> {
    try {
      const response = await this.api.post('/chats', data);
      return response.data;
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  }

  async deleteMessage(id: number): Promise<void> {
    try {
      await this.api.delete(`/chats/${id}`);
    } catch (error) {
      console.error('Delete message error:', error);
      throw error;
    }
  }

  async updateTask(taskId: number, taskData: UpdateTaskData): Promise<TaskResponse> {
    try {
      const response: AxiosResponse<TaskResponse> = await this.api.put(`/tasks/${taskId}`, taskData);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  }

  async deleteTask(taskId: number): Promise<TaskResponse> {
    try {
      const response: AxiosResponse<TaskResponse> = await this.api.delete(`/tasks/${taskId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  }

  // Notes endpoints
  async getNotes(): Promise<any[]> {
    try {
      const response = await this.api.get('/notes');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Get notes error:', error);
      return [];
    }
  }

  async createNote(noteData: { title: string; content: string }): Promise<any> {
    try {
      const response = await this.api.post('/notes', noteData);
      return response.data;
    } catch (error: any) {
      console.error('Create note error:', error);
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  }

  async updateNote(noteId: number, noteData: { title: string; content: string }): Promise<any> {
    try {
      const response = await this.api.put(`/notes/${noteId}`, noteData);
      return response.data;
    } catch (error: any) {
      console.error('Update note error:', error);
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  }

  async deleteNote(noteId: number): Promise<any> {
    try {
      const response = await this.api.delete(`/notes/${noteId}`);
      return response.data;
    } catch (error: any) {
      console.error('Delete note error:', error);
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  }

  // Utility methods
  async getStoredToken(): Promise<string | null> {
    return await StorageService.getItem('auth_token');
  }

  async getStoredUser(): Promise<User | null> {
    try {
      const userData = await StorageService.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getStoredToken();
    if (!token) return false;

    try {
      // Test token validity by making a request to /user endpoint
      const response = await this.api.get('/user');
      return response.status === 200;
    } catch (error) {
      // Token is invalid, clear it
      await StorageService.deleteItem('auth_token');
      await StorageService.deleteItem('user_data');
      return false;
    }
  }
}

export default new ApiService();